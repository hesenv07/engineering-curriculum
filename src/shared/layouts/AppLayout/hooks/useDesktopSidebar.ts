import { useState } from 'react';

const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function useDesktopSidebar(defaultOpen: boolean) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggle = () => {
    const next = !isOpen;
    setIsOpen(next);
    document.cookie = `sidebarOpen=${next}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  };

  return { isOpen, toggle };
}
