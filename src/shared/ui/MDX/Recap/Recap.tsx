'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';

import { resolveLocale } from '@/shared/lib/utils/locale';

import type { TLocale } from '@/shared/types';
import type { IRecapProps } from './Recap.types';

const recapLabel: Record<TLocale, string> = {
  az: 'Xülasə',
  en: 'Recap',
};

const Recap = ({ children }: IRecapProps) => {
  const { locale } = useParams<{ locale: string }>();
  const lang = resolveLocale(locale);

  return (
    <section>
      <h2 className="font-display text-2xl font-bold text-primary dark:text-primary-dark mt-10 mb-4 leading-tight">
        {recapLabel[lang]}
      </h2>
      {children}
    </section>
  );
};

export default Recap;
