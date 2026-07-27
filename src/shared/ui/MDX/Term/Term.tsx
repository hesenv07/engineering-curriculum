"use client";

import { useState, useRef } from "react";
import { createPortal } from "react-dom";

import type { ITermProps } from "./Term.types";

function IconInfo() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
      className="inline-block ml-0.5 mb-0.5 align-middle shrink-0 opacity-70"
    >
      <circle cx="6" cy="6" r="5.5" stroke="currentColor" />
      <rect x="5.25" y="5" width="1.5" height="4" rx="0.75" fill="currentColor" />
      <circle cx="6" cy="3.25" r="0.75" fill="currentColor" />
    </svg>
  );
}

export function Term({ children, definition }: ITermProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showSheet, setShowSheet] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);

  function handleMouseEnter() {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setTooltipPos({
        top: rect.bottom + 12,
        left: rect.left + rect.width / 2,
      });
    }
    setShowTooltip(true);
  }

  return (
    <>
      <span className="inline-block">
        <span
          ref={triggerRef}
          role="button"
          tabIndex={0}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={() => setShowSheet(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") setShowSheet(true);
          }}
          className="inline-flex items-baseline gap-px border-b border-dashed border-link dark:border-link-dark text-link dark:text-link-dark cursor-help"
        >
          {children}
          <IconInfo />
        </span>
      </span>

      {showTooltip &&
        createPortal(
          <span
            className="hidden md:flex flex-col fixed z-[9999] w-64 rounded-2xl border border-border dark:border-border-dark bg-card dark:bg-card-dark shadow-xl overflow-hidden pointer-events-none animate-term-tooltip -translate-x-1/2"
            style={{ top: tooltipPos.top, left: tooltipPos.left }}
          >
            <span className="bg-highlight dark:bg-highlight-dark px-4 py-2.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-link dark:bg-link-dark shrink-0" />
              <span className="text-xs font-bold text-link dark:text-link-dark tracking-wide">
                {children}
              </span>
            </span>
            <span className="px-4 py-3 text-sm text-secondary dark:text-secondary-dark leading-relaxed">
              {definition}
            </span>
          </span>,
          document.body,
        )}

      {showSheet &&
        createPortal(
          <div className="md:hidden fixed inset-0 z-[9999] flex flex-col justify-end">
            <button
              type="button"
              aria-label="Close"
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowSheet(false)}
            />
            <div className="relative bg-card dark:bg-card-dark rounded-t-3xl overflow-hidden animate-term-sheet">
              <div className="w-10 h-1 rounded-full bg-border dark:bg-border-dark mx-auto mt-3 mb-1" />
              <div className="bg-highlight dark:bg-highlight-dark px-6 py-4 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-link dark:bg-link-dark shrink-0" />
                <p className="font-bold text-base text-link dark:text-link-dark">
                  {children}
                </p>
              </div>
              <p className="px-6 py-5 text-base text-secondary dark:text-secondary-dark leading-relaxed">
                {definition}
              </p>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
