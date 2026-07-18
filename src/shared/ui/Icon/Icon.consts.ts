import dynamic from 'next/dynamic';

import BaseIcons from '@/shared/resources/constants/BaseIcons';


function d(path: string) {
  return dynamic<React.SVGProps<SVGSVGElement>>(
    () => import(`@/shared/resources/icons/svgs/${path}`).then((mod) => mod.default),
  );
}

export const IconsMap = Object.fromEntries(
  Object.values(BaseIcons).map((value) => [value, d(value)]),
);
