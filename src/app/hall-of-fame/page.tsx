import Link from 'next/link';
import { getHallOfFame, type Photo, type Profile } from '@/lib/db';
import PhotoActions from '@/components/PhotoActions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Hall of Fame ✨ | Sneha Veed' };

export default async function HallOfFamePage() {
  const photos = await getHallOfFame(30);

  return (
    <div className="page-wrap">
      <div style={{ padding: '2.5rem 0 2rem' }} className="fade-up">
        <div className="page-title">✨ Hall of Fame</div>
        <p style={{ color: 'var(--text-2)' }}>The most loved photos across the entire group. Legends only.</p>
      </div>

      {photos.length === 0 ? (
        <div className="empty fade-up">
          <div className="empty-emoji">⭐</div>
          <div className="empty-title">Nothing here yet</div>
          <div className="empty-sub">Upload photos and start liking! 👍</div>
        </div>
      ) : (
        <div className="masonry fade-up delay-1">
          {photos.map((photo: Photo & { profiles: Profile }, i) => (
            <div key={photo.id} className={`masonry-item fade-up delay-${Math.min(i % 6 + 1, 6)}`}>
              <div className="photo-card">
                <img src={photo.url} alt="Fame" />
                <div style={{ padding: '.75rem 1rem .25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Link href={`/profile/${photo.profile_id}`} style={{ fontWeight: 700, fontSize: '.88rem', color: 'var(--green-dark)' }}>
                    {photo.profiles?.call_name || 'Unknown'}
                  </Link>
                  <span className="tag tag-sun">👍 {photo.likes}</span>
                </div>
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
