'use client';

import { useState, useEffect, useTransition } from 'react';
import { submitBattleVote } from './actions';
import { emojiPop } from '@/lib/emojiPop';
import type { Profile, BattleQuestion } from '@/lib/db';

type ProfileWithCover = Profile & { cover: string | null };

interface Props {
  profiles: ProfileWithCover[];
  questions: BattleQuestion[];
}

export default function BattleArena({ profiles, questions }: Props) {
  const [p1, setP1] = useState<ProfileWithCover | null>(null);
  const [p2, setP2] = useState<ProfileWithCover | null>(null);
  const [q, setQ] = useState<BattleQuestion | null>(null);
  const [animating, setAnimating] = useState<'left' | 'right' | null>(null);
  const [pending, startTransition] = useTransition();

  // Initialize random profiles and question
  useEffect(() => {
    if (profiles.length >= 2) {
      const shuffled = [...profiles].sort(() => Math.random() - 0.5);
      setP1(shuffled[0]);
      setP2(shuffled[1]);
      setQ(questions[Math.floor(Math.random() * questions.length)]);
    }
  }, [profiles, questions]);

  const handleVote = (winner: 'p1' | 'p2', e: React.MouseEvent) => {
    if (!p1 || !p2 || !q || animating) return;

    const winnerId = winner === 'p1' ? p1.id : p2.id;
    const loserId = winner === 'p1' ? p2.id : p1.id;
    const loserSide = winner === 'p1' ? 'right' : 'left';

    // Emoji burst on winner side
    emojiPop('🏆', e, { count: 4, spread: 60 });
    setTimeout(() => emojiPop('✨', e, { count: 3, spread: 80 }), 80);

    // Start exit animation for loser
    setAnimating(loserSide);

    // Fire network request in background
    startTransition(() => {
      submitBattleVote(q.id, winnerId, loserId).catch(console.error);
    });

    // Wait for exit animation, then swap loser and question
    setTimeout(() => {
      const remainingProfiles = profiles.filter(p => p.id !== p1.id && p.id !== p2.id);
      const nextProfile = remainingProfiles.length > 0
        ? remainingProfiles[Math.floor(Math.random() * remainingProfiles.length)]
        : profiles.find(p => p.id === loserId)!; // Fallback if only 2 profiles exist

      const remainingQuestions = questions.filter(quest => quest.id !== q.id);
      const nextQ = remainingQuestions.length > 0
        ? remainingQuestions[Math.floor(Math.random() * remainingQuestions.length)]
        : q;

      if (loserSide === 'left') setP1(nextProfile);
      else setP2(nextProfile);
      
      setQ(nextQ);
      setAnimating(null);
    }, 400); // match css transition
  };

  if (!p1 || !p2 || !q) return null;

  return (
    <div style={{ width: '100%', maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Question Banner */}
      <div style={{
        textAlign: 'center', background: 'var(--surface-2)', padding: '1.5rem',
        borderRadius: 'var(--r-lg)', border: '2px solid var(--border)',
        boxShadow: 'var(--shadow-md)', position: 'relative', zIndex: 10,
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '.5rem' }}>{q.emoji}</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, color: 'var(--text)' }}>{q.text}</h2>
        <div style={{ fontSize: '.85rem', color: 'var(--text-3)', marginTop: '.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.05em' }}>
          Click the winner to vote
        </div>
      </div>

      {/* Arena */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '1rem', alignItems: 'center' }}>
        
        {/* Player 1 */}
        <div
          onClick={e => handleVote('p1', e)}
          style={{
            cursor: animating ? 'default' : 'pointer',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: animating === 'left' ? 'scale(0.8) translateY(50px)' : 'scale(1)',
            opacity: animating === 'left' ? 0 : 1,
            pointerEvents: animating ? 'none' : 'auto',
          }}
        >
          <FighterCard profile={p1} align="right" />
        </div>

        {/* VS Badge */}
        <div style={{
          width: 60, height: 60, borderRadius: '50%', background: 'var(--red)',
          color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 900, fontSize: '1.5rem', fontStyle: 'italic',
          boxShadow: '0 8px 24px rgba(207, 17, 26, 0.3)',
          border: '4px solid var(--surface)', zIndex: 5,
        }}>
          VS
        </div>

        {/* Player 2 */}
        <div
          onClick={e => handleVote('p2', e)}
          style={{
            cursor: animating ? 'default' : 'pointer',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: animating === 'right' ? 'scale(0.8) translateY(50px)' : 'scale(1)',
            opacity: animating === 'right' ? 0 : 1,
            pointerEvents: animating ? 'none' : 'auto',
          }}
        >
          <FighterCard profile={p2} align="left" />
        </div>

      </div>
    </div>
  );
}

function FighterCard({ profile, align }: { profile: ProfileWithCover, align: 'left' | 'right' }) {
  return (
    <div className="card hover-scale" style={{ padding: 0, overflow: 'hidden', border: '3px solid transparent', transition: 'border 0.2s', ...({
      ':hover': { borderColor: 'var(--green)' }
    } as any) }}>
      <div style={{ aspectRatio: '3/4', background: 'var(--surface-2)', position: 'relative' }}>
        {profile.cover ? (
          <img src={profile.cover} alt={profile.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem' }}>👤</div>
        )}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
          padding: '2rem 1.5rem 1.5rem', textAlign: align,
        }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            {profile.name}
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '.05em' }}>
            {profile.call_name}
          </div>
        </div>
      </div>
    </div>
  );
}
