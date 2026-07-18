import * as React from 'react';

import type { IYouTubeIframeProps } from './YouTubeIframe.types';

const YouTubeIframe = ({
  src,
  title = 'YouTube video',
  ...props
}: IYouTubeIframeProps & React.IframeHTMLAttributes<HTMLIFrameElement>) => (
  <div className="relative h-0 overflow-hidden pt-[56.25%] my-6 rounded-xl">
    <iframe
      src={src}
      title={title}
      className="absolute inset-0 w-full h-full rounded-xl"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      {...props}
    />
  </div>
);

export default YouTubeIframe;
