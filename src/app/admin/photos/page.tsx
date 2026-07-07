import { getProfiles } from '@/lib/db';
import { BulkPhotoUpload } from '../BulkPhotoUpload';
import { UpdateProfilePicForm } from '../AdminClient';
import { AdminPhotoManager } from '../AdminPhotoManager';

export const dynamic = 'force-dynamic';
export const metadata = { title: '📸 Photos Admin | Sneha Veed' };

export default async function AdminPhotosPage() {
  const profiles = await getProfiles();

  return (
    <div className="fade-up">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '.5rem' }}>Photos Management</h1>
        <p style={{ color: 'var(--text-2)' }}>Upload new evidence, manage profile pictures, and move misattributed photos.</p>
      </div>

      <div style={{ display: 'grid', gap: '2rem' }}>
        
        <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
          {/* BULK ADD PHOTOS */}
          <div className="card">
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--wood-light)' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--wood-dark)' }}>📸 Bulk Upload Photos</div>
              <div style={{ fontSize: '.82rem', color: 'var(--wood-dark)', opacity: .7, marginTop: '.2rem' }}>
                Upload multiple photos at once. Select a friend to attribute the photos to.
              </div>
            </div>
            <div className="card-body">
              {profiles.length === 0 ? (
                <div className="empty" style={{ padding: '2rem' }}>
                  <div className="empty-emoji">👥</div>
                  <div className="empty-sub">Create a profile first!</div>
                </div>
              ) : (
                <BulkPhotoUpload profiles={profiles} />
              )}
            </div>
          </div>

          {/* SET PROFILE PIC */}
          <div className="card">
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: 'var(--sun-light)' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#b37d00' }}>🖼️ Set Profile Photo</div>
              <div style={{ fontSize: '.82rem', color: '#b37d00', opacity: .8, marginTop: '.2rem' }}>
                Pick from existing uploaded photos or upload a brand new one.
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
        </div>

        {/* ADMIN PHOTO MANAGER */}
        <AdminPhotoManager profiles={profiles} />
        
      </div>
    </div>
  );
}
