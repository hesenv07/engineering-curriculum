import * as React from 'react';
import clsx from 'clsx';
import { useRouter } from 'next/router';

type TCalloutType = 'note' | 'pitfall';

interface IExpandableCalloutProps {
  type: TCalloutType;
  children: React.ReactNode;
}

const titles: Record<'az' | 'en', Record<TCalloutType, string>> = {
  az: { note: 'Qeyd', pitfall: 'Diqqət' },
  en: { note: 'Note', pitfall: 'Pitfall' },
};

const variantMap: Record<
  TCalloutType,
  { containerClasses: string; textColor: string }
> = {
  note: {
    containerClasses:
      'bg-green-5 dark:bg-green-60/20 text-primary dark:text-primary-dark text-lg',
    textColor: 'text-green-60 dark:text-green-40',
  },
  pitfall: {
    containerClasses: 'bg-yellow-5 dark:bg-yellow-60/20',
    textColor: 'text-yellow-50 dark:text-yellow-40',
  },
};

const ExpandableCallout = ({ type, children }: IExpandableCalloutProps) => {
  const { locale } = useRouter();
  const lang = (locale === 'en' ? 'en' : 'az') as 'az' | 'en';
  const title = titles[lang][type];
  const variant = variantMap[type];

  return (
    <div
      className={clsx(
        'pt-8 pb-4 px-5 sm:px-8 my-8 relative rounded-none shadow-inner-border -mx-5 sm:mx-auto sm:rounded-2xl',
        variant.containerClasses,
      )}
    >
      <h3 className={clsx('text-2xl font-display font-bold mb-2', variant.textColor)}>
        {title}
      </h3>
      <div className="py-2">{children}</div>
    </div>
  );
};

export default ExpandableCallout;
