import * as React from 'react';

interface PitfallProps {
  children: React.ReactNode;
}

export function Pitfall({ children }: PitfallProps) {
  return (
    <div className="rounded-xl border border-[#F5C8C8] dark:border-[#6B1C1C] bg-[#FFF8F8] dark:bg-[#2B1515] p-5 mb-6">
      <div className="flex gap-3">
        <span className="text-[#AD1A1A] dark:text-[#FF8080] text-lg flex-shrink-0 mt-0.5" aria-hidden="true">
          ⚠
        </span>
        <div className="prose-docs flex-1 [&>p:last-child]:mb-0 [&>p]:text-[#23272F] dark:[&>p]:text-[#f0d4d4]">
          <strong className="text-[#AD1A1A] dark:text-[#FF8080] block mb-1 text-sm font-bold uppercase tracking-wide">
            Diqqət
          </strong>
          {children}
        </div>
      </div>
    </div>
  );
}
