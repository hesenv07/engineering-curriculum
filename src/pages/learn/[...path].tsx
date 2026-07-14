import type { NextPage, GetStaticProps, GetStaticPaths } from 'next';
import Head from 'next/head';
import { MDXRemote } from 'next-mdx-remote';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';

import Page from '@/components/Layout/Page';
import { MDXComponents } from '@/components/MDX/MDXComponents';
import { getAllContentPaths, getContentByPath } from '@/utils/mdx';
import sidebarData from '@/sidebar.json';

import type { ITocItem, IPageContext, ISidebarRoute } from '@/types';

interface ILearnPageProps {
  meta: { title: string; description?: string };
  toc: ITocItem[];
  mdxSource: MDXRemoteSerializeResult;
  pageContext: IPageContext;
}

const LearnPage: NextPage<ILearnPageProps> = ({ mdxSource, meta, toc, pageContext }) => {
  return (
    <Page toc={toc} pageContext={pageContext}>
      <Head>
        <title>{meta.title} — Engineering Curriculum</title>
        {meta.description && <meta name="description" content={meta.description} />}
      </Head>
      <MDXRemote {...mdxSource} components={MDXComponents as Record<string, React.ComponentType<object>>} />
    </Page>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = getAllContentPaths();

  return {
    paths: paths.map((segments) => ({
      params: { path: segments.filter((s) => s !== 'learn') },
    })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<ILearnPageProps> = async ({ params }) => {
  const pathSegments = (params?.path as string[]) || [];
  const fullPath = ['learn', ...pathSegments];

  const result = await getContentByPath(fullPath);

  if (!result) {
    return { notFound: true };
  }

  const pageContext = getPageContext(fullPath.join('/'));

  return {
    props: {
      mdxSource: result.mdxSource,
      meta: result.meta,
      toc: result.toc,
      pageContext,
    },
  };
};

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

function getPageContext(currentPath: string): IPageContext {
  const all = flattenRoutes((sidebarData as { routes: ISidebarRoute[] }).routes);
  const idx = all.findIndex((r) => r.path === `/${currentPath}` || r.path === currentPath);

  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx < all.length - 1 ? all[idx + 1] : null,
  };
}

export default LearnPage;
