'use client';

import * as React from 'react';
import { cn } from '@/lib/cn';
import { useStaggerChildren } from '@/lib/animations';

interface SectionRevealProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'section' | 'div' | 'article';
  stagger?: number;
  selector?: string;
}

/**
 * Wrapper que aplica fade-up con stagger a sus hijos directos.
 * Respeta `prefers-reduced-motion`.
 */
export function SectionReveal({
  as: Tag = 'section',
  stagger = 0.08,
  selector = ':scope > *',
  className,
  children,
  ...props
}: SectionRevealProps) {
  const ref = React.useRef<HTMLElement>(null);
  useStaggerChildren(ref, selector, stagger);
  return React.createElement(Tag, { ref, className: cn(className), ...props }, children);
}