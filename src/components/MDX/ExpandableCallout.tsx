import * as React from 'react';
import clsx from 'clsx';

type TCalloutType = 'note' | 'pitfall';

interface IExpandableCalloutProps {
  type: TCalloutType;
  children: React.ReactNode;
}

const variantMap: Record<
  TCalloutType,
  { title: string; containerClasses: string; textColor: string }
> = {
  note: {
    title: 'Qeyd',
    containerClasses:
      'bg-green-5 dark:bg-green-60/20 text-primary dark:text-primary-dark text-lg',
    textColor: 'text-green-60 dark:text-green-40',
  },
  pitfall: {
    title: 'Tuzaq',
    containerClasses: 'bg-yellow-5 dark:bg-yellow-60/20',
    textColor: 'text-yellow-50 dark:text-yellow-40',
  },
};

const ExpandableCallout = ({ type, children }: IExpandableCalloutProps) => {
  const variant = variantMap[type];

  return (
    <div
      className={clsx(
        'pt-8 pb-4 px-5 sm:px-8 my-8 relative rounded-none shadow-inner-border -mx-5 sm:mx-auto sm:rounded-2xl',
        variant.containerClasses,
      )}
    >
      <h3 className={clsx('text-2xl font-display font-bold mb-2', variant.textColor)}>
        {variant.title}
      </h3>
      <div className="py-2">{children}</div>
    </div>
  );
};

export default ExpandableCallout;
