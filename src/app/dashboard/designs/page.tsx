'use client';

import Link from 'next/link';
import { useDesignSessionStore } from '@/store/design-session';
import { StickerLabel } from '@/components/sticker/sticker-label';
import { Button } from '@/components/ui/button';
import { useHydrated } from '@/hooks/use-hydrated';

export default function DashboardDesignsPage() {
  const hydrated = useHydrated();
  const designs = useDesignSessionStore((s) => s.designs);
  const logoDataUrl = useDesignSessionStore((s) => s.logoDataUrl);
  const currentConfig = useDesignSessionStore((s) => s.currentConfig);
  const shampooConfig = useDesignSessionStore((s) => s.shampooConfig);
  const conditionerConfig = useDesignSessionStore((s) => s.conditionerConfig);

  if (!hydrated) {
    return <p className="text-muted text-sm">Loading…</p>;
  }

  const hasSession = designs.length > 0 || currentConfig;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl tracking-tight">My Designs</h1>
        <p className="mt-3 text-muted">
          Designs from your active session on this device.
        </p>
      </div>

      {!hasSession ?
        <div className="border border-dashed border-border px-8 py-16 text-center">
          <p className="text-muted">No saved designs yet.</p>
          <Button asChild className="mt-6">
            <Link href="/create/upload">Create your first label</Link>
          </Button>
        </div>
      : <>
          {designs.length > 0 && (
            <section className="space-y-6">
              <h2 className="text-xs uppercase tracking-[0.16em] text-muted">
                Starter directions
              </h2>
              <div className="grid gap-6 sm:grid-cols-3">
                {designs.map((config, i) => (
                  <div
                    key={`${config.style}-${i}`}
                    className="border border-border/80 bg-ivory/30 p-6 text-center"
                  >
                    <StickerLabel
                      config={config}
                      logoUrl={logoDataUrl}
                      className="mx-auto max-w-[120px]"
                    />
                    <p className="mt-4 text-xs text-muted">Design {i + 1}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {(shampooConfig || currentConfig) && (
            <section className="space-y-6">
              <h2 className="text-xs uppercase tracking-[0.16em] text-muted">
                Approved artwork
              </h2>
              <div className="flex flex-wrap gap-8">
                {shampooConfig && (
                  <div className="text-center">
                    <StickerLabel
                      config={shampooConfig}
                      logoUrl={logoDataUrl}
                      className="max-w-[140px]"
                    />
                    <p className="mt-2 text-xs text-muted">Shampoo</p>
                  </div>
                )}
                {conditionerConfig && (
                  <div className="text-center">
                    <StickerLabel
                      config={conditionerConfig}
                      logoUrl={logoDataUrl}
                      className="max-w-[140px]"
                    />
                    <p className="mt-2 text-xs text-muted">Conditioner</p>
                  </div>
                )}
              </div>
            </section>
          )}

          <Button asChild variant="secondary">
            <Link href="/create/customize">Continue customizing</Link>
          </Button>
        </>
      }
    </div>
  );
}
