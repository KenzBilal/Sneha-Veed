import { getCampaignOptions } from '@/lib/db';
import { WorldCupEliminationBoard } from '../WorldCupAdminControls';

export const dynamic = 'force-dynamic';
export const metadata = { title: '⚽ World Cup Admin | Sneha Veed' };

export default async function AdminWorldCupPage() {
  const worldCupOptions = await getCampaignOptions('c0000000-0000-0000-0000-000000000001');

  return (
    <div className="fade-up">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.02em', marginBottom: '.5rem' }}>World Cup Campaign</h1>
        <p style={{ color: 'var(--text-2)' }}>Manage the ongoing tournament. Eliminate teams manually here.</p>
      </div>

      <div className="card fade-up delay-1">
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>⚽ Knockouts Board</div>
          <div style={{ fontSize: '.82rem', color: 'var(--text-3)', marginTop: '.2rem' }}>
            Click an active team to eliminate them from the tournament.
          </div>
        </div>
        <div className="card-body">
          <WorldCupEliminationBoard options={worldCupOptions} />
        </div>
      </div>
    </div>
  );
}
