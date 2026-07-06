import Link from 'next/link';
import { getHallOfShame, type Photo, type Profile } from '@/lib/db';
import PhotoActions from '@/components/PhotoActions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Hall of Shame 😈 | Sneha Veed' };

const SHAME_QUOTES = [
  'Every photo here has a story. A really bad one.',
  'The council has decided. These are crimes against photography.',
  '"I look great in photos." — None of these people.',
  'Viewer discretion is advised. (Not really, enjoy the suffering.)',
];

export default async function HallOfShamePage() {
  const photos = await getHallOfShame(30);
  const quote  = SHAME_QUOTES[Math.floor(Date.now() / 86400000) % SHAME_QUOTES.length];

  return (
    <div className="page-wrap">
      <div style={{ padding: '2.5rem 0 1.5rem' }} className="fade-up">
        <div className="page-title">😈 Hall of Shame</div>
        <p style={{ color: 'var(--text-2)' }}>Most disliked photos. The worst of the worst. The legends of embarrassment.</p>
      </div>

      <div className="quote-card fade-up delay-1" style={{ background: 'linear-gradient(135deg, var(--red-light), var(--wood-light))' }}>
        <div className="quote-text" style={{ color: 'var(--red)' }}>{quote}</div>
      </div>

      {photos.length === 0 ? (
        <div className="empty fade-up delay-1">
          <div className="empty-emoji">😇</div>
          <div className="empty-title">Everyone is innocent... for now</div>
          <div className="empty-sub">Upload photos and start disliking 👎</div>
        </div>
      ) : (
        <div className="masonry fade-up delay-2">
          {photos.map((photo: Photo & { profiles: Profile }, i) => (
            <div key={photo.id} className={`masonry-item fade-up delay-${Math.min(i % 6 + 1, 6)}`}>
              <div className="photo-card" style={{ border: '1.5px solid var(--red-light)' }}>
                <img src={photo.url} alt="Shame" style={{ filter: 'brightness(0.95)' }} />
                <div style={{ padding: '.75rem 1rem .25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Link href={`/profile/${photo.profile_id}`} style={{ fontWeight: 700, fontSize: '.88rem', color: 'var(--red)' }}>
                    {photo.profiles?.call_name || 'Unknown'}
                  </Link>
                  <span className="tag tag-red">👎 {photo.dislikes}</span>
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
