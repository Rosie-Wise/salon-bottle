import { Suspense } from 'react';
import { SiteHeader } from '@/components/layout/site-header';
import { LoginForm } from './login-form';

export const instant = false;

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Suspense fallback={<p className="py-24 text-center text-muted">Loading…</p>}>
          <LoginForm />
        </Suspense>
      </main>
    </>
  );
}
