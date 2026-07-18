import React from "react";

import { Link } from "@/i18n/navigation";

import type { IStartCardProps } from "./StartCard.types";

const StartCard = ({ title, desc, ctaHref, ctaLabel }: IStartCardProps) => {
  return (
    <div className="rounded-xl border border-border dark:border-border-dark bg-highlight dark:bg-highlight-dark p-6">
      <h2 className="font-bold text-link dark:text-link-dark mb-2">{title}</h2>
      <p className="text-secondary dark:text-secondary-dark">{desc}</p>
      <Link
        href={ctaHref}
        className="inline-flex items-center gap-1 mt-3 text-link dark:text-link-dark font-medium hover:underline"
      >
        {ctaLabel}
      </Link>
    </div>
  );
};

export default StartCard;
