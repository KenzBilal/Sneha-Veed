'use client';

import { useState } from 'react';
import { updateProfileDetails } from '@/app/actions';
import type { Profile } from '@/lib/db';
import TagBadge from '@/components/TagBadge';

interface Props {
  profile: Profile;
  tags: any[];
}

export default function EditProfileForm({ profile, tags }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState(profile.name);
  const [callName, setCallName] = useState(profile.call_name);
  const [bio, setBio] = useState(profile.description || '');

  const handleSave = async () => {
    if (!name.trim() || !callName.trim()) {
      alert('Name and Call Name are required.');
      return;
    }
    setLoading(true);
    try {
      await updateProfileDetails(profile.id, name, callName, bio);
      setIsEditing(false);
    } catch (err: any) {
      alert('Failed to update: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
        <input 
          className="input" 
          value={callName} 
          onChange={e => setCallName(e.target.value)} 
          placeholder="Call Name (e.g. The Overthinker)"
          style={{ fontSize: '1.5rem', fontWeight: 900, textAlign: 'center', background: 'var(--surface)' }}
        />
        <input 
          className="input" 
          value={name} 
          onChange={e => setName(e.target.value)} 
          placeholder="Real Name"
          style={{ textAlign: 'center', background: 'var(--surface)' }}
        />
        <textarea 
          className="input" 
          value={bio} 
          onChange={e => setBio(e.target.value)} 
          placeholder="Bio / Quote"
          rows={3}
          style={{ textAlign: 'center', background: 'var(--surface)', resize: 'none' }}
        />
        
        <div style={{ display: 'flex', gap: '.5rem', justifyContent: 'center', marginTop: '.5rem' }}>
          <button className="btn btn-outline" onClick={() => setIsEditing(false)} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-green" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsEditing(true)}
        className="btn-pop"
        style={{ 
          position: 'absolute', top: '-10px', right: 0, 
          background: 'var(--surface)', border: '1px solid var(--border)', 
          padding: '.4rem .6rem', borderRadius: 'var(--r-md)', fontSize: '.8rem',
          cursor: 'pointer', fontWeight: 700, color: 'var(--text-2)'
        }}
        title="Edit Profile"
      >
        ✏️ Edit
      </button>

      <h1 className="profile-call-name">{profile.call_name}</h1>
      <p className="profile-real-name">aka {profile.name}</p>
      <p className="profile-bio">"{profile.description}"</p>
      
      <div className="profile-tags">
        {tags.map(t => <TagBadge key={t.label} tag={t} />)}
      </div>
    </div>
  );
}
