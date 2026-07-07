import { getProfiles, getPhotosByProfile } from '@/lib/db';
import { CreateProfileForm, ProfilesTable } from './AdminClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: '👥 Profiles Admin | Sneha Veed' };

export default async function AdminPage() {
  const profiles = await getProfiles();

  const profilesWithCount = await Promise.all(
    profiles.map(async (p) => {
      const photos = await getPhotosByProfile(p.id);
      return { ...p, photoCount: photos.length };
    })
  );

  return (
    <div className="fade-up">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '.5rem' }}>Profiles Dashboard</h1>
        <p style={{ color: 'var(--text-2)' }}>Manage the core cast. Create new members or delete existing ones.</p>
      </div>

      <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {/* CREATE PROFILE */}
        <div className="card">
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

        {/* PROFILES TABLE */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
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
      </div>
    </div>
  );
}
