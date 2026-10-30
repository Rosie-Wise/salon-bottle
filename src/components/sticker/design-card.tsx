'use client';

import { useState } from 'react';
import type { DesignConfig } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { StickerLabel } from './sticker-label';
import { Bottle360Viewer } from './bottle-360-viewer';

export interface DesignCardProps {
  designNumber: number;
  config: DesignConfig;
  logoUrl: string | null;
  onCustomize: () => void;
  className?: string;
}

type PreviewMode = 'bottle' | 'front' | 'flat';

export function DesignCard({
  designNumber,
  config,
  logoUrl,
  onCustomize,
  className,
}: DesignCardProps) {
  const [mode, setMode] = useState<PreviewMode>('bottle');

  return (
    <div
      className={cn(
        'flex flex-col border border-border/80 bg-ivory/50 p-6 md:p-8',
        className,
      )}
    >
      <p className="mb-4 text-xs uppercase tracking-[0.16em] text-muted">
        Design {designNumber}
      </p>

      <div className="flex min-h-[320px] flex-1 flex-col items-center justify-center py-2">
        {mode === 'bottle' ?
          <Bottle360Viewer
            config={config}
            logoUrl={logoUrl}
            compact
            className="w-full"
          />
        : mode === 'flat' ?
          <StickerLabel
            config={config}
            logoUrl={logoUrl}
            view="full"
            showPanelLabels
            className="max-w-full"
          />
        : <StickerLabel
            config={config}
            logoUrl={logoUrl}
            view="front"
            className="max-w-[200px]"
          />
        }
      </div>

      <p className="mt-2 text-center text-xs text-muted">
        {mode === 'bottle' && 'Drag the bottle to see front and back'}
        {mode === 'front' && 'Front panel you can customize'}
        {mode === 'flat' && 'Full wrap flat — front · ingredients · claims'}
      </p>

      <div className="mt-6 flex flex-col gap-3">
        <Button type="button" className="w-full" onClick={onCustomize}>
          Customize This Design
        </Button>
        <div className="grid grid-cols-3 gap-2">
          <Button
            type="button"
            variant={mode === 'bottle' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setMode('bottle')}
          >
            360°
          </Button>
          <Button
            type="button"
            variant={mode === 'front' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setMode('front')}
          >
            Front
          </Button>
          <Button
            type="button"
            variant={mode === 'flat' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setMode('flat')}
          >
            Flat
          </Button>
        </div>
      </div>
    </div>
  );
}
