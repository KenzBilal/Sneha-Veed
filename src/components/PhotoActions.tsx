'use client';

import { useState } from 'react';
import { likePhoto, dislikePhoto, roastPhoto } from '@/app/actions';

interface Props {
  photoId: string;
  profileId: string;
  likes: number;
  dislikes: number;
  roasts: number;
}

export default function PhotoActions({ photoId, profileId, likes, dislikes, roasts }: Props) {
  const [l, setL] = useState(likes);
  const [d, setD] = useState(dislikes);
  const [r, setR] = useState(roasts);
  const [loading, setLoading] = useState<string | null>(null);
  
  const [showMove, setShowMove] = useState(false);
  const [profiles, setProfiles] = useState<{id: string, name: string, call_name: string}[]>([]);

  const act = async (type: 'like' | 'dislike' | 'roast') => {
    if (loading) return;
    setLoading(type);
    try {
      if (type === 'like')    { await likePhoto(photoId, profileId);    setL(p => p + 1); }
      if (type === 'dislike') { await dislikePhoto(photoId, profileId); setD(p => p + 1); }
      if (type === 'roast')   { await roastPhoto(photoId, profileId);   setR(p => p + 1); }
    } finally { setLoading(null); }
  };

  const handleMoveClick = async () => {
    if (showMove) {
      setShowMove(false);
      return;
    }
    if (profiles.length === 0) {
      const { getProfilesList } = await import('@/app/actions');
      const data = await getProfilesList();
      setProfiles(data);
    }
    setShowMove(true);
  };

  const executeMove = async (newProfileId: string) => {
    if (!newProfileId || newProfileId === profileId) {
      setShowMove(false);
      return;
    }
    setLoading('move');
    try {
      const { movePhoto } = await import('@/app/actions');
      await movePhoto(photoId, profileId, newProfileId);
      setShowMove(false);
    } catch (err: any) {
      alert('Move failed: ' + err.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <div className="photo-card-actions">
        <button className="vote-btn" onClick={() => act('like')} disabled={!!loading} title="Like">
          👍 {l}
        </button>
        <button className="vote-btn dislike" onClick={() => act('dislike')} disabled={!!loading} title="Dislike">
          👎 {d}
        </button>
        <button className="vote-btn roast" onClick={() => act('roast')} disabled={!!loading} title="Roast">
          🔥 {r}
        </button>
        <button className="vote-btn" onClick={handleMoveClick} disabled={!!loading} title="Move Photo" style={{ marginLeft: 'auto', background: 'var(--surface-2)', color: 'var(--text)' }}>
          🔄 Move
        </button>
      </div>

      {showMove && (
        <div style={{
          position: 'absolute', bottom: '100%', right: 0, marginBottom: '0.5rem',
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)',
          padding: '0.75rem', zIndex: 50, boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '220px'
        }}>
          <div style={{ fontSize: '.85rem', fontWeight: 800, marginBottom: '.5rem', color: 'var(--text-2)' }}>Move to:</div>
          <select 
            onChange={(e) => executeMove(e.target.value)}
            value=""
            style={{ width: '100%', padding: '.4rem', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)' }}
          >
            <option value="" disabled>Select profile...</option>
            {profiles.filter(p => p.id !== profileId).map(p => (
              <option key={p.id} value={p.id}>{p.call_name} ({p.name})</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
