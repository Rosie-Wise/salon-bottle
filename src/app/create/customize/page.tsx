'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { nanoid } from 'nanoid';
import { StickerLabel } from '@/components/sticker/sticker-label';
import { Bottle360Viewer } from '@/components/sticker/bottle-360-viewer';
import { AiChat, type ChatMessage } from '@/components/create/ai-chat';
import { ManualControls } from '@/components/create/manual-controls';
import { Button } from '@/components/ui/button';
import { useDesignSessionStore } from '@/store/design-session';
import { useHydrated } from '@/hooks/use-hydrated';
import { cn } from '@/lib/utils';

type StudioView = 'bottle' | 'front' | 'flat';

export default function CreateCustomizePage() {
  const router = useRouter();
  const hydrated = useHydrated();
  const currentConfig = useDesignSessionStore((s) => s.currentConfig);
  const logoDataUrl = useDesignSessionStore((s) => s.logoDataUrl);
  const brandAnalysis = useDesignSessionStore((s) => s.brandAnalysis);
  const updateConfig = useDesignSessionStore((s) => s.updateConfig);
  const setStep = useDesignSessionStore((s) => s.setStep);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [studioView, setStudioView] = useState<StudioView>('bottle');

  useEffect(() => {
    if (!hydrated) return;
    if (!currentConfig) {
      router.replace('/create/upload');
    }
  }, [hydrated, currentConfig, router]);

  const handleSend = useCallback(
    async (message: string) => {
      if (!currentConfig) return;
      const userMsg: ChatMessage = {
        id: nanoid(),
        role: 'user',
        content: message,
      };
      setMessages((m) => [...m, userMsg]);
      setChatLoading(true);
      try {
        const res = await fetch('/api/ai/customize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            config: currentConfig,
            brandAnalysis,
          }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(body.error ?? 'Could not apply changes.');
        }
        const patch = body.patch as Partial<typeof currentConfig>;
        updateConfig(patch);
        setMessages((m) => [
          ...m,
          {
            id: nanoid(),
            role: 'assistant',
            content: 'Your label has been updated with those changes.',
          },
        ]);
      } catch (err) {
        setMessages((m) => [
          ...m,
          {
            id: nanoid(),
            role: 'assistant',
            content:
              err instanceof Error ?
                err.message
              : 'Something went wrong. Try again or use manual controls.',
          },
        ]);
      } finally {
        setChatLoading(false);
      }
    },
    [brandAnalysis, currentConfig, updateConfig],
  );

  if (!hydrated || !currentConfig) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:px-10 md:py-16">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl tracking-tight">Customize</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Spin the bottle to check your front design and the fixed ingredients
            back. Chat or use the controls to refine the front panel.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/create/approve" onClick={() => setStep('review')}>
            Approve My Design
          </Link>
        </Button>
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,58%)_minmax(0,42%)]">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(
              [
                { id: 'bottle', label: '360° bottle' },
                { id: 'front', label: 'Front panel' },
                { id: 'flat', label: 'Full label flat' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStudioView(tab.id)}
                className={cn(
                  'px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors',
                  studioView === tab.id ?
                    'bg-foreground text-background'
                  : 'border border-border text-muted hover:text-foreground',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex min-h-[480px] items-center justify-center border border-border/80 bg-cream/40 p-6 md:p-10">
            {studioView === 'bottle' ?
              <Bottle360Viewer
                config={currentConfig}
                logoUrl={logoDataUrl}
                className="w-full max-w-[320px]"
              />
            : studioView === 'flat' ?
              <div className="w-full space-y-4">
                <StickerLabel
                  config={currentConfig}
                  logoUrl={logoDataUrl}
                  view="full"
                  showPanelLabels
                  className="max-w-full"
                />
                <p className="text-center text-xs text-muted">
                  Front · Ingredients · Claims — one continuous wrap
                </p>
              </div>
            : <StickerLabel
                config={currentConfig}
                logoUrl={logoDataUrl}
                view="front"
                className="max-w-[260px]"
              />
            }
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <AiChat
            messages={messages}
            isLoading={chatLoading}
            onSend={handleSend}
            className="min-h-[320px]"
          />
          <div className="border border-border/80 bg-cream/30 p-6">
            <h2 className="mb-6 font-display text-lg">Manual adjustments</h2>
            <ManualControls />
          </div>
        </div>
      </div>
    </div>
  );
}
