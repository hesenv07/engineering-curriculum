import * as React from 'react';

import { ExpandableCallout } from '../ExpandableCallout';

import type { INoteProps } from './Note.types';

const Note = ({ children }: INoteProps) => (
  <ExpandableCallout type="note">{children}</ExpandableCallout>
);

export default Note;
