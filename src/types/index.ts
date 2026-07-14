export interface ISidebarRoute {
  title?: string;
  path?: string;
  routes?: ISidebarRoute[];
  heading?: boolean;
  version?: 'canary' | 'major' | 'experimental' | 'rc';
  hasSectionHeader?: boolean;
  sectionHeader?: string;
  wip?: boolean;
}

export interface ISidebarConfig {
  title: string;
  path: string;
  routes: ISidebarRoute[];
}

export interface IPageMeta {
  title: string;
  description?: string;
}

export interface ITocItem {
  id: string;
  text: string;
  level: number;
}

export interface IPageContext {
  prev?: { title: string; path: string } | null;
  next?: { title: string; path: string } | null;
}
