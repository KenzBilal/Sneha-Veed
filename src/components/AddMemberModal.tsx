'use client';

import { useState } from 'react';
import { publicCreateProfile } from '@/app/actions';

export default function AddMemberModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      const fd = new FormData(e.currentTarget);
      await publicCreateProfile(fd);
      setMsg('✅ Member added successfully!');
      setTimeout(() => {
        setIsOpen(false);
        setMsg('');
      }, 1500);
    } catch (err: any) {
      setMsg('❌ ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="btn-pop"
        style={{
          background: 'var(--surface-2)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-md)', padding: '.3rem .6rem',
          fontSize: '.9rem', cursor: 'pointer', fontWeight: 700, color: 'var(--text)'
        }}
      >
        ➕ Add Member
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', padding: '1rem'
        }}>
          <div style={{
            background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--r-lg)',
            width: '100%', maxWidth: '400px', border: '1px solid var(--border)'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '1.5rem', marginTop: 0 }}>
              Add a New Target 🎯
            </h2>
            
            <form onSubmit={submit} style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <label className="field-label">Real Name *</label>
                <input name="name" required placeholder="e.g. John Doe" className="field-input" />
              </div>
              <div>
                <label className="field-label">Call Name *</label>
                <input name="call_name" required placeholder="e.g. The Boss" className="field-input" />
              </div>
              <div>
                <label className="field-label">Bio / Description</label>
                <textarea name="description" rows={3} placeholder="Something funny about them..." className="field-input" style={{ resize: 'vertical' }} />
              </div>
              
              <div style={{ fontSize: '.8rem', color: 'var(--text-3)' }}>
                Note: Profile pictures are added automatically when you upload photos to their profile.
              </div>

              {msg && (
                <div style={{
                  padding: '.75rem 1rem', borderRadius: 8,
                  background: msg.startsWith('✅') ? 'var(--green-light)' : 'var(--red-light)',
                  color: msg.startsWith('✅') ? 'var(--green-dark)' : 'var(--red)',
                  fontWeight: 700, fontSize: '.88rem',
                }}>{msg}</div>
              )}

              <div style={{ display: 'flex', gap: '.5rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsOpen(false)} disabled={loading} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn btn-green" style={{ flex: 2, justifyContent: 'center' }}>
                  {loading ? '⏳ Adding...' : '➕ Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
