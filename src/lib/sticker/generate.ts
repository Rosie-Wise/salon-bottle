import type { BrandAnalysis, DesignConfig } from '@/lib/types';
import {
  createBrandDesignConfig,
  createMinimalDesignConfig,
  createSignatureDesignConfig,
} from '@/lib/sticker/defaults';

/**
 * Builds three starter designs (minimal, brand, signature) from brand analysis.
 * `logoUrl` is reserved for future preview generation; configs are style-only today.
 */
export function generateThreeDesigns(
  brandAnalysis: BrandAnalysis,
  _logoUrl?: string | null,
): [DesignConfig, DesignConfig, DesignConfig] {
  void _logoUrl;
  return [
    createMinimalDesignConfig(brandAnalysis, 'shampoo'),
    createBrandDesignConfig(brandAnalysis, 'shampoo'),
    createSignatureDesignConfig(brandAnalysis, 'shampoo'),
  ];
}
