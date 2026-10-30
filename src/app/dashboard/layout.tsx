import { Suspense } from 'react';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { DashboardNav } from '@/components/dashboard/dashboard-nav';

export const instant = false;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 py-16 md:flex-row md:px-10 md:py-20">
        <Suspense fallback={<div className="md:w-48" />}>
          <DashboardNav />
        </Suspense>
        <div className="min-w-0 flex-1">{children}</div>
      </main>
      <SiteFooter />
    </>
  );
}
