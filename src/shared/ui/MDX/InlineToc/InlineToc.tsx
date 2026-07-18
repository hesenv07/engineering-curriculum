'use client';

import * as React from 'react';

import { TocContext } from '../TocContext';

import type { ITocItem } from '@/shared/types';

function TocList({ items }: { items: ITocItem[] }) {
  return (
    <ul className="ms-6 my-3 list-disc">
      {items.map((item) => (
        <li key={item.id} className={item.level === 3 ? 'ms-4' : ''}>
          <a
            href={`#${item.id}`}
            className="text-link dark:text-link-dark hover:underline leading-relaxed"
          >
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  );
}

const InlineToc = () => {
  const toc = React.useContext(TocContext);

  if (toc.length < 2) return null;

  return <TocList items={toc} />;
};

export default InlineToc;
