import { LearnDetails } from "@/modules/learning-details";
import { ILearnDetailsProps } from "@/modules/learning-details/LearnDetails.types";
import { getAllContentPaths, getContentByPath } from "@/shared/lib/utils/mdx";

import type { Metadata } from "next";

export const dynamicParams = false;

export function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  return getAllContentPaths(params.locale).map((segments) => ({
    path: segments.filter((s) => s !== "learn"),
  }));
}

export async function generateMetadata({
  params,
}: ILearnDetailsProps): Promise<Metadata> {
  const fullPath = ["learn", ...params.path];
  let result = await getContentByPath(fullPath, params.locale);
  if (!result && params.locale !== "az") {
    result = await getContentByPath(fullPath, "az");
  }
  if (!result) return {};

  return {
    title: `${result.meta.title} — Engineering Curriculum`,
    description: result.meta.description || undefined,
  };
}

const LearnDetailPage = ({ params }: ILearnDetailsProps) => {
  return <LearnDetails params={params} />;
};

export default LearnDetailPage;
