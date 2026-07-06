import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  name: string;
  call_name: string;
  description: string;
}

export interface Photo {
  id: string;
  profile_id: string;
  url: string;
  likes: number;
  dislikes: number;
  uploaded_at: string;
}

// --- Helper Functions --- //

export async function getProfiles(): Promise<Profile[]> {
  const { data } = await supabase.from('profiles').select('*');
  return data || [];
}

export async function getProfile(id: string): Promise<Profile | undefined> {
  const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
  return data || undefined;
}

export async function createProfile(profile: Profile) {
  return await supabase.from('profiles').insert(profile);
}

export async function getPhotosByProfile(profileId: string): Promise<Photo[]> {
  const { data } = await supabase.from('photos').select('*').eq('profile_id', profileId).order('uploaded_at', { ascending: false });
  return data || [];
}

export async function getAllPhotos(): Promise<Photo[]> {
  const { data } = await supabase.from('photos').select('*').order('uploaded_at', { ascending: false });
  return data || [];
}

export async function createPhoto(photo: Omit<Photo, 'likes' | 'dislikes' | 'uploaded_at'>) {
  return await supabase.from('photos').insert(photo);
}

export async function likePhoto(id: string) {
  // To avoid race conditions, typically done via RPC, but for fun app, this is fine
  const { data: photo } = await supabase.from('photos').select('likes').eq('id', id).single();
  if (photo) {
    await supabase.from('photos').update({ likes: photo.likes + 1 }).eq('id', id);
  }
}

export async function dislikePhoto(id: string) {
  const { data: photo } = await supabase.from('photos').select('dislikes').eq('id', id).single();
  if (photo) {
    await supabase.from('photos').update({ dislikes: photo.dislikes + 1 }).eq('id', id);
  }
}

export async function calculateTags(profileId: string) {
  const photos = await getAllPhotos();
  
  const profileCounts: Record<string, number> = {};
  const profileLikes: Record<string, number> = {};
  const profileDislikes: Record<string, number> = {};

  photos.forEach(p => {
    profileCounts[p.profile_id] = (profileCounts[p.profile_id] || 0) + 1;
    profileLikes[p.profile_id] = (profileLikes[p.profile_id] || 0) + p.likes;
    profileDislikes[p.profile_id] = (profileDislikes[p.profile_id] || 0) + p.dislikes;
  });

  const tags: string[] = [];
  
  const myCount = profileCounts[profileId] || 0;
  const myLikes = profileLikes[profileId] || 0;
  const myDislikes = profileDislikes[profileId] || 0;

  if (myCount > 0) {
    const isTopPics = Object.values(profileCounts).every(c => myCount >= c);
    if (isTopPics) tags.push("📸 Top Pics");
  } else {
    tags.push("👻 The Introvert");
  }

  if (myDislikes > 0) {
    const isMostHated = Object.values(profileDislikes).every(d => myDislikes >= d);
    if (isMostHated && myDislikes > myLikes) tags.push("😈 Most Hated");
  }

  if (myLikes > 0) {
    const isMostLoved = Object.values(profileLikes).every(l => myLikes >= l);
    if (isMostLoved) tags.push("✨ Most Loved");
  }

  return tags;
}
