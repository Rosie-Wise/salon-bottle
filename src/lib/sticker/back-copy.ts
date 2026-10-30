import type { ProductType } from '@/lib/types';

/** Fixed wrap panels. Volume locked to 200 mL bottle. */
export const BACK_VOLUME = '200 mL ℮ 6.8 fl oz';

export const BACK_DISTRIBUTOR = {
  name: 'Distributed by QUAFFED',
  address: '125 Norfinch Drive, Toronto, ON, M3N 1W8',
  phone: '437.370.0132',
  web: 'shop.quaffed.ca',
  email: 'info@quaffed.ca',
} as const;

export const CLAIM_ICONS = [
  { id: 'vegan', label: 'VEGAN' },
  { id: 'cruelty', label: 'CRUELTY FREE' },
  { id: 'sulfate', label: 'SULFATE FREE' },
  { id: 'silicone', label: 'SILICONE FREE' },
  { id: 'mineral', label: 'MINERAL OIL FREE' },
  { id: 'gluten', label: 'GLUTEN FREE' },
  { id: 'paraben', label: 'PARABEN FREE' },
  { id: 'color', label: 'COLOR SAFE' },
  { id: 'pao', label: '12M' },
] as const;

export const BACK_INGREDIENTS: Record<ProductType, string> = {
  shampoo:
    'Water (Aqua/Eau), Sodium Lauroyl Methyl Isethionate, Cocamidopropyl Betaine, Sodium Methyl Oleoyl Taurate, Glycerin, Sodium Chloride, Fragrance (Parfum), Panthenol, Hydrolyzed Keratin, Helianthus Annuus (Sunflower) Seed Oil, Argania Spinosa Kernel Oil, Simmondsia Chinensis (Jojoba) Seed Oil, Biotin, Tocopherol, Citric Acid, Sodium Benzoate, Potassium Sorbate, Benzyl Alcohol.',
  conditioner:
    'Water (Aqua/Eau), Cetearyl Alcohol, Caprylic/Capric Triglyceride, Behentrimonium Chloride, Glycerin, Cetyl Alcohol, Fragrance (Parfum), Panthenol, Hydrolyzed Keratin, Helianthus Annuus (Sunflower) Seed Oil, Argania Spinosa Kernel Oil, Simmondsia Chinensis (Jojoba) Seed Oil, Biotin, Tocopherol, Citric Acid, Sodium Benzoate, Potassium Sorbate, Benzyl Alcohol.',
};

export const BACK_PRODUCT_TITLE: Record<ProductType, string> = {
  shampoo: 'SHAMPOO',
  conditioner: 'CONDITIONER',
};

export const BACK_PANEL_IMAGE: Record<ProductType, string> = {
  shampoo: '/labels/back-shampoo.png',
  conditioner: '/labels/back-conditioner.png',
};
