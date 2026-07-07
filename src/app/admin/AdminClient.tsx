'use client';

import { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { adminCreateProfile, adminAddPhoto, adminDeleteProfile, adminUpdateProfilePic } from './actions';
import { supabase } from '@/lib/db';
import type { Profile, Photo } from '@/lib/db';

// ===================== COMPRESS HELPER =====================
async function compressToWebp(file: File, onProgress?: (p: number) => void): Promise<File> {
  return imageCompression(file, {
    maxSizeMB: 3,
    maxWidthOrHeight: 2048,
    useWebWorker: false,
    fileType: 'image/webp',
    onProgress,
  });
}

// ===================== IMAGE PREVIEW =====================
function ImagePreview({ file }: { file: File | null }) {
  if (!file) return null;
  const url = URL.createObjectURL(file);
  return (
    <img
      src={url}
      alt="preview"
      style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: 8, marginTop: 8 }}
    />
  );
}

// ===================== FILE INPUT =====================
function FileInput({
  label,
  onChange,
  preview = false,
}: {
  label: string;
  onChange: (f: File | null) => void;
  preview?: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.files?.[0];
    if (!raw) return;
    if (!raw.type.startsWith('image/')) { alert('Images only!'); return; }
    setConverting(true);
    try {
      const webp = await compressToWebp(raw);
      const named = new File([webp], raw.name.replace(/\.[^.]+$/, '') + '.webp', { type: 'image/webp' });
      setFile(named);
      onChange(named);
    } finally { setConverting(false); }
  };

  return (
    <div>
      <label style={{ fontSize: '.8rem', fontWeight: 700, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>{label}</label>
      <div
        onClick={() => ref.current?.click()}
        style={{
          border: '2px dashed var(--green)', borderRadius: 10,
          padding: '1rem', textAlign: 'center', cursor: 'pointer',
          background: 'var(--green-light)', transition: 'all .15s',
        }}
      >
        <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{converting ? '⏳' : '📁'}</div>
        <div style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--green-dark)' }}>
          {converting ? 'Converting to WebP...' : file ? `✅ ${file.name}` : 'Click to choose image'}
        </div>
        <div style={{ fontSize: '.72rem', color: 'var(--text-3)', marginTop: 3 }}>Any format → auto WebP</div>
      </div>
      {preview && <ImagePreview file={file} />}
      <input ref={ref} type="file" accept="image/*" onChange={handle} style={{ display: 'none' }} />
    </div>
  );
}

// ===================== CREATE PROFILE FORM =====================
export function CreateProfileForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [msg, setMsg] = useState('');
  const [picFile, setPicFile] = useState<File | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;
    setStatus('loading');
    setMsg('');
    try {
      const fd = new FormData(formRef.current);
      if (picFile) fd.set('profile_pic', picFile);
      await adminCreateProfile(fd);
      setMsg('✅ Profile created!');
      setStatus('done');
      formRef.current.reset();
      setPicFile(null);
      setTimeout(() => setStatus('idle'), 2500);
    } catch (err: any) {
      setMsg('❌ ' + err.message);
      setStatus('idle');
    }
  };

  return (
    <form ref={formRef} onSubmit={submit} style={{ display: 'grid', gap: '1rem' }}>
      <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
        <div>
          <label className="field-label">Real Name *</label>
          <input name="name" required placeholder="e.g. Sneha" className="field-input" />
        </div>
        <div>
          <label className="field-label">Call Name *</label>
          <input name="call_name" required placeholder="e.g. The Boss" className="field-input" />
        </div>
      </div>
      <div>
        <label className="field-label">Bio / Description</label>
        <textarea name="description" rows={2} placeholder="Something funny about them..." className="field-input" style={{ resize: 'vertical' }} />
      </div>
      <FileInput label="Profile Picture (optional)" onChange={setPicFile} preview />

      {msg && (
        <div style={{
          padding: '.75rem 1rem', borderRadius: 8,
          background: msg.startsWith('✅') ? 'var(--green-light)' : 'var(--red-light)',
          color: msg.startsWith('✅') ? 'var(--green-dark)' : 'var(--red)',
          fontWeight: 700, fontSize: '.88rem',
        }}>{msg}</div>
      )}
      <button type="submit" disabled={status === 'loading'} className="btn btn-green" style={{ width: '100%', justifyContent: 'center' }}>
        {status === 'loading' ? '⏳ Creating...' : '➕ Create Profile'}
      </button>
    </form>
  );
}

