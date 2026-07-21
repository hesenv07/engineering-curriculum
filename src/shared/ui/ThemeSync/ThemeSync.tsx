"use client";

import { useEffect } from "react";

import { usePathname } from "next/navigation";

const ThemeSync = () => {
  const pathname = usePathname();

  useEffect(() => {
    const isDark = localStorage.theme === "dark";
    document.documentElement.classList.toggle("dark", isDark);
  }, [pathname]);

  return null;
};

export default ThemeSync;
