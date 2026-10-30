import type { SiteConfig } from '@/lib/types';

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  minOrderQty: 12,
  qtyIncrement: 6,
  pricePerBottle: null,
  volumeDiscounts: [],
  productInfo: {
    shampoo: {
      title: 'Shampoo',
      description:
        'A refined daily cleanse designed for salon-quality results at the back bar and retail shelf. Custom labeled to match your salon’s look and voice.',
      defaultVolume: '200 mL',
    },
    conditioner: {
      title: 'Conditioner',
      description:
        'A companion conditioner with a silky, professional finish—perfectly paired with your custom shampoo label for a cohesive client experience.',
      defaultVolume: '200 mL',
    },
  },
  faqs: [
    {
      question: 'What is the minimum order?',
      answer:
        'Orders start at 12 bottles, with quantities increasing in increments of 6 so we can batch your run efficiently.',
    },
    {
      question: 'Can I order shampoo and conditioner together?',
      answer:
        'Yes. You can add a matching conditioner label set during customization so both products share your brand palette and typography.',
    },
    {
      question: 'What does the wrap-around label include?',
      answer:
        'One wrap-around label covers the full 200 mL white bottle. You design the front half; the back half is a fixed ingredients and claims panel (same for every order). Label size is 5.34 in × 4.05 in.',
    },
    {
      question: 'How does design approval work?',
      answer:
        'You preview three starter directions for the front panel, refine copy and colors, then approve the final wrap-around artwork before we queue production.',
    },
    {
      question: 'What file format should my logo be?',
      answer:
        'PNG with transparency works best. High-resolution artwork helps keep edges crisp on print.',
    },
    {
      question: 'How long does production take?',
      answer:
        'Timing depends on order size and queue volume. We confirm an estimated window after your design is approved.',
    },
  ],
  benefits: [
    {
      title: 'Salon-first branding',
      description:
        'Labels tailored to your logo and aesthetic—not generic stock templates.',
    },
    {
      title: 'Cohesive retail presentation',
      description:
        'Shampoo and conditioner sets that look intentional on your shelf and in client bags.',
    },
    {
      title: 'Guided customization',
      description:
        'Starter designs and plain-language edits so you can refine without design software.',
    },
    {
      title: 'Production-ready artwork',
      description:
        'Label layouts shaped for our 200 mL bottle format, with safe zones for logo and type.',
    },
  ],
};

/**
 * Returns site configuration. Override later with database or CMS reads.
 */
export async function getSiteConfig(): Promise<SiteConfig> {
  return DEFAULT_SITE_CONFIG;
}

export function getSiteConfigSync(): SiteConfig {
  return DEFAULT_SITE_CONFIG;
}
