'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { isClientDemoMode } from '@/lib/supabase/demo-mode-client';

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/dashboard';
  const demoMode = isClientDemoMode();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [salonName, setSalonName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [businessLocation, setBusinessLocation] = useState('');
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

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          salon_name: salonName,
          phone,
          business_location: businessLocation || null,
        },
      },
    });

    if (signUpError) {
      setLoading(false);
      setError(signUpError.message);
      return;
    }

    if (data.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        first_name: firstName,
        last_name: lastName,
        salon_name: salonName,
        email,
        phone,
        business_location: businessLocation || null,
        role: 'customer',
      });
    }

    setLoading(false);
    router.push(next);
    router.refresh();
  }

  return (
    <div className="mx-auto w-full max-w-md px-6 py-16 md:py-24">
      <p className="text-center text-xs uppercase tracking-[0.2em] text-muted">
        RAD
      </p>
      <h1 className="mt-4 text-center font-display text-3xl tracking-tight">
        Create account
      </h1>
      <p className="mt-3 text-center text-sm text-muted">
        Register your salon for orders and saved designs.
      </p>

      {demoMode ?
        <div className="mt-10 space-y-6 border border-border/80 bg-cream/40 p-8 text-center">
          <p className="text-sm leading-relaxed text-muted">
            Accounts need Supabase configured. Continue without an account to
            place a demo order.
          </p>
          <Button asChild className="w-full">
            <Link href="/create/order">Continue as guest for demo order</Link>
          </Button>
        </div>
      : <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first">First name</Label>
              <Input
                id="first"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="bg-ivory"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last">Last name</Label>
              <Input
                id="last"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="bg-ivory"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="salon">Salon name</Label>
            <Input
              id="salon"
              required
              value={salonName}
              onChange={(e) => setSalonName(e.target.value)}
              className="bg-ivory"
            />
          </div>
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
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-ivory"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-ivory"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Business location (optional)</Label>
            <Input
              id="location"
              value={businessLocation}
              onChange={(e) => setBusinessLocation(e.target.value)}
              className="bg-ivory"
            />
          </div>
          {error && (
            <p className="text-sm text-red-800/90" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </Button>
        </form>
      }

      {!demoMode && (
        <p className="mt-8 text-center text-sm text-muted">
          Already registered?{' '}
          <Link
            href={`/auth/login?next=${encodeURIComponent(next)}`}
            className="text-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      )}
    </div>
  );
}