// ===================== ADD PHOTO FORM =====================
export function AddPhotoForm({ profiles }: { profiles: Profile[] }) {
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');
  const [msg, setMsg] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current || !photoFile) { setMsg('❌ Please select an image'); return; }
    setStatus('loading');
    setMsg('');
    try {
      const fd = new FormData(formRef.current);
      fd.set('file', photoFile);
      await adminAddPhoto(fd);
      setMsg('✅ Photo added!');
      formRef.current.reset();
      setPhotoFile(null);
      setTimeout(() => setMsg(''), 2500);
    } catch (err: any) {
      setMsg('❌ ' + err.message);
    } finally { setStatus('idle'); }
  };

  return (
    <form ref={formRef} onSubmit={submit} style={{ display: 'grid', gap: '1rem' }}>
      <div>
        <label className="field-label">Add Photo To Profile</label>
        <select name="profileId" required className="field-input">
          <option value="">— Select person —</option>
          {profiles.map(p => (
            <option key={p.id} value={p.id}>{p.call_name} ({p.name})</option>
          ))}
        </select>
      </div>
      <FileInput label="Photo" onChange={setPhotoFile} preview />
      {msg && (
        <div style={{
          padding: '.75rem 1rem', borderRadius: 8,
          background: msg.startsWith('✅') ? 'var(--green-light)' : 'var(--red-light)',
          color: msg.startsWith('✅') ? 'var(--green-dark)' : 'var(--red)',
          fontWeight: 700, fontSize: '.88rem',
        }}>{msg}</div>
      )}
      <button type="submit" disabled={status === 'loading'} className="btn btn-wood" style={{ width: '100%', justifyContent: 'center' }}>
        {status === 'loading' ? '⏳ Uploading...' : '📸 Add Photo'}
      </button>
    </form>
  );
}

