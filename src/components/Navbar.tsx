'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const LINKS = [
  { href: '/',               label: '🏠 Home' },
  { href: '/feed',           label: '📰 Feed' },
  { href: '/leaderboard',    label: '🏆 Leaderboard' },
  { href: '/hall-of-fame',   label: '✨ Hall of Fame' },
  { href: '/hall-of-shame',  label: '😈 Hall of Shame' },
];

export default function Navbar() {
  const path = usePathname();
  const [isLocal, setIsLocal] = useState(false);

  useEffect(() => {
    const host = window.location.hostname;
    setIsLocal(host === 'localhost' || host === '127.0.0.1' || host === '::1');
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-logo">
          <span>🏡</span> Sneha Veed
        </Link>
        <ul className="navbar-links">
          {LINKS.map(l => (
            <li key={l.href}>
              <Link href={l.href} className={path === l.href ? 'active' : ''}>
                {l.label}
              </Link>
            </li>
          ))}
          {isLocal && (
            <li>
              <Link href="/admin" className={path === '/admin' ? 'active' : ''} style={{ color: 'var(--wood)', background: 'var(--wood-light)' }}>
                ⚙️ Admin
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
