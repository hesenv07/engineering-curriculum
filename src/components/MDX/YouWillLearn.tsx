import * as React from 'react';

interface YouWillLearnProps {
  children: React.ReactNode;
  isChapter?: boolean;
}

export function YouWillLearn({ children, isChapter }: YouWillLearnProps) {
  const title = isChapter ? 'Bu fəsildə öyrənəcəksiniz' : 'Öyrənəcəksiniz';
  return (
    <div className="rounded-xl border border-[#EBECF0] dark:border-[#343A46] bg-[#F9FBFC] dark:bg-[#2B3245] p-6 mb-6">
      <h5 className="text-[#087EA4] dark:text-[#149ECA] font-bold uppercase text-xs tracking-widest mb-3">
        {title}
      </h5>
      <div className="prose-docs [&>ul]:mb-0 [&>ul>li]:text-[#23272F] dark:[&>ul>li]:text-[#F6F7F9]">
        {children}
      </div>
    </div>
  );
}
