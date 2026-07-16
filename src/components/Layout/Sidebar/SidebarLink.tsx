import { useRef, useEffect } from 'react';
import clsx from 'clsx';
import Link from 'next/link';

import IconNavArrow from '@/components/Icon/IconNavArrow';

interface ISidebarLinkProps {
  href: string;
  level: number;
  title: string;
  duration?: string;
  selected?: boolean;
  isPending: boolean;
  hideArrow?: boolean;
  isExpanded?: boolean;
  version?: 'canary' | 'major' | 'experimental' | 'rc';
}

const SidebarLink = ({
  href,
  level,
  title,
  selected = false,
  hideArrow,
  isPending,
  isExpanded,
  duration,
}: ISidebarLinkProps) => {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (selected && ref && ref.current) {
      // @ts-ignore
      if (typeof ref.current.scrollIntoViewIfNeeded === 'function') {
        // @ts-ignore
        ref.current.scrollIntoViewIfNeeded();
      }
    }
  }, [ref, selected]);

  let target = '';
  if (href.startsWith('https://')) {
    target = '_blank';
  }

  const isLeaf = isExpanded === undefined;

  return (
    <Link
      href={href}
      ref={ref}
      title={title}
      target={target}
      passHref
      aria-current={selected ? 'page' : undefined}
      className={clsx(
        'p-2 pe-2 w-full rounded-none lg:rounded-e-2xl text-start hover:bg-gray-5 dark:hover:bg-gray-80 relative flex items-center justify-between',
        {
          'text-sm ps-6': level > 0,
          'ps-5': level < 2,
          'text-base font-bold': level === 0,
          'text-primary dark:text-primary-dark': level === 0 && !selected,
          'text-base text-secondary dark:text-secondary-dark': level > 0 && !selected,
          'text-base text-link dark:text-link-dark bg-highlight dark:bg-highlight-dark border-blue-40 hover:bg-highlight hover:text-link dark:hover:bg-highlight-dark dark:hover:text-link-dark':
            selected,
          'dark:bg-gray-70 bg-gray-3 dark:hover:bg-gray-70 hover:bg-gray-3': isPending,
        },
      )}
    >
      <div className="flex flex-col min-w-0">
        <span>{title}</span>
        {isLeaf && duration && (
          <span className="text-[10px] text-tertiary dark:text-tertiary-dark mt-0.5">{duration}</span>
        )}
      </div>
      {isExpanded != null && !hideArrow && (
        <span
          className={clsx('pe-1', {
            'text-link dark:text-link-dark': isExpanded,
            'text-tertiary dark:text-tertiary-dark': !isExpanded,
          })}
        >
          <IconNavArrow displayDirection={isExpanded ? 'down' : 'end'} />
        </span>
      )}
    </Link>
  );
};

export default SidebarLink;
