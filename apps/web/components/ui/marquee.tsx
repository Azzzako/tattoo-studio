'use client';

import useEmblaCarousel from 'embla-carousel-react';
import * as React from 'react';
import { cn } from '@/lib/cn';

export interface MarqueeProps {
  children: React.ReactNode;
  speed?: number;
  className?: string;
  pauseOnHover?: boolean;
}

/**
 * Marquee horizontal infinito, accesible y con `prefers-reduced-motion`.
 * A diferencia del carrusel de portafolio, este no tiene foco por item.
 */
export function Marquee({ children, speed = 30, className, pauseOnHover = true }: MarqueeProps) {
  const [ref] = useEmblaCarousel({
    loop: true,
    dragFree: true,
    containScroll: false,
  });
  const [duration, setDuration] = React.useState(speed);

  React.useEffect(() => {
    setDuration(speed);
  }, [speed]);

  return (
    <div
      ref={ref}
      className={cn('group relative w-full overflow-hidden', className)}
      style={{ '--marquee-duration': `${duration}s` } as React.CSSProperties}
      aria-hidden="true"
    >
      <div
        className={cn(
          'flex w-max gap-12',
          pauseOnHover && 'group-hover:[animation-play-state:paused]',
        )}
        style={{
          animation: `marquee var(--marquee-duration) linear infinite`,
        }}
      >
        {children}
        {children}
      </div>
      <style jsx>{`
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}