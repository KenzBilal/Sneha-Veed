'use client';

import { useState, useRef } from 'react';
import { uploadPhoto } from '@/app/actions';

export default function Uploader({ profileId }: { profileId: string }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState('');
  const ref = useRef<HTMLInputElement>(null);

  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const images = files.filter(f => f.type.startsWith('image/'));
    if (images.length === 0) {
      alert('❌ Only images! No videos here bestie.');
      return;
    }

    if (images.length < files.length) {
      alert('⚠️ Skipped some non-image files.');
    }

    setUploading(true);

    let successCount = 0;
    
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      setProgress(`Processing ${i + 1} of ${images.length}...`);

      try {
        // Native WebP Converter
        const compressedFile = await new Promise<Blob>((resolve, reject) => {
          const img = new Image();
          const url = URL.createObjectURL(file);
          
          img.onload = () => {
            URL.revokeObjectURL(url);
            const canvas = document.createElement('canvas');
            
            // Max size 1920x1920
            let width = img.width;
            let height = img.height;
            const max = 1920;
            if (width > max || height > max) {
              if (width > height) { height = Math.round((height * max) / width); width = max; }
              else { width = Math.round((width * max) / height); height = max; }
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return reject(new Error('Failed to get canvas context'));
            
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
              (blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Canvas toBlob failed'));
              },
              'image/webp',
              0.8
            );
          };
          img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image.'));
          };
          img.src = url;
        });

        setProgress(`Uploading ${i + 1} of ${images.length}...`);
        const fd = new FormData();
        fd.append('profileId', profileId);
        fd.append('file', compressedFile, file.name.replace(/\.[^/.]+$/, '') + '.webp');

        await uploadPhoto(fd);
        successCount++;
      } catch (err: any) {
        console.error('Failed to upload', file.name, err);
        // continue to next file
      }
    }

    setProgress('');
    setUploading(false);
    if (ref.current) ref.current.value = '';
    
    if (successCount > 0) {
      // Force reload to show new photos instantly
      window.location.reload();
    }
  };

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <input type="file" multiple accept="image/*" ref={ref} onChange={handle} style={{ display: 'none' }} />
      <div
        className="upload-zone"
        onClick={() => !uploading && ref.current?.click()}
        style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}
      >
        <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>
          {uploading ? '⏳' : '📸'}
        </div>
        <div style={{ fontWeight: 700, color: 'var(--green-dark)', marginBottom: '.25rem' }}>
          {uploading ? progress : 'Drop or click to expose them'}
        </div>
        <div style={{ fontSize: '.8rem', color: 'var(--text-3)', fontWeight: 600 }}>
          {uploading ? 'Please wait...' : 'only images expose them (multiple allowed)'}
        </div>
      </div>
    </div>
  );
}
