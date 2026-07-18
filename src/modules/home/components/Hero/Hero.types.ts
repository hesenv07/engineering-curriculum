import type { IPhaseCard } from "@/shared/types";
import { IHomeProps } from "../../Home.types";

export interface IHeroProps {
  params:  { locale: string };
  phases: IPhaseCard[];
}
