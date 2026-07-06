'use server';

import { revalidatePath } from 'next/cache';
import { upsertCampaignVote } from '@/lib/db';

export async function assignToOption(campaignId: string, profileId: string, optionId: string) {
  const { error } = await upsertCampaignVote(campaignId, profileId, optionId);
  if (error) throw new Error(error.message);
  revalidatePath('/world-cup');
}
