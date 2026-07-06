import Link from 'next/link';
import { getCampaigns, getCampaignOptions, getCampaignVotes } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Campaigns 🎯 | Sneha Veed' };

export default async function CampaignsPage() {
  const campaigns = await getCampaigns();

  const campaignData = await Promise.all(campaigns.map(async (c) => {
    const options = await getCampaignOptions(c.id);
    const votes   = await getCampaignVotes(c.id);
    return { ...c, options, totalVotes: votes.length };
  }));

  return (
    <div className="page-wrap">
      <div style={{ padding: '2.5rem 0 2rem' }} className="fade-up">
        <div className="page-title">🎯 Campaigns</div>
        <p style={{ color: 'var(--text-2)' }}>
          Group polls, battles &amp; rankings. Click in to assign your friends!
        </p>
      </div>

      {campaignData.length === 0 ? (
        <div className="empty fade-up">
          <div className="empty-emoji">🎯</div>
          <div className="empty-title">No campaigns yet</div>
          <div className="empty-sub">Admin can create campaigns from the admin panel.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
          {campaignData.map((c, i) => (
            <Link
              key={c.id}
              href={`/campaigns/${c.id}`}
              className={`card fade-up delay-${Math.min(i + 1, 6)}`}
              style={{ display: 'block' }}
            >
              {/* Header band */}
              <div style={{
                padding: '1.25rem 1.5rem',
                background: c.active ? 'var(--green-light)' : 'var(--surface-2)',
                borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: '.75rem',
              }}>
                <span style={{ fontSize: '2rem' }}>{c.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 900, fontSize: '1.05rem', letterSpacing: '-0.01em' }}>{c.name}</div>
                  <div style={{ fontSize: '.78rem', color: 'var(--text-3)', marginTop: '.1rem' }}>
                    {c.totalVotes} assigned · {c.options.length} options
                  </div>
                </div>
                {!c.active && (
                  <span className="tag tag-gray" style={{ fontSize: '.7rem' }}>Closed</span>
                )}
              </div>

              <div className="card-body">
                {c.description && (
                  <p style={{ fontSize: '.88rem', color: 'var(--text-2)', marginBottom: '1rem' }}>{c.description}</p>
                )}
                {/* Options preview chips */}
                <div className="flex flex-wrap gap-1">
                  {c.options.slice(0, 6).map(opt => (
                    <span
                      key={opt.id}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '.3rem',
                        padding: '.25rem .7rem', borderRadius: 99,
                        background: opt.color + '18',
                        border: `1.5px solid ${opt.color}40`,
                        color: opt.color, fontSize: '.78rem', fontWeight: 700,
                      }}
                    >
                      {opt.emoji} {opt.name}
                    </span>
                  ))}
                  {c.options.length > 6 && (
                    <span className="tag tag-gray">+{c.options.length - 6} more</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
