import Link from 'next/link';
import { getProfiles, calculateTags, getPhotosByProfile, getAllPhotos } from '@/lib/db';
import TagBadge from '@/components/TagBadge';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Home | Sneha Veed 🏡' };

const ROAST_QUOTES = [
  '"We don\'t roast the ones we hate. We roast the ones we love." — Sun Tzu, probably',
  '"A friend is someone who knows all about you and still uploads photos of you." — Abraham Lincoln',
  '"Behind every embarrassing photo is a true friend." — Confucius (maybe)',
  '"The camera adds 10 pounds. Our group adds 100 roasts." — Ancient Proverb',
  '"The best mirror is an old friend with a phone." — George Herbert',
  '"Friends buy you food. Best friends upload your worst photos." — Unknown Legend',
];

export default async function HomePage() {
  const profiles = await getProfiles();
  const allPhotos = await getAllPhotos();
  const quoteIdx = Math.floor(Date.now() / 86400000) % ROAST_QUOTES.length;
  const quote = ROAST_QUOTES[quoteIdx];

  const totalPhotos = allPhotos.length;
  const totalLikes  = allPhotos.reduce((a, p) => a + p.likes, 0);
  const totalRoasts = allPhotos.reduce((a, p) => a + (p.roasts || 0), 0);

  return (
    <div className="page-wrap">
      {/* HERO */}
      <section className="hero fade-up">
        <div className="hero-emoji">🏡 🌲 🌳</div>
        <h1 className="hero-title">Sneha Veed</h1>
        <p className="hero-sub">
          The official hall of memories, embarrassments, and pure chaotic energy of our group.
        </p>
        <div className="hero-actions">
          <Link href="/leaderboard" className="btn btn-green">🏆 Leaderboard</Link>
          <Link href="/feed" className="btn btn-outline">📰 Latest Feed</Link>
          {profiles.length > 0 && (
            <Link
              href={`/profile/${profiles[Math.floor(Math.random() * profiles.length)].id}`}
              className="btn btn-wood"
            >
              🎲 Random Profile
            </Link>
          )}
        </div>
      </section>

      {/* DAILY QUOTE */}
      <div className="quote-card fade-up delay-1">
        <div className="quote-text">{quote}</div>
        <div className="quote-attr">— Daily Roast Quote</div>
      </div>

      {/* GLOBAL STATS */}
      <div className="stats-strip fade-up delay-2" style={{ marginBottom: '2.5rem' }}>
        <div className="stat-block">
          <div className="stat-num">{profiles.length}</div>
          <div className="stat-label">🧑 Members</div>
        </div>
        <div className="stat-block">
          <div className="stat-num">{totalPhotos}</div>
          <div className="stat-label">📸 Photos</div>
        </div>
        <div className="stat-block">
          <div className="stat-num">{totalLikes}</div>
          <div className="stat-label">👍 Total Likes</div>
        </div>
        <div className="stat-block">
          <div className="stat-num">{totalRoasts}</div>
          <div className="stat-label">🔥 Total Roasts</div>
        </div>
      </div>

      {/* FRIENDS GRID */}
      <div className="section-header">
        <h2 className="section-title">The Squad 👥</h2>
        <span className="section-sub">{profiles.length} members</span>
      </div>

      {profiles.length === 0 ? (
        <div className="empty">
          <div className="empty-emoji">👀</div>
          <div className="empty-title">No one here yet</div>
          <div className="empty-sub">Add friends to the database first!</div>
        </div>
      ) : (
        <div className="friend-grid">
          {await Promise.all(profiles.map(async (profile, i) => {
            const tags   = await calculateTags(profile.id);
            const photos = await getPhotosByProfile(profile.id);
            const cover  = profile.profile_pic || photos[0]?.url || null;
            const totalL = photos.reduce((a, p) => a + p.likes, 0);
            const totalD = photos.reduce((a, p) => a + p.dislikes, 0);

            return (
              <Link
                href={`/profile/${profile.id}`}
                key={profile.id}
                className={`card fade-up delay-${Math.min(i + 1, 6)}`}
                style={{ display: 'block' }}
              >
                {/* Cover — ratio box so image always fills perfectly */}
                <div style={{ position: 'relative', paddingBottom: '72%', background: 'var(--surface-2)', overflow: 'hidden' }}>
                  {cover ? (
                    <img
                      src={cover}
                      alt={profile.call_name}
                      style={{
                        position: 'absolute', inset: 0,
                        width: '100%', height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center top', /* prioritise faces */
                      }}
                    />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>
                      👤
                    </div>
                  )}

                  {/* Gradient scrim at bottom */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,.55) 0%, transparent 50%)',
                    pointerEvents: 'none',
                  }} />

                  {/* Name overlay on image */}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: '.75rem 1rem',
                  }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white', textShadow: '0 1px 6px rgba(0,0,0,.6)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                      {profile.call_name}
                    </div>
                    <div style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.7)', fontWeight: 600, marginTop: '.1rem' }}>
                      aka {profile.name}
                    </div>
                  </div>
                </div>

                <div className="card-body" style={{ padding: '.85rem 1rem' }}>
                  {/* Mini stats */}
                  <div className="flex gap-1" style={{ marginBottom: '.7rem', fontSize: '.8rem', color: 'var(--text-2)', fontWeight: 600 }}>
                    <span>📸 {photos.length}</span>
                    <span>·</span>
                    <span>👍 {totalL}</span>
                    <span>·</span>
                    <span>👎 {totalD}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {tags.slice(0, 2).map(tag => <TagBadge key={tag.label} tag={tag} />)}
                  </div>
                </div>
              </Link>
            );
          }))}
        </div>
      )}
    </div>
  );
}
