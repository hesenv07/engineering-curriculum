import * as React from 'react';

interface IntroProps {
  children: React.ReactNode;
}

export function Intro({ children }: IntroProps) {
  return (
    <div className="text-xl leading-relaxed text-[#404756] dark:text-[#99A1B3] mb-8 mt-4">
      {children}
    </div>
  );
}
