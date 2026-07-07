'use client';

import { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { uploadPhoto } from '@/app/actions';

export default function Uploader({ profileId }: { profileId: string }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState('');
  const ref = useRef<HTMLInputElement>(null);

  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('❌ Only images! No videos here bestie.');
      return;
    }

    try {
      setUploading(true);
      setProgress('Converting to WebP...');

      const compressed = await imageCompression(file, {
        maxSizeMB: 2,
        maxWidthOrHeight: 1920,
        useWebWorker: false,
        fileType: 'image/webp',
        onProgress: (p) => setProgress(`Converting... ${p}%`),
      });

      setProgress('Uploading...');

      const fd = new FormData();
      fd.append('profileId', profileId);
      fd.append('file', compressed, compressed.name.replace(/\.[^/.]+$/, '') + '.webp');

      await uploadPhoto(fd);
      setProgress('');
      if (ref.current) ref.current.value = '';
    } catch (err: any) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <input type="file" accept="image/*" ref={ref} onChange={handle} style={{ display: 'none' }} />
      <div
        className="upload-zone"
        onClick={() => !uploading && ref.current?.click()}
        style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}
      >
        <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>
          {uploading ? '⏳' : '📸'}
        </div>
        <div style={{ fontWeight: 700, color: 'var(--green-dark)', marginBottom: '.25rem' }}>
          {uploading ? progress || 'Working...' : 'Drop or click to expose them'}
        </div>
        <div style={{ fontSize: '.8rem', color: 'var(--text-3)', fontWeight: 600 }}>
          only images expose them
        </div>
      </div>
    </div>
  );
}
