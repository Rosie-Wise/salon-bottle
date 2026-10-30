'use client';

import { useId } from 'react';
import type { DesignConfig } from '@/lib/types';
import { fontFamilyForConfig } from '@/lib/sticker/fonts';
import {
  BACK_PANEL,
  FRONT_PANEL,
  FRONT_PATH,
  FRONT_SAFE_AREA,
  STICKER_CLIP_ID,
  STICKER_PATH,
  STICKER_VIEWBOX,
} from '@/lib/sticker/shape';
import { LabelBackPanel } from '@/components/sticker/label-back-panel';
import { resolveLabelSurfaceColor } from '@/lib/sticker/bottle-surface';
import { cn } from '@/lib/utils';

export type StickerViewMode = 'front' | 'full' | 'back';

export interface StickerLabelProps {
  config: DesignConfig;
  logoUrl: string | null;
  className?: string;
  showCutLine?: boolean;
  /** front = design studio; full = wrap-around print layout; back = ingredients only */
  view?: StickerViewMode;
  showPanelLabels?: boolean;
  /** Content only — no outer cut shape (for seamless bottle wrap). */
  bare?: boolean;
}

export function StickerLabel({
  config,
  logoUrl,
  className,
  showCutLine = false,
  view = 'front',
  showPanelLabels = false,
  bare = false,
}: StickerLabelProps) {
  const uid = useId().replace(/:/g, '');
  const clipId = `${STICKER_CLIP_ID}-${uid}`;
  const fontStack = fontFamilyForConfig(config.fontFamily);
  const surface = resolveLabelSurfaceColor(config.backgroundColor);
  const onBottleConfig = { ...config, backgroundColor: surface };

  if (view === 'back') {
    return (
      <LabelBackPanel
        productType={config.productType}
        standalone
        className={className}
      />
    );
  }

  if (view === 'full') {
    return (
      <svg
        viewBox={`${STICKER_VIEWBOX.minX} ${STICKER_VIEWBOX.minY} ${STICKER_VIEWBOX.width} ${STICKER_VIEWBOX.height}`}
        className={cn('h-auto w-full max-w-[540px]', className)}
        role="img"
        aria-label={`${config.productName} wrap-around label`}
      >
        <defs>
          <clipPath id={clipId}>
            <path d={STICKER_PATH} />
          </clipPath>
        </defs>

        <path d={STICKER_PATH} fill={surface} />

        <g clipPath={`url(#${clipId})`}>
          <FrontFace
            config={onBottleConfig}
            logoUrl={logoUrl}
            fontStack={fontStack}
            offsetX={0}
          />
          <LabelBackPanel
            productType={config.productType}
            offsetX={BACK_PANEL.x}
          />
          {/* Soft panel guides */}
          <line
            x1={FRONT_PANEL.width}
            y1={6}
            x2={FRONT_PANEL.width}
            y2={STICKER_VIEWBOX.height - 6}
            stroke="#d4cfc4"
            strokeWidth={0.8}
            strokeDasharray="3 3"
            opacity={0.7}
          />
          <line
            x1={FRONT_PANEL.width * 2}
            y1={6}
            x2={FRONT_PANEL.width * 2}
            y2={STICKER_VIEWBOX.height - 6}
            stroke="#d4cfc4"
            strokeWidth={0.8}
            strokeDasharray="3 3"
            opacity={0.7}
          />
        </g>

        {showPanelLabels && (
          <>
            <text
              x={FRONT_PANEL.width / 2}
              y={16}
              textAnchor="middle"
              fill="#8a847a"
              style={{ fontSize: 8, letterSpacing: '0.12em' }}
            >
              FRONT
            </text>
            <text
              x={FRONT_PANEL.width * 1.5}
              y={16}
              textAnchor="middle"
              fill="#8a847a"
              style={{ fontSize: 8, letterSpacing: '0.12em' }}
            >
              INGREDIENTS
            </text>
            <text
              x={FRONT_PANEL.width * 2.5}
              y={16}
              textAnchor="middle"
              fill="#8a847a"
              style={{ fontSize: 8, letterSpacing: '0.12em' }}
            >
              CLAIMS
            </text>
          </>
        )}

        {showCutLine && (
          <path
            d={STICKER_PATH}
            fill="none"
            stroke="#B8956A"
            strokeWidth={0.8}
            strokeDasharray="4 3"
            opacity={0.75}
          />
        )}
      </svg>
    );
  }

  // Front-only (design experience)
  if (bare) {
    return (
      <svg
        viewBox={`0 0 ${FRONT_PANEL.width} ${FRONT_PANEL.height}`}
        className={cn('h-auto w-full', className)}
        role="img"
        aria-label={`${config.productName} front label`}
      >
        <FrontFace
          config={config}
          logoUrl={logoUrl}
          fontStack={fontStack}
          offsetX={0}
          fillBackground={false}
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${FRONT_PANEL.width} ${FRONT_PANEL.height}`}
      className={cn('h-auto w-full max-w-[280px]', className)}
      role="img"
      aria-label={`${config.productName} front label`}
    >
      <defs>
        <clipPath id={clipId}>
          <path d={FRONT_PATH} />
        </clipPath>
      </defs>
      <path d={FRONT_PATH} fill={surface} />
      <g clipPath={`url(#${clipId})`}>
        <FrontFace
          config={onBottleConfig}
          logoUrl={logoUrl}
          fontStack={fontStack}
          offsetX={0}
        />
      </g>
      {showCutLine && (
        <path
          d={FRONT_PATH}
          fill="none"
          stroke="#B8956A"
          strokeWidth={0.8}
          strokeDasharray="4 3"
          opacity={0.75}
        />
      )}
    </svg>
  );
}

function FrontFace({
  config,
  logoUrl,
  fontStack,
  offsetX,
  fillBackground = true,
}: {
  config: DesignConfig;
  logoUrl: string | null;
  fontStack: string;
  offsetX: number;
  fillBackground?: boolean;
}) {
  const textAnchor = config.textAlign === 'center' ? 'middle' : 'start';
  const safe = FRONT_SAFE_AREA;
  const textX =
    offsetX +
    (config.textAlign === 'center' ?
      safe.x + safe.width / 2
    : safe.x + 6);

  const logoSlotHeight = safe.height * 0.36;
  const logoWidth = safe.width * config.logoScale * 0.92;
  const logoHeight = logoSlotHeight * config.logoScale;
  const logoX =
    offsetX + safe.x + (safe.width - logoWidth) / 2 + config.logoOffsetX;
  const logoY = safe.y + 16 + config.logoOffsetY;

  const nameY = safe.y + logoSlotHeight + 48;
  const lineY = nameY - 14;
  const taglineY = nameY + config.productNameSize + 12;
  const volumeY = safe.y + safe.height - 18;
  const lineHalf = safe.width * 0.28;

  return (
    <g>
      {fillBackground && (
        <rect
          x={offsetX}
          y={0}
          width={FRONT_PANEL.width}
          height={FRONT_PANEL.height}
          fill={config.backgroundColor}
        />
      )}

      {logoUrl && (
        <image
          href={logoUrl}
          x={logoX}
          y={logoY}
          width={logoWidth}
          height={logoHeight}
          preserveAspectRatio="xMidYMid meet"
        />
      )}

      {config.showDecorativeLines && (
        <>
          <line
            x1={textX - lineHalf}
            y1={lineY}
            x2={textX + lineHalf}
            y2={lineY}
            stroke={config.decorativeLineColor}
            strokeWidth={0.9}
            opacity={0.85}
          />
          <line
            x1={textX - lineHalf * 0.65}
            y1={taglineY + 16}
            x2={textX + lineHalf * 0.65}
            y2={taglineY + 16}
            stroke={config.decorativeLineColor}
            strokeWidth={0.6}
            opacity={0.6}
          />
        </>
      )}

      <text
        x={textX}
        y={nameY}
        fill={config.textColor}
        textAnchor={textAnchor}
        style={{
          fontFamily: fontStack,
          fontSize: config.productNameSize,
          fontWeight: config.fontFamily === 'sans' ? 500 : 400,
          letterSpacing: config.fontFamily === 'elegant' ? '0.08em' : '0.04em',
        }}
      >
        {config.productName}
      </text>

      <text
        x={textX}
        y={taglineY}
        fill={config.textColor}
        textAnchor={textAnchor}
        opacity={0.82}
        style={{
          fontFamily: fontStack,
          fontSize: config.taglineSize,
          fontWeight: 400,
          letterSpacing: '0.08em',
        }}
      >
        {config.tagline}
      </text>

      <text
        x={textX}
        y={volumeY}
        fill={config.accentColor}
        textAnchor={textAnchor}
        style={{
          fontFamily: fontStack,
          fontSize: config.volumeSize,
          fontWeight: 400,
          letterSpacing: '0.12em',
        }}
      >
        {config.volumeText}
      </text>
    </g>
  );
}
