import { Suspense } from 'react';
import { SiteHeader } from '@/components/layout/site-header';
import { RegisterForm } from './register-form';

export const instant = false;

export default function RegisterPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Suspense fallback={<p className="py-24 text-center text-muted">Loading…</p>}>
          <RegisterForm />
        </Suspense>
      </main>
    </>
  );
}
