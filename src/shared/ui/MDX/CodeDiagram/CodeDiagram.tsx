import * as React from 'react';

import type { ICodeDiagramProps } from './CodeDiagram.types';

const CodeDiagram = ({ flip = false, children }: ICodeDiagramProps) => {
  const allChildren = React.Children.toArray(children);

  const codeChildren = allChildren.filter((child) => {
    if (!React.isValidElement(child)) return false;
    const el = child as React.ReactElement & { type: { mdxName?: string } };
    return el.type?.mdxName === 'pre' || el.type?.mdxName === 'Sandpack';
  });

  const diagramChildren = allChildren.filter((child) => {
    if (!React.isValidElement(child)) return false;
    const el = child as React.ReactElement & { type: { mdxName?: string } };
    return el.type?.mdxName !== 'pre' && el.type?.mdxName !== 'Sandpack';
  });

  const codeBlock = (
    <div className="flex-1 min-w-0">{codeChildren}</div>
  );

  const diagramBlock = (
    <div className="flex-1 flex items-center justify-center min-w-0">
      {diagramChildren}
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start my-6">
      {flip ? (
        <>
          {diagramBlock}
          {codeBlock}
        </>
      ) : (
        <>
          {codeBlock}
          {diagramBlock}
        </>
      )}
    </div>
  );
};

export default CodeDiagram;