// ===================== UPDATE PROFILE PIC FORM =====================
export function UpdateProfilePicForm({ profiles }: { profiles: Profile[] }) {
  const [profileId, setProfileId] = useState('');
  const [photos, setPhotos] = useState<{ id: string; url: string }[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [selected, setSelected] = useState<string | null>(null); // existing URL
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading'>('idle');
  const [msg, setMsg] = useState('');

  const fetchPhotos = async (id: string) => {
    setLoadingPhotos(true);
    setPhotos([]);
    setSelected(null);
    setUploadFile(null);
    try {
      const { data } = await supabase.from('photos').select('id, url').eq('profile_id', id).order('uploaded_at', { ascending: false });
      setPhotos(data || []);
    } finally { setLoadingPhotos(false); }
  };

  const onProfileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setProfileId(id);
    if (id) fetchPhotos(id);
    else setPhotos([]);
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.files?.[0];
    if (!raw) return;
    if (!raw.type.startsWith('image/')) { alert('Images only!'); return; }
    setSelected(null); // deselect existing when uploading new
    const webp = await compressToWebp(raw);
    const named = new File([webp], raw.name.replace(/\.[^.]+$/, '') + '.webp', { type: 'image/webp' });
    setUploadFile(named);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileId) { setMsg('❌ Select a profile'); return; }
    if (!selected && !uploadFile) { setMsg('❌ Pick or upload a photo'); return; }
    setStatus('loading');
    setMsg('');
    try {
      const fd = new FormData();
      fd.set('profileId', profileId);
      if (selected) fd.set('existingUrl', selected);
      if (uploadFile && !selected) fd.set('file', uploadFile);
      await adminUpdateProfilePic(fd);
      setMsg('✅ Profile photo updated!');
      setTimeout(() => setMsg(''), 3000);
    } catch (err: any) {
      setMsg('❌ ' + err.message);
    } finally { setStatus('idle'); }
  };

  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <form onSubmit={submit} style={{ display: 'grid', gap: '1rem' }}>
      {/* Profile selector */}
      <div>
        <label className="field-label">Select Profile *</label>
        <select value={profileId} onChange={onProfileChange} required className="field-input">
          <option value="">— Choose person —</option>
          {profiles.map(p => (
            <option key={p.id} value={p.id}>{p.call_name} ({p.name})</option>
          ))}
        </select>
      </div>

      {/* Existing photos grid */}
      {profileId && (
        <div>
          <label className="field-label">Choose Existing Photo</label>
          {loadingPhotos ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-3)', fontSize: '.85rem' }}>Loading photos...</div>
          ) : photos.length === 0 ? (
            <div style={{ padding: '.75rem', borderRadius: 8, background: 'var(--surface-2)', fontSize: '.82rem', color: 'var(--text-3)', textAlign: 'center' }}>
              No photos yet — upload one below
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '.5rem' }}>
              {photos.map(ph => (
                <div
                  key={ph.id}
                  onClick={() => { setSelected(ph.url); setUploadFile(null); }}
                  style={{
                    cursor: 'pointer',
                    borderRadius: 8,
                    border: selected === ph.url ? '3px solid var(--green)' : '2px solid var(--border)',
                    overflow: 'hidden',
                    aspectRatio: '1',
                    transition: 'border .15s, transform .15s',
                    transform: selected === ph.url ? 'scale(1.05)' : 'scale(1)',
                    position: 'relative',
                  }}
                >
                  <img src={ph.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {selected === ph.url && (
                    <div style={{
                      position: 'absolute', inset: 0,
                      background: 'rgba(45,138,78,.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.5rem',
                    }}>✅</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* OR divider */}
      {profileId && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--text-3)' }}>OR UPLOAD NEW</span>
          <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>
      )}

      {/* Upload new */}
      {profileId && (
        <div>
          <input ref={fileRef} type="file" accept="image/*" onChange={onFileChange} style={{ display: 'none' }} />
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border: uploadFile ? '2px solid var(--green)' : '2px dashed var(--border)',
              borderRadius: 10, padding: '1rem', textAlign: 'center', cursor: 'pointer',
              background: uploadFile ? 'var(--green-light)' : 'var(--surface-2)', transition: 'all .15s',
            }}
          >
            <div style={{ fontSize: '1.3rem', marginBottom: 4 }}>{uploadFile ? '✅' : '📤'}</div>
            <div style={{ fontSize: '.82rem', fontWeight: 600, color: uploadFile ? 'var(--green-dark)' : 'var(--text-2)' }}>
              {uploadFile ? uploadFile.name : 'Click to upload a new photo'}
            </div>
            <div style={{ fontSize: '.72rem', color: 'var(--text-3)', marginTop: 3 }}>Auto-converts to WebP</div>
          </div>
          {uploadFile && (
            <img
              src={URL.createObjectURL(uploadFile)}
              alt="preview"
              style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: 8, marginTop: 8 }}
            />
          )}
        </div>
      )}

      {msg && (
        <div style={{
          padding: '.75rem 1rem', borderRadius: 8,
          background: msg.startsWith('✅') ? 'var(--green-light)' : 'var(--red-light)',
          color: msg.startsWith('✅') ? 'var(--green-dark)' : 'var(--red)',
          fontWeight: 700, fontSize: '.88rem',
        }}>{msg}</div>
      )}

      <button type="submit" disabled={status === 'loading' || !profileId} className="btn btn-green" style={{ width: '100%', justifyContent: 'center' }}>
        {status === 'loading' ? '⏳ Saving...' : '🖼️ Set as Profile Photo'}
      </button>
    </form>
  );
}

