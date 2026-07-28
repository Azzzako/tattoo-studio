'use client';

import * as React from 'react';
import { useCountUp } from '@/lib/animations';
import { cn } from '@/lib/cn';

export interface CountUpProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  to: number;
  duration?: number;
  delay?: number;
  start?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

/**
 * Contador numérico que anima de 0 al valor objetivo al entrar en viewport.
 */
export function CountUp({
  to,
  duration,
  delay,
  start,
  prefix = '',
  suffix = '',
  decimals = 0,
  className,
  ...props
}: CountUpProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const text = useCountUp(ref, {
    to,
    ...(duration !== undefined ? { duration } : {}),
    ...(delay !== undefined ? { delay } : {}),
    ...(start !== undefined ? { start } : {}),
    prefix,
    suffix,
    decimals,
  });
  return (
    <span ref={ref} className={cn(className)} {...props}>
      {text}
    </span>
  );
}
