'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';

import { Link } from '@/i18n/navigation';
import { resolveLocale } from '@/shared/lib/utils/locale';

import type { TLocale } from '@/shared/types';
import type { ILearnMoreProps } from './LearnMore.types';

const readMoreLabel: Record<TLocale, string> = {
  az: 'Daha çox oxu',
  en: 'Read more',
};

const LearnMore = ({ path, title, children }: ILearnMoreProps) => {
  const { locale } = useParams<{ locale: string }>();
  const lang = resolveLocale(locale);

  return (
    <>
      <section className="p-8 mt-16 mb-4 flex flex-row shadow-inner-border dark:shadow-inner-border-dark justify-between items-center bg-card dark:bg-card-dark rounded-2xl">
        <div className="flex-col">
          <h2 className="text-primary dark:text-primary-dark font-display font-bold text-2xl leading-tight mt-0">
            {title}
          </h2>
          <div className="my-3 text-secondary dark:text-secondary-dark">{children}</div>
          {path && (
            <Link
              href={path}
              className="inline-flex items-center gap-1 mt-1 px-4 py-2 rounded-lg bg-link dark:bg-link-dark !text-white text-sm font-semibold hover:opacity-90 transition-opacity !no-underline"
            >
              {readMoreLabel[lang]}
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06z" />
              </svg>
            </Link>
          )}
        </div>
      </section>
      <hr className="border-border dark:border-border-dark mb-14" />
    </>
  );
};

export default LearnMore;
