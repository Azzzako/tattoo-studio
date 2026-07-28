'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * Pantalla de carga de una sola línea. Se monta tras hidratación,
 * reproduce una línea dorada bajo la palabra y se desvanece.
 * Respeta prefers-reduced-motion.
 */
export function LoadingScreen() {
  const [hidden, setHidden] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t = setTimeout(() => setHidden(true), reduced ? 0 : 900);
    return () => clearTimeout(t);
  }, []);

  if (!mounted) return null;

  return (
    <div
      aria-hidden={hidden}
      className={cn(
        'bg-background pointer-events-none fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-500',
        hidden && 'opacity-0',
      )}
    >
      <div className="relative px-6 text-center">
        <p className="font-display text-foreground text-3xl md:text-4xl">Insigne</p>
        <span
          className={cn(
            'bg-gold mt-3 block h-px origin-left',
            hidden ? 'scale-x-100' : 'animate-[line-grow_0.9s_ease-out_forwards]',
          )}
        />
      </div>
    </div>
  );
}
