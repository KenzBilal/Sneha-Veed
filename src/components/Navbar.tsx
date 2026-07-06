'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const LINKS = [
  { href: '/',               label: '🏠 Home' },
  { href: '/feed',           label: '📰 Feed' },
  { href: '/leaderboard',    label: '🏆 Leaderboard' },
  { href: '/hall-of-fame',   label: '✨ Hall of Fame' },
  { href: '/hall-of-shame',  label: '😈 Hall of Shame' },
];

export default function Navbar() {
  const path = usePathname();
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-logo">
          <span>🏡</span> Sneha Veed
        </Link>
        <ul className="navbar-links">
          {LINKS.map(l => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={path === l.href ? 'active' : ''}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
