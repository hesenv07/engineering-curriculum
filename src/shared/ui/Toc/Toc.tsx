'use client';

import * as React from 'react';
import clsx from 'clsx';

import type { ITocItem } from '@/shared/types';

interface ITocProps {
  toc: ITocItem[];
}

const Toc = ({ toc }: ITocProps) => {
  const [activeId, setActiveId] = React.useState<string>('');

  React.useEffect(() => {
    if (!toc.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      { rootMargin: '0% 0% -80% 0%', threshold: 0 },
    );

    toc.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [toc]);

  if (toc.length < 2) return null;

  return (
    <nav
      aria-label="Məzmun cədvəli"
      className="sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto py-6 pr-4"
    >
      <h4 className="mb-3 px-1 text-xs font-bold uppercase tracking-widest text-secondary dark:text-secondary-dark">
        Bu Səhifədə
      </h4>
      <ul className="space-y-1">
        {toc.map(({ id, text, level }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={clsx(
                'block py-0.5 text-sm leading-snug transition-colors',
                level === 3 ? 'pl-4' : 'pl-1',
                activeId === id
                  ? 'font-medium text-link dark:text-link-dark'
                  : 'text-secondary dark:text-secondary-dark hover:text-primary dark:hover:text-primary-dark',
              )}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Toc;
