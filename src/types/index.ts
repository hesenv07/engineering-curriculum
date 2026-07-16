export type TLessonLevel = 'Fundamental' | 'Intermediate' | 'Deep';

export type TLocale = 'az' | 'en';

export interface ISidebarRoute {
  path?: string;
  wip?: boolean;
  title?: string;
  label?: string;
  heading?: boolean;
  duration?: string;
  level?: TLessonLevel;
  description?: string;
  sectionHeader?: string;
  routes?: ISidebarRoute[];
  hasSectionHeader?: boolean;
  version?: 'canary' | 'major' | 'experimental' | 'rc';
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
