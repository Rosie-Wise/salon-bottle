import { Suspense } from 'react';
import { CreateFlowShell } from '@/components/create/create-flow-shell';

export const instant = false;

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-muted">
          Loading…
        </div>
      }
    >
      <CreateFlowShell>{children}</CreateFlowShell>
    </Suspense>
  );
}
