import * as React from 'react';
import clsx from 'clsx';

import type { IConsoleBlockProps, IConsoleBlockMultiProps } from './ConsoleBlock.types';

function WarningIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M8 1a.75.75 0 0 1 .65.375l6.5 11.25A.75.75 0 0 1 14.5 14h-13a.75.75 0 0 1-.65-1.125l6.5-11.25A.75.75 0 0 1 8 1zm0 4.5a.75.75 0 0 0-.75.75v3a.75.75 0 1 0 1.5 0v-3A.75.75 0 0 0 8 5.5zm0 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm-.75 4.75a.75.75 0 1 1 1.5 0v3a.75.75 0 1 1-1.5 0v-3zm.75 6.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
    </svg>
  );
}

function ConsoleHeader() {
  return (
    <div className="flex w-full rounded-t-lg bg-gray-200 dark:bg-gray-80">
      <div className="px-4 py-2 border-gray-300 dark:border-gray-90 border-r">
        <div className="bg-gray-300 dark:bg-gray-70 rounded" style={{ width: 15, height: 17 }} />
      </div>
      <div className="flex text-sm px-4">
        <div className="border-b-2 border-gray-300 dark:border-gray-90 text-tertiary dark:text-tertiary-dark py-2">
          Console
        </div>
        <div className="px-4 py-2 flex gap-2">
          <div className="bg-gray-300 dark:bg-gray-70 rounded" style={{ width: 60, height: 17 }} />
          <div className="bg-gray-300 dark:bg-gray-70 rounded hidden md:block" style={{ width: 60, height: 17 }} />
        </div>
      </div>
    </div>
  );
}

function extractMessage(children: React.ReactNode): React.ReactNode {
  if (typeof children === 'string') return children;
  if (React.isValidElement(children)) {
    return (children as React.ReactElement<{ children?: React.ReactNode }>).props.children;
  }
  return children;
}

export function ConsoleBlock({ level = 'error', children }: IConsoleBlockProps) {
  const message = extractMessage(children);

  return (
    <div
      className="mb-4 text-secondary bg-wash dark:bg-wash-dark rounded-lg overflow-hidden"
      translate="no"
      dir="ltr"
    >
      <ConsoleHeader />
      <div
        className={clsx(
          'flex px-4 pt-4 pb-6 items-center font-mono text-sm rounded-b-md gap-2',
          {
            'bg-red-30 bg-opacity-5 text-red-50 dark:text-red-30': level === 'error',
            'bg-yellow-5 text-yellow-50': level === 'warning',
            'bg-gray-5 text-secondary dark:text-secondary-dark': level === 'info',
          },
        )}
      >
        {level === 'error' && <ErrorIcon />}
        {level === 'warning' && <WarningIcon />}
        <div className="px-1">{message}</div>
      </div>
    </div>
  );
}

export function ConsoleBlockMulti({ children }: IConsoleBlockMultiProps) {
  return (
    <div
      className="mb-4 text-secondary bg-wash dark:bg-wash-dark rounded-lg overflow-hidden"
      translate="no"
      dir="ltr"
    >
      <ConsoleHeader />
      <div className="grid grid-cols-1 divide-y divide-gray-300 dark:divide-gray-70">
        {children}
      </div>
    </div>
  );
}

export function ConsoleLogLine({ level = 'info', children }: IConsoleBlockProps) {
  const message = extractMessage(children);

  return (
    <div
      className={clsx(
        'ps-4 pe-2 pt-1 pb-2 grid grid-cols-[18px_auto] font-mono text-sm rounded-b-md',
        {
          'bg-red-30 bg-opacity-5 text-red-50 dark:text-red-30': level === 'error',
          'bg-yellow-5 text-yellow-50': level === 'warning',
          'bg-gray-5 text-secondary dark:text-secondary-dark': level === 'info',
        },
      )}
    >
      {level === 'error' && <ErrorIcon />}
      {level === 'warning' && <WarningIcon />}
      {level === 'info' && <span />}
      <div className="px-2 pt-1 whitespace-break-spaces text-sm leading-tight">{message}</div>
    </div>
  );
}
