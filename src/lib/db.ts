import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// =================== TYPES ===================

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
  roasts: number;
  uploaded_at: string;
}

export interface ProfileStats {
  totalPhotos: number;
  totalLikes: number;
  totalDislikes: number;
  totalRoasts: number;
  vibeScore: number;
  topPhoto: Photo | null;
}

export interface Tag {
  emoji: string;
  label: string;
  color: 'green' | 'red' | 'wood' | 'sun' | 'gray';
}

// =================== QUERIES ===================

export async function getProfiles(): Promise<Profile[]> {
  const { data } = await supabase.from('profiles').select('*').order('name');
  return data || [];
}

export async function getProfile(id: string): Promise<Profile | undefined> {
  const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
  return data || undefined;
}

export async function createProfile(profile: Omit<Profile, 'id'> & { id: string }) {
  return await supabase.from('profiles').insert(profile);
}

export async function getPhotosByProfile(profileId: string): Promise<Photo[]> {
  const { data } = await supabase
    .from('photos')
    .select('*')
    .eq('profile_id', profileId)
    .order('uploaded_at', { ascending: false });
  return data || [];
}

export async function getAllPhotos(): Promise<Photo[]> {
  const { data } = await supabase
    .from('photos')
    .select('*')
    .order('uploaded_at', { ascending: false });
  return data || [];
}

export async function getRecentPhotos(limit = 20): Promise<(Photo & { profiles: Profile })[]> {
  const { data } = await supabase
    .from('photos')
    .select('*, profiles(*)')
    .order('uploaded_at', { ascending: false })
    .limit(limit);
  return (data as any) || [];
}

export async function createPhoto(photo: Omit<Photo, 'likes' | 'dislikes' | 'roasts' | 'uploaded_at'>) {
  return await supabase.from('photos').insert(photo);
}

export async function likePhoto(id: string) {
  const { data } = await supabase.from('photos').select('likes').eq('id', id).single();
  if (data) await supabase.from('photos').update({ likes: data.likes + 1 }).eq('id', id);
}

export async function dislikePhoto(id: string) {
  const { data } = await supabase.from('photos').select('dislikes').eq('id', id).single();
  if (data) await supabase.from('photos').update({ dislikes: data.dislikes + 1 }).eq('id', id);
}

export async function roastPhoto(id: string) {
  const { data } = await supabase.from('photos').select('roasts').eq('id', id).single();
  if (data) await supabase.from('photos').update({ roasts: (data.roasts || 0) + 1 }).eq('id', id);
}

// =================== STATS ===================

export async function getProfileStats(profileId: string): Promise<ProfileStats> {
  const photos = await getPhotosByProfile(profileId);
  const totalLikes = photos.reduce((a, p) => a + p.likes, 0);
  const totalDislikes = photos.reduce((a, p) => a + p.dislikes, 0);
  const totalRoasts = photos.reduce((a, p) => a + (p.roasts || 0), 0);
  const topPhoto = photos.reduce<Photo | null>((best, p) =>
    !best || p.likes > best.likes ? p : best, null);

  return {
    totalPhotos: photos.length,
    totalLikes,
    totalDislikes,
    totalRoasts,
    vibeScore: totalLikes - totalDislikes,
    topPhoto,
  };
}

// =================== TAGS ===================

export async function calculateTags(profileId: string): Promise<Tag[]> {
  const allPhotos = await getAllPhotos();
  const profiles = await getProfiles();

  // Aggregate per profile
  const counts: Record<string, number>  = {};
  const likes:  Record<string, number>  = {};
  const dislikes: Record<string, number> = {};
  const roasts: Record<string, number>  = {};
  const recentCutoff = Date.now() - 24 * 60 * 60 * 1000;
  const recentUploads: Record<string, number> = {};

  for (const p of allPhotos) {
    counts[p.profile_id]  = (counts[p.profile_id]  || 0) + 1;
    likes[p.profile_id]   = (likes[p.profile_id]   || 0) + p.likes;
    dislikes[p.profile_id]= (dislikes[p.profile_id]|| 0) + p.dislikes;
    roasts[p.profile_id]  = (roasts[p.profile_id]  || 0) + (p.roasts || 0);
    if (new Date(p.uploaded_at).getTime() > recentCutoff) {
      recentUploads[p.profile_id] = (recentUploads[p.profile_id] || 0) + 1;
    }
  }

  const myCount    = counts[profileId]   || 0;
  const myLikes    = likes[profileId]    || 0;
  const myDislikes = dislikes[profileId] || 0;
  const myRoasts   = roasts[profileId]   || 0;
  const myRecent   = recentUploads[profileId] || 0;
  const myVibe     = myLikes - myDislikes;

  const maxCount    = Math.max(...Object.values(counts), 0);
  const maxLikes    = Math.max(...Object.values(likes), 0);
  const maxDislikes = Math.max(...Object.values(dislikes), 0);
  const maxRoasts   = Math.max(...Object.values(roasts), 0);
  const maxRecent   = Math.max(...Object.values(recentUploads), 0);

  const tags: Tag[] = [];

  if (myCount === 0) {
    tags.push({ emoji: '👻', label: 'The Introvert', color: 'gray' });
    return tags;
  }

  if (myCount === maxCount && maxCount > 0)
    tags.push({ emoji: '📸', label: 'Top Pics', color: 'green' });

  if (myDislikes === maxDislikes && maxDislikes > 0 && myDislikes > myLikes)
    tags.push({ emoji: '😈', label: 'Most Hated', color: 'red' });

  if (myLikes === maxLikes && maxLikes > 0)
    tags.push({ emoji: '✨', label: 'Most Loved', color: 'sun' });

  if (myRoasts === maxRoasts && maxRoasts > 0)
    tags.push({ emoji: '🤡', label: 'Clown of the Day', color: 'wood' });

  if (myRecent > 0 && myRecent === maxRecent)
    tags.push({ emoji: '🔥', label: 'On Fire', color: 'wood' });

  if (myVibe > 0 && myLikes > 0) {
    const maxVibe = Math.max(...profiles.map(pr =>
      (likes[pr.id] || 0) - (dislikes[pr.id] || 0)));
    if (myVibe === maxVibe)
      tags.push({ emoji: '🏆', label: 'Legend', color: 'sun' });
  }

  if (tags.length === 0)
    tags.push({ emoji: '😶', label: 'Just Vibing', color: 'gray' });

  return tags;
}

// =================== HALL QUERIES ===================

export async function getHallOfShame(limit = 30): Promise<(Photo & { profiles: Profile })[]> {
  const { data } = await supabase
    .from('photos')
    .select('*, profiles(*)')
    .order('dislikes', { ascending: false })
    .limit(limit);
  return (data as any) || [];
}

export async function getHallOfFame(limit = 30): Promise<(Photo & { profiles: Profile })[]> {
  const { data } = await supabase
    .from('photos')
    .select('*, profiles(*)')
    .order('likes', { ascending: false })
    .limit(limit);
  return (data as any) || [];
}
