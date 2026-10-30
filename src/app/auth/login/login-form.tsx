'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { isClientDemoMode } from '@/lib/supabase/demo-mode-client';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/dashboard';
  const demoMode = isClientDemoMode();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (demoMode) return;
    setError(null);
    setLoading(true);
    const supabase = createClient();
    if (!supabase) {
      setError('Supabase is not configured.');
      setLoading(false);
      return;
    }
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-md px-6 py-16 md:py-24">
      <p className="text-center text-xs uppercase tracking-[0.2em] text-muted">
        RAD
      </p>
      <h1 className="mt-4 text-center font-display text-3xl tracking-tight">
        Sign in
      </h1>
      <p className="mt-3 text-center text-sm text-muted">
        Access your designs and orders.
      </p>

      {demoMode ?
        <div className="mt-10 space-y-6 border border-border/80 bg-cream/40 p-8 text-center">
          <p className="text-sm leading-relaxed text-muted">
            Accounts require Supabase in this environment. You can still complete
            a demo order without signing in.
          </p>
          <Button asChild className="w-full">
            <Link href="/create/order">Continue as guest for demo order</Link>
          </Button>
        </div>
      : <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-ivory"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-ivory"
            />
          </div>
          {error && (
            <p className="text-sm text-red-800/90" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      }

      {!demoMode && (
        <p className="mt-8 text-center text-sm text-muted">
          New to RAD?{' '}
          <Link
            href={`/auth/register?next=${encodeURIComponent(next)}`}
            className="text-foreground underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </p>
      )}
    </div>
  );
}
