import {
  BACK_DISTRIBUTOR,
  BACK_INGREDIENTS,
  BACK_PRODUCT_TITLE,
  BACK_VOLUME,
} from '@/lib/sticker/back-copy';
import { BOTTLE_SURFACE } from '@/lib/sticker/bottle-surface';
import { PRODUCT_COPY } from '@/lib/sticker/defaults';
import type { ProductType } from '@/lib/types';

export const LABEL_TEX_W = 2048;
export const LABEL_TEX_H = 1024;

/** Official claims / barcode panel artwork from Quaffed label. */
const CLAIMS_ART_URL = '/labels/claims-panel.png';

export interface LabelTextureOptions {
  productType: ProductType;
  logoUrl: string | null;
  logoScale: number;
  logoOffsetX: number;
  logoOffsetY: number;
  salonName?: string;
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

/** Letter-spaced wordmark that always fits inside the panel (no clipped B). */
function drawSpacedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  y: number,
  tracking: number,
  maxWidth?: number,
) {
  const prevAlign = ctx.textAlign;
  const prevBaseline = ctx.textBaseline;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  let track = tracking;
  const measure = () => {
    const widths = text.split('').map((ch) => ctx.measureText(ch === ' ' ? '\u00A0' : ch).width);
    const total =
      widths.reduce((a, b) => a + b, 0) + track * Math.max(text.length - 1, 0);
    return { widths, total };
  };

  let { widths, total } = measure();
  if (maxWidth && total > maxWidth) {
    const scale = maxWidth / total;
    // Prefer shrinking tracking first, then accept slightly tighter fit
    track = Math.max(0, track * scale);
    ({ widths, total } = measure());
    if (total > maxWidth) {
      // Last resort: slightly smaller — caller should pass a fitted font already
      track = Math.max(0, track * 0.85);
      ({ widths, total } = measure());
    }
  }

  let x = cx - total / 2;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;
    ctx.fillText(ch === ' ' ? ' ' : ch, x, y);
    x += widths[i]! + track;
  }

  ctx.textAlign = prevAlign;
  ctx.textBaseline = prevBaseline;
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

async function drawFront(
  ctx: CanvasRenderingContext2D,
  x: number,
  w: number,
  h: number,
  opts: LabelTextureOptions,
) {
  const cx = x + w / 2;
  const copy = PRODUCT_COPY[opts.productType];
  const brand = (opts.salonName?.trim() || 'BEAUTY SALON').toUpperCase();
  const brandMaxW = w * 0.88;
  let productY = h * 0.7;

  if (opts.logoUrl) {
    try {
      const logo = await loadImage(opts.logoUrl);
      const maxH = h * 0.16 * opts.logoScale;
      const maxW = w * 0.72;
      const scale = Math.min(maxW / logo.width, maxH / logo.height);
      const lw = logo.width * scale;
      const lh = logo.height * scale;
      const ly = h * 0.42 + opts.logoOffsetY * 2.2;
      const lx = cx - lw / 2 + opts.logoOffsetX * 1.8;
      const clampedX = Math.min(Math.max(lx, x + w * 0.06), x + w - lw - w * 0.06);
      const clampedY = Math.min(Math.max(ly, h * 0.28), h * 0.58);
      ctx.drawImage(logo, clampedX, clampedY, lw, lh);
      productY = clampedY + lh + h * 0.05;
    } catch {
      ctx.fillStyle = '#1a1a1a';
      ctx.font = `400 ${Math.round(h * 0.048)}px Helvetica Neue, Helvetica, Arial, sans-serif`;
      drawSpacedText(ctx, brand, cx, h * 0.52, Math.round(h * 0.022), brandMaxW);
      productY = h * 0.64;
    }
  } else {
    ctx.fillStyle = '#1a1a1a';
    // Size + tracking tuned so full “BEAUTY SALON” (incl. B) fits the front panel
    let fontSize = Math.round(h * 0.05);
    ctx.font = `400 ${fontSize}px Helvetica Neue, Helvetica, Arial, sans-serif`;
    let tracking = Math.round(h * 0.024);
    // Ensure measured width fits before drawing
    const probe = brand.split('').reduce((acc, ch, i, arr) => {
      return acc + ctx.measureText(ch === ' ' ? ' ' : ch).width + (i < arr.length - 1 ? tracking : 0);
    }, 0);
    if (probe > brandMaxW) {
      fontSize = Math.round(fontSize * (brandMaxW / probe) * 0.98);
      tracking = Math.round(tracking * (brandMaxW / probe) * 0.98);
      ctx.font = `400 ${fontSize}px Helvetica Neue, Helvetica, Arial, sans-serif`;
    }
    drawSpacedText(ctx, brand, cx, h * 0.52, tracking, brandMaxW);
    productY = h * 0.64;
  }

  ctx.fillStyle = '#1a1a1a';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  const lines = copy.productName.trim().split(/\s+/);
  const size = Math.round(h * 0.038);
  ctx.font = `500 ${size}px Helvetica Neue, Helvetica, Arial, sans-serif`;
  if (lines.length >= 2) {
    ctx.fillText(lines[0]!, cx, productY);
    ctx.fillText(lines.slice(1).join(' '), cx, productY + size * 1.3);
  } else {
    ctx.fillText(copy.productName, cx, productY);
  }

  ctx.font = `400 ${Math.round(h * 0.024)}px Helvetica Neue, Helvetica, Arial, sans-serif`;
  ctx.fillText(copy.tagline, cx, h * 0.9);
}

