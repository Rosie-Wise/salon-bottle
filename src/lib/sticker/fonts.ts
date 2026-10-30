import type { FontFamily } from '@/lib/types';

export function fontFamilyForConfig(family: FontFamily): string {
  switch (family) {
    case 'serif':
      return 'var(--font-display), Georgia, serif';
    case 'elegant':
      return 'var(--font-elegant), Georgia, serif';
    case 'sans':
    default:
      return 'var(--font-sans), system-ui, sans-serif';
  }
}
