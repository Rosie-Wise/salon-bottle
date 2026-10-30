'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { StickerLabel } from '@/components/sticker/sticker-label';
import { Bottle360Viewer } from '@/components/sticker/bottle-360-viewer';
import { Button } from '@/components/ui/button';
import { useDesignSessionStore } from '@/store/design-session';
import { useHydrated } from '@/hooks/use-hydrated';

export default function CreateApprovePage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const shampooConfig = useDesignSessionStore((s) => s.shampooConfig);
  const conditionerConfig = useDesignSessionStore((s) => s.conditionerConfig);
  const includeConditioner = useDesignSessionStore((s) => s.includeConditioner);
  const logoDataUrl = useDesignSessionStore((s) => s.logoDataUrl);
  const setIncludeConditioner = useDesignSessionStore((s) => s.setIncludeConditioner);
  const approve = useDesignSessionStore((s) => s.approve);
  const setStep = useDesignSessionStore((s) => s.setStep);
  const [answered, setAnswered] = useState(includeConditioner);

  useEffect(() => {
    if (!hydrated) return;
    if (!shampooConfig) {
      router.replace('/create/upload');
    }
  }, [hydrated, shampooConfig, router]);

  function handleConditionerChoice(yes: boolean) {
    setAnswered(true);
    setIncludeConditioner(yes);
  }

  function handleContinue() {
    approve();
    setStep('checkout');
    router.push('/create/order');
  }

  if (!hydrated || !shampooConfig) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-16 md:px-10 md:py-24">
      <header className="mb-12 text-center">
        <h1 className="font-display text-3xl tracking-tight md:text-4xl">
          Approve your design
        </h1>
        {!answered && (
          <p className="mt-6 text-lg text-foreground">
            Would you like to create a matching conditioner label?
          </p>
        )}
      </header>

      {!answered ?
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button type="button" size="lg" onClick={() => handleConditionerChoice(true)}>
            Yes, add conditioner
          </Button>
          <Button
            type="button"
            size="lg"
            variant="secondary"
            onClick={() => handleConditionerChoice(false)}
          >
            No, shampoo only
          </Button>
        </div>
      : null}

      {answered && (
        <>
          <div className="mt-10 space-y-14">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
              <div className="space-y-4 text-center">
                <p className="text-xs uppercase tracking-[0.16em] text-muted">
                  Shampoo — spin to see front & back
                </p>
                <div className="flex justify-center border border-border/80 bg-gradient-to-b from-ivory to-cream/70 p-6">
                  <Bottle360Viewer
                    config={shampooConfig}
                    logoUrl={logoDataUrl}
                    className="w-full max-w-[260px]"
                  />
                </div>
              </div>
              <div className="space-y-4 text-center">
                <p className="text-xs uppercase tracking-[0.16em] text-muted">
                  Full label flat (5.34″ × 4.05″)
                </p>
                <div className="flex justify-center border border-border/80 bg-ivory/50 p-6">
                  <StickerLabel
                    config={shampooConfig}
                    logoUrl={logoDataUrl}
                    view="full"
                    showPanelLabels
                    className="max-w-full"
                  />
                </div>
                <p className="text-xs text-muted">
                  Left: your front · Right: fixed ingredients back
                </p>
              </div>
            </div>

            {includeConditioner && conditionerConfig && (
              <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
                <div className="space-y-4 text-center">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted">
                    Conditioner — 360° bottle
                  </p>
                  <div className="flex justify-center border border-border/80 bg-gradient-to-b from-ivory to-cream/70 p-6">
                    <Bottle360Viewer
                      config={conditionerConfig}
                      logoUrl={logoDataUrl}
                      className="w-full max-w-[260px]"
                    />
                  </div>
                </div>
                <div className="space-y-4 text-center">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted">
                    Conditioner — full label flat
                  </p>
                  <div className="flex justify-center border border-border/80 bg-ivory/50 p-6">
                    <StickerLabel
                      config={conditionerConfig}
                      logoUrl={logoDataUrl}
                      view="full"
                      showPanelLabels
                      className="max-w-full"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center">
            <Button
              type="button"
              size="lg"
              onClick={() => approve()}
            >
              Approve My Design
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/create/customize">Edit Design</Link>
            </Button>
            <Button type="button" size="lg" variant="secondary" onClick={handleContinue}>
              Continue to Order
            </Button>
          </div>
          <p className="mt-8 text-center text-xs text-muted">
            By continuing, you approve this artwork for production.
          </p>
        </>
      )}
    </div>
  );
}
