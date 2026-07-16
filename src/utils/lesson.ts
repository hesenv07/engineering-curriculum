import { resolveLocale } from '@/utils/locale';

import type { TLessonLevel } from '@/types';

export function getLessonLevel(urlPath: string): TLessonLevel | undefined {
  const match = urlPath.match(/\/faza-(\d+)\//);
  if (!match) return undefined;
  const fazaNum = parseInt(match[1], 10);
  if (fazaNum <= 1) return 'Fundamental';
  if (fazaNum <= 5) return 'Intermediate';
  return 'Deep';
}

export function computeDuration(lineCount: number, locale?: string): string {
  const minutes = Math.ceil(lineCount / 75) * 5;
  return resolveLocale(locale) === 'en' ? `${minutes} min` : `${minutes} dəq`;
}
