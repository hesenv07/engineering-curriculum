import React from "react";

import { resolveLocale } from "@/shared/lib/utils/locale";
import { CONTENT } from "../../mock/Home.mock";

import type { IStatisticsProps } from "./Statistics.types";

const Statistics = ({
  params,
  totalPhases,
  totalLessons,
  totalModules,
}: IStatisticsProps) => {
  const t = CONTENT[resolveLocale(params.locale)];

  const stats = [
    { value: String(totalPhases), label: t.stat.phases },
    { value: String(totalModules), label: t.stat.modules },
    { value: String(totalLessons), label: t.stat.lessons },
    { value: t.stat.free, label: t.stat.payment },
  ];

  return (
    <section className="py-8 px-6 border-b border-border dark:border-border-dark bg-wash dark:bg-wash-dark">
      <div className="max-w-3xl mx-auto flex flex-wrap justify-center gap-8 sm:gap-20">
        {stats.map(({ value, label }) => (
          <div key={label} className="text-center">
            <div className="text-3xl font-bold text-link dark:text-link-dark tabular-nums">
              {value}
            </div>
            <div className="text-sm text-secondary dark:text-secondary-dark mt-1">
              {label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Statistics;
