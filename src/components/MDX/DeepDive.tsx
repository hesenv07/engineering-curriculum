import { useState } from 'react';
import * as React from 'react';
import clsx from 'clsx';

import { isMdxTag } from './mdxTag.utils';

interface IDeepDiveProps {
  children: React.ReactNode;
}

const DeepDive = ({ children }: IDeepDiveProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const childArray = React.Children.toArray(children);

  const headingChild = childArray.find(
    (child) => React.isValidElement(child) && isMdxTag(child.type, 'h4'),
  ) as React.ReactElement<{ children?: React.ReactNode; id?: string }> | undefined;

  const rest = childArray.filter((child) => child !== headingChild);

  const titleText = headingChild
    ? String(headingChild.props.children ?? 'Dərinləmə')
    : 'Dərinləmə';

  return (
    <details
      open={isOpen}
      onToggle={(e: React.SyntheticEvent<HTMLDetailsElement>) => {
        setIsOpen(e.currentTarget.open);
      }}
      className="my-12 rounded-2xl shadow-inner-border dark:shadow-inner-border-dark relative bg-purple-5 dark:bg-purple-60/20"
    >
      <summary
        className="list-none p-8"
        tabIndex={-1}
        onClick={(e: React.MouseEvent<HTMLElement>) => {
          if (!(e.target instanceof SVGElement)) {
            e.preventDefault();
          }
        }}
      >
        <h5 className="mb-4 uppercase font-bold flex items-center text-sm text-purple-50 dark:text-purple-30">
          Dərinləmə
        </h5>
        <h4 className="text-xl font-bold text-primary dark:text-primary-dark mb-4">
          {titleText}
        </h4>
        <button
          className={clsx(
            'rounded-lg px-4 py-2 text-sm font-semibold transition-colors text-white',
            'bg-purple-50 hover:bg-purple-40',
          )}
          onClick={() => setIsOpen((v) => !v)}
        >
          {isOpen ? 'Gizlət' : 'Ətraflı göstər'}
        </button>
      </summary>
      <div className="p-8 pt-4 border-t border-purple-10 dark:border-purple-60">
        {rest}
      </div>
    </details>
  );
};

export default DeepDive;
