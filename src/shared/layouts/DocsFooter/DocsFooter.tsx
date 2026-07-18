import { Link } from "@/i18n/navigation";

import { LINK_CLASS, CHEVRON_LEFT, CHEVRON_RIGHT } from "./DocsFooter.const";

import type { IDocsFooterProps } from "./DocsFooter.types";

const DocsFooter = ({ prev, next }: IDocsFooterProps) => {
  if (!prev && !next) return null;

  return (
    <div className="grid grid-cols-2 gap-4 mt-12 pt-8 border-t border-border dark:border-border-dark">
      {prev ? (
        <Link href={prev.path} className={LINK_CLASS}>
          {CHEVRON_LEFT}
          <div className="min-w-0">
            <div className="text-xs font-semibold text-link dark:text-link-dark mb-0.5 uppercase tracking-wide">
              Əvvəlki
            </div>
            <div className="text-sm font-medium text-primary dark:text-primary-dark group-hover:text-link dark:group-hover:text-link-dark leading-snug line-clamp-2 transition-colors">
              {prev.title}
            </div>
          </div>
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link href={next.path} className={`${LINK_CLASS} justify-end`}>
          <div className="min-w-0 text-right">
            <div className="text-xs font-semibold text-link dark:text-link-dark mb-0.5 uppercase tracking-wide">
              Növbəti
            </div>
            <div className="text-sm font-medium text-primary dark:text-primary-dark group-hover:text-link dark:group-hover:text-link-dark leading-snug line-clamp-2 transition-colors">
              {next.title}
            </div>
          </div>
          {CHEVRON_RIGHT}
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
};

export default DocsFooter;
