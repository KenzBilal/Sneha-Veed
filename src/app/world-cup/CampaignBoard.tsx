'use client';

import { useState, useTransition } from 'react';
import { assignToOption } from './actions';
import type { Profile, CampaignOption, CampaignVote } from '@/lib/db';

interface Props {
  campaignId: string;
  profiles: Profile[];
  options: CampaignOption[];
  initialVotes: CampaignVote[];
  active: boolean;
}

export default function CampaignBoard({ campaignId, profiles, options, initialVotes, active }: Props) {
  const [votes, setVotes] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    initialVotes.forEach(v => { map[v.profile_id] = v.option_id; });
    return map;
  });
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState<string | null>(null); // profileId being moved

  const assign = (profileId: string, optionId: string) => {
    if (!active) return;
    setLoading(profileId);
    const prev = { ...votes };
    setVotes(v => ({ ...v, [profileId]: optionId }));
    startTransition(async () => {
      try {
        await assignToOption(campaignId, profileId, optionId);
      } catch {
        setVotes(prev);
      } finally {
        setLoading(null);
      }
    });
  };

  // Group profiles by their current option
  const grouped: Record<string, Profile[]> = {};
  const unassigned: Profile[] = [];

  for (const p of profiles) {
    const optId = votes[p.id];
    if (optId) {
      if (!grouped[optId]) grouped[optId] = [];
      grouped[optId].push(p);
    } else {
      unassigned.push(p);
    }
  }

  const assigned = profiles.length - unassigned.length;

  return (
    <div>
      {/* Progress bar */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.8rem', fontWeight: 700, color: 'var(--text-3)', marginBottom: '.4rem' }}>
          <span>{assigned}/{profiles.length} people assigned</span>
          {!active && <span style={{ color: 'var(--red)', fontWeight: 700 }}>🔒 Campaign Closed</span>}
        </div>
        <div style={{ height: 8, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'var(--green)', borderRadius: 99, width: `${(assigned / Math.max(profiles.length, 1)) * 100}%`, transition: 'width .4s' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1.25rem', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>

        {/* Unassigned pool */}
        {unassigned.length > 0 && (
          <div style={{
            border: '2px dashed var(--border)', borderRadius: 'var(--r-lg)',
            padding: '1rem', background: 'var(--surface-2)',
          }}>
            <div style={{ fontWeight: 800, fontSize: '.9rem', color: 'var(--text-3)', marginBottom: '.75rem' }}>
              👤 Not yet assigned ({unassigned.length})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
              {unassigned.map(p => (
                <PersonChip key={p.id} profile={p} options={options} currentOptionId={null} onAssign={assign} active={active} loading={loading === p.id} />
              ))}
            </div>
          </div>
        )}

        {/* Option columns */}
        {options.map(opt => (
          <div
            key={opt.id}
            style={{
              border: `2px solid ${opt.color}40`,
              borderRadius: 'var(--r-lg)',
              overflow: 'hidden',
              background: opt.color + '08',
            }}
          >
            {/* Option header */}
            <div style={{
              padding: '.85rem 1rem',
              background: opt.color + '18',
              borderBottom: `1.5px solid ${opt.color}30`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                <span style={{ fontSize: '1.3rem' }}>{opt.emoji}</span>
                <span style={{ fontWeight: 900, fontSize: '.95rem', color: opt.color }}>{opt.name}</span>
              </div>
              <span style={{
                background: opt.color, color: 'white', borderRadius: 99,
                padding: '.15rem .6rem', fontSize: '.75rem', fontWeight: 800,
              }}>{(grouped[opt.id] || []).length}</span>
            </div>

            {/* Assigned people */}
            <div style={{ padding: '.75rem', minHeight: 80, display: 'flex', flexWrap: 'wrap', gap: '.5rem', alignContent: 'flex-start' }}>
              {(grouped[opt.id] || []).map(p => (
                <PersonChip key={p.id} profile={p} options={options} currentOptionId={opt.id} onAssign={assign} active={active} loading={loading === p.id} />
              ))}
              {!(grouped[opt.id]?.length) && active && (
                <div style={{ fontSize: '.78rem', color: opt.color + '80', fontStyle: 'italic' }}>Drop someone here...</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PersonChip({
  profile, options, currentOptionId, onAssign, active, loading,
}: {
  profile: Profile;
  options: CampaignOption[];
  currentOptionId: string | null;
  onAssign: (pid: string, oid: string) => void;
  active: boolean;
  loading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const current = options.find(o => o.id === currentOptionId);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => active && setOpen(o => !o)}
        disabled={loading || !active}
        style={{
          display: 'flex', alignItems: 'center', gap: '.35rem',
          padding: '.35rem .75rem',
          borderRadius: 99,
          border: current ? `1.5px solid ${current.color}` : '1.5px solid var(--border)',
          background: current ? current.color + '15' : 'var(--surface)',
          color: current ? current.color : 'var(--text)',
          fontWeight: 700, fontSize: '.8rem', cursor: active ? 'pointer' : 'default',
          transition: 'all .15s',
          opacity: loading ? 0.5 : 1,
          whiteSpace: 'nowrap',
        }}
      >
        {profile.profile_pic
          ? <img src={profile.profile_pic} style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }} alt="" />
          : <span style={{ fontSize: '.9rem' }}>👤</span>
        }
        {profile.call_name}
        {loading && <span style={{ fontSize: '.7rem' }}>⏳</span>}
        {active && !loading && <span style={{ fontSize: '.65rem', opacity: .6 }}>▾</span>}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 9 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute', top: '110%', left: 0, zIndex: 10,
            background: 'var(--surface)', border: '1.5px solid var(--border)',
            borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-md)',
            minWidth: 180, overflow: 'hidden',
          }}>
            <div style={{ padding: '.5rem .75rem', fontSize: '.72rem', fontWeight: 700, color: 'var(--text-3)', borderBottom: '1px solid var(--border)' }}>
              Assign {profile.call_name} to:
            </div>
            {options.map(opt => (
              <button
                key={opt.id}
                onClick={() => { onAssign(profile.id, opt.id); setOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '.5rem',
                  width: '100%', padding: '.55rem .75rem',
                  background: opt.id === currentOptionId ? opt.color + '15' : 'transparent',
                  border: 'none', cursor: 'pointer', fontSize: '.85rem', fontWeight: 600,
                  color: opt.id === currentOptionId ? opt.color : 'var(--text)',
                  textAlign: 'left', transition: 'background .1s',
                }}
              >
                <span>{opt.emoji}</span>
                <span style={{ flex: 1 }}>{opt.name}</span>
                {opt.id === currentOptionId && <span>✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
