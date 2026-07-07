'use client';

import { useState } from 'react';
import type { Profile } from '@/lib/db';

export function AdminPhotoManager({ profiles }: { profiles: Profile[] }) {
  const [selectedProfileId, setSelectedProfileId] = useState<string>('');
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPhotos = async (profileId: string) => {
    setSelectedProfileId(profileId);
    if (!profileId) {
      setPhotos([]);
      return;
    }
    setLoading(true);
    try {
      // Create a temporary server action or just fetch from an API route. 
      // Since we don't have a direct "get photos" action for client, let's use a server action.
      const { getPhotosByProfileId } = await import('./actions');
      const data = await getPhotosByProfileId(profileId);
      setPhotos(data);
    } catch (err: any) {
      alert('Failed to load photos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const movePhoto = async (photoId: string, newProfileId: string) => {
    if (!newProfileId || newProfileId === selectedProfileId) return;
    try {
      const { movePhoto: moveAction } = await import('@/app/actions');
      await moveAction(photoId, selectedProfileId, newProfileId);
      setPhotos(prev => prev.filter(p => p.id !== photoId));
    } catch (err: any) {
      alert('Failed to move photo: ' + err.message);
    }
  };

  return (
    <div className="card fade-up delay-3" style={{ marginTop: '2rem' }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--sun-light)' }}>
        <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#b37d00' }}>🔄 Manage & Move Photos</div>
        <div style={{ fontSize: '.82rem', color: '#b37d00', opacity: .8, marginTop: '.2rem' }}>
          Select a profile to view their photos, then move them to another profile if needed.
        </div>
      </div>
      <div className="card-body">
        <select 
          value={selectedProfileId} 
          onChange={(e) => loadPhotos(e.target.value)}
          style={{ width: '100%', padding: '.75rem', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-2)', marginBottom: '1.5rem', fontWeight: 600 }}
        >
          <option value="">-- Select a profile --</option>
          {profiles.map(p => (
            <option key={p.id} value={p.id}>{p.call_name} ({p.name})</option>
          ))}
        </select>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-3)' }}>Loading photos...</div>
        ) : photos.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {photos.map(photo => (
              <div key={photo.id} style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', background: 'var(--surface)' }}>
                <img src={photo.url} alt="Evidence" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
                <div style={{ padding: '.75rem' }}>
                  <div style={{ fontSize: '.75rem', fontWeight: 800, marginBottom: '.4rem', color: 'var(--text-2)' }}>Move to:</div>
                  <select 
                    value=""
                    onChange={(e) => movePhoto(photo.id, e.target.value)}
                    style={{ width: '100%', padding: '.4rem', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--surface-2)', fontSize: '.8rem' }}
                  >
                    <option value="" disabled>Select new owner...</option>
                    {profiles.filter(p => p.id !== selectedProfileId).map(p => (
                      <option key={p.id} value={p.id}>{p.call_name}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        ) : selectedProfileId ? (
          <div className="empty" style={{ padding: '2rem' }}>
            <div className="empty-emoji">📂</div>
            <div className="empty-sub">This profile has no photos.</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
