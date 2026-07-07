'use client';

import { useState } from 'react';
import { updatePublicCallName } from '@/app/actions';

export default function EditableCallName({ profileId, initialName }: { profileId: string, initialName: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === initialName) {
      setIsEditing(false);
      setName(initialName);
      return;
    }
    setSaving(true);
    try {
      await updatePublicCallName(profileId, trimmed);
      setIsEditing(false);
    } catch (err) {
      alert('Failed to update call name');
      setName(initialName);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setIsEditing(false);
      setName(initialName);
    }
  };

  if (isEditing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem', margin: '1rem 0 0.2rem' }}>
        <input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          disabled={saving}
          style={{
            fontSize: '2rem', fontWeight: 900, textAlign: 'center', fontFamily: 'inherit',
            background: 'transparent', border: '2px dashed var(--border)', borderRadius: 'var(--r-sm)',
            color: 'var(--text)', padding: '0 0.5rem', width: '100%', maxWidth: '300px'
          }}
        />
        {saving && <span style={{ fontSize: '1.2rem' }}>⏳</span>}
      </div>
    );
  }

  return (
    <h1 
      className="profile-call-name hover-scale" 
      onClick={() => setIsEditing(true)}
      title="Click to edit call name"
      style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '.5rem' }}
    >
      {name} <span style={{ fontSize: '1.2rem', opacity: 0.5 }}>✏️</span>
    </h1>
  );
}
