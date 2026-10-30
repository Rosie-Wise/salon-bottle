'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { StickerLabel } from '@/components/sticker/sticker-label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getSiteConfigSync } from '@/lib/config/site';
import { useDesignSessionStore } from '@/store/design-session';
import { useHydrated } from '@/hooks/use-hydrated';
import { createClient } from '@/lib/supabase/client';
import { isClientDemoMode } from '@/lib/supabase/demo-mode-client';

function clampQty(value: number, min: number, step: number): number {
  if (value < min) return min;
  const rem = value % step;
  return rem === 0 ? value : value + (step - rem);
}

export default function CreateOrderPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const site = getSiteConfigSync();
  const shampooConfig = useDesignSessionStore((s) => s.shampooConfig);
  const conditionerConfig = useDesignSessionStore((s) => s.conditionerConfig);
  const includeConditioner = useDesignSessionStore((s) => s.includeConditioner);
  const logoDataUrl = useDesignSessionStore((s) => s.logoDataUrl);
  const salonName = useDesignSessionStore((s) => s.salonName);
  const approved = useDesignSessionStore((s) => s.approved);
  const clearSession = useDesignSessionStore((s) => s.clearSession);

  const demoMode = isClientDemoMode();
  const [authChecked, setAuthChecked] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [shampooQty, setShampooQty] = useState(site.minOrderQty);
  const [conditionerQty, setConditionerQty] = useState(0);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const submissionKeyRef = useRef<string>(
    typeof crypto !== 'undefined' && crypto.randomUUID ?
      crypto.randomUUID()
    : `sub-${Date.now()}`,
  );

  const totalQty = shampooQty + conditionerQty;

  useEffect(() => {
    if (!hydrated) return;
    if (!shampooConfig || !approved) {
      router.replace('/create/approve');
    }
  }, [hydrated, shampooConfig, approved, router]);

  useEffect(() => {
    if (demoMode) {
      setAuthChecked(true);
      return;
    }
    const supabase = createClient();
    if (!supabase) {
      setAuthChecked(true);
      return;
    }
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
      setAuthChecked(true);
    });
  }, [demoMode]);

  useEffect(() => {
    if (!includeConditioner) {
      setConditionerQty(0);
    }
  }, [includeConditioner]);

  const priceDisplay = useMemo(() => {
    if (site.pricePerBottle == null) return null;
    return site.pricePerBottle * totalQty;
  }, [site.pricePerBottle, totalQty]);

  const needsAuth = authChecked && !demoMode && !userEmail;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || orderId) return;

    const qtyError =
      totalQty < site.minOrderQty ?
        `Minimum order is ${site.minOrderQty} bottles.`
      : totalQty % site.qtyIncrement !== 0 ?
        `Total must be a multiple of ${site.qtyIncrement}.`
      : null;
    if (qtyError) {
      setError(qtyError);
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shampooQty,
          conditionerQty: includeConditioner ? conditionerQty : 0,
          notes: notes.trim() || null,
          submissionKey: submissionKeyRef.current,
          customerSnapshot: {
            salonName,
            includeConditioner,
            shampooConfig,
            conditionerConfig: includeConditioner ? conditionerConfig : null,
            logoDataUrl,
          },
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body.error ?? 'Order could not be submitted.');
      }
      const id = body.order?.id as string | undefined;
      if (id) setOrderId(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!hydrated || !shampooConfig) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted" />
      </div>
    );
  }

  if (orderId) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-foreground/80" strokeWidth={1.25} />
        <h1 className="mt-6 font-display text-3xl">Thank you</h1>
        <p className="mt-4 text-muted">
          Your order has been received. Reference{' '}
          <span className="font-mono text-foreground">{orderId}</span>
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link href="/dashboard/orders">View orders</Link>
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              clearSession();
              router.push('/create/upload');
            }}
          >
            Create another label
          </Button>
        </div>
      </div>
    );
  }

  if (needsAuth) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <h1 className="font-display text-3xl">Sign in to order</h1>
        <p className="mt-4 text-muted leading-relaxed">
          Create an account or sign in to place your RAD order. Your design
          is saved in this browser until you complete checkout.
        </p>
        <div className="mt-10 flex flex-col gap-3">
          <Button asChild size="lg">
            <Link href="/auth/login?next=/create/order">Sign in</Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="/auth/register?next=/create/order">Create account</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 md:px-10 md:py-24">
      <header className="mb-12">
        <h1 className="font-display text-3xl tracking-tight md:text-4xl">
          Place your order
        </h1>
        <p className="mt-3 text-muted">
          Minimum {site.minOrderQty} bottles · increments of {site.qtyIncrement}
        </p>
      </header>

      <form onSubmit={handleSubmit} className="grid gap-12 lg:grid-cols-2">
        <div className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="shampoo-qty">Shampoo quantity</Label>
            <Input
              id="shampoo-qty"
              type="number"
              min={0}
              step={site.qtyIncrement}
              value={shampooQty}
              onChange={(e) =>
                setShampooQty(
                  clampQty(parseInt(e.target.value, 10) || 0, 0, site.qtyIncrement),
                )
              }
              className="bg-ivory"
            />
          </div>

          {includeConditioner && (
            <div className="space-y-2">
              <Label htmlFor="conditioner-qty">Conditioner quantity</Label>
              <Input
                id="conditioner-qty"
                type="number"
                min={0}
                step={site.qtyIncrement}
                value={conditionerQty}
                onChange={(e) =>
                  setConditionerQty(
                    clampQty(parseInt(e.target.value, 10) || 0, 0, site.qtyIncrement),
                  )
                }
                className="bg-ivory"
              />
            </div>
          )}

          <div className="rounded border border-border/80 bg-cream/40 px-4 py-3 text-sm">
            <span className="text-muted">Total bottles: </span>
            <span className="font-medium tabular-nums">{totalQty}</span>
          </div>

          {site.pricePerBottle != null ?
            <p className="text-sm">
              Estimated total:{' '}
              <span className="font-medium tabular-nums">
                ${priceDisplay?.toFixed(2)}
              </span>
            </p>
          : <p className="text-sm text-muted">Quote on request</p>}

          <div className="space-y-2">
            <Label htmlFor="notes">Order notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Delivery preferences, billing contact, or special instructions"
              className="bg-ivory resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-800/90" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" size="lg" disabled={submitting}>
            {submitting ?
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting…
              </>
            : 'Submit order'}
          </Button>
        </div>

        <div className="space-y-6">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">
            Label preview
          </p>
          <div className="flex flex-wrap justify-center gap-8 border border-border/80 bg-ivory/40 p-8">
            <StickerLabel
              config={shampooConfig}
              logoUrl={logoDataUrl}
              className="max-w-[160px]"
            />
            {includeConditioner && conditionerConfig && (
              <StickerLabel
                config={conditionerConfig}
                logoUrl={logoDataUrl}
                className="max-w-[160px]"
              />
            )}
          </div>
          {salonName && (
            <p className="text-center text-sm text-muted">{salonName}</p>
          )}
        </div>
      </form>
    </div>
  );
}
