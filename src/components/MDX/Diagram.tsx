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
  const [imgError, setImgError] = useState(false);

  const imgSrc = `/images/docs/diagrams/${name}.svg`;

  return (
    <figure className="my-6 text-center">
      {captionPosition === 'top' && children && (
        <figcaption className="text-sm text-secondary dark:text-tertiary-dark italic mb-3">
          {children}
        </figcaption>
      )}

      {!imgError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imgSrc}
          alt={alt}
          width={width}
          height={height}
          className="rounded-xl border border-border dark:border-border-dark mx-auto max-w-full"
          onError={() => setImgError(true)}
        />
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
