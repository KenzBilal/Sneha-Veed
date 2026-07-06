'use client';

import { useState, useRef } from 'react';
import { adminCreateCampaign, adminDeleteCampaign, adminToggleCampaign } from '@/app/campaigns/actions';
import type { Campaign, CampaignOption } from '@/lib/db';

export function CreateCampaignForm() {
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');
  const [msg, setMsg] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;
    setStatus('loading');
    setMsg('');
    try {
      const fd = new FormData(formRef.current);
      await adminCreateCampaign(fd);
      setMsg('✅ Campaign created!');
      formRef.current.reset();
      setTimeout(() => setMsg(''), 3000);
    } catch (err: any) {
      setMsg('❌ ' + err.message);
    } finally { setStatus('idle'); }
  };

  return (
    <form ref={formRef} onSubmit={submit} style={{ display: 'grid', gap: '1rem' }}>
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'auto 1fr' }}>
        <div>
          <label className="field-label">Emoji</label>
          <input name="emoji" defaultValue="🎯" className="field-input" style={{ width: 70 }} />
        </div>
        <div>
          <label className="field-label">Campaign Name *</label>
          <input name="name" required placeholder="e.g. World Cup 2026 🏆" className="field-input" />
        </div>
      </div>
      <div>
        <label className="field-label">Description</label>
        <input name="description" placeholder="What is this campaign about?" className="field-input" />
      </div>
      <div>
        <label className="field-label">Options * (one per line)</label>
        <div style={{ fontSize: '.72rem', color: 'var(--text-3)', marginBottom: 6 }}>
          Format: <code>🇧🇷 Brazil #009C3B</code> — emoji, name, hex color (optional)
        </div>
        <textarea
          name="options"
          required
          rows={8}
          placeholder={`🇧🇷 Brazil #009C3B\n🇦🇷 Argentina #75AADB\n🏴󠁧󠁢󠁥󠁮󠁧󠁿 England #CF111A\n🇫🇷 France #002395`}
          className="field-input"
          style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '.85rem' }}
        />
      </div>
      {msg && (
        <div style={{
          padding: '.75rem 1rem', borderRadius: 8,
          background: msg.startsWith('✅') ? 'var(--green-light)' : 'var(--red-light)',
          color: msg.startsWith('✅') ? 'var(--green-dark)' : 'var(--red)',
          fontWeight: 700, fontSize: '.88rem',
        }}>{msg}</div>
      )}
      <button type="submit" disabled={status === 'loading'} className="btn btn-green" style={{ width: '100%', justifyContent: 'center' }}>
        {status === 'loading' ? '⏳ Creating...' : '🎯 Create Campaign'}
      </button>
    </form>
  );
}

export function CampaignsTable({ campaigns }: { campaigns: (Campaign & { options: CampaignOption[]; voteCount: number })[] }) {
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const toggle = async (id: string, active: boolean) => {
    setToggling(id);
    try { await adminToggleCampaign(id, !active); } finally { setToggling(null); }
  };

  const del = async (id: string, name: string) => {
    if (!confirm(`Delete campaign "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try { await adminDeleteCampaign(id); } finally { setDeleting(null); }
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
        <thead>
          <tr style={{ background: 'var(--surface-2)', textAlign: 'left' }}>
            {['', 'Campaign', 'Options', 'Votes', 'Status', ''].map(h => (
              <th key={h} style={{ padding: '.6rem .9rem', fontWeight: 700, color: 'var(--text-2)', borderBottom: '2px solid var(--border)', whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c, i) => (
            <tr key={c.id} style={{ background: i % 2 === 0 ? 'var(--surface)' : 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
              <td style={{ padding: '.6rem .9rem', fontSize: '1.3rem' }}>{c.emoji}</td>
              <td style={{ padding: '.6rem .9rem', fontWeight: 800 }}>{c.name}</td>
              <td style={{ padding: '.6rem .9rem' }}>{c.options.length}</td>
              <td style={{ padding: '.6rem .9rem', fontWeight: 700 }}>{c.voteCount}</td>
              <td style={{ padding: '.6rem .9rem' }}>
                <button
                  onClick={() => toggle(c.id, c.active)}
                  disabled={toggling === c.id}
                  className="btn btn-xs"
                  style={{
                    background: c.active ? 'var(--green-light)' : 'var(--surface-2)',
                    color: c.active ? 'var(--green-dark)' : 'var(--text-3)',
                    border: 'none', fontWeight: 700,
                  }}
                >
                  {toggling === c.id ? '...' : c.active ? '🟢 Active' : '⚫ Closed'}
                </button>
              </td>
              <td style={{ padding: '.6rem .9rem' }}>
                <button
                  onClick={() => del(c.id, c.name)}
                  disabled={deleting === c.id}
                  className="btn btn-xs"
                  style={{ background: 'var(--red-light)', color: 'var(--red)', border: 'none', fontWeight: 700 }}
                >
                  {deleting === c.id ? '...' : '🗑️ Delete'}
                </button>
              </td>
            </tr>
          ))}
          {campaigns.length === 0 && (
            <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-3)' }}>No campaigns yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
