"use client";

import * as React from "react";

import { useParams } from "next/navigation";

import { usePathname, useRouter } from "@/i18n/navigation";

type TLanguageOption = {
  code: string;
  label: string;
  isSoon?: boolean;
};

const LANGUAGES: TLanguageOption[] = [
  { code: "az", label: "Azərbaycanca" },
  { code: "en", label: "English" },
];

const LanguageSelector = () => {
  const { locale } = useParams<{ locale: string }>();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

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
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm text-secondary dark:text-secondary-dark hover:bg-wash dark:hover:bg-wash-dark hover:text-primary dark:hover:text-primary-dark transition-colors"
        aria-label="Select language"
        aria-expanded={isOpen}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span className="font-medium">{currentLabel}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={`transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-card-dark border border-border dark:border-border-dark rounded-xl shadow-lg overflow-hidden z-50">
          <div className="p-1">
            {LANGUAGES.map((l) => (
              <div key={l.code}>
                {l.isSoon ? (
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-tertiary dark:text-tertiary-dark cursor-not-allowed select-none">
                    <span>{l.label}</span>
                    <span className="text-[10px] bg-wash dark:bg-wash-dark text-tertiary dark:text-tertiary-dark rounded px-1.5 py-0.5 font-medium">
                      soon
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      router.replace(pathname, { locale: l.code });
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                      locale === l.code
                        ? "bg-highlight dark:bg-highlight-dark text-link dark:text-link-dark font-semibold"
                        : "text-secondary dark:text-secondary-dark hover:bg-wash dark:hover:bg-wash-dark"
                    }`}
                  >
                    {l.label}
                    {locale === l.code && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
