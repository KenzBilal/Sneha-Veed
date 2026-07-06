'use server';

import { revalidatePath } from 'next/cache';
import { createProfile, createPhoto, deleteProfile as dbDeleteProfile, supabase } from '@/lib/db';
import crypto from 'crypto';

async function uploadImageToStorage(file: File, folder: string): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Only images allowed');
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileName = `${folder}/${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage.from('photos').upload(fileName, buffer, {
    contentType: 'image/webp',
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw new Error('Upload failed: ' + error.message);
  const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(fileName);
  return publicUrl;
}

export async function adminCreateProfile(formData: FormData) {
  const name        = (formData.get('name')        as string).trim();
  const call_name   = (formData.get('call_name')   as string).trim();
  const description = (formData.get('description') as string).trim();
  const picFile     = formData.get('profile_pic')  as File | null;

  if (!name || !call_name) throw new Error('Name and Call Name are required');

  let profile_pic: string | null = null;

  if (picFile && picFile.size > 0) {
    profile_pic = await uploadImageToStorage(picFile, 'avatars');
  }

  const id = crypto.randomUUID();
  const { error } = await createProfile({ id, name, call_name, description, profile_pic });
  if (error) throw new Error('Failed to create profile: ' + error.message);

  revalidatePath('/');
  revalidatePath('/admin');
  return id;
}

export async function adminAddPhoto(formData: FormData) {
  const profileId = formData.get('profileId') as string;
  const file      = formData.get('file')      as File;

  if (!profileId || !file || file.size === 0) throw new Error('Missing data');

  const url = await uploadImageToStorage(file, 'photos');
  const { error } = await createPhoto({ id: crypto.randomUUID(), profile_id: profileId, url });
  if (error) throw new Error('Failed to add photo: ' + error.message);

  revalidatePath('/admin');
  revalidatePath('/feed');
  revalidatePath(`/profile/${profileId}`);
}

export async function adminDeleteProfile(profileId: string) {
  await dbDeleteProfile(profileId);
  revalidatePath('/');
  revalidatePath('/admin');
}
