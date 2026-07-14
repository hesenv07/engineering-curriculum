'use client';
import * as React from 'react';
import { useRouter } from 'next/router';
import { SidebarLink } from './SidebarLink';
import { SidebarRoute } from '@/types';
import clsx from 'clsx';

interface SidebarRouteTreeProps {
  routes: SidebarRoute[];
  level?: number;
}

function isRouteActive(route: SidebarRoute, currentPath: string): boolean {
  if (route.path && currentPath.startsWith(route.path)) return true;
  if (route.routes) {
    return route.routes.some((r) => isRouteActive(r, currentPath));
  }
  return false;
}

function RouteItem({
  route,
  level,
}: {
  route: SidebarRoute;
  level: number;
}) {
  const router = useRouter();
  const currentPath = router.asPath.split('#')[0];
  const isActive = route.path ? isRouteActive(route, currentPath) : false;
  const hasChildren = route.routes && route.routes.length > 0;
  const [isOpen, setIsOpen] = React.useState(isActive || level < 1);

  // Keep open if child becomes active
  React.useEffect(() => {
    if (isActive) setIsOpen(true);
  }, [isActive]);

  if (!route.title) return null;

  if (!hasChildren && route.path) {
    return (
      <li>
        <SidebarLink href={route.path}>{route.title}</SidebarLink>
      </li>
    );
  }

  if (hasChildren) {
    return (
      <li>
        {route.path ? (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={clsx(
              'w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm font-medium transition-colors text-left',
              isActive
                ? 'text-[#23272F] dark:text-[#F6F7F9]'
                : 'text-[#404756] dark:text-[#99A1B3] hover:bg-[#F6F7F9] dark:hover:bg-[#343A46] hover:text-[#23272F] dark:hover:text-[#F6F7F9]'
            )}
          >
            <span>{route.title}</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`flex-shrink-0 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        ) : (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm font-medium text-[#404756] dark:text-[#99A1B3] hover:bg-[#F6F7F9] dark:hover:bg-[#343A46] hover:text-[#23272F] dark:hover:text-[#F6F7F9] transition-colors text-left"
          >
            <span>{route.title}</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`flex-shrink-0 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              }`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        )}
        {isOpen && route.routes && (
          <ul className={clsx('ml-3 mt-1 space-y-0.5 border-l border-[#EBECF0] dark:border-[#343A46] pl-3')}>
            <SidebarRouteTree routes={route.routes} level={level + 1} />
          </ul>
        )}
      </li>
    );
  }

  return null;
}

export function SidebarRouteTree({ routes, level = 0 }: SidebarRouteTreeProps) {
  return (
    <>
      {routes.map((route, i) => {
        if (route.hasSectionHeader) {
          return (
            <li key={`header-${i}`} className="mt-5 mb-1 first:mt-0">
              <div className="px-3 text-xs font-bold uppercase tracking-widest text-[#087EA4] dark:text-[#149ECA]">
                {route.sectionHeader}
              </div>
            </li>
          );
        }
        return <RouteItem key={route.path || i} route={route} level={level} />;
      })}
    </>
  );
}
