import { getProfiles, getBattleQuestions, getPhotosByProfile } from '@/lib/db';
import BattleArena from './BattleArena';

export const dynamic = 'force-dynamic';
export const metadata = { title: '⚔️ 1v1 | Sneha Veed' };

export default async function BattlesPage() {
  const [profiles, questions] = await Promise.all([
    getProfiles(),
    getBattleQuestions(),
  ]);

  // We need to pass at least one photo for each profile for the arena
  const profilesWithPhoto = await Promise.all(
    profiles.map(async (p) => {
      const photos = await getPhotosByProfile(p.id);
      return { ...p, cover: p.profile_pic || photos[0]?.url || null };
    })
  );

  return (
    <div className="page-wrap" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '2.5rem 0 1rem', textAlign: 'center' }} className="fade-up">
        <div className="page-title" style={{ fontSize: '2.5rem', marginBottom: '.5rem' }}>⚔️ 1v1</div>
        <p style={{ color: 'var(--text-2)', maxWidth: 500, margin: '0 auto' }}>
          Who is better? Pick a winner. The loser gets swapped out. Wins and losses permanently affect profile tags!
        </p>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 0' }} className="fade-up delay-1">
        {profilesWithPhoto.length >= 2 && questions.length > 0 ? (
          <BattleArena profiles={profilesWithPhoto} questions={questions} />
        ) : (
          <div className="empty">
            <div className="empty-emoji">🤷‍♂️</div>
            <div className="empty-title">Need more players</div>
            <div className="empty-sub">Add at least 2 profiles in the admin panel to start battles.</div>
          </div>
        )}
      </div>
    </div>
  );
}
