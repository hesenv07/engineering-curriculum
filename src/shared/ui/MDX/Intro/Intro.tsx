import * as React from 'react';

import type { IIntroProps } from './Intro.types';

const Intro = ({ children }: IIntroProps) => (
  <div className="font-display text-xl text-primary dark:text-primary-dark leading-relaxed">
    {children}
  </div>
);

export default Intro;
