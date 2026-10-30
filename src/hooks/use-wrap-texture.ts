'use client';

import { useEffect, useState } from 'react';
import type { DesignConfig } from '@/lib/types';
import {
  BACK_DISTRIBUTOR,
  BACK_INGREDIENTS,
  BACK_PRODUCT_TITLE,
  BACK_VOLUME,
  CLAIM_ICONS,
} from '@/lib/sticker/back-copy';
import { BOTTLE_SURFACE, resolveLabelSurfaceColor } from '@/lib/sticker/bottle-surface';
import { fontFamilyForConfig } from '@/lib/sticker/fonts';

/** Continuous wrap texture: Front | Ingredients | Claims (3 equal panels). */
export const TEX_W = 1200;
export const TEX_H = 910;

export function useWrapTexture(
  config: DesignConfig,
  logoUrl: string | null,
  salonName?: string,
): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function build() {
      const canvas = document.createElement('canvas');
      canvas.width = TEX_W;
      canvas.height = TEX_H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const panel = TEX_W / 3;
      const surface = resolveLabelSurfaceColor(config.backgroundColor);

      // Entire wrap shares bottle surface — continuous printed look
      ctx.fillStyle = surface;
      ctx.fillRect(0, 0, TEX_W, TEX_H);

      await drawFrontPanel(ctx, 0, panel, TEX_H, config, logoUrl, salonName, surface);
      drawIngredientsPanel(ctx, panel, panel, TEX_H, config.productType, surface);
      drawClaimsPanel(ctx, panel * 2, panel, TEX_H, salonName, surface);

      if (cancelled) return;
      setUrl(canvas.toDataURL('image/jpeg', 0.94));
    }

    void build();
    return () => {
      cancelled = true;
    };
  }, [config, logoUrl, salonName]);

  return url;
}

async function drawFrontPanel(
  ctx: CanvasRenderingContext2D,
  x: number,
  w: number,
  h: number,
  config: DesignConfig,
  logoUrl: string | null,
  salonName: string | undefined,
  surface: string,
) {
  ctx.fillStyle = surface;
  ctx.fillRect(x, 0, w, h);

  const cx = x + w / 2;
  const brand = (salonName?.trim() || 'BEAUTY SALON').toUpperCase();
  // Reference flat label: top space, wordmark mid-lower, stacked product, tagline footer
  let productY = h * 0.72;

  if (logoUrl) {
    try {
      const logo = await loadImage(logoUrl);
      const maxH = h * 0.085 * config.logoScale;
      const maxW = w * 0.82;
      const scale = Math.min(maxW / logo.width, maxH / logo.height);
      const lw = logo.width * scale;
      const lh = logo.height * scale;
      const ly = h * 0.58 + config.logoOffsetY * 2;
      ctx.drawImage(
        logo,
        cx - lw / 2 + config.logoOffsetX * 1.5,
        ly,
        lw,
        lh,
      );
      productY = ly + lh + h * 0.045;
    } catch {
      ctx.fillStyle = config.textColor;
      ctx.textAlign = 'center';
      ctx.font = `400 ${Math.round(h * 0.042)}px Helvetica Neue, Helvetica, Arial, sans-serif`;
      drawSpacedText(ctx, brand, cx, h * 0.64, Math.round(h * 0.028));
      productY = h * 0.72;
    }
  } else {
    ctx.fillStyle = config.textColor;
    ctx.textAlign = 'center';
    ctx.font = `400 ${Math.round(h * 0.042)}px Helvetica Neue, Helvetica, Arial, sans-serif`;
    drawSpacedText(ctx, brand, cx, h * 0.64, Math.round(h * 0.028));
    productY = h * 0.72;
  }

  ctx.fillStyle = config.textColor;
  ctx.textAlign = 'center';
  const productLines = config.productName.trim().split(/\s+/);
  const productSize = Math.round(h * 0.032);
  ctx.font = `500 ${productSize}px Helvetica Neue, Helvetica, Arial, sans-serif`;
  if (productLines.length >= 2) {
    ctx.fillText(productLines[0], cx, productY);
    ctx.fillText(productLines.slice(1).join(' '), cx, productY + productSize * 1.25);
  } else {
    ctx.fillText(config.productName, cx, productY);
  }

  ctx.font = `400 ${Math.round(h * 0.022)}px Helvetica Neue, Helvetica, Arial, sans-serif`;
  ctx.fillText(config.tagline, cx, h * 0.92);
}

function drawSpacedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  y: number,
  tracking: number,
) {
  const prev = ctx.textAlign;
  ctx.textAlign = 'left';
  const chars = text.split('');
  const widths = chars.map((ch) => ctx.measureText(ch === ' ' ? ' ' : ch).width);
  const total =
    widths.reduce((a, b) => a + b, 0) + tracking * Math.max(chars.length - 1, 0);
  let x = cx - total / 2;
  for (let i = 0; i < chars.length; i++) {
    ctx.fillText(chars[i]!, x, y);
    x += widths[i]! + tracking;
  }
  ctx.textAlign = prev;
}

