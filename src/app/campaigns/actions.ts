'use server';

import { revalidatePath } from 'next/cache';
import { upsertCampaignVote, createCampaign, createCampaignOption, deleteCampaign, toggleCampaignActive } from '@/lib/db';
import crypto from 'crypto';

export async function assignToOption(campaignId: string, profileId: string, optionId: string) {
  const { error } = await upsertCampaignVote(campaignId, profileId, optionId);
  if (error) throw new Error(error.message);
  revalidatePath('/campaigns');
  revalidatePath(`/campaigns/${campaignId}`);
}

export async function adminCreateCampaign(formData: FormData) {
  const name        = (formData.get('name')        as string).trim();
  const description = (formData.get('description') as string || '').trim();
  const emoji       = (formData.get('emoji')       as string || '🎯').trim();
  const optionsRaw  = (formData.get('options')     as string).trim();

  if (!name) throw new Error('Campaign name required');

  const { data, error } = await createCampaign({ name, description, emoji, active: true });
  if (error || !data) throw new Error('Failed to create campaign: ' + error?.message);

  const campaignId = (data as any).id;

  // Parse options: one per line as "emoji Name #color"
  const lines = optionsRaw.split('\n').map(l => l.trim()).filter(Boolean);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Format: "🇧🇷 Brazil #009C3B"  or  "Brazil"
    const colorMatch = line.match(/#([0-9a-fA-F]{3,6})\s*$/);
    const color = colorMatch ? '#' + colorMatch[1] : '#888888';
    const withoutColor = colorMatch ? line.replace(colorMatch[0], '').trim() : line;
    // First "word" that's an emoji
    const emojiMatch = withoutColor.match(/^(\p{Emoji_Presentation}|\p{Extended_Pictographic})\s*/u);
    const optEmoji = emojiMatch ? emojiMatch[1] : '🏳️';
    const optName  = emojiMatch ? withoutColor.slice(emojiMatch[0].length).trim() : withoutColor;

    await createCampaignOption({
      campaign_id: campaignId,
      name: optName || line,
      emoji: optEmoji,
      color,
      sort_order: i,
    });
  }

  revalidatePath('/campaigns');
  revalidatePath('/admin');
  return campaignId;
}

export async function adminDeleteCampaign(id: string) {
  await deleteCampaign(id);
  revalidatePath('/campaigns');
  revalidatePath('/admin');
}

export async function adminToggleCampaign(id: string, active: boolean) {
  await toggleCampaignActive(id, active);
  revalidatePath('/campaigns');
  revalidatePath(`/campaigns/${id}`);
  revalidatePath('/admin');
}
