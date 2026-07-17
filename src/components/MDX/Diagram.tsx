'use client';

import { useState } from 'react';
import * as React from 'react';

interface IDiagramProps {
  name: string;
  alt: string;
  height?: number;
  width?: number;
  children?: React.ReactNode;
  captionPosition?: 'top' | 'bottom';
}

const Diagram = ({
  name,
  alt,
  height,
  width,
  children,
  captionPosition = 'bottom',
}: IDiagramProps) => {
  const [lightError, setLightError] = useState(false);
  const [darkError, setDarkError] = useState(false);

  const lightSrc = `/images/docs/diagrams/${name}.svg`;
  const darkSrc = `/images/docs/diagrams/${name}.dark.svg`;

  const hasError = lightError && darkError;

  return (
    <figure className="my-6 text-center">
      {captionPosition === 'top' && children && (
        <figcaption className="text-sm text-secondary dark:text-tertiary-dark italic mb-3">
          {children}
        </figcaption>
      )}

      {!hasError ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightSrc}
            alt={alt}
            width={width}
            height={height}
            className="rounded-xl border border-border dark:border-border-dark mx-auto max-w-full dark:hidden"
            onError={() => setLightError(true)}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={darkError ? lightSrc : darkSrc}
            alt={alt}
            width={width}
            height={height}
            className="rounded-xl border border-border dark:border-border-dark mx-auto max-w-full hidden dark:block"
            onError={() => setDarkError(true)}
          />
        </>
      ) : (
        <div
          className="rounded-xl border border-border dark:border-border-dark bg-card dark:bg-card-dark mx-auto flex items-center justify-center p-8 max-w-full"
          style={{
            width: width ? Math.min(width, 700) : '100%',
            minHeight: height ? Math.min(height, 300) : 200,
          }}
        >
          <p className="text-sm text-secondary dark:text-tertiary-dark italic max-w-md leading-relaxed">
            {alt}
          </p>
        </div>
      )}

      {captionPosition === 'bottom' && children && (
        <figcaption className="text-sm text-secondary dark:text-tertiary-dark italic mt-3">
          {children}
        </figcaption>
      )}
    </figure>
  );
};

export default Diagram;