function drawIngredientsPanel(
  ctx: CanvasRenderingContext2D,
  x: number,
  w: number,
  h: number,
  productType: DesignConfig['productType'],
  surface: string,
) {
  ctx.fillStyle = surface;
  ctx.fillRect(x, 0, w, h);

  const cx = x + w / 2;
  const pad = w * 0.1;

  ctx.fillStyle = '#1a1a1a';
  ctx.textAlign = 'center';
  ctx.font = `500 ${Math.round(h * 0.048)}px Georgia, "Times New Roman", serif`;
  ctx.fillText(BACK_PRODUCT_TITLE[productType], cx, h * 0.1);

  ctx.beginPath();
  ctx.moveTo(x + pad, h * 0.13);
  ctx.lineTo(x + w - pad, h * 0.13);
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = `400 ${Math.round(h * 0.028)}px Georgia, "Times New Roman", serif`;
  ctx.letterSpacing = '0.18em';
  ctx.fillText('INGREDIENTS', cx, h * 0.18);
  ctx.letterSpacing = '0';

  ctx.textAlign = 'left';
  ctx.font = `400 ${Math.round(h * 0.018)}px Georgia, "Times New Roman", serif`;
  wrapText(
    ctx,
    BACK_INGREDIENTS[productType],
    x + pad,
    h * 0.22,
    w - pad * 2,
    h * 0.028,
    h * 0.72,
  );

  ctx.textAlign = 'center';
  ctx.font = `400 ${Math.round(h * 0.026)}px Georgia, "Times New Roman", serif`;
  ctx.fillText(BACK_VOLUME, cx, h * 0.92);
}

function drawClaimsPanel(
  ctx: CanvasRenderingContext2D,
  x: number,
  w: number,
  h: number,
  salonName: string | undefined,
  surface: string,
) {
  ctx.fillStyle = surface;
  ctx.fillRect(x, 0, w, h);

  const cols = 3;
  const rows = 3;
  const gridTop = h * 0.08;
  const gridH = h * 0.48;
  const cellW = w / cols;
  const cellH = gridH / rows;

  CLAIM_ICONS.forEach((icon, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const cx = x + cellW * (col + 0.5);
    const cy = gridTop + cellH * (row + 0.38);
    const r = Math.min(cellW, cellH) * 0.28;

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Simple glyph
    ctx.fillStyle = '#1a1a1a';
    ctx.font = `400 ${Math.round(r * 0.7)}px Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const glyphs: Record<string, string> = {
      vegan: '🍃',
      cruelty: '🐇',
      sulfate: '⚗',
      silicone: '🌿',
      mineral: '💧',
      gluten: '🌾',
      paraben: '⬡',
      color: '🌐',
      pao: '12M',
    };
    // Prefer text marks for a print-like look (no emoji dependency)
    const marks: Record<string, string> = {
      vegan: 'V',
      cruelty: 'CF',
      sulfate: 'SF',
      silicone: 'Si',
      mineral: 'MO',
      gluten: 'GF',
      paraben: 'PF',
      color: 'CS',
      pao: '12M',
    };
    ctx.font = `500 ${Math.round(r * 0.55)}px system-ui, sans-serif`;
    ctx.fillText(marks[icon.id] ?? glyphs[icon.id] ?? '•', cx, cy);

    ctx.font = `500 ${Math.round(h * 0.014)}px system-ui, sans-serif`;
    ctx.textBaseline = 'top';
    ctx.fillText(icon.label, cx, cy + r + 6);
  });

  // Made in Canada mark
  const stampY = h * 0.64;
  ctx.beginPath();
  ctx.arc(x + w * 0.28, stampY, h * 0.055, 0, Math.PI * 2);
  ctx.stroke();
  ctx.font = `500 ${Math.round(h * 0.016)}px system-ui, sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.fillText('MADE IN', x + w * 0.28, stampY - 6);
  ctx.fillText('CANADA', x + w * 0.28, stampY + 8);

  // Barcode
  const bx = x + w * 0.72;
  const by = h * 0.58;
  ctx.fillStyle = '#1a1a1a';
  for (let i = 0; i < 18; i++) {
    const bw = i % 3 === 0 ? 2.2 : 1.1;
    ctx.fillRect(bx + i * 3.2, by, bw, h * 0.14);
  }

  // Distributor
  const salon = salonName?.trim() || 'YOUR BEAUTY SALON';
  ctx.fillStyle = '#1a1a1a';
  ctx.textAlign = 'center';
  ctx.font = `400 ${Math.round(h * 0.017)}px Georgia, serif`;
  const lines = [
    `Distributed by ${salon.toUpperCase()}`,
    BACK_DISTRIBUTOR.address,
    `Phone: ${BACK_DISTRIBUTOR.phone}`,
    `${BACK_DISTRIBUTOR.web} | ${BACK_DISTRIBUTOR.email}`,
  ];
  lines.forEach((line, i) => {
    ctx.fillText(line, x + w / 2, h * 0.8 + i * (h * 0.035));
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lineH: number,
  maxY: number,
) {
  const words = text.split(' ');
  let line = '';
  let cy = y;
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, cy);
      line = word;
      cy += lineH;
      if (cy > maxY) return;
    } else {
      line = test;
    }
  }
  if (line && cy <= maxY) ctx.fillText(line, x, cy);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image load failed'));
    img.src = src;
  });
}

export { BOTTLE_SURFACE };
