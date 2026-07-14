import * as React from 'react';

interface IRecapProps {
  children: React.ReactNode;
}

const Recap = ({ children }: IRecapProps) => (
  <section>
    <h2 className="font-display text-2xl font-bold text-primary dark:text-primary-dark mt-10 mb-4 leading-tight">
      Xülasə
    </h2>
    {children}
  </section>
);

export default Recap;
