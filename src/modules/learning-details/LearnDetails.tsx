import { cookies } from "next/headers";

import { AppLayout } from "@/shared/layouts/AppLayout";

import { getContentByPath } from "@/shared/lib/utils/mdx";
import { computeDuration, getLessonLevel } from "@/shared/lib/utils/lesson";

import { getPageContext } from "./LearnDetails.utils";

import { LessonHeader } from "./components/LessonHeader";
import { LessonContent } from "./components/LessonContent";

import type { ILearnDetailsProps } from "./LearnDetails.types";

const LearnDetails = async ({ params }: ILearnDetailsProps) => {
  const fullPath = ["learn", ...params.path];

  const [cookieStore, result] = await Promise.all([
    cookies(),
    getContentByPath(fullPath, params.locale).then((r) =>
      r ? r : params.locale !== "az" ? getContentByPath(fullPath, "az") : null,
    ),
  ]);

  if (!result) return null;

  const defaultSidebarOpen = cookieStore.get("sidebarOpen")?.value !== "false";
  const pageContext = getPageContext(fullPath.join("/"), params.locale);
  const lessonLevel = getLessonLevel(`/${fullPath.join("/")}/`) ?? null;
  const duration = computeDuration(result.lineCount, params.locale);

  return (
    <AppLayout toc={result.toc} pageContext={pageContext} defaultSidebarOpen={defaultSidebarOpen}>
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
