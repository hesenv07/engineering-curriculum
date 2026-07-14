import * as React from 'react';
import Link from 'next/link';
import { PageContext } from '@/types';

interface DocsFooterProps {
  prev?: PageContext['prev'];
  next?: PageContext['next'];
}

export function DocsFooter({ prev, next }: DocsFooterProps) {
  if (!prev && !next) return null;

  return (
    <div className="flex justify-between items-center mt-12 pt-8 border-t border-[#EBECF0] dark:border-[#343A46]">
      {prev ? (
        <Link
          href={prev.path}
          className="flex items-center gap-2 text-sm text-[#404756] dark:text-[#99A1B3] hover:text-[#087EA4] dark:hover:text-[#149ECA] transition-colors group max-w-[45%]"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="flex-shrink-0"
          >
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <div>
            <div className="text-xs text-[#087EA4] dark:text-[#149ECA] mb-0.5">Əvvəlki</div>
            <div className="font-medium text-[#23272F] dark:text-[#F6F7F9] group-hover:text-[#087EA4] dark:group-hover:text-[#149ECA] leading-snug">
              {prev.title}
            </div>
          </div>
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          href={next.path}
          className="flex items-center gap-2 text-sm text-[#404756] dark:text-[#99A1B3] hover:text-[#087EA4] dark:hover:text-[#149ECA] transition-colors group max-w-[45%] text-right"
        >
          <div>
            <div className="text-xs text-[#087EA4] dark:text-[#149ECA] mb-0.5">Növbəti</div>
            <div className="font-medium text-[#23272F] dark:text-[#F6F7F9] group-hover:text-[#087EA4] dark:group-hover:text-[#149ECA] leading-snug">
              {next.title}
            </div>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="flex-shrink-0"
          >
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
