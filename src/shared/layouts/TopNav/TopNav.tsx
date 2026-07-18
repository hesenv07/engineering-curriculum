import * as React from 'react';

import IconLogo from '@/shared/resources/icons/svgs/logo';
import IconGithub from '@/shared/resources/icons/svgs/github';
import { Link } from '@/i18n/navigation';

import ThemeToggle from './ui/ThemeToggle';
import LanguageSelector from './ui/LanguageSelector';

interface ITopNavProps {
  isMenuOpen?: boolean;
  onMenuToggle?: () => void;
}

const TopNav = ({ isMenuOpen, onMenuToggle }: ITopNavProps) => {
  return (
    <header className="sticky top-0 z-50 bg-wash dark:bg-wash-dark border-b border-border dark:border-border-dark h-14 flex items-center">
      <div className="flex items-center justify-between w-full px-4 lg:px-6 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-5 dark:hover:bg-gray-80 text-secondary dark:text-secondary-dark"
            aria-label="Menyu"
          >
            {isMenuOpen ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            )}
          </button>

          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-link flex items-center justify-center flex-shrink-0 group-hover:bg-blue-40 transition-colors">
              <IconLogo />
            </div>
            <span className="font-bold text-primary dark:text-primary-dark text-base hidden sm:block leading-tight">
              Engineering Curriculum
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <LanguageSelector />
          <a
            href="https://github.com/hesenv07/engineering-curriculum"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-lg hover:bg-gray-5 dark:hover:bg-gray-80 text-secondary dark:text-secondary-dark transition-colors"
            aria-label="GitHub"
          >
            <IconGithub />
          </a>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
