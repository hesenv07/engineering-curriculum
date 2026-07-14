'use client';
import * as React from 'react';

interface DeepDiveProps {
  children: React.ReactNode;
}

export function DeepDive({ children }: DeepDiveProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Extract h4 title from children
  const childArray = React.Children.toArray(children);
  const heading = childArray.find(
    (child) =>
      React.isValidElement(child) &&
      (child.type === 'h4' || (child.props as any)?.mdxType === 'h4')
  );
  const rest = childArray.filter((child) => child !== heading);

  const titleText =
    React.isValidElement(heading)
      ? String((heading.props as any)?.children || 'Dərinləmə')
      : 'Dərinləmə';

  return (
    <div className="rounded-xl border border-[#E0EDF5] dark:border-[#2A3A4A] bg-[#F5FAFE] dark:bg-[#1A2533] mb-6 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-[#EBF5FC] dark:hover:bg-[#1E2D3D] transition-colors"
        aria-expanded={isOpen}
      >
        <div>
          <span className="text-[#087EA4] dark:text-[#149ECA] font-bold uppercase text-xs tracking-widest block mb-1">
            Dərinləmə
          </span>
          <span className="font-semibold text-[#23272F] dark:text-[#F6F7F9] text-base">
            {titleText}
          </span>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-[#087EA4] dark:text-[#149ECA] flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      {isOpen && (
        <div className="px-5 pb-5 prose-docs border-t border-[#E0EDF5] dark:border-[#2A3A4A] pt-4">
          {rest}
        </div>
      )}
    </div>
  );
}
