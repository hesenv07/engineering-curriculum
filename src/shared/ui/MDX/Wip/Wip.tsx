import * as React from 'react';

import { ExpandableCallout } from '../ExpandableCallout';

import type { IWipProps } from './Wip.types';

const Wip = ({ children }: IWipProps) => (
  <ExpandableCallout type="wip">{children}</ExpandableCallout>
);

export default Wip;
