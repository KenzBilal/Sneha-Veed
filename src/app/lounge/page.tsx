import { cookies } from 'next/headers';
import { getProfiles } from '@/lib/db';
import LoungeClient from './LoungeClient';

export const metadata = { title: '🎙️ Voice Lounge | Sneha Veed' };
export const dynamic = 'force-dynamic';

export default async function LoungePage() {
  const cookieStore = await cookies();
  const activeProfileId = cookieStore.get('activeProfileId')?.value;
  
  const profiles = await getProfiles();

  return (
    <div className="page-wrap">
      <LoungeClient profiles={profiles} initialActiveId={activeProfileId} />
    </div>
  );
}
