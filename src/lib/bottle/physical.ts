/**
 * Physical bottle + wrap-label dimensions.
 * Estimates until manufacturing measurements are confirmed — keep configurable.
 */
export const BOTTLE_PHYSICAL = {
  capacityMl: 200,
  capacityFlOz: 6.8,
  /** Estimated outer diameter of the printable cylinder (inches). */
  bodyDiameterIn: 1.7,
  /** Estimated printable body height (inches). */
  bodyHeightIn: 4.05,
  /** Provisional wrap label width (circumference coverage). */
  labelWidthIn: 5.34,
  /** Provisional wrap label height. */
  labelHeightIn: 4.05,
  /** Safe print area inset from die-cut edge. */
  safeAreaWidthIn: 5.16,
  safeAreaHeightIn: 3.87,
  /** Scene units for the procedural 3D model (not manufacturing). */
  scene: {
    bodyRadius: 0.85,
    bodyHeight: 3.35,
    shoulderHeight: 0.18,
    capRadius: 0.82,
    capHeight: 0.38,
    neckHeight: 0.12,
    labelHeightRatio: 0.92,
  },
} as const;

export type BottlePhysicalConfig = typeof BOTTLE_PHYSICAL;
