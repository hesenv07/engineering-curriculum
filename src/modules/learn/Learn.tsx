import { cookies } from "next/headers";

import { AppLayout } from "@/shared/layouts/AppLayout";

import { resolveLocale } from "@/shared/lib/utils/locale";
import { getSidebarRouteTree, parseSidebar } from "@/shared/lib/utils/sidebar";

import { CONTENT } from "./mock/Learn.mock";

import { StartCard } from "./components/StartCard";

import type { ILearnProps } from "./Learn.types";

const Learn = async ({ params }: ILearnProps) => {
  const cookieStore = await cookies();
  const defaultSidebarOpen = cookieStore.get("sidebarOpen")?.value !== "false";

  const lang = resolveLocale(params.locale);
  const t = CONTENT[lang];

  const routes = getSidebarRouteTree(params.locale).routes ?? [];
  const { phases } = parseSidebar(routes);

  return (
    <AppLayout defaultSidebarOpen={defaultSidebarOpen}>
      <div className="py-4">
        <h1 className="text-4xl font-bold text-primary dark:text-primary-dark mb-4">
          {t.heading}
        </h1>
        <p className="text-xl text-secondary dark:text-secondary-dark leading-relaxed mb-8">
          {t.desc}
        </p>

        <StartCard
          title={t.startTitle}
          desc={t.startDesc}
          ctaLabel={t.startCta}
          ctaHref={phases[0]?.path ?? "/learn"}
        />
      </div>
    </AppLayout>
  );
};

export default Learn;
