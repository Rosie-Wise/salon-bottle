'use client';

import { usePathname } from 'next/navigation';
import { SiteHeader } from '@/components/layout/site-header';
import { ProgressBar } from '@/components/layout/progress-bar';
import { SiteFooter } from '@/components/layout/site-footer';

const STEP_BY_SEGMENT: Record<string, number> = {
  upload: 1,
  designs: 2,
  customize: 3,
  approve: 4,
  order: 5,
};

function stepFromPath(pathname: string): number {
  const segment = pathname.split('/').filter(Boolean).pop() ?? 'upload';
  return STEP_BY_SEGMENT[segment] ?? 1;
}

export function CreateFlowShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentStep = stepFromPath(pathname);

  return (
    <>
      <SiteHeader />
      <div className="border-b border-border/50 bg-cream/40 py-6">
        <ProgressBar currentStep={currentStep} />
      </div>
      <main className="flex-1">{children}</main>
      <SiteFooter className="mt-auto border-t-0 bg-background" />
    </>
  );
}
