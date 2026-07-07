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
  revalidatePath('/admin', 'layout');
  return id;
}

export async function adminAddPhoto(formData: FormData) {
  const profileId = formData.get('profileId') as string;
  const file      = formData.get('file')      as File;

  if (!profileId || !file || file.size === 0) throw new Error('Missing data');

  const url = await uploadImageToStorage(file, 'photos');
  const { error } = await createPhoto({ id: crypto.randomUUID(), profile_id: profileId, url });
  if (error) throw new Error('Failed to add photo: ' + error.message);

  revalidatePath('/admin', 'layout');
  revalidatePath('/feed');
  revalidatePath(`/profile/${profileId}`);
}

export async function adminDeleteProfile(profileId: string) {
  await dbDeleteProfile(profileId);
  revalidatePath('/');
  revalidatePath('/admin', 'layout');
}

export async function adminUpdateProfilePic(formData: FormData) {
  const profileId  = formData.get('profileId') as string;
  const existingUrl = formData.get('existingUrl') as string | null;
  const file        = formData.get('file') as File | null;

  if (!profileId) throw new Error('Profile ID required');

  let url: string | null = null;

  if (existingUrl && existingUrl.length > 0) {
    // use an existing uploaded photo as profile pic
    url = existingUrl;
  } else if (file && file.size > 0) {
    url = await uploadImageToStorage(file, 'avatars');
  } else {
    throw new Error('Select an existing photo or upload a new one');
  }

  const { error } = await supabase
    .from('profiles')
    .update({ profile_pic: url })
    .eq('id', profileId);

  if (error) throw new Error('Update failed: ' + error.message);

  revalidatePath('/');
  revalidatePath(`/profile/${profileId}`);
}

export async function getPhotosByProfileId(profileId: string) {
  const { data } = await supabase
    .from('photos')
    .select('*')
    .eq('profile_id', profileId)
    .order('uploaded_at', { ascending: false });
  return data || [];
}

export async function adminDeletePhoto(photoId: string, profileId: string) {
  const { error } = await supabase.from('photos').delete().eq('id', photoId);
  if (error) throw new Error(error.message);
  revalidatePath('/');
  revalidatePath('/feed');
  revalidatePath('/leaderboard');
  revalidatePath('/hall-of-shame');
  revalidatePath('/hall-of-fame');
  revalidatePath(`/profile/${profileId}`);
}
