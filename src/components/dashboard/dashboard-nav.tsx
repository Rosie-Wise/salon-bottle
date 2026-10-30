'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const links = [
  { href: '/dashboard/designs', label: 'My Designs' },
  { href: '/dashboard/orders', label: 'My Orders' },
  { href: '/dashboard/account', label: 'My Account' },
  { href: '/create/upload', label: 'Create a New Label' },
] as const;

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 border-b border-border/70 pb-8 md:border-b-0 md:border-r md:pb-0 md:pr-10">
      <Link
        href="/dashboard"
        className="mb-4 font-display text-xl tracking-[0.14em] text-foreground"
      >
        RAD
      </Link>
      {links.map((link) => {
        const active =
          pathname === link.href ||
          (link.href !== '/create/upload' && pathname.startsWith(link.href));
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'px-2 py-2 text-sm transition-colors',
              active ?
                'text-foreground font-medium'
              : 'text-muted hover:text-foreground',
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
