import type { ISidebarRoute } from '@/shared/types';

export function getBreadcrumbs(
  path: string,
  routeTree: ISidebarRoute,
  crumbs: ISidebarRoute[] = [],
): ISidebarRoute[] {
  if (routeTree.path === path) return crumbs;
  if (!routeTree.routes) return [];
  for (const route of routeTree.routes) {
    const result = getBreadcrumbs(path, route, [...crumbs, routeTree]);
    if (result.length > 0 || route.path === path) return result;
  }
  return [];
}
