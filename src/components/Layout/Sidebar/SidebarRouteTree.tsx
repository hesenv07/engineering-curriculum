'use client';

import { useRef, useLayoutEffect, useState, useEffect, Fragment } from 'react';
import * as React from 'react';
import clsx from 'clsx';
import { useCollapse } from 'react-collapsed';

import { usePathname } from '@/i18n/navigation';

import SidebarLink from './SidebarLink';
import SidebarButton from './SidebarButton';

import type { ISidebarRoute } from '@/types';

interface ISidebarRouteTreeProps {
  isForceExpanded: boolean;
  breadcrumbs: ISidebarRoute[];
  routeTree: ISidebarRoute;
  level?: number;
}

interface ICollapseWrapperProps {
  isExpanded: boolean;
  duration: number;
  children: React.ReactNode;
}

interface IModuleGroupProps {
  title: string | undefined;
  routes: ISidebarRoute[];
  level: number;
  isForceExpanded: boolean;
  breadcrumbs: ISidebarRoute[];
  currentSlug: string;
}

// CollapseWrapper is kept in this file because ModuleGroup and SidebarRouteTree are mutually recursive.
function CollapseWrapper({ isExpanded, duration, children }: ICollapseWrapperProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const { getCollapseProps } = useCollapse({ isExpanded, duration });

  const isExpandedRef = useRef(isExpanded);
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useLayoutEffect(() => {
      const wasExpanded = isExpandedRef.current;
      if (wasExpanded === isExpanded) {
        return;
      }
      isExpandedRef.current = isExpanded;
      if (ref.current !== null) {
        const node: HTMLDivElement = ref.current;
        node.style.pointerEvents = 'none';
        if (timeoutRef.current !== null) {
          window.clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = window.setTimeout(() => {
          node.style.pointerEvents = '';
        }, duration + 100);
      }
    });
  }

  return (
    <div
      ref={ref}
      className={clsx(isExpanded ? 'opacity-100' : 'opacity-50')}
      style={{ transition: `opacity ${duration}ms ease-in-out` }}
    >
      <div {...getCollapseProps()}>{children}</div>
    </div>
  );
}

function hasDescendant(routes: ISidebarRoute[], slug: string): boolean {
  for (const route of routes) {
    if (route.path === slug) return true;
    if (route.routes && hasDescendant(route.routes, slug)) return true;
  }
  return false;
}

function ModuleGroup({
  title,
  routes,
  level,
  isForceExpanded,
  breadcrumbs,
  currentSlug,
}: IModuleGroupProps) {
  const isActive = hasDescendant(routes, currentSlug);
  const [isExpanded, setIsExpanded] = useState(isForceExpanded || isActive);

  useEffect(() => {
    if (isForceExpanded || isActive) setIsExpanded(true);
  }, [isForceExpanded, isActive]);

  return (
    <li>
      <SidebarButton
        title={title ?? ''}
        heading={false}
        level={level}
        onClick={() => setIsExpanded((v) => !v)}
        isExpanded={isExpanded}
        isBreadcrumb={isActive && !isExpanded}
      />
      <CollapseWrapper duration={250} isExpanded={isExpanded}>
        <SidebarRouteTree
          isForceExpanded={isForceExpanded}
          routeTree={{ title, routes }}
          breadcrumbs={breadcrumbs}
          level={level + 1}
        />
      </CollapseWrapper>
    </li>
  );
}

const SidebarRouteTree = ({
  isForceExpanded,
  breadcrumbs,
  routeTree,
  level = 0,
}: ISidebarRouteTreeProps) => {
  const slug = usePathname();
  const currentRoutes = routeTree.routes ?? [];

  return (
    <ul>
      {currentRoutes.map(
        ({ path, title, routes, version, heading, hasSectionHeader, sectionHeader, duration }, index) => {
          const selected = slug === path;
          let listItem = null;

          if (!path || heading) {
            if (!path && !heading && routes) {
              listItem = (
                <ModuleGroup
                  key={`${title}-${level}-group`}
                  title={title}
                  routes={routes}
                  level={level}
                  isForceExpanded={isForceExpanded}
                  breadcrumbs={breadcrumbs}
                  currentSlug={slug}
                />
              );
            } else {
              listItem = (
                <SidebarRouteTree
                  level={level + 1}
                  isForceExpanded={isForceExpanded}
                  routeTree={{ title, routes }}
                  breadcrumbs={[]}
                />
              );
            }
          } else if (routes) {
            const isBreadcrumb =
              breadcrumbs.length > 1 &&
              breadcrumbs[breadcrumbs.length - 1].path === path;
            const isExpanded = isForceExpanded || isBreadcrumb || selected;
            listItem = (
              <li key={`${title}-${path}-${level}-heading`}>
                <SidebarLink
                  key={`${title}-${path}-${level}-link`}
                  href={path}
                  selected={selected}
                  level={level}
                  title={title ?? ''}
                  version={version}
                  isExpanded={isExpanded}
                  hideArrow={isForceExpanded}
                />
                <CollapseWrapper duration={250} isExpanded={isExpanded}>
                  <SidebarRouteTree
                    isForceExpanded={isForceExpanded}
                    routeTree={{ title, routes }}
                    breadcrumbs={breadcrumbs}
                    level={level + 1}
                  />
                </CollapseWrapper>
              </li>
            );
          } else {
            listItem = (
              <li key={`${title}-${path}-${level}-link`}>
                <SidebarLink
                  href={path}
                  selected={selected}
                  level={level}
                  title={title ?? ''}
                  version={version}
                  duration={duration}
                />
              </li>
            );
          }

          if (hasSectionHeader) {
            const sectionHeaderText = sectionHeader ?? '';
            return (
              <Fragment key={`${sectionHeaderText}-${level}-separator`}>
                {index !== 0 && (
                  <li
                    role="separator"
                    className="mt-4 mb-2 ms-5 border-b border-border dark:border-border-dark"
                  />
                )}
                <h3
                  className={clsx(
                    'mb-1 text-sm font-bold ms-5 text-tertiary dark:text-tertiary-dark',
                    index !== 0 && 'mt-2',
                  )}
                >
                  {sectionHeaderText}
                </h3>
              </Fragment>
            );
          } else {
            return listItem;
          }
        },
      )}
    </ul>
  );
};

export default SidebarRouteTree;
