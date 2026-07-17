import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';

import Page from '@/components/Layout/Page';
import { MDXComponents } from '@/components/MDX/MDXComponents';
import { getLessonLevel, computeDuration } from '@/utils/lesson';
import { getAllContentPaths, getContentByPath } from '@/utils/mdx';
import { getSidebarRouteTree } from '@/utils/sidebar';

import type { Metadata } from 'next';
import type { TLessonLevel, IPageContext, ISidebarRoute } from '@/types';

export const dynamicParams = false;

const LEVEL_STYLES: Record<TLessonLevel, string> = {
  Fundamental: 'text-blue-50 dark:text-blue-30 bg-blue-5 dark:bg-blue-80',
  Intermediate: 'text-green-60 dark:text-green-40 bg-green-5 dark:bg-green-10',
  Deep: 'text-purple-60 dark:text-purple-30 bg-purple-5 dark:bg-purple-10',
};

interface ILearnPageProps {
  params: { locale: string; path: string[] };
}

export function generateStaticParams({ params }: { params: { locale: string } }) {
  return getAllContentPaths(params.locale).map((segments) => ({
    path: segments.filter((s) => s !== 'learn'),
  }));
}

export async function generateMetadata({ params }: ILearnPageProps): Promise<Metadata> {
  const fullPath = ['learn', ...params.path];
  let result = await getContentByPath(fullPath, params.locale);
  if (!result && params.locale !== 'az') {
    result = await getContentByPath(fullPath, 'az');
  }
  if (!result) return {};

  return {
    title: `${result.meta.title} — Engineering Curriculum`,
    description: result.meta.description || undefined,
  };
}

function flattenRoutes(routes: ISidebarRoute[]): { title: string; path: string }[] {
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
  const idx = all.findIndex((r) => r.path === `/${currentPath}` || r.path === currentPath);

  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx < all.length - 1 ? all[idx + 1] : null,
  };
}

const LearnPage = async ({ params }: ILearnPageProps) => {
  const fullPath = ['learn', ...params.path];

  let result = await getContentByPath(fullPath, params.locale);
  if (!result && params.locale !== 'az') {
    result = await getContentByPath(fullPath, 'az');
  }

  if (!result) {
    return null;
  }

  const pageContext = getPageContext(fullPath.join('/'), params.locale);
  const lessonLevel = getLessonLevel(`/${fullPath.join('/')}/`) ?? null;
  const duration = computeDuration(result.lineCount, params.locale);

  return (
    <Page toc={result.toc} pageContext={pageContext}>
      <h1>{result.meta.title}</h1>
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
      <MDXRemote
        source={result.content}
        components={MDXComponents as Record<string, React.ComponentType<object>>}
        options={{ mdxOptions: { remarkPlugins: [remarkGfm], format: 'mdx' } }}
      />
    </Page>
  );
};

export default LearnPage;
