import { Home } from "@/modules/home";

import { CONTENT } from "@/modules/home/mock/Home.mock";
import { resolveLocale } from "@/shared/lib/utils/locale";

import type { Metadata } from "next";
import type { IHomeProps } from "@/modules/home/Home.types";

export function generateMetadata({ params }: IHomeProps): Metadata {
  return { title: CONTENT[resolveLocale(params.locale)].title };
}

const HomePage = ({ params }: IHomeProps) => {
  return <Home params={params} />;
};

export default HomePage;
