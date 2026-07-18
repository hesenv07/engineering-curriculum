import React from "react";

import { AppLayout } from "@/shared/layouts/AppLayout";

import { resolveLocale } from "@/shared/lib/utils/locale";
import { getSidebarRouteTree, parseSidebar } from "@/shared/lib/utils/sidebar";

import { Hero } from "./components/Hero";
import { Curriculum } from "./components/Curriculum";
import { Statistics } from "./components/Statistics";

import type { IHomeProps } from "./Home.types";

const Home = ({ params }: IHomeProps) => {
  const lang = resolveLocale(params.locale);

  const routes = getSidebarRouteTree(params.locale).routes ?? [];
  const { phases, totalPhases, totalModules, totalLessons } =
    parseSidebar(routes);

  return (
    <AppLayout showSidebar={false}>
      <Hero params={params} phases={phases} />
      <Statistics
        params={params}
        totalPhases={totalPhases}
        totalLessons={totalLessons}
        totalModules={totalModules}
      />

      <Curriculum params={params} routes={routes} />
    </AppLayout>
  );
};

export default Home;
