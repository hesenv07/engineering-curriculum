import * as React from 'react';

interface RecapProps {
  children: React.ReactNode;
}

export function Recap({ children }: RecapProps) {
  return (
    <div className="rounded-xl border border-[#EBECF0] dark:border-[#343A46] bg-[#EDF5FA] dark:bg-[#1A2333] p-6 mb-6">
      <h5 className="text-[#087EA4] dark:text-[#149ECA] font-bold uppercase text-xs tracking-widest mb-3">
        Xülasə
      </h5>
      <div className="prose-docs [&>ul]:mb-0">
        {children}
      </div>
    </div>
  );
}
