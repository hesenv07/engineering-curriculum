import * as React from 'react';
import Link from 'next/link';

import DeepDive from './DeepDive';
import Diagram from './Diagram';
import Intro from './Intro';
import Note from './Note';
import Pitfall from './Pitfall';
import Recap from './Recap';
import Sandpack from './Sandpack';
import YouWillLearn from './YouWillLearn';
import { Challenges, Hint, Solution } from './Challenges';

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
    return getTextContent((node.props as { children: React.ReactNode }).children);
  }
  return '';
}

function HeadingAnchor({ id }: { id: string }) {
  return (
    <a
      href={`#${id}`}
      className="heading-anchor opacity-0 group-hover:opacity-100 ml-2 text-link font-normal no-underline transition-opacity"
      aria-hidden="true"
    >
      #
    </a>
  );
}

function H1({ children, id, ...props }: React.HTMLProps<HTMLHeadingElement>) {
  const text = getTextContent(children);
  const headingId = id || slugify(text);
  return (
    <h1 id={headingId} className="group" {...props}>
      {children}
    </h1>
  );
}

function H2({ children, id, ...props }: React.HTMLProps<HTMLHeadingElement>) {
  const text = getTextContent(children);
  const headingId = id || slugify(text);
  return (
    <h2 id={headingId} className="group" {...props}>
      <a href={`#${headingId}`} className="no-underline text-inherit">
        {children}
      </a>
      <HeadingAnchor id={headingId} />
    </h2>
  );
}

function H3({ children, id, ...props }: React.HTMLProps<HTMLHeadingElement>) {
  const text = getTextContent(children);
  const headingId = id || slugify(text);
  return (
    <h3 id={headingId} className="group" {...props}>
      <a href={`#${headingId}`} className="no-underline text-inherit">
        {children}
      </a>
      <HeadingAnchor id={headingId} />
    </h3>
  );
}

function H4({ children, id, ...props }: React.HTMLProps<HTMLHeadingElement>) {
  const text = getTextContent(children);
  const headingId = id || slugify(text);
  return (
    <h4 id={headingId} {...props}>
      {children}
    </h4>
  );
}

function P(props: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className="whitespace-pre-wrap my-4" {...props} />;
}

function Strong(props: React.HTMLAttributes<HTMLElement>) {
  return <strong className="font-bold" {...props} />;
}

function OL(props: React.HTMLAttributes<HTMLOListElement>) {
  return <ol className="ms-6 my-3 list-decimal" {...props} />;
}

function UL(props: React.HTMLAttributes<HTMLUListElement>) {
  return <ul className="ms-6 my-3 list-disc" {...props} />;
}

function LI(props: React.HTMLAttributes<HTMLLIElement>) {
  return <li className="leading-relaxed mb-1" {...props} />;
}

function Divider() {
  return <hr className="my-6 block border-b border-t-0 border-border dark:border-border-dark" />;
}

function Code({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  if (className && className.startsWith('language-')) {
    return (
      <code className={`${className} text-[#d4d4d4] font-mono text-sm leading-relaxed`}>
        {children}
      </code>
    );
  }
  return (
    <code className="bg-blue-5 dark:bg-card-dark text-red-40 dark:text-red-30 rounded px-1.5 py-0.5 text-[0.875em] font-mono">
      {children}
    </code>
  );
}

function Pre({ children }: { children: React.ReactNode }) {
  return (
    <pre className="bg-wash-dark rounded-xl overflow-x-auto mb-4 p-5 text-sm leading-relaxed">
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
      <Link href={href} {...props}>
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
    <blockquote className="py-4 px-8 my-8 shadow-inner-border dark:shadow-inner-border-dark bg-highlight dark:bg-highlight-dark rounded-2xl leading-6 flex relative border-0">
      <span className="block relative">{children}</span>
    </blockquote>
  );
}

export const MDXComponents = {
  p: P,
  strong: Strong,
  ol: OL,
  ul: UL,
  li: LI,
  hr: Divider,
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  code: Code,
  pre: Pre,
  a: CustomLink,
  blockquote: Blockquote,
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

for (const key of Object.keys(MDXComponents)) {
  const component = MDXComponents[key as keyof typeof MDXComponents];
  if (typeof component === 'function') {
    (component as { mdxName?: string }).mdxName = key;
  }
}
