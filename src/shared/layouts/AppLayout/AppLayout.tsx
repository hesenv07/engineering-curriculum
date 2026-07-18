"use client";

import clsx from "clsx";
import { useParams } from "next/navigation";
import { usePathname } from "@/i18n/navigation";

import Toc from "../../ui/Toc/Toc";
import TopNav from "../TopNav";
import Footer from "../Footer";
import SidebarNav from "../Sidebar";
import { DocsFooter } from "../DocsFooter";

import { getSidebarRouteTree } from "@/shared/lib/utils/sidebar";
import { getBreadcrumbs } from "./utils/getBreadcrumbs";
import { useMobileMenu } from "./hooks/useMobileMenu";
import { useDesktopSidebar } from "./hooks/useDesktopSidebar";

import type { IPageProps } from "./AppLayout.types";

const AppLayout = ({
  children,
  toc = [],
  pageContext,
  showSidebar = true,
  defaultSidebarOpen = true,
}: IPageProps) => {
  const currentPath = usePathname();
  const mobileMenu = useMobileMenu();
  const { locale } = useParams<{ locale: string }>();
  const desktopSidebar = useDesktopSidebar(defaultSidebarOpen);

  const routeTree = getSidebarRouteTree(locale);
  const breadcrumbs = getBreadcrumbs(currentPath, routeTree);
  const contentWidth = desktopSidebar.isOpen
    ? "max-w-4xl ms-0 2xl:mx-auto"
    : "max-w-5xl mx-auto";

  return (
    <>
      <TopNav
        isMenuOpen={mobileMenu.isOpen}
        isDesktopSidebarOpen={desktopSidebar.isOpen}
        onMenuToggle={showSidebar ? mobileMenu.toggle : undefined}
        onDesktopSidebarToggle={showSidebar ? desktopSidebar.toggle : undefined}
      />

      {showSidebar ? (
        <>
          {mobileMenu.isOpen && (
            <div
              className="fixed inset-0 top-14 z-30 bg-black/50 lg:hidden"
              onClick={mobileMenu.close}
            />
          )}

          <div
            className={clsx(
              "grid grid-cols-only-content",
              desktopSidebar.isOpen &&
                "lg:grid-cols-sidebar-content 2xl:grid-cols-sidebar-content-toc",
            )}
          >
            <div
              className={clsx(
                "z-40 lg:z-10",
                mobileMenu.isOpen
                  ? "fixed bottom-0 left-0 top-14 w-[20rem] shadow-xl"
                  : clsx("hidden", desktopSidebar.isOpen ? "lg:block" : ""),
              )}
            >
              <SidebarNav routeTree={routeTree} breadcrumbs={breadcrumbs} />
            </div>

            <main className="isolate min-w-0">
              <article className="font-normal break-words text-primary dark:text-primary-dark">
                <div className="px-5 sm:px-12">
                  <div className="max-w-7xl mx-auto">
                    <div className={clsx("pt-8 pb-4 prose-docs", contentWidth)}>
                      {children}
                    </div>
                    {pageContext && (
                      <div className={contentWidth}>
                        <DocsFooter prev={pageContext.prev} next={pageContext.next} />
                      </div>
                    )}
                  </div>
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

export default AppLayout;
