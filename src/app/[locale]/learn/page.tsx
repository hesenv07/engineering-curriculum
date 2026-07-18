import { Learn } from "@/modules/learn";

import { resolveLocale } from "@/shared/lib/utils/locale";
import { CONTENT } from "@/modules/learn/mock/Learn.mock";

import type { Metadata } from "next";
import type { ILearnProps } from "@/modules/learn/Learn.types";

export function generateMetadata({ params }: ILearnProps): Metadata {
  return { title: CONTENT[resolveLocale(params.locale)].title };
}

const LearnPage = ({ params }: ILearnProps) => {
  return <Learn params={params} />;
};

export default LearnPage;
