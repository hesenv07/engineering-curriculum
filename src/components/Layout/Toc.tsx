'use client';
import * as React from 'react';
import { TocItem } from '@/types';
import clsx from 'clsx';

interface TocProps {
  toc: TocItem[];
}

export function Toc({ toc }: TocProps) {
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
      { rootMargin: '0% 0% -80% 0%', threshold: 0 }
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
      <h4 className="text-xs font-bold uppercase tracking-widest text-[#404756] dark:text-[#99A1B3] mb-3 px-1">
        Bu Səhifədə
      </h4>
      <ul className="space-y-1">
        {toc.map(({ id, text, level }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={clsx(
                'block text-sm transition-colors py-0.5 leading-snug',
                level === 3 ? 'pl-4' : 'pl-1',
                activeId === id
                  ? 'text-[#087EA4] dark:text-[#149ECA] font-medium'
                  : 'text-[#404756] dark:text-[#99A1B3] hover:text-[#23272F] dark:hover:text-[#F6F7F9]'
              )}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
