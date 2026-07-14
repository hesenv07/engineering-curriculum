import * as React from 'react';
import clsx from 'clsx';
import { useRouter } from 'next/router';

import sidebarAz from '@/sidebar.json';
import sidebarEn from '@/sidebar-en.json';

import TopNav from './TopNav';
import Footer from './Footer';
import SidebarNav from './Sidebar/SidebarNav';
import Toc from './Toc';
import DocsFooter from './DocsFooter';

import type { ITocItem, IPageContext, ISidebarRoute } from '@/types';

interface IPageProps {
  children: React.ReactNode;
  toc?: ITocItem[];
  pageContext?: IPageContext;
  showSidebar?: boolean;
}

function getBreadcrumbs(
  path: string,
  routeTree: ISidebarRoute,
  crumbs: ISidebarRoute[] = [],
): ISidebarRoute[] {
  if (routeTree.path === path) {
    return crumbs;
  }
  if (!routeTree.routes) {
    return [];
  }
  for (const route of routeTree.routes) {
    const result = getBreadcrumbs(path, route, [...crumbs, routeTree]);
    if (result.length > 0 || route.path === path) {
      return result;
    }
  }
  return [];
}

const Page = ({ children, toc = [], pageContext, showSidebar = true }: IPageProps) => {
  const [isMobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const { asPath, locale } = useRouter();
  const currentPath = asPath.split(/[?#]/)[0];

  const routeTree: ISidebarRoute = (locale === 'en' ? sidebarEn : sidebarAz) as ISidebarRoute;
  const breadcrumbs = getBreadcrumbs(currentPath, routeTree);

  return (
    <>
      <TopNav
        onMenuToggle={() => setMobileMenuOpen((v) => !v)}
        isMenuOpen={isMobileMenuOpen}
      />

      {showSidebar ? (
        <>
          {isMobileMenuOpen && (
            <div
              className="fixed inset-0 top-14 z-30 bg-black/50 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}

          <div className="grid grid-cols-only-content lg:grid-cols-sidebar-content 2xl:grid-cols-sidebar-content-toc">
            <div
              className={clsx(
                'z-40 lg:z-10',
                isMobileMenuOpen
                  ? 'fixed bottom-0 left-0 top-14 w-[20rem] shadow-xl'
                  : 'hidden lg:block',
              )}
            >
              <SidebarNav routeTree={routeTree} breadcrumbs={breadcrumbs} />
            </div>

            <main className="isolate min-w-0">
              <article className="font-normal break-words text-primary dark:text-primary-dark">
                <div className="px-5 sm:px-12">
                  <div className="max-w-7xl mx-auto">
                    <div className="max-w-4xl ms-0 2xl:mx-auto pt-8 pb-4 prose-docs">
                      {children}
                    </div>
                  </div>
                  {pageContext && (
                    <DocsFooter prev={pageContext.prev} next={pageContext.next} />
                  )}
                </div>
              </article>
              <div className="w-full px-5 pt-8 sm:px-12 md:pt-10">
                <hr className="mx-auto max-w-7xl border-border dark:border-border-dark" />
              </div>
              <div className="px-5 py-10 sm:px-12 md:py-12">
                <Footer />
              </div>
            </main>

            <div className="hidden 2xl:block">
              {toc.length > 1 && <Toc toc={toc} />}
            </div>
          </div>
        </>
      ) : (
        <>
          <main>{children}</main>
          <div className="border-t border-border dark:border-border-dark">
            <div className="mx-auto max-w-7xl px-5 py-10 sm:px-12 md:py-12">
              <Footer />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Page;
