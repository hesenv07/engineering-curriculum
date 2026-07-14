import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import clsx from 'clsx';

interface SidebarLinkProps {
  href: string;
  children: React.ReactNode;
  isPending?: boolean;
}

export function SidebarLink({ href, children }: SidebarLinkProps) {
  const router = useRouter();
  const isActive = router.asPath === href || router.asPath.split('#')[0] === href;

  return (
    <Link
      href={href}
      className={clsx(
        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors leading-snug',
        isActive
          ? 'bg-[#EDF5FA] dark:bg-[#1A3344] text-[#087EA4] dark:text-[#149ECA] font-semibold'
          : 'text-[#404756] dark:text-[#99A1B3] hover:bg-[#F6F7F9] dark:hover:bg-[#343A46] hover:text-[#23272F] dark:hover:text-[#F6F7F9]'
      )}
    >
      {children}
    </Link>
  );
}
