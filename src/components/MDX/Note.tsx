import * as React from 'react';

interface NoteProps {
  children: React.ReactNode;
}

export function Note({ children }: NoteProps) {
  return (
    <div className="rounded-xl border border-[#C6E4F0] dark:border-[#1C4F6B] bg-[#EDF5FA] dark:bg-[#0F2537] p-5 mb-6">
      <div className="flex gap-3">
        <span className="text-[#087EA4] dark:text-[#149ECA] text-lg flex-shrink-0 mt-0.5" aria-hidden="true">
          ℹ
        </span>
        <div className="prose-docs flex-1 [&>p:last-child]:mb-0 [&>p]:text-[#23272F] dark:[&>p]:text-[#d4e5f0]">
          {children}
        </div>
      </div>
    </div>
  );
}
