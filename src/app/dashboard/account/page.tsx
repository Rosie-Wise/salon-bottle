'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { isClientDemoMode } from '@/lib/supabase/demo-mode-client';
import { useDesignSessionStore } from '@/store/design-session';

export default function DashboardAccountPage() {
  const demoMode = isClientDemoMode();
  const salonName = useDesignSessionStore((s) => s.salonName);
  const clearSession = useDesignSessionStore((s) => s.clearSession);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    if (demoMode) return;
    const supabase = createClient();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, [demoMode]);

  async function handleSignOut() {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    window.location.href = '/';
  }

  return (
    <div className="space-y-10 max-w-lg">
      <div>
        <h1 className="font-display text-3xl tracking-tight">My Account</h1>
        <p className="mt-3 text-muted">Profile and session preferences.</p>
      </div>

      <dl className="space-y-4 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wider text-muted">Salon</dt>
          <dd className="mt-1">{salonName || '—'}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wider text-muted">Email</dt>
          <dd className="mt-1">
            {demoMode ?
              'Demo mode — sign in when Supabase is configured'
            : email ?? 'Not signed in'}
          </dd>
        </div>
      </dl>

      <div className="flex flex-col gap-3 sm:flex-row">
        {!demoMode && !email && (
          <Button asChild>
            <Link href="/auth/login?next=/dashboard/account">Sign in</Link>
          </Button>
        )}
        {!demoMode && email && (
          <Button type="button" variant="secondary" onClick={handleSignOut}>
            Sign out
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            if (confirm('Clear your saved label session on this device?')) {
              clearSession();
            }
          }}
        >
          Clear design session
        </Button>
      </div>
    </div>
  );
}
