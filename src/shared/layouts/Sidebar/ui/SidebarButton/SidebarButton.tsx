import clsx from "clsx";
import React from "react";

import IconNavArrow from "@/shared/resources/icons/svgs/nav-arrow";

import type { ISidebarButtonProps } from "./SidebarButton.types";

const SidebarButton = ({
  level,
  title,
  heading,
  onClick,
  isExpanded,
  isBreadcrumb,
}: ISidebarButtonProps) => {
  return (
    <div
      className={clsx({
        "my-1": heading || level === 1,
        "my-3": level > 1,
      })}
    >
      <button
        className={clsx(
          "p-2 pe-2 ps-5 w-full rounded-e-lg text-start hover:bg-gray-5 dark:hover:bg-gray-80 relative flex items-center justify-between",
          {
            "p-2 text-base": level > 1,
            "text-link bg-highlight dark:bg-highlight-dark text-base font-bold hover:bg-highlight dark:hover:bg-highlight-dark hover:text-link dark:hover:text-link-dark":
              !heading && isBreadcrumb && !isExpanded,
            "p-4 my-6 text-2xl lg:my-auto lg:text-sm font-bold": heading,
            "p-2 hover:text-gray-70 text-base font-bold text-primary dark:text-primary-dark":
              !heading && !isBreadcrumb,
            "text-primary dark:text-primary-dark": heading && !isBreadcrumb,
            "text-primary dark:text-primary-dark text-base font-bold bg-card dark:bg-card-dark":
              !heading && isExpanded,
          },
        )}
        onClick={onClick}
      >
        {title}
        {isExpanded != null && !heading && (
          <span className="pe-2 text-gray-30">
            <IconNavArrow displayDirection={isExpanded ? "down" : "end"} />
          </span>
        )}
      </button>
    </div>
  );
};

export default SidebarButton;
