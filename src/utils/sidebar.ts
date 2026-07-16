import sidebarAz from '@/sidebar.json';
import sidebarEn from '@/sidebar-en.json';

import { resolveLocale } from '@/utils/locale';

import type { ISidebarRoute } from '@/types';

export function getSidebarRouteTree(locale?: string): ISidebarRoute {
  return (resolveLocale(locale) === 'en' ? sidebarEn : sidebarAz) as ISidebarRoute;
}

export interface IPhaseCard {
  id: string;
  badgeText: string;
  title: string;
  desc: string;
  lessonCount: number;
  path: string;
}

export interface ISidebarStats {
  phases: IPhaseCard[];
  totalPhases: number;
  totalModules: number;
  totalLessons: number;
}

export function parseSidebar(routes: ISidebarRoute[]): ISidebarStats {
  const phases: IPhaseCard[] = [];
  let bucket: ISidebarRoute[] = [];
  let header: ISidebarRoute | null = null;

  function flush() {
    if (!header) return;

    const raw = header.sectionHeader ?? '';
    const match = raw.match(/^((?:FAZA|PHASE)\s+\d+)\s*[—–-]\s*(.+)$/i);
    const badgeText = header.label ?? (match ? match[1] : raw);
    const title = match ? match[2].replace(/\s*\(.*\)$/, '').trim() : raw;

    let lessonCount = 0;
    let firstPath = '/learn';

    for (const mod of bucket) {
      if (mod.routes) {
        for (const lesson of mod.routes) {
          if (lesson.path) {
            lessonCount++;
            if (firstPath === '/learn') firstPath = lesson.path;
          }
        }
      } else if (mod.path) {
        lessonCount++;
        if (firstPath === '/learn') firstPath = mod.path;
      }
    }

    phases.push({
      id: String(phases.length),
      badgeText,
      title,
      desc: header.description ?? '',
      lessonCount,
      path: firstPath,
    });
  }

  for (const route of routes) {
    if (route.hasSectionHeader) {
      flush();
      header = route;
      bucket = [];
    } else {
      bucket.push(route);
    }
  }
  flush();

  const totalModules = routes.filter(
    (r) => !r.hasSectionHeader && !r.path && Array.isArray(r.routes),
  ).length;
  const totalLessons = phases.reduce((sum, p) => sum + p.lessonCount, 0);

  return { phases, totalPhases: phases.length, totalModules, totalLessons };
}
