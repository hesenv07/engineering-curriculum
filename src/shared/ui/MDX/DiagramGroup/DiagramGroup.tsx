import * as React from 'react';

import type { IDiagramGroupProps } from './DiagramGroup.types';

const DiagramGroup = ({ children }: IDiagramGroupProps) => (
  <div className="flex flex-col sm:flex-row py-2 sm:space-y-0 justify-center items-start sm:items-center w-full gap-4">
    {children}
  </div>
);

export default DiagramGroup;
