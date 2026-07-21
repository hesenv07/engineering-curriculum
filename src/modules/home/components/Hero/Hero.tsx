import React from "react";

import { Link } from "@/i18n/navigation";
import { Show } from "@/shared/ui/Show";

import { resolveLocale } from "@/shared/lib/utils/locale";
import { CONTENT } from "../../mock/Home.mock";

import type { IHeroProps } from "./Hero.types";

const Hero = ({ params, phases }: IHeroProps) => {
  const t = CONTENT[resolveLocale(params.locale)];

  const heroLines = t.hero.split("\n");

  return (
    <section className="py-20 px-6 text-center border-b border-border dark:border-border-dark">
      <div className="max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-highlight dark:bg-highlight-dark text-link dark:text-link-dark rounded-full px-4 py-1.5 text-sm font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-link dark:bg-link-dark" />
          {t.badge}
        </div>

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-primary dark:text-primary-dark leading-[1.1] mb-6 tracking-tight">
          {heroLines.map((line, i) => (
            <span key={line}>
              <Show when={i === 0} fallback={line}>
                <span className="text-link dark:text-link-dark">{line}</span>
              </Show>
              <Show when={i < heroLines.length - 1}>
                <br />
              </Show>
            </span>
          ))}
        </h1>

        <p className="text-xl text-secondary dark:text-secondary-dark leading-relaxed mb-10 max-w-2xl mx-auto">
          {t.desc}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={phases[0]?.path ?? "/learn"}
            className="bg-link hover:bg-link-dark text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-base shadow-sm"
          >
            {t.cta1} →
          </Link>
          <Link
            href="/learn"
            className="border border-border dark:border-border-dark text-secondary dark:text-secondary-dark hover:border-link hover:text-link dark:hover:text-link-dark dark:hover:border-link-dark font-semibold px-8 py-3.5 rounded-xl transition-colors text-base bg-white dark:bg-transparent"
          >
            {t.cta2}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
