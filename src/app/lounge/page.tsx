import { cookies } from 'next/headers';
import LoungeRoom from './LoungeRoom';
import { getProfile } from '@/lib/db';
import Link from 'next/link';

export const metadata = { title: '🎙️ Voice Lounge | Sneha Veed' };
export const dynamic = 'force-dynamic';

export default async function LoungePage() {
  const cookieStore = await cookies();
  const profileId = cookieStore.get('activeProfileId')?.value;
  
  if (!profileId) {
    return (
      <div className="page-wrap fade-up">
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎙️</div>
          <h2>Join the Voice Lounge</h2>
          <p style={{ color: 'var(--text-3)', margin: '1rem 0 2rem' }}>
            You need to set an active profile before joining the voice lounge.
          </p>
          <Link href="/" className="btn btn-green">Go back to Homepage</Link>
        </div>
      </div>
    );
  }

  const profile = await getProfile(profileId);
  
  if (!profile) {
    return (
      <div className="page-wrap fade-up">
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h2>Profile Error</h2>
          <p>We couldn't find your active profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrap">
      <div style={{ padding: '2.5rem 0 2rem' }} className="fade-up">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '.5rem' }}>
          <span style={{ fontSize: '3rem' }}>🎙️</span>
          <div>
            <div className="page-title">Voice Lounge</div>
            <p style={{ color: 'var(--text-2)', marginTop: '.25rem' }}>
              Drop in, talk smack. Joined as <strong>{profile.call_name}</strong>.
            </p>
          </div>
        </div>
      </div>

      <div className="fade-up delay-1">
        <LoungeRoom profileId={profile.id} />
      </div>
    </div>
  );
}
