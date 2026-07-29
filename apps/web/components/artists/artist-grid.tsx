'use client';

import { useRef } from 'react';
import { useStaggerChildren } from '@/lib/animations';

export function ArtistGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useStaggerChildren(ref, { stagger: 0.12, distance: 32, start: 'top 80%' });
  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
