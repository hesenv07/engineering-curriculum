'use client';
import * as React from 'react';
import { TopNav } from './TopNav';
import { Footer } from './Footer';
import { SidebarNav } from './Sidebar/SidebarNav';
import { Toc } from './Toc';
import { DocsFooter } from './DocsFooter';
import { SidebarRoute, TocItem, PageContext } from '@/types';
import sidebarData from '@/sidebar.json';

interface PageProps {
  children: React.ReactNode;
  toc?: TocItem[];
  pageContext?: PageContext;
  showSidebar?: boolean;
}

export function Page({ children, toc = [], pageContext, showSidebar = true }: PageProps) {
  const [isMobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#23272F]">
      <TopNav
        onMenuToggle={() => setMobileMenuOpen((v) => !v)}
        isMenuOpen={isMobileMenuOpen}
      />

      {showSidebar ? (
        <div className="flex flex-1 max-w-screen-2xl mx-auto w-full">
          {/* Sidebar */}
          <aside
            className={`
              ${isMobileMenuOpen ? 'flex' : 'hidden'} lg:flex
              flex-col w-[300px] flex-shrink-0 border-r border-[#EBECF0] dark:border-[#343A46]
              lg:sticky lg:top-14 lg:h-[calc(100vh-3.5rem)]
              fixed inset-0 top-14 z-40 bg-white dark:bg-[#23272F] lg:z-auto
            `}
          >
            <SidebarNav routes={(sidebarData as any).routes} />
          </aside>

          {/* Mobile overlay */}
          {isMobileMenuOpen && (
            <div
              className="lg:hidden fixed inset-0 top-14 z-30 bg-black/30"
              onClick={() => setMobileMenuOpen(false)}
            />
          )}

          {/* Main content + TOC */}
          <div className="flex flex-1 min-w-0">
            <main className="flex-1 min-w-0 px-5 lg:px-12 py-10 max-w-3xl">
              <article className="prose-docs">
                {children}
              </article>
              {pageContext && (
                <DocsFooter prev={pageContext.prev} next={pageContext.next} />
              )}
            </main>

            {/* TOC */}
            {toc.length > 1 && (
              <div className="hidden 2xl:block w-[250px] flex-shrink-0 border-l border-[#EBECF0] dark:border-[#343A46] px-4">
                <Toc toc={toc} />
              </div>
            )}
          </div>
        </div>
      ) : (
        <main className="flex-1">{children}</main>
      )}

      <Footer />
    </div>
  );
}
