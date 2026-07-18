import * as React from 'react';

import type { IPackageImportProps } from './PackageImport.types';

type TElementWithMdxName = React.ReactElement & {
  type: { mdxName?: string };
};

function hasMdxName(child: React.ReactNode): child is TElementWithMdxName {
  return (
    React.isValidElement(child) &&
    typeof (child as TElementWithMdxName).type?.mdxName === 'string'
  );
}

const PackageImport = ({ children }: IPackageImportProps) => {
  const allChildren = React.Children.toArray(children);

  const terminal = allChildren.filter(
    (child) => !hasMdxName(child) || child.type.mdxName !== 'pre',
  );

  const code = allChildren.map((child, i) => {
    if (hasMdxName(child) && child.type.mdxName === 'pre') {
      return React.cloneElement(child, { key: i });
    }
    return null;
  });

  return (
    <section className="my-8 grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
      <div className="flex flex-col justify-center">{terminal}</div>
      <div className="flex flex-col justify-center">{code}</div>
    </section>
  );
};

export default PackageImport;
