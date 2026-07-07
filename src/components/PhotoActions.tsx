'use client';

import { useState, useRef } from 'react';
import { likePhoto, dislikePhoto, roastPhoto } from '@/app/actions';
import { emojiPop } from '@/lib/emojiPop';

interface Props {
  photoId: string;
  profileId: string;
  likes: number;
  dislikes: number;
  roasts: number;
}

const ACTIONS = {
  like:    { emoji: '👍', bump: '💚', fn: likePhoto },
  dislike: { emoji: '👎', bump: '💀', fn: dislikePhoto },
  roast:   { emoji: '🔥', bump: '🔥', fn: roastPhoto },
} as const;

export default function PhotoActions({ photoId, profileId, likes, dislikes, roasts }: Props) {
  const [counts, setCounts] = useState({ like: likes, dislike: dislikes, roast: roasts });
  const [loading, setLoading] = useState<string | null>(null);
  const [popKey, setPopKey] = useState<Record<string, number>>({ like: 0, dislike: 0, roast: 0 });
  const [btnAnim, setBtnAnim] = useState<string | null>(null);

  const act = async (type: keyof typeof ACTIONS, e: React.MouseEvent) => {
    if (loading) return;
    setLoading(type);
    setBtnAnim(type);

    // Fire multiple emojis
    const cfg = ACTIONS[type];
    emojiPop(cfg.emoji, e, { count: 3, spread: 30 });

    try {
      await cfg.fn(photoId, profileId);
      setCounts(c => ({ ...c, [type]: c[type] + 1 }));
      setPopKey(k => ({ ...k, [type]: k[type] + 1 }));
    } finally {
      setLoading(null);
      setTimeout(() => setBtnAnim(null), 300);
    }
  };

  return (
    <div className="photo-card-actions">
      {(['like', 'dislike', 'roast'] as const).map(type => {
        const cfg = ACTIONS[type];
        return (
          <button
            key={type}
            className={`vote-btn ${type !== 'like' ? type : ''} ${btnAnim === type ? 'btn-pop' : ''}`}
            onClick={e => act(type, e)}
            disabled={!!loading}
            title={type.charAt(0).toUpperCase() + type.slice(1)}
          >
            {cfg.emoji}{' '}
            <span
              key={popKey[type]} /* re-mount triggers animation */
              className={popKey[type] > 0 ? 'num-pop' : ''}
              style={{ display: 'inline-block' }}
            >
              {counts[type]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
