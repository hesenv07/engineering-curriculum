import type { TLessonLevel } from "@/shared/types";

export interface ILessonHeaderProps {
  title: string;
  duration: string;
  lessonLevel: TLessonLevel | null;
}
