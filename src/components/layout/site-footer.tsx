'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function SiteFooter({ className }: { className?: string }) {
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer
      className={cn(
        'border-t border-border/70 bg-cream text-foreground',
        className,
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-14 md:flex-row md:items-end md:justify-between md:px-10">
        <div className="space-y-3">
          <p className="font-display text-lg tracking-[0.18em]">RAD</p>
          <p className="max-w-sm text-sm leading-relaxed text-muted">
            Luxury private-label salon bottles. Print-ready labels, cohesive
            shampoo and conditioner sets, and a seamless path from logo to shelf.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-sm text-muted md:items-end">
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <Link
              href="/create/upload"
              className="transition-colors hover:text-foreground"
            >
              Create Your Label
            </Link>
            <Link
              href="/#faq"
              className="transition-colors hover:text-foreground"
            >
              FAQ
            </Link>
            <a
              href="mailto:hello@radbottles.com"
              className="transition-colors hover:text-foreground"
            >
              Contact
            </a>
          </div>
          <p className="text-xs tracking-wide text-muted/80">
            © {year ?? '—'} RAD. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
