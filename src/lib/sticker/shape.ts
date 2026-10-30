/**
 * 200 mL cylindrical bottle — single continuous wrap-around label.
 * Spec: 5.34 in × 4.05 in (safe 5.16 × 3.87).
 *
 * Three equal panels around the bottle:
 *   1. Front  — salon branding (customizable)
 *   2. Middle — ingredients (fixed)
 *   3. Right  — claims / icons / distributor (fixed)
 */

export const LABEL_WIDTH_IN = 5.34;
export const LABEL_HEIGHT_IN = 4.05;
export const SAFE_WIDTH_IN = 5.16;
export const SAFE_HEIGHT_IN = 3.87;
export const UNITS_PER_INCH = 100;

export const STICKER_VIEWBOX = {
  width: Math.round(LABEL_WIDTH_IN * UNITS_PER_INCH), // 534
  height: Math.round(LABEL_HEIGHT_IN * UNITS_PER_INCH), // 405
  minX: 0,
  minY: 0,
} as const;

const BLEED_X = ((LABEL_WIDTH_IN - SAFE_WIDTH_IN) / 2) * UNITS_PER_INCH;
const BLEED_Y = ((LABEL_HEIGHT_IN - SAFE_HEIGHT_IN) / 2) * UNITS_PER_INCH;

export const STICKER_SAFE_AREA = {
  x: BLEED_X,
  y: BLEED_Y,
  width: SAFE_WIDTH_IN * UNITS_PER_INCH,
  height: SAFE_HEIGHT_IN * UNITS_PER_INCH,
} as const;

const PANEL_W = STICKER_VIEWBOX.width / 3;

/** Panel 1 — customizable front */
export const FRONT_PANEL = {
  x: 0,
  y: 0,
  width: PANEL_W,
  height: STICKER_VIEWBOX.height,
} as const;

/** Panel 2 — fixed ingredients */
export const INGREDIENTS_PANEL = {
  x: PANEL_W,
  y: 0,
  width: PANEL_W,
  height: STICKER_VIEWBOX.height,
} as const;

/** Panel 3 — fixed icons / regulatory */
export const CLAIMS_PANEL = {
  x: PANEL_W * 2,
  y: 0,
  width: PANEL_W,
  height: STICKER_VIEWBOX.height,
} as const;

/** @deprecated use INGREDIENTS_PANEL + CLAIMS_PANEL — kept for older imports */
export const BACK_PANEL = {
  x: PANEL_W,
  y: 0,
  width: PANEL_W * 2,
  height: STICKER_VIEWBOX.height,
} as const;

export const FRONT_SAFE_AREA = {
  x: STICKER_SAFE_AREA.x,
  y: STICKER_SAFE_AREA.y,
  width: FRONT_PANEL.width - STICKER_SAFE_AREA.x - 4,
  height: STICKER_SAFE_AREA.height,
} as const;

export const STICKER_PATH = roundedRectPath(
  0,
  0,
  STICKER_VIEWBOX.width,
  STICKER_VIEWBOX.height,
  10,
);

export const FRONT_PATH = roundedRectPath(
  0,
  0,
  FRONT_PANEL.width,
  FRONT_PANEL.height,
  10,
);

export const STICKER_CLIP_ID = 'rad-wrap-label-clip';

export interface StickerDimensions {
  widthIn: number;
  heightIn: number;
  safeWidthIn: number;
  safeHeightIn: number;
  widthMm: number;
  heightMm: number;
  viewBoxWidth: number;
  viewBoxHeight: number;
  bottleVolumeMl: number;
}

export function getStickerDimensions(): StickerDimensions {
  return {
    widthIn: LABEL_WIDTH_IN,
    heightIn: LABEL_HEIGHT_IN,
    safeWidthIn: SAFE_WIDTH_IN,
    safeHeightIn: SAFE_HEIGHT_IN,
    widthMm: Math.round(LABEL_WIDTH_IN * 25.4 * 10) / 10,
    heightMm: Math.round(LABEL_HEIGHT_IN * 25.4 * 10) / 10,
    viewBoxWidth: STICKER_VIEWBOX.width,
    viewBoxHeight: STICKER_VIEWBOX.height,
    bottleVolumeMl: 200,
  };
}

function roundedRectPath(
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): string {
  const rr = Math.min(r, w / 2, h / 2);
  return [
    `M ${x + rr} ${y}`,
    `H ${x + w - rr}`,
    `Q ${x + w} ${y} ${x + w} ${y + rr}`,
    `V ${y + h - rr}`,
    `Q ${x + w} ${y + h} ${x + w - rr} ${y + h}`,
    `H ${x + rr}`,
    `Q ${x} ${y + h} ${x} ${y + h - rr}`,
    `V ${y + rr}`,
    `Q ${x} ${y} ${x + rr} ${y}`,
    'Z',
  ].join(' ');
}
