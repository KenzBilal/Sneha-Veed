import Link from 'next/link';
import { getRecentPhotos, type Photo, type Profile } from '@/lib/db';
import PhotoActions from '@/components/PhotoActions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Feed 📰 | Sneha Veed' };

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)   return 'just now';
  if (m < 60)  return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default async function FeedPage() {
  const photos = await getRecentPhotos(30);

  return (
    <div className="page-wrap-narrow">
      <div style={{ padding: '2.5rem 0 2rem' }} className="fade-up">
        <div className="page-title">📰 Activity Feed</div>
        <p style={{ color: 'var(--text-2)' }}>Latest uploads across the whole group. Freshest chaos first.</p>
      </div>

      {photos.length === 0 ? (
        <div className="empty fade-up">
          <div className="empty-emoji">🌵</div>
          <div className="empty-title">Dead quiet here</div>
          <div className="empty-sub">Go upload something embarrassing to get this started.</div>
        </div>
      ) : (
        <div className="fade-up delay-1">
          {photos.map((photo: Photo & { profiles: Profile }, i) => (
            <div key={photo.id} className={`fade-up delay-${Math.min(i % 6 + 1, 6)}`} style={{ marginBottom: '1.5rem' }}>
              <div className="card" style={{ overflow: 'hidden' }}>
                {/* Header */}
                <div className="flex items-center gap-2" style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'var(--green-light)', border: '2px solid var(--green)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem', flexShrink: 0,
                  }}>👤</div>
                  <div style={{ flex: 1 }}>
                    <Link href={`/profile/${photo.profile_id}`} style={{ fontWeight: 800, fontSize: '.95rem' }}>
                      {(photo as any).profiles?.call_name || 'Unknown'}
                    </Link>
                    <div style={{ fontSize: '.78rem', color: 'var(--text-3)' }}>
                      Someone exposed them · {timeAgo(photo.uploaded_at)}
                    </div>
                  </div>
                </div>

                {/* Image */}
                <img src={photo.url} alt="Feed photo" style={{ width: '100%', objectFit: 'cover', maxHeight: '500px' }} />

                {/* Actions */}
                <PhotoActions
                  photoId={photo.id}
                  profileId={photo.profile_id}
                  likes={photo.likes}
                  dislikes={photo.dislikes}
                  roasts={photo.roasts || 0}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
