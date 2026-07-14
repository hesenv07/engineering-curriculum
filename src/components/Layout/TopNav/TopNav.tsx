import * as React from 'react';
import Link from 'next/link';

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
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
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
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
