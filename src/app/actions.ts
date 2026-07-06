'use server'

import { createPhoto, likePhoto as dbLikePhoto, dislikePhoto as dbDislikePhoto, supabase } from "@/lib/db";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function uploadPhoto(formData: FormData) {
  const profileId = formData.get("profileId") as string;
  const file = formData.get("file") as File;
  
  if (!file || !profileId) {
    throw new Error("Missing file or profile");
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Only images are allowed");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const fileName = `${crypto.randomUUID()}.webp`;
  
  // Upload to Supabase Storage bucket 'photos'
  const { error } = await supabase.storage.from('photos').upload(fileName, buffer, {
    contentType: 'image/webp',
    cacheControl: '3600',
    upsert: false
  });

  if (error) {
    throw new Error("Failed to upload to storage: " + error.message);
  }

  const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(fileName);
  
  await createPhoto({
    id: crypto.randomUUID(),
    profile_id: profileId,
    url: publicUrl
  });

  revalidatePath("/");
  revalidatePath(`/profile/${profileId}`);
}

export async function likePhoto(photoId: string, profileId: string) {
  await dbLikePhoto(photoId);
  revalidatePath("/");
  revalidatePath(`/profile/${profileId}`);
}

export async function dislikePhoto(photoId: string, profileId: string) {
  await dbDislikePhoto(photoId);
  revalidatePath("/");
  revalidatePath(`/profile/${profileId}`);
}
