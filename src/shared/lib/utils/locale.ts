import type { TLocale } from "@/shared/types";

export function resolveLocale(locale?: string): TLocale {
  return locale === "en" ? "en" : "az";
}
