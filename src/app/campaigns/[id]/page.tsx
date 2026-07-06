import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCampaign, getCampaignOptions, getCampaignVotes, getProfiles } from '@/lib/db';
import CampaignBoard from './CampaignBoard';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await getCampaign(id);
  return { title: c ? `${c.emoji} ${c.name} | Sneha Veed` : 'Not Found' };
}

export default async function CampaignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [campaign, options, votes, profiles] = await Promise.all([
    getCampaign(id),
    getCampaignOptions(id),
    getCampaignVotes(id),
    getProfiles(),
  ]);

  if (!campaign) return notFound();

  // Stats per option
  const voteMap: Record<string, string> = {};
  votes.forEach(v => { voteMap[v.profile_id] = v.option_id; });

  const optionCounts: Record<string, number> = {};
  options.forEach(o => { optionCounts[o.id] = 0; });
  votes.forEach(v => { optionCounts[v.option_id] = (optionCounts[v.option_id] || 0) + 1; });

  const maxCount = Math.max(...Object.values(optionCounts), 0);

  return (
    <div className="page-wrap">
      {/* Header */}
      <div style={{ padding: '2.5rem 0 2rem' }} className="fade-up">
        <Link href="/campaigns" style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', fontSize: '.85rem', fontWeight: 700, color: 'var(--text-3)', marginBottom: '1rem' }}>
          ← All Campaigns
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '.5rem' }}>
          <span style={{ fontSize: '3rem' }}>{campaign.emoji}</span>
          <div>
            <div className="page-title">{campaign.name}</div>
            {campaign.description && <p style={{ color: 'var(--text-2)', marginTop: '.25rem' }}>{campaign.description}</p>}
          </div>
        </div>
        {!campaign.active && (
          <span className="tag tag-red" style={{ marginTop: '.5rem' }}>🔒 Campaign Closed — Viewing Results</span>
        )}
      </div>

      {/* Stats strip */}
      <div className="stats-strip fade-up delay-1" style={{ marginBottom: '2rem' }}>
        <div className="stat-block">
          <div className="stat-num">{profiles.length}</div>
          <div className="stat-label">👥 Members</div>
        </div>
        <div className="stat-block">
          <div className="stat-num">{votes.length}</div>
          <div className="stat-label">✅ Assigned</div>
        </div>
        <div className="stat-block">
          <div className="stat-num">{profiles.length - votes.length}</div>
          <div className="stat-label">⏳ Remaining</div>
        </div>
        <div className="stat-block">
          <div className="stat-num">{options.length}</div>
          <div className="stat-label">🏳️ Options</div>
        </div>
      </div>

      {/* Mini bar chart */}
      {votes.length > 0 && (
        <div className="card fade-up delay-2" style={{ marginBottom: '2rem' }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', fontWeight: 800, fontSize: '.95rem' }}>
            📊 Current Standings
          </div>
          <div style={{ padding: '1rem 1.25rem', display: 'grid', gap: '.6rem' }}>
            {[...options]
              .sort((a, b) => (optionCounts[b.id] || 0) - (optionCounts[a.id] || 0))
              .map(opt => {
                const count = optionCounts[opt.id] || 0;
                const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                return (
                  <div key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                    <div style={{ width: 120, display: 'flex', alignItems: 'center', gap: '.4rem', flexShrink: 0 }}>
                      <span style={{ fontSize: '1.1rem' }}>{opt.emoji}</span>
                      <span style={{ fontWeight: 700, fontSize: '.82rem', color: opt.color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{opt.name}</span>
                    </div>
                    <div style={{ flex: 1, height: 20, background: 'var(--surface-2)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: opt.color, borderRadius: 99, transition: 'width .6s cubic-bezier(.4,0,.2,1)' }} />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '.88rem', minWidth: 24, textAlign: 'right', color: opt.color }}>{count}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Interactive board */}
      <div className="fade-up delay-3">
        <div className="section-header">
          <h2 className="section-title">Assign Your Friends</h2>
          <span className="section-sub">Click any name to change their team</span>
        </div>
        <CampaignBoard
          campaignId={id}
          profiles={profiles}
          options={options}
          initialVotes={votes}
          active={campaign.active}
        />
      </div>
    </div>
  );
}
