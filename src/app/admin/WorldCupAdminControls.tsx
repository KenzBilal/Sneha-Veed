'use client';

import { useTransition } from 'react';
import { adminToggleEliminate } from './worldCupActions';
import type { CampaignOption } from '@/lib/db';

export function WorldCupEliminationBoard({ options }: { options: CampaignOption[] }) {
  const [pending, startTransition] = useTransition();

  const toggle = (id: string, eliminated: boolean) => {
    startTransition(() => {
      adminToggleEliminate(id, eliminated).catch(console.error);
    });
  };

  const active = options.filter(o => !o.eliminated);
  const eliminated = options.filter(o => o.eliminated);

  return (
    <div style={{ padding: '1.5rem', background: 'var(--surface-2)', borderRadius: 'var(--r-lg)', border: '1px solid var(--border)' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '.75rem', color: 'var(--green)' }}>
          🟢 Active Teams ({active.length})
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
          {active.map(o => (
            <button
              key={o.id}
              disabled={pending}
              onClick={() => toggle(o.id, true)}
              style={{
                padding: '.4rem .8rem', background: o.color + '20', color: o.color,
                border: `2px solid ${o.color}`, borderRadius: 99, fontSize: '.85rem', fontWeight: 700,
                cursor: 'pointer', transition: 'transform 0.1s',
                opacity: pending ? 0.6 : 1,
              }}
            >
              {o.emoji} {o.name} <span style={{ opacity: 0.5, fontSize: '.75rem', marginLeft: '.25rem' }}>Eliminate</span>
            </button>
          ))}
          {active.length === 0 && <span style={{ fontSize: '.8rem', color: 'var(--text-3)' }}>None.</span>}
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '.75rem', color: 'var(--red)' }}>
          🔴 Eliminated Teams ({eliminated.length})
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
          {eliminated.map(o => (
            <button
              key={o.id}
              disabled={pending}
              onClick={() => toggle(o.id, false)}
              style={{
                padding: '.4rem .8rem', background: 'var(--surface)', color: 'var(--text-3)',
                border: `2px dashed var(--border)`, borderRadius: 99, fontSize: '.85rem', fontWeight: 700,
                cursor: 'pointer', filter: 'grayscale(1)',
                opacity: pending ? 0.6 : 1, textDecoration: 'line-through',
              }}
            >
              {o.emoji} {o.name} <span style={{ opacity: 0.5, fontSize: '.75rem', marginLeft: '.25rem', textDecoration: 'none' }}>Revive</span>
            </button>
          ))}
          {eliminated.length === 0 && <span style={{ fontSize: '.8rem', color: 'var(--text-3)' }}>None.</span>}
        </div>
      </div>
    </div>
  );
}
