import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getProfiles, getPhotosByProfile, getCampaigns, getCampaignOptions, getCampaignVotes } from '@/lib/db';
import { CreateProfileForm, AddPhotoForm, ProfilesTable, UpdateProfilePicForm } from './AdminClient';
import { CreateCampaignForm, CampaignsTable } from '@/components/AdminCampaigns';

export const dynamic = 'force-dynamic';
export const metadata = { title: '⚙️ Admin | Sneha Veed' };

// ─── LOCALHOST ONLY ──────────────────────────────────────────────────────────
// This page returns 404 on any non-local hostname.
async function isLocal(): Promise<boolean> {
  const hdrs = await headers();
  const host = hdrs.get('host') || '';
  return host.startsWith('localhost') || host.startsWith('127.0.0.1') || host.startsWith('::1');
}

export default async function AdminPage() {
  if (!(await isLocal())) return notFound();

  const profiles = await getProfiles();
  const campaigns = await getCampaigns();

  const profilesWithCount = await Promise.all(
    profiles.map(async (p) => {
      const photos = await getPhotosByProfile(p.id);
      return { ...p, photoCount: photos.length };
    })
  );

  const campaignsWithData = await Promise.all(
    campaigns.map(async (c) => {
      const options = await getCampaignOptions(c.id);
      const votes   = await getCampaignVotes(c.id);
      return { ...c, options, voteCount: votes.length };
    })
  );

  return (
    <>
      {/* Admin-only inline styles */}
      <style>{`
        .field-label {
          display: block;
          font-size: .8rem;
          font-weight: 700;
          color: var(--text-2);
          margin-bottom: 6px;
          letter-spacing: .01em;
        }
        .field-input {
          width: 100%;
          padding: .6rem .85rem;
          border: 1.5px solid var(--border);
          border-radius: 8px;
          font-size: .9rem;
          font-family: inherit;
          background: var(--surface);
          color: var(--text);
          outline: none;
          transition: border-color .15s, box-shadow .15s;
        }
        .field-input:focus {
          border-color: var(--green);
          box-shadow: 0 0 0 3px rgba(45,138,78,.1);
        }
      `}</style>

      <div className="page-wrap">
        {/* HEADER */}
        <div style={{ padding: '2.5rem 0 2rem' }} className="fade-up">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', background: 'var(--red-light)', color: 'var(--red)', padding: '.3rem .9rem', borderRadius: 99, fontSize: '.78rem', fontWeight: 700, marginBottom: '.75rem' }}>
            🔒 LOCAL ONLY — Not visible on Vercel
          </div>
          <div className="page-title">⚙️ Admin Panel</div>
          <p style={{ color: 'var(--text-2)' }}>Add and manage group members. Only you can do this.</p>
        </div>

        <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr 1fr' }}>

          {/* CREATE PROFILE */}
          <div className="card fade-up delay-1">
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--green-light)' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--green-dark)' }}>➕ Create New Profile</div>
              <div style={{ fontSize: '.82rem', color: 'var(--green-dark)', opacity: .7, marginTop: '.2rem' }}>
                Profiles are permanent once created — no one can edit them from the site.
              </div>
            </div>
            <div className="card-body">
              <CreateProfileForm />
            </div>
          </div>

          {/* ADD PHOTO */}
          <div className="card fade-up delay-2">
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--wood-light)' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--wood-dark)' }}>📸 Add Photo to Profile</div>
              <div style={{ fontSize: '.82rem', color: 'var(--wood-dark)', opacity: .7, marginTop: '.2rem' }}>
                Upload initial photos. Anyone can also upload from the profile page.
              </div>
            </div>
            <div className="card-body">
              {profiles.length === 0 ? (
                <div className="empty" style={{ padding: '2rem' }}>
                  <div className="empty-emoji">👥</div>
                  <div className="empty-sub">Create a profile first!</div>
                </div>
              ) : (
                <AddPhotoForm profiles={profiles} />
              )}
            </div>
          </div>
        </div>

        {/* SET PROFILE PIC */}
        <div className="card fade-up delay-3" style={{ marginTop: '2rem' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--sun-light)' }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#b37d00' }}>🖼️ Set Profile Photo</div>
            <div style={{ fontSize: '.82rem', color: '#b37d00', opacity: .8, marginTop: '.2rem' }}>
              Pick from existing uploaded photos or upload a brand new one. Auto-converts to WebP.
            </div>
          </div>
          <div className="card-body">
            {profiles.length === 0 ? (
              <div className="empty" style={{ padding: '2rem' }}>
                <div className="empty-emoji">👥</div>
                <div className="empty-sub">Create a profile first!</div>
              </div>
            ) : (
              <UpdateProfilePicForm profiles={profiles} />
            )}
          </div>
        </div>

        {/* PROFILES TABLE */}
        <div className="card fade-up delay-3" style={{ marginTop: '2rem' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            <div className="flex justify-between items-center">
              <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>
                👥 All Profiles ({profiles.length})
              </div>
              <span className="tag tag-gray">{profilesWithCount.reduce((a, p) => a + p.photoCount, 0)} total photos</span>
            </div>
          </div>
          <div style={{ padding: '0' }}>
            <ProfilesTable profiles={profilesWithCount} />
          </div>
        </div>

        {/* CAMPAIGNS */}
        <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr 1fr', marginTop: '2rem' }}>
          <div className="card fade-up delay-4">
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: 'linear-gradient(90deg, var(--sun-light), var(--wood-light))' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#b37d00' }}>🎯 Create Campaign</div>
              <div style={{ fontSize: '.82rem', color: '#b37d00', opacity: .8, marginTop: '.2rem' }}>
                World Cup, best dressed, who is most likely to… anything goes.
              </div>
            </div>
            <div className="card-body">
              <CreateCampaignForm />
            </div>
          </div>

          <div className="card fade-up delay-4">
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>
                🎯 All Campaigns ({campaigns.length})
              </div>
            </div>
            <div style={{ padding: 0 }}>
              <CampaignsTable campaigns={campaignsWithData} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
