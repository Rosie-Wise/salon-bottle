import type { BrandAnalysis, DesignConfig } from '@/lib/types';
import {
  LOGO_OFFSET_X_MAX,
  LOGO_OFFSET_X_MIN,
  LOGO_OFFSET_Y_MAX,
  LOGO_OFFSET_Y_MIN,
  LOGO_SCALE_MAX,
  LOGO_SCALE_MIN,
  TEXT_SIZE_MAX,
  TEXT_SIZE_MIN,
} from '@/lib/sticker/apply-changes';
import { getOpenAI } from '@/lib/openai/client';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function clampPartial(partial: Partial<DesignConfig>): Partial<DesignConfig> {
  const out = { ...partial };
  if (out.logoScale !== undefined) {
    out.logoScale = clamp(out.logoScale, LOGO_SCALE_MIN, LOGO_SCALE_MAX);
  }
  if (out.logoOffsetY !== undefined) {
    out.logoOffsetY = clamp(out.logoOffsetY, LOGO_OFFSET_Y_MIN, LOGO_OFFSET_Y_MAX);
  }
  if (out.logoOffsetX !== undefined) {
    out.logoOffsetX = clamp(out.logoOffsetX, LOGO_OFFSET_X_MIN, LOGO_OFFSET_X_MAX);
  }
  if (out.productNameSize !== undefined) {
    out.productNameSize = clamp(out.productNameSize, TEXT_SIZE_MIN, TEXT_SIZE_MAX);
  }
  if (out.taglineSize !== undefined) {
    out.taglineSize = clamp(out.taglineSize, TEXT_SIZE_MIN, TEXT_SIZE_MAX);
  }
  if (out.volumeSize !== undefined) {
    out.volumeSize = clamp(out.volumeSize, TEXT_SIZE_MIN, TEXT_SIZE_MAX);
  }
  return out;
}

const COLOR_KEYWORDS: Record<string, string> = {
  black: '#1A1A1A',
  white: '#FFFFFF',
  cream: '#F7F3EE',
  ivory: '#FFFFF0',
  charcoal: '#2C2C2C',
  gray: '#6B6B6B',
  grey: '#6B6B6B',
  gold: '#B8956A',
  champagne: '#E8DCC8',
  blush: '#E8C4C4',
  pink: '#E8A4B8',
  rose: '#C97B8B',
  blue: '#4A6FA5',
  navy: '#1E3A5F',
  sage: '#9CAF88',
  green: '#5C7A5C',
  beige: '#D4C4B0',
  tan: '#C4A882',
};

function parseKeywordCustomization(
  message: string,
  currentConfig: DesignConfig,
): Partial<DesignConfig> {
  const lower = message.toLowerCase();
  const patch: Partial<DesignConfig> = {};

  for (const [word, hex] of Object.entries(COLOR_KEYWORDS)) {
    if (lower.includes(`background ${word}`) || lower.includes(`${word} background`)) {
      patch.backgroundColor = hex;
    }
    if (lower.includes(`text ${word}`) || lower.includes(`${word} text`)) {
      patch.textColor = hex;
    }
    if (lower.includes(`accent ${word}`) || lower.includes(`${word} accent`)) {
      patch.accentColor = hex;
    }
  }

  if (/\blogo smaller\b|\bshrink logo\b|\breduce logo\b/.test(lower)) {
    patch.logoScale = currentConfig.logoScale - 0.1;
  }
  if (/\blogo bigger\b|\blarger logo\b|\benlarge logo\b/.test(lower)) {
    patch.logoScale = currentConfig.logoScale + 0.1;
  }
  if (/\blogo higher\b|\bmove logo up\b|\braise logo\b/.test(lower)) {
    patch.logoOffsetY = currentConfig.logoOffsetY - 6;
  }
  if (/\blogo lower\b|\bmove logo down\b/.test(lower)) {
    patch.logoOffsetY = currentConfig.logoOffsetY + 6;
  }
  if (/\blogo left\b/.test(lower)) {
    patch.logoOffsetX = currentConfig.logoOffsetX - 6;
  }
  if (/\blogo right\b/.test(lower)) {
    patch.logoOffsetX = currentConfig.logoOffsetX + 6;
  }

  if (/\bmore minimal\b|\bminimal\b/.test(lower)) {
    patch.style = 'minimal';
    patch.showDecorativeLines = false;
    patch.fontFamily = 'sans';
  }
  if (/\bbrand style\b|\bmore branded\b/.test(lower)) {
    patch.style = 'brand';
    patch.showDecorativeLines = true;
  }
  if (/\bsignature\b|\bdark background\b|\bluxury\b/.test(lower)) {
    patch.style = 'signature';
    patch.showDecorativeLines = true;
    patch.fontFamily = 'serif';
  }

  if (/\bcenter align\b|\bcenter text\b/.test(lower)) {
    patch.textAlign = 'center';
  }
  if (/\bleft align\b|\bleft text\b/.test(lower)) {
    patch.textAlign = 'left';
  }

  if (/\bserif\b/.test(lower)) patch.fontFamily = 'serif';
  if (/\bsans\b/.test(lower)) patch.fontFamily = 'sans';
  if (/\belegant\b/.test(lower)) patch.fontFamily = 'elegant';

  if (/\bhide lines\b|\bno lines\b/.test(lower)) {
    patch.showDecorativeLines = false;
  }
  if (/\bshow lines\b|\bdecorative lines\b/.test(lower)) {
    patch.showDecorativeLines = true;
  }

  if (/\bbigger title\b|\blarger product name\b/.test(lower)) {
    patch.productNameSize = currentConfig.productNameSize + 2;
  }
  if (/\bsmaller title\b/.test(lower)) {
    patch.productNameSize = currentConfig.productNameSize - 2;
  }

  return patch;
}

