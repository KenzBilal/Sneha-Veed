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

  const act = async (type: 'like' | 'dislike' | 'roast') => {
    if (loading) return;
    setLoading(type);
    try {
      if (type === 'like')    { await likePhoto(photoId, profileId);    setL(p => p + 1); }
      if (type === 'dislike') { await dislikePhoto(photoId, profileId); setD(p => p + 1); }
      if (type === 'roast')   { await roastPhoto(photoId, profileId);   setR(p => p + 1); }
    } finally { setLoading(null); }
  };

  return (
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
    </div>
  );
}
