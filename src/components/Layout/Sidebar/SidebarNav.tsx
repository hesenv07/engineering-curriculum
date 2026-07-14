import * as React from 'react';
import { SidebarRouteTree } from './SidebarRouteTree';
import { SidebarRoute } from '@/types';

interface SidebarNavProps {
  routes: SidebarRoute[];
}

export function SidebarNav({ routes }: SidebarNavProps) {
  return (
    <nav
      className="h-full overflow-y-auto py-6 px-3"
      aria-label="Kurs naviqasiyası"
    >
      <ul className="space-y-0.5">
        <SidebarRouteTree routes={routes} level={0} />
      </ul>
    </nav>
  );
}
