import type { ISidebarRoute } from "@/shared/types";

export interface ISidebarNavProps {
  routeTree: ISidebarRoute;
  breadcrumbs: ISidebarRoute[];
}