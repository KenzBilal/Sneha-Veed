'use server';

import { revalidatePath } from 'next/cache';
import { likePhoto as dbLike, dislikePhoto as dbDislike, roastPhoto as dbRoast, createPhoto, supabase } from '@/lib/db';
import crypto from 'crypto';

export async function uploadPhoto(formData: FormData) {
  const profileId = formData.get('profileId') as string;
  const file = formData.get('file') as File;

  if (!file || !profileId) throw new Error('Missing file or profile');
  if (!file.type.startsWith('image/')) throw new Error('Only images allowed');

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileName = `${crypto.randomUUID()}.webp`;

  const { error } = await supabase.storage.from('photos').upload(fileName, buffer, {
    contentType: 'image/webp',
    cacheControl: '3600',
    upsert: false,
  });

  if (error) throw new Error('Upload failed: ' + error.message);

  const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(fileName);

  await createPhoto({ id: crypto.randomUUID(), profile_id: profileId, url: publicUrl });

  revalidatePath('/');
  revalidatePath('/feed');
  revalidatePath(`/profile/${profileId}`);
}

export async function likePhoto(photoId: string, profileId: string) {
  await dbLike(photoId);
  revalidatePath('/');
  revalidatePath('/leaderboard');
  revalidatePath('/hall-of-fame');
  revalidatePath(`/profile/${profileId}`);
}

export async function dislikePhoto(photoId: string, profileId: string) {
  await dbDislike(photoId);
  revalidatePath('/');
  revalidatePath('/leaderboard');
  revalidatePath('/hall-of-shame');
  revalidatePath(`/profile/${profileId}`);
}

export async function roastPhoto(photoId: string, profileId: string) {
  await dbRoast(photoId);
  revalidatePath(`/profile/${profileId}`);
}

export async function getProfilesList() {
  const { data } = await supabase.from('profiles').select('id, name, call_name').order('name');
  return data || [];
}

export async function movePhoto(photoId: string, oldProfileId: string, newProfileId: string) {
  const { error } = await supabase.from('photos').update({ profile_id: newProfileId }).eq('id', photoId);
  if (error) throw new Error(error.message);
  revalidatePath('/');
  revalidatePath('/feed');
  revalidatePath('/leaderboard');
  revalidatePath('/hall-of-fame');
  revalidatePath('/hall-of-shame');
  revalidatePath(`/profile/${oldProfileId}`);
  revalidatePath(`/profile/${newProfileId}`);
}
