import * as React from 'react';

import type { IIllustrationProps, IIllustrationBlockProps } from './Illustration.types';

export function Illustration({ src, alt, caption, author, authorLink }: IIllustrationProps) {
  return (
    <div className="relative group my-16 mx-0 2xl:mx-auto max-w-4xl 2xl:max-w-6xl">
      <figure className="my-8 flex flex-col items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="rounded-lg"
          style={{ maxHeight: 300 }}
        />
        {caption && (
          <figcaption className="text-center text-secondary dark:text-secondary-dark leading-tight mt-4 text-sm">
            {caption}
          </figcaption>
        )}
      </figure>
      {author && (
        <p className="text-center text-xs text-tertiary dark:text-tertiary-dark mt-1">
          Illustrated by{' '}
          {authorLink ? (
            <a
              href={authorLink}
              target="_blank"
              rel="noreferrer"
              className="text-link dark:text-link-dark"
            >
              {author}
            </a>
          ) : (
            author
          )}
        </p>
      )}
    </div>
  );
}

export function IllustrationBlock({
  author,
  authorLink,
  sequential = false,
  children,
}: IIllustrationBlockProps) {
  const items = React.Children.toArray(children);

  const figures = items.map((child, index) => {
    if (!React.isValidElement(child)) return null;
    const props = child.props as IIllustrationProps;
    return (
      <figure key={index} className="flex-1">
        <div className="bg-white dark:bg-card-dark rounded-lg p-4 flex justify-center items-center my-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={props.src} alt={props.alt} className="text-primary" />
        </div>
        {props.caption && (
          <figcaption className="text-secondary dark:text-secondary-dark text-center leading-tight mt-2 text-sm">
            {props.caption}
          </figcaption>
        )}
      </figure>
    );
  });

  return (
    <div className="relative group my-16 mx-0 2xl:mx-auto max-w-4xl 2xl:max-w-6xl">
      {sequential ? (
        <ol className="flex gap-4">{figures.map((fig, i) => <li key={i} className="flex-1">{fig}</li>)}</ol>
      ) : (
        <div className="flex flex-wrap gap-4">{figures}</div>
      )}
      {author && (
        <p className="text-center text-xs text-tertiary dark:text-tertiary-dark mt-2">
          Illustrated by{' '}
          {authorLink ? (
            <a href={authorLink} target="_blank" rel="noreferrer" className="text-link dark:text-link-dark">
              {author}
            </a>
          ) : author}
        </p>
      )}
    </div>
  );
}
