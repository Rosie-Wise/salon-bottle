'use client';

import type { DesignConfig } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Bottle360Viewer } from './bottle-360-viewer';

export interface BottlePreviewProps {
  config: DesignConfig;
  logoUrl: string | null;
  /** Full wrap-around label image to project onto the bottle. */
  wrapImageUrl?: string | null;
  className?: string;
  /** Enable drag / spin controls (default true for interactive surfaces). */
  interactive?: boolean;
}

/**
 * 200 mL white bottle with seamless wrap-around label.
 * Defaults to the interactive 360° viewer.
 */
export function BottlePreview({
  config,
  logoUrl,
  wrapImageUrl,
  className,
  interactive = true,
}: BottlePreviewProps) {
  return (
    <Bottle360Viewer
      config={config}
      logoUrl={logoUrl}
      wrapImageUrl={wrapImageUrl}
      className={cn(className)}
      compact
      autoSpin={false}
    />
  );
}
