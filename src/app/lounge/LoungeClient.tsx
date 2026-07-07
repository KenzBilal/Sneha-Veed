'use client';

import { useState } from 'react';
import type { Profile } from '@/lib/db';
import LoungeRoom from './LoungeRoom';

interface Props {
  profiles: Profile[];
  initialActiveId?: string;
}

export default function LoungeClient({ profiles, initialActiveId }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (selectedId) {
    const profile = profiles.find(p => p.id === selectedId);
    return (
      <div className="fade-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          <span style={{ fontSize: '3rem' }}>🎙️</span>
          <div>
            <div className="page-title">Voice Lounge</div>
            <p style={{ color: 'var(--text-2)', marginTop: '.25rem' }}>
              Joined as <strong>{profile?.call_name}</strong>.
            </p>
          </div>
        </div>
        <LoungeRoom profileId={selectedId} onLeave={() => setSelectedId(null)} />
      </div>
    );
  }

  // Suggest the initial active ID if they have one, but let them confirm
  const initial = profiles.find(p => p.id === initialActiveId);

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <span style={{ fontSize: '3rem' }}>🎙️</span>
        <div>
          <div className="page-title">Voice Lounge</div>
          <p style={{ color: 'var(--text-2)', marginTop: '.25rem' }}>
            Who is joining the call? Select your profile.
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Choose Your Avatar</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
          {profiles.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '.5rem',
                padding: '1rem', borderRadius: 'var(--r-lg)',
                border: p.id === initialActiveId ? '2px solid var(--primary)' : '2px solid transparent',
                background: 'var(--surface-2)',
                cursor: 'pointer', transition: 'all .2s',
                width: '120px'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'var(--surface-3)'}
              onMouseOut={e => e.currentTarget.style.background = 'var(--surface-2)'}
            >
              {p.profile_pic ? (
                <img src={p.profile_pic} style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover' }} alt="" />
              ) : (
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                  👤
                </div>
              )}
              <span style={{ fontWeight: 700, fontSize: '.85rem', color: 'var(--text)', textAlign: 'center', wordBreak: 'break-word' }}>
                {p.call_name}
              </span>
              {p.id === initialActiveId && (
                <span style={{ fontSize: '.65rem', background: 'var(--primary)', color: 'white', padding: '.1rem .4rem', borderRadius: 99, marginTop: '-2px' }}>
                  Current
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
