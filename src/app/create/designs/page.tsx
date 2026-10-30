'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { DesignCard } from '@/components/sticker/design-card';
import { Button } from '@/components/ui/button';
import { useDesignSessionStore } from '@/store/design-session';
import { useHydrated } from '@/hooks/use-hydrated';
export default function CreateDesignsPage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const designs = useDesignSessionStore((s) => s.designs);
  const logoDataUrl = useDesignSessionStore((s) => s.logoDataUrl);
  const brandAnalysis = useDesignSessionStore((s) => s.brandAnalysis);
  const selectDesign = useDesignSessionStore((s) => s.selectDesign);
  const setDesigns = useDesignSessionStore((s) => s.setDesigns);
  const setStep = useDesignSessionStore((s) => s.setStep);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (designs.length === 0) {
      router.replace('/create/upload');
    }
  }, [hydrated, designs.length, router]);

  async function handleRegenerate() {
    if (!brandAnalysis) return;
    setRegenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandAnalysis,
          logoUrl: logoDataUrl,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Could not regenerate designs.');
      }
      const { designs: next } = (await res.json()) as {
        designs: typeof designs;
      };
      setDesigns(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Regeneration failed.');
    } finally {
      setRegenerating(false);
    }
  }

  function handleCustomize(index: number) {
    selectDesign(index);
    setStep('customize');
    router.push('/create/customize');
  }

  if (!hydrated || designs.length === 0) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:px-10 md:py-24">
      <header className="mb-14 max-w-xl">
        <h1 className="font-display text-3xl tracking-tight md:text-4xl">
          Made Just for Your Salon
        </h1>
        <p className="mt-4 text-muted leading-relaxed">
          Three front-panel directions for your 200 mL wrap-around label. The
          ingredients back is fixed. Choose one to customize, or regenerate.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        {designs.map((config, index) => (
          <DesignCard
            key={`${config.style}-${index}`}
            designNumber={index + 1}
            config={config}
            logoUrl={logoDataUrl}
            onCustomize={() => handleCustomize(index)}
          />
        ))}
      </div>

      {error && (
        <p className="mt-8 text-sm text-red-800/90" role="alert">
          {error}
        </p>
      )}

      <div className="mt-12 flex justify-center">
        <Button
          type="button"
          variant="secondary"
          disabled={regenerating || !brandAnalysis}
          onClick={handleRegenerate}
        >
          {regenerating ?
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Regenerating…
            </>
          : 'Regenerate Designs'}
        </Button>
      </div>
    </div>
  );
}
