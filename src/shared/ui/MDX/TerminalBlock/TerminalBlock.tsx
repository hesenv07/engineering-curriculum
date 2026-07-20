'use client';

import * as React from 'react';
import clsx from 'clsx';

import type { TTerminalLevel, ITerminalBlockProps } from './TerminalBlock.types';

function TerminalIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 4l4 4-4 4M8 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function LevelPrefix({ level }: { level: TTerminalLevel }) {
  if (level === 'warning') {
    return <span className="text-yellow-50 me-1">Warning: </span>;
  }
  if (level === 'error') {
    return <span className="text-red-40 me-1">Error: </span>;
  }
  return null;
}

function extractMessage(children: React.ReactNode): string | undefined {
  if (typeof children === 'string') return children;
  if (
    React.isValidElement(children) &&
    typeof (children as React.ReactElement<{ children: string }>).props.children === 'string'
  ) {
    return (children as React.ReactElement<{ children: string }>).props.children;
  }
  return undefined;
}

const TerminalBlock = ({ level = 'info', children }: ITerminalBlockProps) => {
  const message = extractMessage(children);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = () => {
    if (message) {
      window.navigator.clipboard.writeText(message);
      setCopied(true);
    }
  };

  return (
    <div className="rounded-lg bg-gray-95 dark:bg-gray-10 my-6 overflow-hidden">
      <div className="flex justify-between items-center bg-gray-90 dark:bg-gray-20 px-4 py-1.5">
        <span className="flex items-center gap-2 text-sm text-primary-dark dark:text-primary">
          <TerminalIcon />
          Terminal
        </span>
        <button
          onClick={handleCopy}
          className={clsx(
            'flex items-center gap-1 text-sm transition-colors',
            copied
              ? 'text-green-40'
              : 'text-primary-dark dark:text-primary hover:text-white dark:hover:text-primary-dark',
          )}
        >
          <CopyIcon />
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre
        className="px-8 pt-4 pb-6 text-primary-dark font-mono text-sm whitespace-pre overflow-x-auto"
        translate="no"
        dir="ltr"
      >
        <code>
          <LevelPrefix level={level} />
          {message ?? children}
        </code>
      </pre>
    </div>
  );
};

export default TerminalBlock;
