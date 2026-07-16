import Head from "next/head";
import { MDXRemote } from "next-mdx-remote";

import Page from "@/components/Layout/Page";

import { MDXComponents } from "@/components/MDX/MDXComponents";
import { getLessonLevel, computeDuration } from "@/utils/lesson";
import { getAllContentPaths, getContentByPath } from "@/utils/mdx";
import { getSidebarRouteTree } from "@/utils/sidebar";

import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import type { NextPage, GetStaticProps, GetStaticPaths } from "next";
import type {
  ITocItem,
  TLessonLevel,
  IPageContext,
  ISidebarRoute,
} from "@/types";

const LEVEL_STYLES: Record<TLessonLevel, string> = {
  Fundamental: "text-blue-50 dark:text-blue-30 bg-blue-5 dark:bg-blue-80",
  Intermediate: "text-green-60 dark:text-green-40 bg-green-5 dark:bg-green-10",
  Deep: "text-purple-60 dark:text-purple-30 bg-purple-5 dark:bg-purple-10",
};

interface ILearnPageProps {
  toc: ITocItem[];
  duration: string;
  pageContext: IPageContext;
  lessonLevel: TLessonLevel | null;
  mdxSource: MDXRemoteSerializeResult;
  meta: { title: string; description?: string };
}

const LearnPage: NextPage<ILearnPageProps> = ({
  toc,
  meta,
  duration,
  mdxSource,
  pageContext,
  lessonLevel,
}) => {
  return (
    <Page toc={toc} pageContext={pageContext}>
      <Head>
        <title>{meta.title} — Engineering Curriculum</title>
        {meta.description && (
          <meta name="description" content={meta.description} />
        )}
      </Head>
      <h1>{meta.title}</h1>
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
            <span className="text-xs text-tertiary dark:text-tertiary-dark">
              {duration}
            </span>
          )}
        </div>
      )}
      <MDXRemote
        {...mdxSource}
        components={
          MDXComponents as Record<string, React.ComponentType<object>>
        }
      />
    </Page>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const azPaths = getAllContentPaths("az");
  const enPaths = getAllContentPaths("en");

  return {
    paths: [
      ...azPaths.map((segments) => ({
        params: { path: segments.filter((s) => s !== "learn") },
        locale: "az",
      })),
      ...enPaths.map((segments) => ({
        params: { path: segments.filter((s) => s !== "learn") },
        locale: "en",
      })),
    ],
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<ILearnPageProps> = async ({
  params,
  locale,
}) => {
  const pathSegments = (params?.path as string[]) || [];
  const fullPath = ["learn", ...pathSegments];

  let result = await getContentByPath(fullPath, locale);
  if (!result && locale !== "az") {
    result = await getContentByPath(fullPath, "az");
  }

  if (!result) {
    return { notFound: true };
  }

  const pageContext = getPageContext(fullPath.join("/"), locale);
  const lessonLevel = getLessonLevel(`/${fullPath.join("/")}/`);
  const duration = computeDuration(result.lineCount, locale);

  return {
    props: {
      mdxSource: result.mdxSource,
      meta: result.meta,
      toc: result.toc,
      pageContext,
      lessonLevel: lessonLevel ?? null,
      duration,
    },
  };
};

function flattenRoutes(
  routes: ISidebarRoute[],
): { title: string; path: string }[] {
  const result: { title: string; path: string }[] = [];
  for (const route of routes) {
    if (route.hasSectionHeader) continue;
    if (route.path && route.title) {
      result.push({ title: route.title, path: route.path });
    }
    if (route.routes) {
      result.push(...flattenRoutes(route.routes));
    }
  }
  return result;
}

function getPageContext(currentPath: string, locale?: string): IPageContext {
  const all = flattenRoutes(getSidebarRouteTree(locale).routes ?? []);
  const idx = all.findIndex(
    (r) => r.path === `/${currentPath}` || r.path === currentPath,
  );

  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx < all.length - 1 ? all[idx + 1] : null,
  };
}

export default LearnPage;
