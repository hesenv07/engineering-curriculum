import * as React from 'react';

import type { IYouWillLearnProps } from './YouWillLearn.types';

const YouWillLearn = ({ children, isChapter }: IYouWillLearnProps) => {
  const title = isChapter ? 'Bu fəsildə öyrənəcəksiniz' : 'Öyrənəcəksiniz';

  return (
    <div className="p-6 xl:p-8 pb-4 xl:pb-6 bg-card dark:bg-card-dark rounded-2xl shadow-inner-border dark:shadow-inner-border-dark text-base text-secondary dark:text-secondary-dark my-8">
      <h3 className="font-display text-primary dark:text-primary-dark mt-0 mb-3 leading-tight text-xl font-bold">
        {title}
      </h3>
      {children}
    </div>
  );
};

export default YouWillLearn;
