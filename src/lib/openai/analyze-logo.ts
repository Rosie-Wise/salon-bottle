import type { BrandAnalysis } from '@/lib/types';
import { getOpenAI } from '@/lib/openai/client';

const OFFLINE_DEFAULT: BrandAnalysis = {
  primaryColor: '#2C2C2C',
  secondaryColor: '#6B6B6B',
  accentColor: '#B8956A',
  suggestedBackgrounds: ['#F7F3EE', '#FFFFFF', '#EDE8E0'],
  suggestedTextColors: ['#2C2C2C', '#1A1A1A', '#4A4A4A'],
  styleNotes: 'Classic cream-and-charcoal salon aesthetic.',
  logoHasTransparency: true,
};

function stripDataUrlPrefix(input: string): { mime: string; base64: string } {
  const match = /^data:([^;]+);base64,(.+)$/i.exec(input.trim());
  if (match) {
    return { mime: match[1], base64: match[2] };
  }
  return { mime: 'application/octet-stream', base64: input.trim() };
}

function base64ToBytes(base64: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(base64, 'base64'));
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) =>
    Math.round(Math.max(0, Math.min(255, n)))
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function hexLuminance(hex: string): number {
  const n = hex.replace('#', '');
  if (n.length !== 6) return 0.5;
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function pickAccent(primary: string, secondary: string): string {
  const candidates = ['#B8956A', '#C4A882', '#8B7355', '#A67C52'];
  const primaryLum = hexLuminance(primary);
  return primaryLum < 0.4 ? candidates[0] : secondary;
}

function heuristicAnalyzeLogo(imageBase64OrDataUrl: string): BrandAnalysis {
  const { mime, base64 } = stripDataUrlPrefix(imageBase64OrDataUrl);
  const bytes = base64ToBytes(base64);
  const isPng = mime.includes('png') || looksLikePng(bytes);
  const logoHasTransparency = isPng && pngLikelyHasAlpha(bytes);

  const sampled = sampleDominantColors(bytes, isPng);
  if (!sampled) {
    return { ...OFFLINE_DEFAULT, logoHasTransparency };
  }

  const [primary, secondary] = sampled;
  const accent = pickAccent(primary, secondary);
  const lightBg = hexLuminance(primary) > 0.7 ? primary : '#F7F3EE';
  const darkText = hexLuminance(primary) < 0.35 ? primary : '#2C2C2C';

  return {
    primaryColor: primary,
    secondaryColor: secondary,
    accentColor: accent,
    suggestedBackgrounds: [lightBg, '#FFFFFF', '#EDE8E0'],
    suggestedTextColors: [darkText, '#1A1A1A', secondary],
    styleNotes:
      'Derived from logo colors using offline sampling. Refine in the editor as needed.',
    logoHasTransparency,
  };
}

function looksLikePng(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  );
}

function pngLikelyHasAlpha(bytes: Uint8Array): boolean {
  if (!looksLikePng(bytes)) return false;
  let offset = 8;
  while (offset + 12 <= bytes.length) {
    const length =
      (bytes[offset] << 24) |
      (bytes[offset + 1] << 16) |
      (bytes[offset + 2] << 8) |
      bytes[offset + 3];
    const type = String.fromCharCode(
      bytes[offset + 4],
      bytes[offset + 5],
      bytes[offset + 6],
      bytes[offset + 7],
    );
    if (type === 'IHDR' && length >= 13) {
      const colorType = bytes[offset + 8 + 9];
      return colorType === 4 || colorType === 6;
    }
    if (type === 'tRNS') return true;
    offset += 12 + length;
  }
  return false;
}

function sampleDominantColors(
  bytes: Uint8Array,
  isPng: boolean,
): [string, string] | null {
  if (!isPng || bytes.length < 100) return null;

  const buckets = new Map<string, number>();
  const step = Math.max(1, Math.floor((bytes.length - 64) / 800));
  for (let i = 64; i < bytes.length - 3; i += step) {
    const r = bytes[i];
    const g = bytes[i + 1];
    const b = bytes[i + 2];
    if (r === g && g === b && (r > 250 || r < 5)) continue;
    const key = `${Math.floor(r / 32)},${Math.floor(g / 32)},${Math.floor(b / 32)}`;
    buckets.set(key, (buckets.get(key) ?? 0) + 1);
  }

  const sorted = [...buckets.entries()].sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) return null;

  const toRgb = (key: string) =>
    key.split(',').map((v) => Math.min(255, parseInt(v, 10) * 32 + 16));

  const [k1] = sorted[0];
  const k2 = sorted[1]?.[0] ?? k1;
  const [r1, g1, b1] = toRgb(k1);
  const [r2, g2, b2] = toRgb(k2);
  return [rgbToHex(r1, g1, b1), rgbToHex(r2, g2, b2)];
}

export async function analyzeLogo(
  imageBase64OrDataUrl: string,
): Promise<BrandAnalysis> {
  const client = getOpenAI();
  if (!client) {
    return heuristicAnalyzeLogo(imageBase64OrDataUrl);
  }

  const { mime, base64 } = stripDataUrlPrefix(imageBase64OrDataUrl);
  const dataUrl =
    imageBase64OrDataUrl.startsWith('data:') ?
      imageBase64OrDataUrl
    : `data:${mime};base64,${base64}`;

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You analyze salon logos for bottle label design. Return JSON with: primaryColor, secondaryColor, accentColor (hex), suggestedBackgrounds (3 hex), suggestedTextColors (3 hex), styleNotes (short), logoHasTransparency (boolean).',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this logo for a luxury salon bottle label palette.',
            },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ],
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) return heuristicAnalyzeLogo(imageBase64OrDataUrl);

    const parsed = JSON.parse(raw) as Partial<BrandAnalysis>;
    return {
      primaryColor: parsed.primaryColor ?? OFFLINE_DEFAULT.primaryColor,
      secondaryColor: parsed.secondaryColor ?? OFFLINE_DEFAULT.secondaryColor,
      accentColor: parsed.accentColor ?? OFFLINE_DEFAULT.accentColor,
      suggestedBackgrounds:
        parsed.suggestedBackgrounds?.length ?
          parsed.suggestedBackgrounds
        : OFFLINE_DEFAULT.suggestedBackgrounds,
      suggestedTextColors:
        parsed.suggestedTextColors?.length ?
          parsed.suggestedTextColors
        : OFFLINE_DEFAULT.suggestedTextColors,
      styleNotes: parsed.styleNotes ?? OFFLINE_DEFAULT.styleNotes,
      logoHasTransparency: parsed.logoHasTransparency ?? true,
    };
  } catch {
    return heuristicAnalyzeLogo(imageBase64OrDataUrl);
  }
}