// ===================== PROFILES TABLE =====================
export function ProfilesTable({ profiles }: { profiles: (Profile & { photoCount: number })[] }) {
  const [deleting, setDeleting] = useState<string | null>(null);
  
  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCallName, setEditCallName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [saving, setSaving] = useState(false);

  const startEdit = (p: Profile) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditCallName(p.call_name);
    setEditBio(p.description || '');
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      const { updateProfileDetails } = await import('@/app/actions');
      await updateProfileDetails(editingId, editName, editCallName, editBio);
      setEditingId(null);
    } catch (err: any) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const del = async (id: string, name: string) => {
    if (!confirm(`Delete ${name}? This removes their profile. Photos stay.`)) return;
    setDeleting(id);
    try { await adminDeleteProfile(id); } finally { setDeleting(null); }
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.88rem' }}>
        <thead>
          <tr style={{ background: 'var(--surface-2)', textAlign: 'left' }}>
            {['Pic', 'Call Name', 'Real Name', 'Bio', 'Photos', 'Actions'].map(h => (
              <th key={h} style={{ padding: '.6rem .9rem', fontWeight: 700, color: 'var(--text-2)', whiteSpace: 'nowrap', borderBottom: '2px solid var(--border)' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {profiles.map((p, i) => {
            const isEditing = editingId === p.id;
            
            return (
              <tr key={p.id} style={{ background: i % 2 === 0 ? 'var(--surface)' : 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '.6rem .9rem' }}>
                  {p.profile_pic
                    ? <img src={p.profile_pic} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
                    : <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>👤</div>
                  }
                </td>
                
                {/* Call Name */}
                <td style={{ padding: '.6rem .9rem', fontWeight: 800 }}>
                  {isEditing ? (
                    <input className="field-input" value={editCallName} onChange={e => setEditCallName(e.target.value)} style={{ padding: '.2rem .4rem' }} />
                  ) : p.call_name}
                </td>
                
                {/* Real Name */}
                <td style={{ padding: '.6rem .9rem', color: isEditing ? 'var(--text)' : 'var(--text-2)' }}>
                  {isEditing ? (
                    <input className="field-input" value={editName} onChange={e => setEditName(e.target.value)} style={{ padding: '.2rem .4rem' }} />
                  ) : p.name}
                </td>
                
                {/* Bio */}
                <td style={{ padding: '.6rem .9rem', color: isEditing ? 'var(--text)' : 'var(--text-3)', maxWidth: 200, whiteSpace: isEditing ? 'normal' : 'nowrap', overflow: isEditing ? 'visible' : 'hidden', textOverflow: 'ellipsis' }}>
                  {isEditing ? (
                    <textarea className="field-input" value={editBio} onChange={e => setEditBio(e.target.value)} rows={2} style={{ padding: '.2rem .4rem' }} />
                  ) : (p.description || '—')}
                </td>
                
                <td style={{ padding: '.6rem .9rem', fontWeight: 700 }}>{p.photoCount}</td>
                
                <td style={{ padding: '.6rem .9rem', display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                  {isEditing ? (
                    <>
                      <button onClick={saveEdit} disabled={saving} className="btn btn-xs btn-green" style={{ padding: '.2rem .6rem' }}>
                        {saving ? '⏳' : '💾 Save'}
                      </button>
                      <button onClick={() => setEditingId(null)} disabled={saving} className="btn btn-xs btn-outline" style={{ padding: '.2rem .6rem' }}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEdit(p)} className="btn btn-xs btn-outline" style={{ padding: '.2rem .6rem' }}>
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => del(p.id, p.call_name)}
                        disabled={deleting === p.id}
                        className="btn btn-xs"
                        style={{ background: 'var(--red-light)', color: 'var(--red)', border: 'none', fontWeight: 700, padding: '.2rem .6rem' }}
                      >
                        {deleting === p.id ? '...' : '🗑️'}
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
          {profiles.length === 0 && (
            <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-3)' }}>No profiles yet</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
