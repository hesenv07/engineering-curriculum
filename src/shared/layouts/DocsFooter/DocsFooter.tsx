import React from "react";

import { Link } from "@/i18n/navigation";
import BaseIcons from "@/shared/resources/constants/BaseIcons";
import Icon from "@/shared/ui/Icon/Icon";

import type { IDocsFooterProps } from "./DocsFooter.types";

const DocsFooter = ({ prev, next }: IDocsFooterProps) => {
  if (!prev && !next) return null;

  return (
    <div className="flex justify-between items-center mt-12 pt-8 border-t border-[#EBECF0] dark:border-[#343A46]">
      {prev ? (
        <Link
          href={prev.path}
          className="flex items-center gap-2 text-sm text-[#404756] dark:text-[#99A1B3] hover:text-[#087EA4] dark:hover:text-[#149ECA] transition-colors group max-w-[45%]"
        >
          <Icon name={BaseIcons.ARROW} className="flex-shrink-0" />
          <div>
            <div className="text-xs text-[#087EA4] dark:text-[#149ECA] mb-0.5">
              Əvvəlki
            </div>
            <div className="font-medium text-[#23272F] dark:text-[#F6F7F9] group-hover:text-[#087EA4] dark:group-hover:text-[#149ECA] leading-snug">
              {prev.title}
            </div>
          </div>
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link
          href={next.path}
          className="flex items-center gap-2 text-sm text-[#404756] dark:text-[#99A1B3] hover:text-[#087EA4] dark:hover:text-[#149ECA] transition-colors group max-w-[45%] text-right"
        >
          <div>
            <div className="text-xs text-[#087EA4] dark:text-[#149ECA] mb-0.5">
              Növbəti
            </div>
            <div className="font-medium text-[#23272F] dark:text-[#F6F7F9] group-hover:text-[#087EA4] dark:group-hover:text-[#149ECA] leading-snug">
              {next.title}
            </div>
          </div>
          <Icon name={BaseIcons.ARROW} className="flex-shrink-0 rotate-180" />
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
};

export default DocsFooter;
