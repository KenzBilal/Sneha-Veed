'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const LINKS = [
  { href: '/',               label: '🏠', full: 'Home' },
  { href: '/feed',           label: '📰', full: 'Feed' },
  { href: '/world-cup',      label: '⚽', full: 'World Cup' },
  { href: '/battles',        label: '⚔️', full: '1v1 Battles' },
  { href: '/leaderboard',    label: '🏆', full: 'Leaderboard' },
  { href: '/hall-of-fame',   label: '✨', full: 'Hall of Fame' },
  { href: '/hall-of-shame',  label: '😈', full: 'Hall of Shame' },
];

export default function Navbar() {
  const path = usePathname();
  const [isLocal, setIsLocal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const host = window.location.hostname;
    setIsLocal(host === 'localhost' || host === '127.0.0.1' || host === '::1');
  }, []);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [path]);

  const allLinks = isLocal ? [...LINKS, { href: '/admin', label: '⚙️', full: 'Admin' }] : LINKS;

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="navbar-logo">
            <span>🏡</span> Sneha Veed
          </Link>

          {/* Desktop links */}
          <ul className="navbar-links navbar-desktop">
            {allLinks.map(l => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={path === l.href ? 'active' : ''}
                  style={l.href === '/admin' ? { color: 'var(--wood-dark)', background: 'var(--wood-light)' } : undefined}
                >
                  {l.label} {l.full}
                </Link>
              </li>
            ))}
          </ul>

          {/* Hamburger */}
          <button
            className="navbar-hamburger"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className={`hamburger-icon ${menuOpen ? 'open' : ''}`}>
              <span /><span /><span />
            </span>
          </button>
        </div>

        {/* Mobile Drawer */}
        <div className={`navbar-drawer ${menuOpen ? 'drawer-open' : ''}`}>
          <ul className="drawer-links">
            {allLinks.map(l => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`drawer-link ${path === l.href ? 'active' : ''}`}
                  style={l.href === '/admin' ? { color: 'var(--wood-dark)', borderColor: 'var(--wood-light)' } : undefined}
                >
                  <span className="drawer-emoji">{l.label}</span>
                  {l.full}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Backdrop */}
      {menuOpen && (
        <div className="navbar-backdrop" onClick={() => setMenuOpen(false)} />
      )}
    </>
  );
}
