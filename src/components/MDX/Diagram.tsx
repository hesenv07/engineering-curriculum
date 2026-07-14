import * as React from 'react';

interface DiagramProps {
  name: string;
  alt: string;
  height?: number;
  width?: number;
  children?: React.ReactNode; // caption
  captionPosition?: 'top' | 'bottom';
}

export function Diagram({
  name,
  alt,
  height,
  width,
  children,
  captionPosition = 'bottom',
}: DiagramProps) {
  const [imgError, setImgError] = React.useState(false);

  const imgSrc = `/images/docs/diagrams/${name}.png`;

  return (
    <figure className="my-6 text-center">
      {captionPosition === 'top' && children && (
        <figcaption className="text-sm text-[#404756] dark:text-[#99A1B3] italic mb-3">
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
          className="rounded-xl border border-[#EBECF0] dark:border-[#343A46] mx-auto max-w-full"
          onError={() => setImgError(true)}
        />
      ) : (
        /* Fallback: show alt text in a styled box */
        <div
          className="rounded-xl border border-[#EBECF0] dark:border-[#343A46] bg-[#F9FBFC] dark:bg-[#2B3245] mx-auto flex items-center justify-center p-8"
          style={{
            width: width ? Math.min(width, 700) : '100%',
            minHeight: height ? Math.min(height, 300) : 200,
            maxWidth: '100%',
          }}
        >
          <p className="text-sm text-[#404756] dark:text-[#99A1B3] italic max-w-md leading-relaxed">
            {alt}
          </p>
        </div>
      )}

      {captionPosition === 'bottom' && children && (
        <figcaption className="text-sm text-[#404756] dark:text-[#99A1B3] italic mt-3">
          {children}
        </figcaption>
      )}
    </figure>
  );
}
