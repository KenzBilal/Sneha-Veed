import { notFound } from 'next/navigation';
import { getProfile, getPhotosByProfile, calculateTags, getProfileStats } from '@/lib/db';
import Uploader from '@/components/Uploader';
import PhotoActions from '@/components/PhotoActions';
import TagBadge from '@/components/TagBadge';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getProfile(id);
  return { title: profile ? `${profile.call_name} | Sneha Veed 🏡` : 'Not Found' };
}

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getProfile(id);
  if (!profile) return notFound();

  const [tags, photos, stats] = await Promise.all([
    calculateTags(id),
    getPhotosByProfile(id),
    getProfileStats(id),
  ]);

  // Vibe percentage 0-100 (50 = neutral)
  const totalVotes = stats.totalLikes + stats.totalDislikes;
  const vibePercent = totalVotes > 0 ? Math.round((stats.totalLikes / totalVotes) * 100) : 50;
  const vibeEmoji = vibePercent >= 70 ? '😇' : vibePercent >= 50 ? '😐' : vibePercent >= 30 ? '😅' : '💀';

  return (
    <div className="page-wrap-narrow">
      {/* PROFILE HERO */}
      <div className="profile-hero fade-up">
        <div className="profile-avatar">
          {profile.profile_pic ? (
            <img src={profile.profile_pic} alt={profile.name} />
          ) : photos[0] ? (
            <img src={photos[0].url} alt={profile.name} />
          ) : '👤'}
        </div>
        <h1 className="profile-call-name">{profile.call_name}</h1>
        <p className="profile-real-name">aka {profile.name}</p>
        <p className="profile-bio">"{profile.description}"</p>
        <div className="profile-tags">
          {tags.map(t => <TagBadge key={t.label} tag={t} />)}
        </div>
      </div>

      {/* STATS */}
      <div className="stats-strip fade-up delay-1">
        <div className="stat-block">
          <div className="stat-num">{stats.totalPhotos}</div>
          <div className="stat-label">📸 Photos</div>
        </div>
        <div className="stat-block">
          <div className="stat-num" style={{ color: 'var(--green)' }}>{stats.totalLikes}</div>
          <div className="stat-label">👍 Likes</div>
        </div>
        <div className="stat-block">
          <div className="stat-num" style={{ color: 'var(--red)' }}>{stats.totalDislikes}</div>
          <div className="stat-label">👎 Dislikes</div>
        </div>
        <div className="stat-block">
          <div className="stat-num" style={{ color: 'var(--sun)' }}>{stats.totalRoasts}</div>
          <div className="stat-label">🔥 Roasts</div>
        </div>
        <div className="stat-block">
          <div className="stat-num" style={{ color: stats.vibeScore >= 0 ? 'var(--green)' : 'var(--red)' }}>
            {stats.vibeScore >= 0 ? '+' : ''}{stats.vibeScore}
          </div>
          <div className="stat-label">⚡ Vibe Score</div>
        </div>
      </div>

      {/* VIBE METER */}
      <div className="vibe-meter fade-up delay-2">
        <div className="vibe-label">
          <span>💀 Roasted</span>
          <span>{vibeEmoji} Vibe: {vibePercent}% positive</span>
          <span>😇 Beloved</span>
        </div>
        <div className="vibe-track">
          <div className="vibe-fill" style={{ width: `${vibePercent}%` }} />
        </div>
      </div>

      {/* UPLOADER */}
      <div className="fade-up delay-2">
        <Uploader profileId={id} />
      </div>

      <div className="divider" />

      {/* PHOTO GALLERY */}
      <div className="section-header fade-up delay-3">
        <h2 className="section-title">Evidence Gallery 📁</h2>
        <span className="section-sub">{photos.length} pieces of evidence</span>
      </div>

      {photos.length === 0 ? (
        <div className="empty fade-up delay-3">
          <div className="empty-emoji">📂</div>
          <div className="empty-title">No photos yet</div>
          <div className="empty-sub">Be the first to expose {profile.call_name}. You know you want to. 😈</div>
        </div>
      ) : (
        <div className="masonry fade-up delay-3">
          {photos.map((photo) => (
            <div key={photo.id} className="masonry-item">
              <div className="photo-card">
                <img
                  src={photo.url}
                  alt="Evidence"
                  style={{ width: '100%', objectFit: 'cover', display: 'block' }}
                />
                <PhotoActions
                  photoId={photo.id}
                  profileId={id}
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
