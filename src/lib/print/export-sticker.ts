import type { DesignConfig, FontFamily, ProductType } from '@/lib/types';
import { BACK_PANEL_IMAGE, BACK_VOLUME } from '@/lib/sticker/back-copy';
import {
  BACK_PANEL,
  FRONT_PANEL,
  FRONT_SAFE_AREA,
  STICKER_CLIP_ID,
  STICKER_PATH,
  STICKER_VIEWBOX,
  getStickerDimensions,
} from '@/lib/sticker/shape';

export const PRODUCTION_PROOF_NOTE =
  'Production proof for 200 mL wrap-around label (5.34 in × 4.05 in). Front half is salon-custom; back half is fixed ingredients artwork. Verify with your print vendor before manufacturing.';

function svgFontStack(family: FontFamily): string {
  switch (family) {
    case 'serif':
      return 'Georgia, "Times New Roman", serif';
    case 'elegant':
      return '"Cormorant Garamond", Georgia, "Times New Roman", serif';
    case 'sans':
    default:
      return 'system-ui, -apple-system, "Segoe UI", sans-serif';
  }
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function absoluteAssetUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  return `${base.replace(/\/$/, '')}${path}`;
}

export interface ProductionProofMetadata {
  kind: 'production_proof';
  note: string;
  generatedAt: string;
  dimensions: ReturnType<typeof getStickerDimensions>;
}

/**
 * Full wrap-around production SVG: custom front + fixed ingredients back.
 */
export function designConfigToSvg(
  config: DesignConfig,
  logoUrl?: string | null,
): string {
  const clipId = `${STICKER_CLIP_ID}-export`;
  const fontStack = svgFontStack(config.fontFamily);
  const textAnchor = config.textAlign === 'center' ? 'middle' : 'start';
  const safe = FRONT_SAFE_AREA;
  const textX =
    config.textAlign === 'center' ? safe.x + safe.width / 2 : safe.x + 6;

  const logoSlotHeight = safe.height * 0.36;
  const logoWidth = safe.width * config.logoScale * 0.92;
  const logoHeight = logoSlotHeight * config.logoScale;
  const logoX = safe.x + (safe.width - logoWidth) / 2 + config.logoOffsetX;
  const logoY = safe.y + 16 + config.logoOffsetY;
  const nameY = safe.y + logoSlotHeight + 48;
  const lineY = nameY - 14;
  const taglineY = nameY + config.productNameSize + 12;
  const volumeY = safe.y + safe.height - 18;
  const lineHalf = safe.width * 0.28;

  const dims = getStickerDimensions();
  const metaComment = `<!-- ${escapeXml(PRODUCTION_PROOF_NOTE)} -->`;
  const backSrc = absoluteAssetUrl(BACK_PANEL_IMAGE[config.productType as ProductType]);

  const logoBlock =
    logoUrl ?
      `<image href="${escapeXml(logoUrl)}" x="${logoX}" y="${logoY}" width="${logoWidth}" height="${logoHeight}" preserveAspectRatio="xMidYMid meet" />`
    : '';

  const decorativeLines =
    config.showDecorativeLines ?
      `<line x1="${textX - lineHalf}" y1="${lineY}" x2="${textX + lineHalf}" y2="${lineY}" stroke="${escapeXml(config.decorativeLineColor)}" stroke-width="0.9" opacity="0.85" />
      <line x1="${textX - lineHalf * 0.65}" y1="${taglineY + 16}" x2="${textX + lineHalf * 0.65}" y2="${taglineY + 16}" stroke="${escapeXml(config.decorativeLineColor)}" stroke-width="0.6" opacity="0.6" />`
    : '';

  const nameWeight = config.fontFamily === 'sans' ? 500 : 400;
  const nameLetterSpacing =
    config.fontFamily === 'elegant' ? '0.08em' : '0.04em';

  return `<?xml version="1.0" encoding="UTF-8"?>
${metaComment}
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  viewBox="${STICKER_VIEWBOX.minX} ${STICKER_VIEWBOX.minY} ${STICKER_VIEWBOX.width} ${STICKER_VIEWBOX.height}"
  width="${dims.widthIn}in" height="${dims.heightIn}in">
  <title>${escapeXml(config.productName)} — 200 mL wrap-around production proof</title>
  <defs>
    <clipPath id="${clipId}">
      <path d="${STICKER_PATH}" />
    </clipPath>
  </defs>
  <path d="${STICKER_PATH}" fill="#ffffff" />
  <g clip-path="url(#${clipId})">
    <rect x="0" y="0" width="${FRONT_PANEL.width}" height="${FRONT_PANEL.height}" fill="${escapeXml(config.backgroundColor)}" />
    ${logoBlock}
    ${decorativeLines}
    <text x="${textX}" y="${nameY}" fill="${escapeXml(config.textColor)}" text-anchor="${textAnchor}"
      font-family="${escapeXml(fontStack)}" font-size="${config.productNameSize}" font-weight="${nameWeight}" letter-spacing="${nameLetterSpacing}">
      ${escapeXml(config.productName)}
    </text>
    <text x="${textX}" y="${taglineY}" fill="${escapeXml(config.textColor)}" text-anchor="${textAnchor}" opacity="0.82"
      font-family="${escapeXml(fontStack)}" font-size="${config.taglineSize}" font-weight="400" letter-spacing="0.08em">
      ${escapeXml(config.tagline)}
    </text>
    <text x="${textX}" y="${volumeY}" fill="${escapeXml(config.accentColor)}" text-anchor="${textAnchor}"
      font-family="${escapeXml(fontStack)}" font-size="${config.volumeSize}" font-weight="400" letter-spacing="0.12em">
      ${escapeXml(config.volumeText)}
    </text>

    <image href="${escapeXml(backSrc)}" x="${BACK_PANEL.x + 6}" y="6" width="${BACK_PANEL.width - 12}" height="${BACK_PANEL.height - 12}" preserveAspectRatio="xMidYMid meet" />
    <rect x="${BACK_PANEL.x + BACK_PANEL.width * 0.08}" y="${BACK_PANEL.height * 0.78}" width="${BACK_PANEL.width * 0.42}" height="${BACK_PANEL.height * 0.045}" fill="#ffffff" />
    <text x="${BACK_PANEL.x + BACK_PANEL.width * 0.29}" y="${BACK_PANEL.height * 0.81}" text-anchor="middle" fill="#1a1a1a"
      font-family="Georgia, 'Times New Roman', serif" font-size="9" letter-spacing="0.04em">
      ${escapeXml(BACK_VOLUME)}
    </text>
  </g>
  <path d="${STICKER_PATH}" fill="none" stroke="#B8956A" stroke-width="0.8" stroke-dasharray="4 3" opacity="0.75" />
</svg>`;
}

export function getProductionProofMetadata(): ProductionProofMetadata {
  return {
    kind: 'production_proof',
    note: PRODUCTION_PROOF_NOTE,
    generatedAt: new Date().toISOString(),
    dimensions: getStickerDimensions(),
  };
}
