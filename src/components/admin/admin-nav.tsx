'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const links = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/customers', label: 'Customers' },
  { href: '/admin/settings', label: 'Settings' },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 border-b border-border/70 pb-8 md:w-48 md:border-b-0 md:border-r md:pb-0 md:pr-8">
      <p className="mb-4 text-xs uppercase tracking-[0.2em] text-muted">
        RAD Admin
      </p>
      {links.map((link) => {
        const active =
          link.href === '/admin' ?
            pathname === '/admin'
          : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'px-2 py-2 text-sm',
              active ?
                'font-medium text-foreground'
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
