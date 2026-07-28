'use client';

import * as React from 'react';
import { useTextReveal, type TextRevealOptions } from '@/lib/animations';
import { cn } from '@/lib/cn';

export interface TextRevealProps extends React.HTMLAttributes<HTMLSpanElement> {
  text: string;
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'div';
  options?: TextRevealOptions;
}

/**
 * Divide el texto en palabras y las anima al entrar en viewport.
 */
export function TextReveal({
  text,
  as: Tag = 'span',
  options,
  className,
  ...props
}: TextRevealProps) {
  const ref = React.useRef<HTMLElement>(null);
  useTextReveal(ref, options);
  return React.createElement(Tag, { ref, className: cn(className), ...props }, text);
}
