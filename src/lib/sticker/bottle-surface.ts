/** Matte white matching the physical 200 mL bottle. */
export const BOTTLE_SURFACE = '#F3F2EF';
export const BOTTLE_SURFACE_SHADOW = '#E4E2DC';
export const CAP_SURFACE = '#F7F6F3';

/** Treat near-white design fills as bottle surface so the label blends in. */
export function resolveLabelSurfaceColor(backgroundColor: string): string {
  const hex = backgroundColor.replace('#', '').trim();
  if (hex.length !== 6) return backgroundColor;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  // Pale / white / cream fills → bottle surface (no white card look)
  if (luminance > 0.88) return BOTTLE_SURFACE;
  return backgroundColor;
}
