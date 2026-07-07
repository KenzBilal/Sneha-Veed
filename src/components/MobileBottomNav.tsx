'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const LINKS = [
  { href: '/',               label: '🏠', text: 'Home' },
  { href: '/feed',           label: '📰', text: 'Feed' },
  { href: '/hall-of-fame',   label: '🏆', text: 'Fame' },
  { href: '/lounge',         label: '🎙️', text: 'Lounge' },
  { href: '/world-cup',      label: '⚽', text: 'Cup' },
  { href: '/battles',        label: '⚔️', text: '1v1' },
  { href: '/leaderboard',    label: '🏆', text: 'Ranks' },
];

export default function MobileBottomNav() {
  const path = usePathname();
  const [isLocal, setIsLocal] = useState(false);

  useEffect(() => {
    const host = window.location.hostname;
    setIsLocal(host === 'localhost' || host === '127.0.0.1' || host === '::1');
  }, []);

  const allLinks = isLocal ? [...LINKS, { href: '/admin', label: '⚙️', text: 'Admin' }] : LINKS;

  // On very small screens, maybe 6 links is too tight, but let's see.
  // Actually, Instagram has 5. We'll show up to 6.

  return (
    <nav className="mobile-bottom-nav">
      {allLinks.map(link => {
        const isActive = path === link.href;
        return (
          <Link 
            key={link.href} 
            href={link.href} 
            className={`nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{link.label}</span>
            <span className="nav-text">{link.text}</span>
          </Link>
        );
      })}
    </nav>
  );
}
