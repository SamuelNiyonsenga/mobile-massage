'use client';

import { useEffect, useRef } from 'react';

/** Silent looping video behind the hero title. Stays still for visitors who prefer reduced motion. */
export default function HeroVideo({ src, poster }: { src: string; poster: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => {
      if (reduce.matches) v.pause();
      else void v.play().catch(() => undefined);
    };
    apply();
    reduce.addEventListener('change', apply);
    return () => reduce.removeEventListener('change', apply);
  }, []);

  return (
    <video
      ref={ref}
      className="bd__img"
      src={src}
      poster={poster || undefined}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}
