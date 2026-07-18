import * as React from 'react';

import { Link } from '@/i18n/navigation';

import type { IYouWillLearnCardProps } from './YouWillLearnCard.types';

const YouWillLearnCard = ({ path, title, children }: IYouWillLearnCardProps) => (
  <div className="flex flex-col h-full bg-card dark:bg-card-dark shadow-inner-border dark:shadow-inner-border-dark justify-between rounded-2xl pb-8 p-6 xl:p-8 mt-3">
    <div>
      <h4 className="text-primary dark:text-primary-dark font-bold text-2xl leading-tight">
        {title}
      </h4>
      <div className="my-4 text-secondary dark:text-secondary-dark">{children}</div>
    </div>
    <div>
      <Link
        href={path}
        className="inline-flex items-center gap-1 mt-1 px-4 py-2 rounded-lg bg-link dark:bg-link-dark text-white text-sm font-semibold hover:opacity-90 transition-opacity no-underline"
      >
        Daha çox oxu
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <path fillRule="evenodd" d="M6.22 3.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 0 1 0-1.06z" />
        </svg>
      </Link>
    </div>
  </div>
);

export default YouWillLearnCard;
