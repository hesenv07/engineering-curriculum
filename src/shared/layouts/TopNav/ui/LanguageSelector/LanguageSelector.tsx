"use client";

import * as React from "react";

import { useParams } from "next/navigation";

import { Show } from "@/shared/ui/Show";
import Icon from "@/shared/ui/Icon/Icon";
import cn from "@/shared/lib/helpers/cn";

import { usePathname, useRouter } from "@/i18n/navigation";

import { LANGUAGES } from "./LanguageSelector.consts";

const LanguageSelector = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useParams<{ locale: string }>();

  const [isOpen, setIsOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  const handleToggleOpen = () => setIsOpen((prev) => !prev);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentLabel = (locale ?? "az").toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        aria-expanded={isOpen}
        onClick={handleToggleOpen}
        aria-label="Select language"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-secondary dark:text-secondary-dark hover:bg-wash dark:hover:bg-wash-dark hover:text-primary dark:hover:text-primary-dark transition-colors"
      >
        <Icon name="globe" className="w-4 h-4" />
        <span className="font-medium">{currentLabel}</span>
        <Icon
          name="arrow-down"
          className={cn(
            "transition-transform duration-150",
            isOpen && "rotate-180",
          )}
        />
      </button>

      <Show when={isOpen}>
        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-card-dark border border-border dark:border-border-dark rounded-xl shadow-lg overflow-hidden z-50">
          <div className="p-1">
            {LANGUAGES.map((l) => {
              const isActive = locale === l.code;
              const activeClassName = isActive
                ? "bg-highlight dark:bg-highlight-dark text-link dark:text-link-dark font-semibold"
                : "text-secondary dark:text-secondary-dark hover:bg-wash dark:hover:bg-wash-dark";

              const handleSelectLanguage = () => {
                router.replace(pathname, { locale: l.code });
                setIsOpen(false);
              };

              return (
                <div key={l.code}>
                  <Show
                    when={l.isSoon}
                    fallback={
                      <button
                        onClick={handleSelectLanguage}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                          activeClassName,
                        )}
                      >
                        {l.label}
                        <Show when={isActive}>
                          <Icon name="success" />
                        </Show>
                      </button>
                    }
                  >
                    <div className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-tertiary dark:text-tertiary-dark cursor-not-allowed select-none">
                      <span>{l.label}</span>
                      <span className="text-[10px] bg-wash dark:bg-wash-dark text-tertiary dark:text-tertiary-dark rounded px-1.5 py-0.5 font-medium">
                        soon
                      </span>
                    </div>
                  </Show>
                </div>
              );
            })}
          </div>
        </div>
      </Show>
    </div>
  );
};

export default LanguageSelector;
