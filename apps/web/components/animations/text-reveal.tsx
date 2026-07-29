'use client';

import * as React from 'react';
import { useWordReveal, type WordRevealOptions } from '@/lib/animations';
import { cn } from '@/lib/cn';

export interface TextRevealProps extends React.HTMLAttributes<HTMLElement> {
  text: string;
  as?: 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'div';
  options?: WordRevealOptions;
}

/**
 * Renderiza el texto en spans por palabra (declarativo, sin
 * mutar el DOM) y los anima al entrar en viewport. Respeta
 * prefers-reduced-motion y es compatible con `aria-labelledby`.
 */
export function TextReveal({
  text,
  as: Tag = 'span',
  options,
  className,
  id,
  ...props
}: TextRevealProps) {
  const ref = React.useRef<HTMLElement>(null);
  useWordReveal(ref, options);

  const parts = text.split(/(\s+)/);
  return React.createElement(
    Tag,
    { ref, className: cn(className), id, ...props },
    parts.map((part, index) =>
      /^\s+$/.test(part) ? (
        <React.Fragment key={index}>{part}</React.Fragment>
      ) : (
        <span key={index} data-word className="inline-block will-change-transform">
          {part}
        </span>
      ),
    ),
  );
}