function drawIngredients(
  ctx: CanvasRenderingContext2D,
  x: number,
  w: number,
  h: number,
  productType: ProductType,
) {
  const cx = x + w / 2;
  const pad = w * 0.1;

  ctx.fillStyle = '#1a1a1a';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `500 ${Math.round(h * 0.055)}px Georgia, "Times New Roman", serif`;
  ctx.fillText(BACK_PRODUCT_TITLE[productType], cx, h * 0.1);

  ctx.beginPath();
  ctx.moveTo(x + pad, h * 0.13);
  ctx.lineTo(x + w - pad, h * 0.13);
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = `400 ${Math.round(h * 0.028)}px Helvetica Neue, Helvetica, Arial, sans-serif`;
  drawSpacedText(ctx, 'INGREDIENTS', cx, h * 0.19, Math.round(h * 0.012), w * 0.85);

  ctx.textAlign = 'left';
  ctx.font = `400 ${Math.round(h * 0.02)}px Georgia, "Times New Roman", serif`;
  wrapText(
    ctx,
    BACK_INGREDIENTS[productType],
    x + pad,
    h * 0.24,
    w - pad * 2,
    h * 0.032,
    h * 0.78,
  );

  ctx.beginPath();
  ctx.moveTo(x + pad, h * 0.84);
  ctx.lineTo(x + w - pad, h * 0.84);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.font = `500 ${Math.round(h * 0.032)}px Helvetica Neue, Helvetica, Arial, sans-serif`;
  ctx.fillText(BACK_VOLUME, cx, h * 0.91);
}

/**
 * Claims panel: prefer Quaffed artwork; fall back to distributor text only.
 */
async function drawClaims(
  ctx: CanvasRenderingContext2D,
  x: number,
  w: number,
  h: number,
) {
  try {
    const art = await loadImage(CLAIMS_ART_URL);
    // Fit artwork into panel with small inset, preserve aspect
    const inset = w * 0.04;
    const boxW = w - inset * 2;
    const boxH = h - inset * 2;
    const scale = Math.min(boxW / art.width, boxH / art.height);
    const dw = art.width * scale;
    const dh = art.height * scale;
    const dx = x + (w - dw) / 2;
    const dy = (h - dh) / 2;
    ctx.drawImage(art, dx, dy, dw, dh);
    return;
  } catch {
    // Fallback if asset missing
  }

  ctx.fillStyle = '#1a1a1a';
  ctx.textAlign = 'center';
  ctx.font = `400 ${Math.round(h * 0.022)}px Georgia, serif`;
  const lines = [
    BACK_DISTRIBUTOR.name,
    BACK_DISTRIBUTOR.address,
    BACK_DISTRIBUTOR.web,
    BACK_DISTRIBUTOR.email,
  ];
  lines.forEach((line, i) => {
    ctx.fillText(line, x + w / 2, h * 0.4 + i * (h * 0.05));
  });
}

/** Builds a seamless 3-panel wrap texture: Front | Ingredients | Claims. */
export async function buildLabelTexture(
  opts: LabelTextureOptions,
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = LABEL_TEX_W;
  canvas.height = LABEL_TEX_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2d context unavailable');

  const panel = LABEL_TEX_W / 3;
  ctx.fillStyle = BOTTLE_SURFACE;
  ctx.fillRect(0, 0, LABEL_TEX_W, LABEL_TEX_H);

  await drawFront(ctx, 0, panel, LABEL_TEX_H, opts);
  drawIngredients(ctx, panel, panel, LABEL_TEX_H, opts.productType);
  await drawClaims(ctx, panel * 2, panel, LABEL_TEX_H);

  return canvas;
}