const DESIGN_CONFIG_JSON_KEYS = [
  'backgroundColor',
  'textColor',
  'accentColor',
  'logoScale',
  'logoOffsetY',
  'logoOffsetX',
  'productName',
  'tagline',
  'volumeText',
  'fontFamily',
  'productNameSize',
  'taglineSize',
  'volumeSize',
  'textAlign',
  'showDecorativeLines',
  'decorativeLineColor',
  'style',
  'productType',
] as const;

function sanitizePartial(raw: Record<string, unknown>): Partial<DesignConfig> {
  const out: Partial<DesignConfig> = {};
  for (const key of DESIGN_CONFIG_JSON_KEYS) {
    if (raw[key] !== undefined && raw[key] !== null) {
      (out as Record<string, unknown>)[key] = raw[key];
    }
  }
  if (out.style && !['minimal', 'brand', 'signature'].includes(out.style)) {
    delete out.style;
  }
  if (out.fontFamily && !['serif', 'sans', 'elegant'].includes(out.fontFamily)) {
    delete out.fontFamily;
  }
  if (out.textAlign && !['center', 'left'].includes(out.textAlign)) {
    delete out.textAlign;
  }
  if (out.productType && !['shampoo', 'conditioner'].includes(out.productType)) {
    delete out.productType;
  }
  return out;
}

export async function interpretCustomization(
  message: string,
  currentConfig: DesignConfig,
  brandAnalysis?: BrandAnalysis | null,
): Promise<Partial<DesignConfig>> {
  const client = getOpenAI();
  if (!client) {
    return clampPartial(parseKeywordCustomization(message, currentConfig));
  }

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'design_config_patch',
          strict: false,
          schema: {
            type: 'object',
            additionalProperties: false,
            properties: {
              backgroundColor: { type: 'string' },
              textColor: { type: 'string' },
              accentColor: { type: 'string' },
              logoScale: { type: 'number' },
              logoOffsetY: { type: 'number' },
              logoOffsetX: { type: 'number' },
              productName: { type: 'string' },
              tagline: { type: 'string' },
              volumeText: { type: 'string' },
              fontFamily: { type: 'string', enum: ['serif', 'sans', 'elegant'] },
              productNameSize: { type: 'number' },
              taglineSize: { type: 'number' },
              volumeSize: { type: 'number' },
              textAlign: { type: 'string', enum: ['center', 'left'] },
              showDecorativeLines: { type: 'boolean' },
              decorativeLineColor: { type: 'string' },
              style: { type: 'string', enum: ['minimal', 'brand', 'signature'] },
              productType: { type: 'string', enum: ['shampoo', 'conditioner'] },
            },
          },
        },
      },
      messages: [
        {
          role: 'system',
          content:
            'You translate natural language into partial bottle label design updates. Only include fields that should change. Colors as hex. logoScale 0.3-1.2, logoOffsetY -20 to 40.',
        },
        {
          role: 'user',
          content: JSON.stringify({
            message,
            currentConfig,
            brandAnalysis: brandAnalysis ?? null,
          }),
        },
      ],
    });

    const raw = response.choices[0]?.message?.content;
    if (!raw) {
      return clampPartial(parseKeywordCustomization(message, currentConfig));
    }

    const parsed = sanitizePartial(JSON.parse(raw) as Record<string, unknown>);
    if (Object.keys(parsed).length === 0) {
      return clampPartial(parseKeywordCustomization(message, currentConfig));
    }
    return clampPartial(parsed);
  } catch {
    return clampPartial(parseKeywordCustomization(message, currentConfig));
  }
}

export { parseKeywordCustomization };
