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
    <>
      <style>{`
        .admin-layout {
          display: flex;
          min-height: calc(100vh - 60px); /* Assuming global header is ~60px */
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
          gap: 2rem;
        }
        .admin-sidebar {
          width: 250px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: .5rem;
        }
        .admin-main {
          flex: 1;
          min-width: 0;
        }
        .admin-nav-link {
          display: flex;
          align-items: center;
          gap: .75rem;
          padding: .85rem 1rem;
          border-radius: 12px;
          color: var(--text-2);
          font-weight: 700;
          text-decoration: none;
          transition: all .2s ease;
          border: 1px solid transparent;
        }
        .admin-nav-link:hover {
          background: var(--surface-2);
          color: var(--text);
        }
        
        /* Using standard Next.js active state styling trick or just relying on generic hover */
        
        .field-label {
          display: block;
          font-size: .8rem;
          font-weight: 700;
          color: var(--text-2);
          margin-bottom: 6px;
          letter-spacing: .01em;
        }
        .field-input {
          width: 100%;
          padding: .6rem .85rem;
          border: 1.5px solid var(--border);
          border-radius: 8px;
          font-size: .9rem;
          font-family: inherit;
          background: var(--surface);
          color: var(--text);
          outline: none;
          transition: border-color .15s, box-shadow .15s;
        }
        .field-input:focus {
          border-color: var(--green);
          box-shadow: 0 0 0 3px rgba(45,138,78,.1);
        }
        
        @media (max-width: 768px) {
          .admin-layout {
            flex-direction: column;
          }
          .admin-sidebar {
            width: 100%;
            flex-direction: row;
            flex-wrap: wrap;
          }
          .admin-nav-link {
            flex: 1;
            justify-content: center;
            font-size: .9rem;
          }
        }
      `}</style>

      <div className="admin-layout">
        <aside className="admin-sidebar fade-up">
          <div style={{ marginBottom: '1.5rem', padding: '0 .5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', background: 'var(--red-light)', color: 'var(--red)', padding: '.3rem .7rem', borderRadius: 99, fontSize: '.7rem', fontWeight: 800, marginBottom: '.5rem' }}>
              🔒 LOCAL ONLY
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, letterSpacing: '-0.02em' }}>Admin Panel</div>
          </div>
          
          <Link href="/admin" className="admin-nav-link">
            <span style={{ fontSize: '1.2rem' }}>👥</span> Profiles
          </Link>
          <Link href="/admin/photos" className="admin-nav-link">
            <span style={{ fontSize: '1.2rem' }}>📸</span> Photos
          </Link>
          <Link href="/admin/world-cup" className="admin-nav-link">
            <span style={{ fontSize: '1.2rem' }}>⚽</span> World Cup
          </Link>
        </aside>
        
        <main className="admin-main">
          {children}
        </main>
      </div>
    </>
  );
}
