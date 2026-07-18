export * from "./ISidebarRoute";

export type TLessonLevel = "Fundamental" | "Intermediate" | "Deep";

export type TLocale = "az" | "en";

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

export interface IPhaseCard {
  id: string;
  desc: string;
  path: string;
  title: string;
  badgeText: string;
  lessonCount: number;
}
