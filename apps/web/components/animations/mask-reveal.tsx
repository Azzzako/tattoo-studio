'use client';

import * as React from 'react';
import { useMaskReveal, type MaskRevealOptions } from '@/lib/animations';
import { cn } from '@/lib/cn';

export interface MaskRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  options?: MaskRevealOptions;
}

/**
 * Reveal con clip-path animado. Por defecto recorta desde la izquierda.
 */
export function MaskReveal({ options, className, children, ...props }: MaskRevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  useMaskReveal(ref, options);
  return (
    <div ref={ref} className={cn('will-change-[clip-path]', className)} {...props}>
      {children}
    </div>
  );
}
