import { useState } from 'react';

export function useMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen((v) => !v);
  const close = () => setIsOpen(false);
  return { isOpen, toggle, close };
}
