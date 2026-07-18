import React from "react";

import { LEVEL_STYLES } from "./LessonHeader.const";

import type { ILessonHeaderProps } from "./LessonHeader.types";

const LessonHeader = ({ title, duration, lessonLevel }: ILessonHeaderProps) => {
  return (
    <>
      <h1>{title}</h1>
      {(lessonLevel || duration) && (
        <div className="flex items-center gap-2 mb-6 -mt-4">
          {lessonLevel && (
            <span
              className={`text-xs font-medium rounded px-1.5 py-0.5 leading-none ${LEVEL_STYLES[lessonLevel]}`}
            >
              {lessonLevel}
            </span>
          )}
          {duration && (
            <span className="text-xs text-tertiary dark:text-tertiary-dark">{duration}</span>
          )}
        </div>
      )}
    </>
  );
};

export default LessonHeader;
