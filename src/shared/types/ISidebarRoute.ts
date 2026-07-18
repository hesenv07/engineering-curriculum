import type { IPhaseCard, TLessonLevel } from ".";

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
  version?: "canary" | "major" | "experimental" | "rc";
}

export interface ISidebarConfig {
  path: string;
  title: string;
  routes: ISidebarRoute[];
}

export interface ISidebarStats {
  totalPhases: number;
  phases: IPhaseCard[];
  totalModules: number;
  totalLessons: number;
}
