import * as React from 'react';
import clsx from 'clsx';

import { Link as NextLink } from '@/i18n/navigation';

interface IFooterLinkProps {
  href?: string;
  isHeader?: boolean;
  children: React.ReactNode;
}

const FooterLink = ({ href, isHeader = false, children }: IFooterLinkProps) => {
  const classes = clsx('border-b inline-block border-transparent', {
    'text-sm text-[#23272F] dark:text-[#F6F7F9]': !isHeader,
    'text-md text-[#404756] dark:text-[#99A1B3] my-2 font-bold': isHeader,
    'hover:border-[#EBECF0] dark:hover:border-[#343A46]': !!href,
  });

  if (!href) return <div className={classes}>{children}</div>;

  if (href.startsWith('https://')) {
    return (
      <div>
        <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
          {children}
        </a>
      </div>
    );
  }

  return (
    <div>
      <NextLink href={href} className={classes}>
        {children}
      </NextLink>
    </div>
  );
};

export default FooterLink;
