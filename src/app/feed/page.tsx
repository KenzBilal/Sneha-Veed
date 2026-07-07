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
  if (d < 7)   return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

const CAPTIONS = [
  "caught lacking in 4k 📸",
  "didn't even try to pose 💀",
  "explain this bro 🤨",
  "this angles crazy 😭",
  "delete this immediately 🔥",
  "down bad astronomically 📉",
  "bro is absolutely lost 🚶‍♂️",
  "the intrusive thoughts won 🧠",
  "moments before disaster 🌪️",
  "what did they mean by this 🧐",
  "respectfully, what is this 🤢",
  "looking like a snack (left out in the sun) 🍔",
  "we all make mistakes 🤷",
  "the camera did you dirty (it didn't) 📸",
  "a modern masterpiece 🖼️",
  "this is why we can't have nice things 🚫",
  "bro thinks he's the main character 🤡",
  "certified hood classic 💿",
  "sus ඞ",
];

export default async function FeedPage() {
  const photos = await getRecentPhotos(40);

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 0 4rem' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem 1rem 1rem', borderBottom: '1px solid var(--border)', marginBottom: '1rem' }} className="fade-up">
        <div style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.03em' }}>📰 Feed</div>
        <div style={{ fontSize: '.85rem', color: 'var(--text-2)', marginTop: '.2rem' }}>Latest chaos from the squad</div>
      </div>

      {photos.length === 0 ? (
        <div className="empty fade-up" style={{ margin: '2rem 1rem' }}>
          <div className="empty-emoji">🌵</div>
          <div className="empty-title">Dead quiet here</div>
          <div className="empty-sub">Go upload something embarrassing to get this started.</div>
        </div>
      ) : (
        <div>
          {photos.map((photo: Photo & { profiles: Profile }, i) => {
            const profile = (photo as any).profiles as Profile | null;
            const avatar = profile?.profile_pic || null;
            const profileName = profile?.call_name || profile?.name || 'Unknown';
            const profileId = photo.profile_id;

            return (
              <article
                key={photo.id}
                className={`fade-up delay-${Math.min(i % 6 + 1, 6)}`}
                style={{
                  background: 'var(--surface)',
                  borderTop: i === 0 ? '1px solid var(--border)' : 'none',
                  borderBottom: '1px solid var(--border)',
                  marginBottom: '.75rem',
                  borderRadius: 0,
                }}
              >
                {/* ─── POST HEADER ─── */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '.75rem',
                  padding: '.75rem 1rem',
                }}>
                  {/* Avatar */}
                  <Link href={`/profile/${profileId}`} style={{ flexShrink: 0 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: '50%',
                      background: 'var(--green-light)',
                      border: '2.5px solid var(--green)',
                      overflow: 'hidden',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.3rem',
                    }}>
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={profileName}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
                        />
                      ) : '👤'}
                    </div>
                  </Link>

                  {/* Name + time */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link
                      href={`/profile/${profileId}`}
                      style={{ fontWeight: 800, fontSize: '.95rem', display: 'block', lineHeight: 1.2 }}
                    >
                      {profileName}
                    </Link>
                    <div style={{ fontSize: '.75rem', color: 'var(--text-3)', marginTop: '.1rem' }}>
                      {timeAgo(photo.uploaded_at)} · exposed 😬
                    </div>
                  </div>

                  {/* More icon */}
                  <div style={{ color: 'var(--text-3)', fontSize: '1.2rem', cursor: 'default' }}>···</div>
                </div>

                {/* ─── PHOTO — full width, natural ratio ─── */}
                <div style={{
                  width: '100%',
                  background: '#000',
                  lineHeight: 0,
                }}>
                  <img
                    src={photo.url}
                    alt={`Photo of ${profileName}`}
                    style={{
                      width: '100%',
                      height: 'auto',
                      maxHeight: '80vh',
                      objectFit: 'contain',
                      display: 'block',
                    }}
                  />
                </div>

                {/* ─── ACTIONS ─── */}
                <div style={{ padding: '.25rem 0 0' }}>
                  <PhotoActions
                    photoId={photo.id}
                    profileId={photo.profile_id}
                    likes={photo.likes}
                    dislikes={photo.dislikes}
                    roasts={photo.roasts || 0}
                  />
                </div>

                {/* ─── FOOTER ─── */}
                <div style={{ padding: '0 1rem .875rem', fontSize: '.85rem' }}>
                  <span style={{ fontWeight: 800 }}>{profileName}</span>
                  {' '}
                  <span style={{ color: 'var(--text-2)' }}>
                    {CAPTIONS[Math.floor(Math.random() * CAPTIONS.length)]}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
