import type { DesignConfig } from '@/lib/types';

const LOGO_SCALE_MIN = 0.3;
const LOGO_SCALE_MAX = 1.2;
const LOGO_OFFSET_Y_MIN = -20;
const LOGO_OFFSET_Y_MAX = 40;
const LOGO_OFFSET_X_MIN = -60;
const LOGO_OFFSET_X_MAX = 60;
const TEXT_SIZE_MIN = 5;
const TEXT_SIZE_MAX = 28;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function clampConfigFields(config: DesignConfig): DesignConfig {
  return {
    ...config,
    logoScale: clamp(config.logoScale, LOGO_SCALE_MIN, LOGO_SCALE_MAX),
    logoOffsetY: clamp(config.logoOffsetY, LOGO_OFFSET_Y_MIN, LOGO_OFFSET_Y_MAX),
    logoOffsetX: clamp(config.logoOffsetX, LOGO_OFFSET_X_MIN, LOGO_OFFSET_X_MAX),
    productNameSize: clamp(config.productNameSize, TEXT_SIZE_MIN, TEXT_SIZE_MAX),
    taglineSize: clamp(config.taglineSize, TEXT_SIZE_MIN, TEXT_SIZE_MAX),
    volumeSize: clamp(config.volumeSize, TEXT_SIZE_MIN, TEXT_SIZE_MAX),
  };
}

/**
 * Merges a partial update into the current design config with validated ranges.
 */
export function applyDesignPatch(
  config: DesignConfig,
  partial: Partial<DesignConfig>,
): DesignConfig {
  return clampConfigFields({ ...config, ...partial });
}

export {
  LOGO_SCALE_MIN,
  LOGO_SCALE_MAX,
  LOGO_OFFSET_Y_MIN,
  LOGO_OFFSET_Y_MAX,
  LOGO_OFFSET_X_MIN,
  LOGO_OFFSET_X_MAX,
  TEXT_SIZE_MIN,
  TEXT_SIZE_MAX,
};
