'use client';

import * as React from 'react';

import type { ICodeProps, IPreProps } from './CodeBlock.types';

const InsidePreContext = React.createContext(false);

export function Code({ children, className }: ICodeProps) {
  const isInsidePre = React.useContext(InsidePreContext);
  if (isInsidePre || (className && className.startsWith('language-'))) {
    return (
      <code className={`${className ?? ''} text-[#d4d4d4] font-mono text-sm leading-relaxed`}>
        {children}
      </code>
    );
  }
  return (
    <code className="bg-blue-5 dark:bg-card-dark text-red-40 dark:text-red-30 rounded px-1.5 py-0.5 text-[0.875em] font-mono">
      {children}
    </code>
  );
}

export function Pre({ children }: IPreProps) {
  return (
    <InsidePreContext.Provider value={true}>
      <pre className="bg-wash-dark rounded-xl overflow-x-auto mb-4 p-5 text-sm leading-relaxed">
        {children}
      </pre>
    </InsidePreContext.Provider>
  );
}
