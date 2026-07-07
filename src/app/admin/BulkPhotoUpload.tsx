'use client';

import { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { adminAddPhoto } from './actions';
import type { Profile } from '@/lib/db';

interface UploadItem {
  id: string;
  file: File;
  previewUrl: string;
  profileId: string;
  status: 'pending' | 'compressing' | 'uploading' | 'done' | 'error';
  errorMsg?: string;
}

export function BulkPhotoUpload({ profiles }: { profiles: Profile[] }) {
  const [items, setItems] = useState<UploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newItems: UploadItem[] = files.map((file, i) => ({
      id: Math.random().toString(36).substring(7) + i,
      file,
      previewUrl: URL.createObjectURL(file),
      profileId: profiles[0]?.id || '',
      status: 'pending',
    }));

    setItems(prev => [...prev, ...newItems]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeItem = (id: string) => {
    setItems(prev => {
      const item = prev.find(i => i.id === id);
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter(i => i.id !== id);
    });
  };

  const updateProfile = (id: string, profileId: string) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, profileId } : i));
  };

  const uploadAll = async () => {
    if (isUploading) return;
    setIsUploading(true);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.status === 'done') continue;

      try {
        // 1. Compress
        setItems(prev => prev.map(x => x.id === item.id ? { ...x, status: 'compressing' } : x));
        const compressedFile = await imageCompression(item.file, {
          maxSizeMB: 0.8,
          maxWidthOrHeight: 1600,
          useWebWorker: false,
          fileType: 'image/webp'
        });

        // 2. Upload
        setItems(prev => prev.map(x => x.id === item.id ? { ...x, status: 'uploading' } : x));
        
        const fd = new FormData();
        fd.set('profileId', item.profileId);
        fd.set('file', new File([compressedFile], 'photo.webp', { type: 'image/webp' }));

        await adminAddPhoto(fd);

        setItems(prev => prev.map(x => x.id === item.id ? { ...x, status: 'done' } : x));
      } catch (err: any) {
        setItems(prev => prev.map(x => x.id === item.id ? { ...x, status: 'error', errorMsg: err.message } : x));
      }
    }

    // Clean up finished items after 2 seconds
    setTimeout(() => {
      setItems(prev => prev.filter(i => i.status !== 'done'));
      setIsUploading(false);
    }, 2000);
  };

  const pendingCount = items.filter(i => i.status !== 'done').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* File Selector */}
      <label style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        border: '2px dashed var(--green)', borderRadius: 'var(--r-md)', padding: '2rem',
        background: 'var(--green-light)', color: 'var(--green-dark)', fontWeight: 800,
        cursor: 'pointer', transition: 'background 0.2s', textAlign: 'center'
      }}>
        <span style={{ fontSize: '2rem', marginBottom: '.5rem' }}>📸</span>
        <span>Select Photos to Upload</span>
        <span style={{ fontSize: '.8rem', opacity: 0.8, marginTop: '.25rem', fontWeight: 600 }}>You can select multiple files</span>
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          onChange={handleFiles}
          ref={fileInputRef}
          style={{ display: 'none' }} 
        />
      </label>

      {/* Preview Grid */}
      {items.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {items.map(item => (
            <div key={item.id} style={{
              background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden',
              display: 'flex', flexDirection: 'column', position: 'relative'
            }}>
              
              {/* Delete Button */}
              {item.status === 'pending' && (
                <button 
                  onClick={() => removeItem(item.id)}
                  style={{
                    position: 'absolute', top: 5, right: 5, background: 'rgba(0,0,0,0.6)', color: 'white',
                    border: 'none', borderRadius: '50%', width: 28, height: 28, fontSize: '1.2rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10
                  }}
                >×</button>
              )}

              {/* Status Overlay */}
              {item.status !== 'pending' && (
                <div style={{
                  position: 'absolute', inset: 0, zIndex: 5, background: 'rgba(0,0,0,0.6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'white',
                  fontWeight: 800, padding: '1rem', textAlign: 'center'
                }}>
                  {item.status === 'compressing' && <>⚙️<br/><span style={{fontSize:'.8rem'}}>Compressing</span></>}
                  {item.status === 'uploading' && <>⏳<br/><span style={{fontSize:'.8rem'}}>Uploading</span></>}
                  {item.status === 'done' && <>✅<br/><span style={{fontSize:'.8rem'}}>Done</span></>}
                  {item.status === 'error' && <span style={{color: 'var(--red)'}}>❌ {item.errorMsg}</span>}
                </div>
              )}

              {/* Preview Image */}
              <div style={{ width: '100%', aspectRatio: '1', background: 'var(--surface-2)' }}>
                <img src={item.previewUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              {/* Assignment Dropdown */}
              <div style={{ padding: '.75rem' }}>
                <select 
                  value={item.profileId}
                  onChange={(e) => updateProfile(item.id, e.target.value)}
                  disabled={item.status !== 'pending'}
                  style={{
                    width: '100%', padding: '.4rem', borderRadius: 4, border: '1px solid var(--border)',
                    background: 'var(--surface-2)', color: 'var(--text)', fontSize: '.85rem', fontWeight: 600
                  }}
                >
                  {profiles.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.call_name})</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {pendingCount > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          <button 
            onClick={uploadAll} 
            disabled={isUploading}
            className="btn btn-green" 
            style={{ padding: '.75rem 2rem', fontSize: '1rem' }}
          >
            {isUploading ? '⏳ Uploading...' : `🚀 Upload ${pendingCount} Photos`}
          </button>
        </div>
      )}

    </div>
  );
}
