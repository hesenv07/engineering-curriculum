import React from "react";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";

import "@/styles/globals.css";

import { routing } from "@/i18n/routing";

import type { Metadata } from "next";
import type { TLocale } from "@/shared/types";
import type { ILocaleLayoutProps } from "@/shared/types/ILayoutTypes";

export const metadata: Metadata = {
  description:
    "No frameworks. Engineering. A public, free, login-free site for software engineers who want to understand how things actually work — from transistors to distributed systems.",
  icons: { icon: "/favicon.ico" },
};

function isSupportedLocale(locale: string): locale is TLocale {
  return (routing.locales as readonly string[]).includes(locale);
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const LocaleLayout = ({ children, params }: ILocaleLayoutProps) => {
  if (!isSupportedLocale(params.locale)) {
    notFound();
  }

  return (
    <html lang={params.locale}>
      <body className="font-text font-medium antialiased text-lg bg-wash dark:bg-wash-dark text-secondary dark:text-secondary-dark leading-base">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var q=window.matchMedia('(prefers-color-scheme: dark)');var prefersDark=localStorage.theme==='dark'||(!('theme' in localStorage)&&q.matches);document.documentElement.classList.toggle('dark',prefersDark);window.__setPreferredTheme=function(t){localStorage.theme=t;document.documentElement.classList.toggle('dark',t==='dark')};}catch(e){}})();`,
          }}
        />
        <NextIntlClientProvider locale={params.locale} messages={{}}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
};

export default LocaleLayout;
