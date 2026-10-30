export type FontFamily = 'serif' | 'sans' | 'elegant';
export type TextAlign = 'center' | 'left';
export type DesignStyle = 'minimal' | 'brand' | 'signature';
export type ProductType = 'shampoo' | 'conditioner';

export interface DesignConfig {
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  logoScale: number;
  logoOffsetY: number;
  logoOffsetX: number;
  productName: string;
  tagline: string;
  volumeText: string;
  fontFamily: FontFamily;
  productNameSize: number;
  taglineSize: number;
  volumeSize: number;
  textAlign: TextAlign;
  showDecorativeLines: boolean;
  decorativeLineColor: string;
  style: DesignStyle;
  productType: ProductType;
}

export interface BrandAnalysis {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  suggestedBackgrounds: string[];
  suggestedTextColors: string[];
  styleNotes: string;
  logoHasTransparency: boolean;
}

export type OrderStatus =
  | 'New'
  | 'Design Review'
  | 'Confirmed'
  | 'In Production'
  | 'Ready'
  | 'Shipped'
  | 'Completed'
  | 'Cancelled';

export type DesignSessionStep =
  | 'welcome'
  | 'logo'
  | 'designs'
  | 'customize'
  | 'products'
  | 'review'
  | 'checkout';

export interface Logo {
  id: string;
  fileName: string;
  dataUrl: string;
  mimeType: string;
  uploadedAt: string;
}

export interface DesignVersion {
  id: string;
  designId: string;
  version: number;
  config: DesignConfig;
  createdAt: string;
  note?: string;
}

export interface Design {
  id: string;
  profileId?: string;
  logoId?: string;
  config: DesignConfig;
  previewUrl?: string;
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface Profile {
  id: string;
  salonName: string;
  contactEmail?: string;
  contactPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderLineItem {
  productType: ProductType;
  quantity: number;
  designConfig: DesignConfig;
}

export interface Order {
  id: string;
  profileId?: string;
  salonName: string;
  status: OrderStatus;
  lineItems: OrderLineItem[];
  includeConditioner: boolean;
  totalQuantity: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExcelSyncJob {
  id: string;
  orderId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  attemptedAt?: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface SiteFaq {
  question: string;
  answer: string;
}

export interface SiteBenefit {
  title: string;
  description: string;
}

export interface SiteProductInfo {
  shampoo: { title: string; description: string; defaultVolume: string };
  conditioner: { title: string; description: string; defaultVolume: string };
}

export interface VolumeDiscountTier {
  minQuantity: number;
  label: string;
}

export interface SiteConfig {
  minOrderQty: number;
  qtyIncrement: number;
  pricePerBottle: number | null;
  volumeDiscounts: VolumeDiscountTier[];
  productInfo: SiteProductInfo;
  faqs: SiteFaq[];
  benefits: SiteBenefit[];
}

export interface SessionState {
  logoDataUrl: string | null;
  logoFileName: string | null;
  brandAnalysis: BrandAnalysis | null;
  designs: DesignConfig[];
  selectedDesignIndex: number;
  currentConfig: DesignConfig | null;
  configHistory: DesignConfig[];
  historyIndex: number;
  shampooConfig: DesignConfig | null;
  conditionerConfig: DesignConfig | null;
  includeConditioner: boolean;
  approved: boolean;
  salonName: string;
  step: DesignSessionStep;
}
