import type { TLessonLevel } from "@/shared/types";

export const LEVEL_STYLES: Record<TLessonLevel, string> = {
  Fundamental: "text-blue-50 dark:text-blue-30 bg-blue-5 dark:bg-blue-80",
  Intermediate: "text-green-60 dark:text-green-40 bg-green-5 dark:bg-green-10",
  Deep: "text-purple-60 dark:text-purple-30 bg-purple-5 dark:bg-purple-10",
};
