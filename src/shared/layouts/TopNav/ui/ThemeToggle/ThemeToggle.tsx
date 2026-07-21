"use client";

import { useState, useEffect } from "react";

import { Show } from "@/shared/ui/Show";
import Icon from "@/shared/ui/Icon/Icon";

import BaseIcons from "@/shared/resources/constants/BaseIcons";

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState<boolean | null>(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);
  const handleToggle = () => {
    const next = !isDark;
    setIsDark(next);
    (
      window as unknown as { __setPreferredTheme: (theme: string) => void }
    ).__setPreferredTheme(next ? "dark" : "light");
  };

  if (isDark === null) return null;

  const ariaLabel = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      onClick={handleToggle}
      aria-label={ariaLabel}
      className="p-1.5 rounded-lg hover:bg-gray-5 dark:hover:bg-gray-80 text-secondary dark:text-secondary-dark transition-colors"
    >
      <Show when={isDark} fallback={<Icon name={BaseIcons.MOON} />}>
        <Icon name={BaseIcons.SUN} />
      </Show>
    </button>
  );
};

export default ThemeToggle;
