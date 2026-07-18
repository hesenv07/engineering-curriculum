import React from "react";
import Link from "next/link";

import { parseSidebar } from "@/shared/lib/utils/sidebar";

import { CONTENT } from "../../mock/Home.mock";

import type { ICurriculumProps } from "./Curriculum.types";

const Curriculum = ({ params, routes }: ICurriculumProps) => {
  const locale = params.locale as keyof typeof CONTENT;
  const t = CONTENT[locale];

  const { phases } = parseSidebar(routes);
  return (
    <section className="py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-primary dark:text-primary-dark mb-2 text-center tracking-tight">
          {t.mapTitle}
        </h2>
        <p className="text-secondary dark:text-secondary-dark text-center mb-12 text-base">
          {t.mapDesc}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {phases.map((phase) => (
            <Link
              key={phase.id}
              href={phase.path}
              className="group rounded-xl border border-border dark:border-border-dark bg-white dark:bg-card-dark p-5 hover:border-link dark:hover:border-link-dark hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-bold bg-highlight dark:bg-highlight-dark text-link dark:text-link-dark rounded-full px-2.5 py-1 leading-none">
                  {phase.badgeText}
                </span>
                <span className="text-xs text-tertiary dark:text-tertiary-dark">
                  {phase.lessonCount} {t.lessonSuffix}
                </span>
              </div>
              <h3 className="font-bold text-primary dark:text-primary-dark mb-1.5 group-hover:text-link dark:group-hover:text-link-dark transition-colors leading-snug">
                {phase.title}
              </h3>
              <p className="text-sm text-secondary dark:text-secondary-dark leading-relaxed">
                {phase.desc}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Curriculum;
