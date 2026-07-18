import React, { Suspense } from "react";

import SidebarRouteTree from "./ui/SidebarRouteTree";

import type { ISidebarNavProps } from "./SidebarNav.types";

const SidebarNav = ({ routeTree, breadcrumbs }: ISidebarNavProps) => {
  let tree = routeTree;
  if (tree.routes?.length === 1) {
    tree = tree.routes[0];
  }

  return (
    <div className="h-full lg:sticky lg:top-14 lg:bottom-0 lg:h-[calc(100vh-3.5rem)] flex flex-col">
      <div className="overflow-y-scroll no-bg-scrollbar overscroll-contain lg:w-[342px] grow bg-wash dark:bg-wash-dark">
        <aside className="flex flex-col w-full pb-8 lg:pb-0 lg:max-w-custom-xs z-10">
          <nav
            role="navigation"
            aria-label="Kurs naviqasiyası"
            className="w-full pt-6 scrolling-touch lg:h-auto grow pe-0 lg:pe-5 lg:pb-16 md:pt-4 lg:pt-4 scrolling-gpu"
          >
            <Suspense fallback={null}>
              <SidebarRouteTree
                routeTree={tree}
                isForceExpanded={false}
                breadcrumbs={breadcrumbs}
              />
            </Suspense>
            <div className="h-20" />
          </nav>
        </aside>
      </div>
    </div>
  );
};

export default SidebarNav;
