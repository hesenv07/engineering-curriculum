export interface SidebarRoute {
  title?: string;
  path?: string;
  routes?: SidebarRoute[];
  hasSectionHeader?: boolean;
  sectionHeader?: string;
  wip?: boolean;
}

export interface SidebarConfig {
  title: string;
  path: string;
  routes: SidebarRoute[];
}

export interface PageMeta {
  title: string;
  description?: string;
}

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export interface PageContext {
  prev?: { title: string; path: string } | null;
  next?: { title: string; path: string } | null;
}
