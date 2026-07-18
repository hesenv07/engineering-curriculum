import * as React from 'react';
import clsx from 'clsx';

import type { ICodeStepProps } from './CodeStep.types';

const STEP_CLASSES: Record<number, string> = {
  1: 'bg-blue-40 border-blue-40 text-blue-60 dark:text-blue-30',
  2: 'bg-yellow-40 border-yellow-40 text-yellow-60 dark:text-yellow-30',
  3: 'bg-purple-40 border-purple-40 text-purple-60 dark:text-purple-30',
  4: 'bg-green-40 border-green-40 text-green-60 dark:text-green-30',
};

const CodeStep = ({ step, children }: ICodeStepProps) => (
  <span
    data-step={step}
    className={clsx(
      'code-step bg-opacity-10 dark:bg-opacity-20 relative rounded px-[6px] py-[1.5px] border-b-[2px] border-opacity-60',
      STEP_CLASSES[step],
    )}
  >
    {children}
  </span>
);

export default CodeStep;
