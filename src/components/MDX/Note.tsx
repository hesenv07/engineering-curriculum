import * as React from 'react';

import ExpandableCallout from './ExpandableCallout';

interface INoteProps {
  children: React.ReactNode;
}

const Note = ({ children }: INoteProps) => (
  <ExpandableCallout type="note">{children}</ExpandableCallout>
);

export default Note;
