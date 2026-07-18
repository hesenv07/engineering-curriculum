
import { getSidebarRouteTree } from "@/shared/lib/utils/sidebar";

import type { IPageContext, ISidebarRoute } from "@/shared/types";

function flattenRoutes(routes: ISidebarRoute[]): { title: string; path: string }[] {
  const result: { title: string; path: string }[] = [];
  for (const route of routes) {
    if (route.hasSectionHeader) continue;
    if (route.path && route.title) {
      result.push({ title: route.title, path: route.path });
    }
    if (route.routes) {
      result.push(...flattenRoutes(route.routes));
    }
  }
  return result;
}

export function getPageContext(currentPath: string, locale?: string): IPageContext {
  const all = flattenRoutes(getSidebarRouteTree(locale).routes ?? []);
  const idx = all.findIndex((r) => r.path === `/${currentPath}` || r.path === currentPath);

  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx < all.length - 1 ? all[idx + 1] : null,
  };
}
