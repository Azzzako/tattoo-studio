'use client';

import * as React from 'react';
import { useParallax, type ParallaxOptions } from '@/lib/animations';
import { cn } from '@/lib/cn';

export interface ParallaxProps extends React.HTMLAttributes<HTMLDivElement> {
  speed?: number;
  axis?: 'y' | 'x';
  options?: ParallaxOptions;
}

/**
 * Parallax con scrub. Aplica la transformación únicamente al
 * elemento hijo directo; los overlays que se posicionen con
 * `absolute` deben quedar fuera de este hijo para no moverse
 * con el scroll.
 */
export function Parallax({ speed, axis, options, className, children, ...props }: ParallaxProps) {
  const innerRef = React.useRef<HTMLDivElement>(null);
  useParallax(innerRef, {
    ...(speed !== undefined ? { speed } : {}),
    ...(axis !== undefined ? { axis } : {}),
    ...options,
  });
  return (
    <div className={cn('relative overflow-hidden', className)} {...props}>
      <div ref={innerRef} className="h-full w-full will-change-transform">
        {children}
      </div>
    </div>
  );
}
