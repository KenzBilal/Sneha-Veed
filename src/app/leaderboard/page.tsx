import Link from 'next/link';
import { getProfiles, getPhotosByProfile, calculateTags } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Leaderboard 🏆 | Sneha Veed' };

interface LBEntry {
  profile: { id: string; name: string; call_name: string };
  value: number;
  sub: string;
}

function LBRow({ rank, entry }: { rank: number; entry: LBEntry }) {
  const rankClass = rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : '';
  const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
  return (
    <Link href={`/profile/${entry.profile.id}`} className="lb-row" style={{ display: 'flex', textDecoration: 'none' }}>
      <div className={`lb-rank ${rankClass}`}>{rankEmoji}</div>
      <div className="lb-info">
        <div className="lb-name">{entry.profile.call_name}</div>
        <div className="lb-sub">aka {entry.profile.name} · {entry.sub}</div>
      </div>
      <div className="lb-score">{entry.value}</div>
    </Link>
  );
}

export default async function LeaderboardPage() {
  const profiles = await getProfiles();

  const allStats = await Promise.all(profiles.map(async (p) => {
    const photos = await getPhotosByProfile(p.id);
    const likes    = photos.reduce((a, ph) => a + ph.likes, 0);
    const dislikes = photos.reduce((a, ph) => a + ph.dislikes, 0);
    const roasts   = photos.reduce((a, ph) => a + (ph.roasts || 0), 0);
    return { profile: p, photos: photos.length, likes, dislikes, roasts, vibe: likes - dislikes };
  }));

  const byLikes    = [...allStats].sort((a, b) => b.likes    - a.likes);
  const byDislikes = [...allStats].sort((a, b) => b.dislikes - a.dislikes);
  const byRoasts   = [...allStats].sort((a, b) => b.roasts   - a.roasts);
  const byPhotos   = [...allStats].sort((a, b) => b.photos   - a.photos);
  const byVibe     = [...allStats].sort((a, b) => b.vibe     - a.vibe);

  const boards = [
    { title: '✨ Most Loved',     emoji: '✨', sub: (s: typeof allStats[0]) => `${s.likes} likes`,    data: byLikes.map(s => ({ profile: s.profile, value: s.likes, sub: `${s.likes} likes` })) },
    { title: '😈 Most Hated',     emoji: '😈', sub: (s: typeof allStats[0]) => `${s.dislikes} dislikes`, data: byDislikes.map(s => ({ profile: s.profile, value: s.dislikes, sub: `${s.dislikes} dislikes` })) },
    { title: '🔥 Most Roasted',   emoji: '🔥', sub: (s: typeof allStats[0]) => `${s.roasts} roasts`,  data: byRoasts.map(s => ({ profile: s.profile, value: s.roasts, sub: `${s.roasts} roasts` })) },
    { title: '📸 Top Photographers', emoji: '📸', sub: (s: typeof allStats[0]) => `${s.photos} photos`, data: byPhotos.map(s => ({ profile: s.profile, value: s.photos, sub: `${s.photos} photos` })) },
    { title: '⚡ Vibe Score',     emoji: '⚡', sub: (s: typeof allStats[0]) => `${s.vibe >= 0 ? '+' : ''}${s.vibe} vibe`, data: byVibe.map(s => ({ profile: s.profile, value: s.vibe, sub: `${s.vibe >= 0 ? '+' : ''}${s.vibe} vibe score` })) },
  ];

  return (
    <div className="page-wrap">
      <div style={{ padding: '2.5rem 0 2rem' }} className="fade-up">
        <div className="page-title">🏆 Leaderboard</div>
        <p style={{ color: 'var(--text-2)' }}>Where legends are made and egos are destroyed.</p>
      </div>

      <div style={{ display: 'grid', gap: '2.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))' }}>
        {boards.map((board, bi) => (
          <div key={board.title} className={`fade-up delay-${bi + 1}`}>
            <div className="section-header">
              <h2 className="section-title">{board.title}</h2>
            </div>
            {board.data.slice(0, 5).map((entry, i) => (
              <LBRow key={entry.profile.id} rank={i + 1} entry={entry} />
            ))}
            {board.data.length === 0 && (
              <div className="empty" style={{ padding: '2rem' }}>
                <div className="empty-sub">No data yet — upload some pics first!</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
