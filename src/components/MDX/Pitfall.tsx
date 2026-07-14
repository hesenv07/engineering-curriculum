import * as React from 'react';

import ExpandableCallout from './ExpandableCallout';

interface IPitfallProps {
  children: React.ReactNode;
}

const Pitfall = ({ children }: IPitfallProps) => (
  <ExpandableCallout type="pitfall">{children}</ExpandableCallout>
);

export default Pitfall;
