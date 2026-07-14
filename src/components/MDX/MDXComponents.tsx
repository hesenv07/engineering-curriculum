import * as React from 'react';
import Link from 'next/link';
import { Intro } from './Intro';
import { YouWillLearn } from './YouWillLearn';
import { Recap } from './Recap';
import { Note } from './Note';
import { Pitfall } from './Pitfall';
import { DeepDive } from './DeepDive';
import { Challenges, Solution, Hint } from './Challenges';
import { Diagram } from './Diagram';
import { Sandpack } from './Sandpack';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ə/g, 'e')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ğ/g, 'g')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function getTextContent(node: React.ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getTextContent).join('');
  if (React.isValidElement(node)) {
    return getTextContent((node.props as any).children);
  }
  return '';
}

function HeadingAnchor({ id }: { id: string }) {
  return (
    <a href={`#${id}`} className="heading-anchor opacity-0 group-hover:opacity-100 ml-2 text-[#087EA4] font-normal no-underline transition-opacity" aria-hidden="true">
      #
    </a>
  );
}

function H1({ children, id, ...props }: React.HTMLProps<HTMLHeadingElement>) {
  const text = getTextContent(children);
  const headingId = id || slugify(text);
  return <h1 id={headingId} className="group" {...props}>{children}</h1>;
}

function H2({ children, id, ...props }: React.HTMLProps<HTMLHeadingElement>) {
  const text = getTextContent(children);
  const headingId = id || slugify(text);
  return (
    <h2 id={headingId} className="group" {...props}>
      <a href={`#${headingId}`} className="no-underline text-inherit">{children}</a>
      <HeadingAnchor id={headingId} />
    </h2>
  );
}

function H3({ children, id, ...props }: React.HTMLProps<HTMLHeadingElement>) {
  const text = getTextContent(children);
  const headingId = id || slugify(text);
  return (
    <h3 id={headingId} className="group" {...props}>
      <a href={`#${headingId}`} className="no-underline text-inherit">{children}</a>
      <HeadingAnchor id={headingId} />
    </h3>
  );
}

function H4({ children, id, ...props }: React.HTMLProps<HTMLHeadingElement>) {
  const text = getTextContent(children);
  const headingId = id || slugify(text);
  return <h4 id={headingId} {...props}>{children}</h4>;
}

// Unified Code component: inline vs block detected by className
function Code({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  // Code block (inside pre): has language-* class
  if (className && className.startsWith('language-')) {
    return (
      <code className={`${className} text-[#d4d4d4] font-mono text-sm leading-relaxed`}>
        {children}
      </code>
    );
  }
  // Inline code
  return (
    <code className="bg-[#EDF5FA] dark:bg-[#343A46] text-[#AD1A1A] dark:text-[#FF8080] rounded px-1.5 py-0.5 text-[0.875em] font-mono">
      {children}
    </code>
  );
}

function Pre({ children }: { children: React.ReactNode }) {
  return (
    <pre className="bg-[#23272F] rounded-xl overflow-x-auto mb-4 p-5 text-sm leading-relaxed">
      {children}
    </pre>
  );
}

function CustomLink({
  href,
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href?: string }) {
  if (href && href.startsWith('/')) {
    return (
      <Link href={href} {...(props as any)}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  );
}

function Blockquote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote className="border-l-4 border-[#087EA4] pl-4 italic text-[#404756] dark:text-[#99A1B3] my-4">
      {children}
    </blockquote>
  );
}

export const MDXComponents = {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  code: Code,
  pre: Pre,
  a: CustomLink,
  blockquote: Blockquote,
  // Custom components
  Intro,
  YouWillLearn,
  Recap,
  Note,
  Pitfall,
  DeepDive,
  Challenges,
  Solution,
  Hint,
  Diagram,
  Sandpack,
};
