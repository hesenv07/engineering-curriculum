import React from "react";

import { AppLayout } from "@/shared/layouts/AppLayout";

import { getContentByPath } from "@/shared/lib/utils/mdx";
import { computeDuration, getLessonLevel } from "@/shared/lib/utils/lesson";

import { getPageContext } from "./LearnDetails.utils";

import { LessonHeader } from "./components/LessonHeader";
import { LessonContent } from "./components/LessonContent";

import type { ILearnDetailsProps } from "./LearnDetails.types";

const LearnDetails = async ({ params }: ILearnDetailsProps) => {
  const fullPath = ["learn", ...params.path];

  let result = await getContentByPath(fullPath, params.locale);
  if (!result && params.locale !== "az") {
    result = await getContentByPath(fullPath, "az");
  }

  if (!result) {
    return null;
  }

  const pageContext = getPageContext(fullPath.join("/"), params.locale);
  const lessonLevel = getLessonLevel(`/${fullPath.join("/")}/`) ?? null;
  const duration = computeDuration(result.lineCount, params.locale);

  return (
    <AppLayout toc={result.toc} pageContext={pageContext}>
      <LessonHeader
        title={result.meta.title}
        duration={duration}
        lessonLevel={lessonLevel}
      />
      <LessonContent source={result.content} />
    </AppLayout>
  );
};

export default LearnDetails;
