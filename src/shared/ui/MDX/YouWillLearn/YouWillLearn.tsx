'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';

import type { TLocale } from '@/shared/types';
import { resolveLocale } from '@/shared/lib/utils/locale';

import type { IYouWillLearnProps } from './YouWillLearn.types';

const titles: Record<TLocale, { default: string; chapter: string }> = {
  az: { default: 'Öyrənəcəksiniz', chapter: 'Bu fəsildə öyrənəcəksiniz' },
  en: { default: 'You will learn', chapter: 'You will learn in this chapter' },
};

const YouWillLearn = ({ children, isChapter }: IYouWillLearnProps) => {
  const { locale } = useParams<{ locale: string }>();
  const lang = resolveLocale(locale);
  const title = isChapter ? titles[lang].chapter : titles[lang].default;

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
