import type {
  BrandAnalysis,
  DesignConfig,
  DesignStyle,
  ProductType,
} from '@/lib/types';
import { BOTTLE_SURFACE } from '@/lib/sticker/bottle-surface';

export const PRODUCT_COPY: Record<
  ProductType,
  { productName: string; tagline: string; volumeText: string }
> = {
  shampoo: {
    productName: 'HYDRATING SHAMPOO',
    tagline: 'CLEANSE | NOURISH | RESTORE',
    volumeText: '200 mL | 6.8 fl oz',
  },
  conditioner: {
    productName: 'HYDRATING CONDITIONER',
    tagline: 'NOURISH | HYDRATE | RESTORE',
    volumeText: '200 mL | 6.8 fl oz',
  },
};

const FALLBACK_BRAND: BrandAnalysis = {
  primaryColor: '#2C2C2C',
  secondaryColor: '#6B6B6B',
  accentColor: '#B8956A',
  suggestedBackgrounds: ['#F7F3EE', '#FFFFFF', '#EDE8E0'],
  suggestedTextColors: ['#2C2C2C', '#1A1A1A', '#4A4A4A'],
  styleNotes: 'Neutral luxury palette with warm accent.',
  logoHasTransparency: true,
};

function baseConfig(
  style: DesignStyle,
  productType: ProductType,
  brand: BrandAnalysis,
): DesignConfig {
  const copy = PRODUCT_COPY[productType];
  return {
    backgroundColor: BOTTLE_SURFACE,
    textColor: brand.suggestedTextColors[0] ?? '#2C2C2C',
    accentColor: brand.accentColor,
    logoScale: 0.85,
    logoOffsetY: 0,
    logoOffsetX: 0,
    productName: copy.productName,
    tagline: copy.tagline,
    volumeText: copy.volumeText,
    fontFamily: 'elegant',
    productNameSize: 14,
    taglineSize: 8,
    volumeSize: 8,
    textAlign: 'center',
    showDecorativeLines: false,
    decorativeLineColor: brand.accentColor,
    style,
    productType,
  };
}

export function createMinimalDesignConfig(
  brand: BrandAnalysis,
  productType: ProductType,
): DesignConfig {
  const config = baseConfig('minimal', productType, brand);
  return {
    ...config,
    backgroundColor: BOTTLE_SURFACE,
    textColor: brand.suggestedTextColors[0] ?? '#2C2C2C',
    accentColor: brand.primaryColor,
    fontFamily: 'sans',
    logoScale: 0.75,
    productNameSize: 13,
    taglineSize: 7.5,
    showDecorativeLines: false,
  };
}

export function createBrandDesignConfig(
  brand: BrandAnalysis,
  productType: ProductType,
): DesignConfig {
  const config = baseConfig('brand', productType, brand);
  return {
    ...config,
    // Soft tint that still sits on the bottle without a white card look
    backgroundColor: brand.suggestedBackgrounds[0] ?? BOTTLE_SURFACE,
    textColor: brand.primaryColor,
    accentColor: brand.accentColor,
    fontFamily: 'elegant',
    logoScale: 0.9,
    productNameSize: 14,
    taglineSize: 8,
    showDecorativeLines: true,
    decorativeLineColor: brand.accentColor,
  };
}

export function createSignatureDesignConfig(
  brand: BrandAnalysis,
  productType: ProductType,
): DesignConfig {
  const config = baseConfig('signature', productType, brand);
  const darkBg =
    brand.suggestedBackgrounds.find((c) => isDarkColor(c)) ??
    brand.primaryColor;
  return {
    ...config,
    backgroundColor: isDarkColor(darkBg) ? darkBg : '#2C2C2C',
    textColor: '#F7F3EE',
    accentColor: brand.accentColor,
    fontFamily: 'serif',
    logoScale: 1,
    logoOffsetY: -4,
    productNameSize: 14,
    taglineSize: 8,
    volumeSize: 8,
    showDecorativeLines: true,
    decorativeLineColor: brand.accentColor,
  };
}

const STYLE_CREATORS: Record<
  DesignStyle,
  (brand: BrandAnalysis, productType: ProductType) => DesignConfig
> = {
  minimal: createMinimalDesignConfig,
  brand: createBrandDesignConfig,
  signature: createSignatureDesignConfig,
};

export function createDefaultDesignConfig(
  style: DesignStyle,
  brandAnalysis?: BrandAnalysis | null,
  productType: ProductType = 'shampoo',
): DesignConfig {
  const brand = brandAnalysis ?? FALLBACK_BRAND;
  return STYLE_CREATORS[style](brand, productType);
}

function isDarkColor(hex: string): boolean {
  const normalized = hex.replace('#', '');
  if (normalized.length !== 6) return false;
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.45;
}
