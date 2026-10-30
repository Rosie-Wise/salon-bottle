'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/#studio', label: 'Customize' },
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/dashboard', label: 'Account' },
] as const;

export function SiteHeader({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b border-border/60 bg-[#faf8f5]/85 backdrop-blur-md',
        className,
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 md:px-10">
        <Link
          href="/"
          className="font-display text-lg tracking-[0.2em] text-foreground md:text-xl"
        >
          RAD
        </Link>
        <nav className="hidden items-center gap-10 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs uppercase tracking-[0.14em] text-foreground/80 transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/#studio"
          className="md:hidden text-xs uppercase tracking-[0.14em] text-foreground"
        >
          Customize
        </Link>
      </div>
    </header>
  );
}
