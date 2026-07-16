import type { TLocale } from '@/types';

export function resolveLocale(locale?: string): TLocale {
  return locale === 'en' ? 'en' : 'az';
}
