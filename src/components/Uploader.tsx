'use client';

import { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { uploadPhoto, likePhoto, dislikePhoto } from '@/app/actions';
import { Camera, ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';

export function Uploader({ profileId }: { profileId: string }) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Only images are allowed. No videos!");
      return;
    }

    try {
      setIsUploading(true);
      
      // Convert to WebP via compression options
      const options = {
        maxSizeMB: 2,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: 'image/webp'
      };
      
      const compressedFile = await imageCompression(file, options);
      
      const formData = new FormData();
      formData.append('profileId', profileId);
      formData.append('file', compressedFile, compressedFile.name.replace(/\.[^/.]+$/, "") + ".webp");
      
      await uploadPhoto(formData);
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error(error);
      alert("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ marginTop: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
      <input 
        type="file" 
        accept="image/*" 
        style={{ display: 'none' }} 
        ref={fileInputRef}
        onChange={handleUpload}
      />
      <button 
        className="btn-primary" 
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? <Loader2 className="animate-spin" /> : <Camera />}
        {isUploading ? 'Uploading & Converting...' : 'Upload Embarrassing Pic'}
      </button>
    </div>
  );
}

export function PhotoActions({ photoId, profileId, likes, dislikes }: { photoId: string, profileId: string, likes: number, dislikes: number }) {
  const [isLiking, setIsLiking] = useState(false);
  const [isDisliking, setIsDisliking] = useState(false);

  return (
    <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
      <button 
        className="btn-secondary" 
        style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '4px', alignItems: 'center' }}
        onClick={async () => {
          setIsLiking(true);
          await likePhoto(photoId, profileId);
          setIsLiking(false);
        }}
        disabled={isLiking}
      >
        <ThumbsUp size={16} /> {likes}
      </button>
      <button 
        className="btn-secondary" 
        style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '4px', alignItems: 'center' }}
        onClick={async () => {
          setIsDisliking(true);
          await dislikePhoto(photoId, profileId);
          setIsDisliking(false);
        }}
        disabled={isDisliking}
      >
        <ThumbsDown size={16} /> {dislikes}
      </button>
    </div>
  );
}
