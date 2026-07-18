'use client';

import { Link } from '@/i18n/navigation';
import IconLogo from '@/shared/resources/icons/svgs/logo';
import IconGithub from '@/shared/resources/icons/svgs/github';

import ThemeToggle from './ui/ThemeToggle';
import LanguageSelector from './ui/LanguageSelector';

import { ICON_PROPS, TOGGLE_BTN_CLASS } from './TopNav.const';

import type { ITopNavProps } from './TopNav.types';

const TopNav = ({
  isMenuOpen,
  onMenuToggle,
  isDesktopSidebarOpen,
  onDesktopSidebarToggle,
}: ITopNavProps) => {
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center border-b border-border bg-wash dark:border-border-dark dark:bg-wash-dark">
      <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          {onMenuToggle && (
            <button
              aria-label="Menyu"
              onClick={onMenuToggle}
              className={`lg:hidden ${TOGGLE_BTN_CLASS}`}
            >
              {isMenuOpen ? (
                <svg {...ICON_PROPS}>
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg {...ICON_PROPS}>
                  <path d="M3 12h18M3 6h18M3 18h18" />
                </svg>
              )}
            </button>
          )}

          {onDesktopSidebarToggle && (
            <button
              onClick={onDesktopSidebarToggle}
              aria-label={isDesktopSidebarOpen ? 'Sidebar gizlət' : 'Sidebar göstər'}
              className={`hidden lg:flex ${TOGGLE_BTN_CLASS}`}
            >
              <svg {...ICON_PROPS}>
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 3v18" />
              </svg>
            </button>
          )}

          <Link href="/" className="group flex items-center gap-2">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-link transition-colors group-hover:bg-blue-40">
              <IconLogo />
            </div>
            <span className="hidden text-base font-bold leading-tight text-primary dark:text-primary-dark sm:block">
              Engineering Curriculum
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <LanguageSelector />
          <a
            target="_blank"
            aria-label="GitHub"
            rel="noopener noreferrer"
            href="https://github.com/hesenv07/engineering-curriculum"
            className={TOGGLE_BTN_CLASS}
          >
            <IconGithub />
          </a>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
