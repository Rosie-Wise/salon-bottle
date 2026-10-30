'use client';

import type { ProductType } from '@/lib/types';
import {
  BACK_DISTRIBUTOR,
  BACK_INGREDIENTS,
  BACK_PRODUCT_TITLE,
  BACK_VOLUME,
  CLAIM_ICONS,
} from '@/lib/sticker/back-copy';
import {
  CLAIMS_PANEL,
  INGREDIENTS_PANEL,
} from '@/lib/sticker/shape';
import { BOTTLE_SURFACE } from '@/lib/sticker/bottle-surface';
import { cn } from '@/lib/utils';

export interface LabelBackPanelProps {
  productType: ProductType;
  salonName?: string;
  /** When true, render ingredients + claims as a standalone SVG */
  standalone?: boolean;
  className?: string;
  offsetX?: number;
  offsetY?: number;
}

/**
 * Fixed wrap panels (ingredients + claims) — continuous with bottle surface color.
 */
export function LabelBackPanel({
  productType,
  salonName,
  standalone = false,
  className,
  offsetX = 0,
  offsetY = 0,
}: LabelBackPanelProps) {
  const width = INGREDIENTS_PANEL.width + CLAIMS_PANEL.width;
  const height = INGREDIENTS_PANEL.height;
  const salon = salonName?.trim() || 'YOUR BEAUTY SALON';

  const body = (
    <g transform={`translate(${offsetX}, ${offsetY})`}>
      <rect x={0} y={0} width={width} height={height} fill={BOTTLE_SURFACE} />

      {/* Ingredients panel */}
      <text
        x={INGREDIENTS_PANEL.width / 2}
        y={42}
        textAnchor="middle"
        fill="#1a1a1a"
        style={{ fontFamily: 'Georgia, serif', fontSize: 16, fontWeight: 500 }}
      >
        {BACK_PRODUCT_TITLE[productType]}
      </text>
      <line
        x1={24}
        y1={52}
        x2={INGREDIENTS_PANEL.width - 24}
        y2={52}
        stroke="#1a1a1a"
        strokeWidth={0.8}
      />
      <text
        x={INGREDIENTS_PANEL.width / 2}
        y={72}
        textAnchor="middle"
        fill="#1a1a1a"
        style={{
          fontFamily: 'Georgia, serif',
          fontSize: 9,
          letterSpacing: '0.2em',
        }}
      >
        INGREDIENTS
      </text>
      <foreignObject x={18} y={86} width={INGREDIENTS_PANEL.width - 36} height={260}>
        <div
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: '7.5px',
            lineHeight: 1.35,
            color: '#1a1a1a',
            textAlign: 'left',
          }}
        >
          {BACK_INGREDIENTS[productType]}
        </div>
      </foreignObject>
      <text
        x={INGREDIENTS_PANEL.width / 2}
        y={height - 28}
        textAnchor="middle"
        fill="#1a1a1a"
        style={{ fontFamily: 'Georgia, serif', fontSize: 10 }}
      >
        {BACK_VOLUME}
      </text>

      {/* Claims panel */}
      <g transform={`translate(${INGREDIENTS_PANEL.width}, 0)`}>
        {CLAIM_ICONS.map((icon, idx) => {
          const col = idx % 3;
          const row = Math.floor(idx / 3);
          const cx = 28 + col * 52;
          const cy = 48 + row * 70;
          return (
            <g key={icon.id}>
              <circle
                cx={cx}
                cy={cy}
                r={16}
                fill="none"
                stroke="#1a1a1a"
                strokeWidth={1.1}
              />
              <text
                x={cx}
                y={cy + 1}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#1a1a1a"
                style={{ fontSize: 7, fontWeight: 600, fontFamily: 'system-ui' }}
              >
                {icon.id === 'pao' ? '12M' : icon.label.slice(0, 2)}
              </text>
              <text
                x={cx}
                y={cy + 26}
                textAnchor="middle"
                fill="#1a1a1a"
                style={{ fontSize: 5.5, fontWeight: 600, fontFamily: 'system-ui' }}
              >
                {icon.label}
              </text>
            </g>
          );
        })}
        <circle
          cx={40}
          cy={280}
          r={22}
          fill="none"
          stroke="#1a1a1a"
          strokeWidth={1}
        />
        <text
          x={40}
          y={276}
          textAnchor="middle"
          fill="#1a1a1a"
          style={{ fontSize: 6, fontFamily: 'system-ui', fontWeight: 600 }}
        >
          MADE IN
        </text>
        <text
          x={40}
          y={286}
          textAnchor="middle"
          fill="#1a1a1a"
          style={{ fontSize: 6, fontFamily: 'system-ui', fontWeight: 600 }}
        >
          CANADA
        </text>
        {/* Barcode */}
        {Array.from({ length: 16 }).map((_, i) => (
          <rect
            key={i}
            x={110 + i * 3}
            y={255}
            width={i % 3 === 0 ? 2 : 1}
            height={48}
            fill="#1a1a1a"
          />
        ))}
        <text
          x={CLAIMS_PANEL.width / 2}
          y={340}
          textAnchor="middle"
          fill="#1a1a1a"
          style={{ fontSize: 6.5, fontFamily: 'Georgia, serif' }}
        >
          {`Distributed by ${salon.toUpperCase()}`}
        </text>
        <text
          x={CLAIMS_PANEL.width / 2}
          y={354}
          textAnchor="middle"
          fill="#1a1a1a"
          style={{ fontSize: 6, fontFamily: 'Georgia, serif' }}
        >
          {BACK_DISTRIBUTOR.address}
        </text>
        <text
          x={CLAIMS_PANEL.width / 2}
          y={368}
          textAnchor="middle"
          fill="#1a1a1a"
          style={{ fontSize: 6, fontFamily: 'Georgia, serif' }}
        >
          {`Phone: ${BACK_DISTRIBUTOR.phone}`}
        </text>
        <text
          x={CLAIMS_PANEL.width / 2}
          y={382}
          textAnchor="middle"
          fill="#1a1a1a"
          style={{ fontSize: 6, fontFamily: 'Georgia, serif' }}
        >
          {`${BACK_DISTRIBUTOR.web} | ${BACK_DISTRIBUTOR.email}`}
        </text>
      </g>
    </g>
  );

  if (!standalone) return body;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn('h-auto w-full', className)}
      role="img"
      aria-label="Fixed wrap label panels"
    >
      {body}
    </svg>
  );
}
