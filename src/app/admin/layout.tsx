import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import Link from 'next/link';

// ─── LOCALHOST ONLY ──────────────────────────────────────────────────────────
// This layout returns 404 on any non-local hostname.
async function isLocal(): Promise<boolean> {
  const hdrs = await headers();
  const host = hdrs.get('host') || '';
  return host.startsWith('localhost') || host.startsWith('127.0.0.1') || host.startsWith('::1');
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isLocal())) return notFound();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar fade-up">
        <div style={{ width: '100%', marginBottom: '.75rem', display: 'flex', alignItems: 'center', gap: '.75rem', padding: '0 .25rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', background: 'var(--red-light)', color: 'var(--red)', padding: '.25rem .65rem', borderRadius: 99, fontSize: '.7rem', fontWeight: 800 }}>
            🔒 LOCAL ONLY
          </div>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-0.02em' }}>Admin</div>
        </div>
        
        <Link href="/admin" className="admin-nav-link">
          <span style={{ fontSize: '1.1rem' }}>👥</span> Profiles
        </Link>
        <Link href="/admin/photos" className="admin-nav-link">
          <span style={{ fontSize: '1.1rem' }}>📸</span> Photos
        </Link>
        <Link href="/admin/world-cup" className="admin-nav-link">
          <span style={{ fontSize: '1.1rem' }}>⚽</span> World Cup
        </Link>
      </aside>
      
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
