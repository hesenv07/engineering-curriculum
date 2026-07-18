import * as React from 'react';

import { ExpandableCallout } from '../ExpandableCallout';

import type { IPitfallProps } from './Pitfall.types';

const Pitfall = ({ children }: IPitfallProps) => (
  <ExpandableCallout type="pitfall">{children}</ExpandableCallout>
);

export default Pitfall;
