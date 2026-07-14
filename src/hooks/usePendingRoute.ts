import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';

const usePendingRoute = () => {
  const { events } = useRouter();
  const [pendingRoute, setPendingRoute] = useState<string | null>(null);
  const currentRoute = useRef<string | null>(null);

  useEffect(() => {
    let routeTransitionTimer: ReturnType<typeof setTimeout> | null = null;

    const handleRouteChangeStart = (url: string) => {
      if (routeTransitionTimer !== null) clearTimeout(routeTransitionTimer);
      routeTransitionTimer = setTimeout(() => {
        if (currentRoute.current !== url) {
          currentRoute.current = url;
          setPendingRoute(url);
        }
      }, 100);
    };

    const handleRouteChangeComplete = () => {
      setPendingRoute(null);
      if (routeTransitionTimer !== null) clearTimeout(routeTransitionTimer);
    };

    events.on('routeChangeStart', handleRouteChangeStart);
    events.on('routeChangeComplete', handleRouteChangeComplete);

    return () => {
      events.off('routeChangeStart', handleRouteChangeStart);
      events.off('routeChangeComplete', handleRouteChangeComplete);
      if (routeTransitionTimer !== null) clearTimeout(routeTransitionTimer);
    };
  }, [events]);

  return pendingRoute;
};

export default usePendingRoute;
