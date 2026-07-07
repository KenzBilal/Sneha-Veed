import Link from 'next/link';
import { getProfiles, calculateTags, getPhotosByProfile, getAllPhotos } from '@/lib/db';
import TagBadge from '@/components/TagBadge';
import AddMemberModal from '@/components/AddMemberModal';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Home | Sneha Veed 🏡' };

const ROAST_QUOTES = [
  '"We don\'t roast the ones we hate. We roast the ones we love." — Sun Tzu, probably',
  '"A friend is someone who knows all about you and still uploads photos of you." — Abraham Lincoln',
  '"Behind every embarrassing photo is a true friend." — Confucius (maybe)',
  '"The camera adds 10 pounds. Our group adds 100 roasts." — Ancient Proverb',
  '"The best mirror is an old friend with a phone." — George Herbert',
  '"Friends buy you food. Best friends upload your worst photos." — Unknown Legend',
  '"True friendship is silently agreeing not to post the photo where you both look bad." — Albert Einstein',
  '"If you can\'t handle me at my worst angle, you don\'t deserve me at my filtered best." — Marilyn Monroe',
  '"A picture is worth a thousand words, and 999 of them are roasts." — Shakespeare',
  '"Keep your friends close, and your phone closer." — The Godfather',
  '"What happens in the group chat, eventually gets uploaded here." — Modern Proverb',
  '"I smile because you are my friends. I laugh because there is nothing you can do about these photos." — The Joker',
  '"Some memories are meant to be cherished. Others are meant to be weaponized." — Art of War, Chapter 14',
  '"A true friend stabs you in the front... with a camera flash." — Oscar Wilde',
  '"There is no delete button in real life, and definitely not on this website." — Steve Jobs',
  '"You either die a hero, or live long enough to see yourself become a meme." — Harvey Dent',
  '"Trust no one. Especially the friend holding the camera." — Fox Mulder',
  '"It takes years to build a reputation and one badly timed photo to ruin it." — Warren Buffett',
  '"To err is human; to upload it is divine." — Alexander Pope',
  '"May your Wi-Fi be strong and your angles be flattering. (Spoiler: They aren\'t)" — Ancient Blessing',
];

export default async function HomePage() {
  const profiles = await getProfiles();
  const allPhotos = await getAllPhotos();
  
  // Random quote on every refresh (since dynamic = force-dynamic)
  const quoteIdx = Math.floor(Math.random() * ROAST_QUOTES.length);
  const quote = ROAST_QUOTES[quoteIdx];

  const totalPhotos = allPhotos.length;
  const totalLikes  = allPhotos.reduce((a, p) => a + p.likes, 0);
  const totalRoasts = allPhotos.reduce((a, p) => a + (p.roasts || 0), 0);

  // 1) Fetch enriched data for all profiles
  const profilesData = await Promise.all(profiles.map(async (profile) => {
    const tags   = await calculateTags(profile.id);
    const photos = await getPhotosByProfile(profile.id);
    const cover  = profile.profile_pic || photos[0]?.url || null;
    const totalL = photos.reduce((a, p) => a + p.likes, 0);
    const totalD = photos.reduce((a, p) => a + p.dislikes, 0);
    return { profile, tags, photos, cover, totalL, totalD, photoCount: photos.length };
  }));

  // 2) Sort: Profiles with photos first, then by photo count (desc), then alphabetical
  profilesData.sort((a, b) => {
    if (a.photoCount > 0 && b.photoCount === 0) return -1;
    if (a.photoCount === 0 && b.photoCount > 0) return 1;
    if (a.photoCount !== b.photoCount) return b.photoCount - a.photoCount;
    return a.profile.name.localeCompare(b.profile.name);
  });

  return (
    <div className="page-wrap">
      {/* HERO */}
      <section className="hero fade-up">
        <div className="hero-emoji">🏡 🌲 🌳</div>
        <h1 className="hero-title">Sneha Veed</h1>
        <p className="hero-sub">
          A digital museum of our worst decisions, terrible camera angles, and highly questionable life choices.
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
      <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 className="section-title">The Squad 👥</h2>
          <span className="section-sub">{profiles.length} members</span>
        </div>
        <AddMemberModal />
      </div>

      {profilesData.length === 0 ? (
        <div className="empty">
          <div className="empty-emoji">👀</div>
          <div className="empty-title">No one here yet</div>
          <div className="empty-sub">Add friends to the database first!</div>
        </div>
      ) : (
        <div className="friend-grid">
          {profilesData.map(({ profile, tags, photos, cover, totalL, totalD }, i) => (
            <Link
              href={`/profile/${profile.id}`}
              key={profile.id}
              className={`card fade-up delay-${Math.min(i + 1, 6)}`}
              style={{ display: 'block' }}
            >
              {/* Cover — full image, no cropping */}
              <div style={{ background: 'var(--surface-2)', position: 'relative' }}>
                {cover ? (
                  <img
                    src={cover}
                    alt={profile.call_name}
                    style={{
                      width: '100%', aspectRatio: '4/5', display: 'block',
                      objectFit: 'cover', background: 'var(--surface-3)'
                    }}
                  />
                ) : (
                  <div style={{ padding: '3rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>
                    👤
                  </div>
                )}

                {/* Gradient scrim at bottom */}
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
                  background: 'linear-gradient(to top, rgba(0,0,0,.7) 0%, transparent 100%)',
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
          ))}
        </div>
      )}
    </div>
  );
}
