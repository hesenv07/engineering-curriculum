import type { ISidebarRoute } from "@/shared/types";

export interface ISidebarRouteTreeProps {
  level?: number;
  routeTree: ISidebarRoute;
  isForceExpanded: boolean;
  breadcrumbs: ISidebarRoute[];
}

export interface ICollapseWrapperProps {
  duration: number;
  isExpanded: boolean;
  children: React.ReactNode;
}

export interface IModuleGroupProps {
  level: number;
  currentSlug: string;
  routes: ISidebarRoute[];
  isForceExpanded: boolean;
  title: string | undefined;
  breadcrumbs: ISidebarRoute[];
}
