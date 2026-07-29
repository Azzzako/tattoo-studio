'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * Pantalla de carga inicial. Se renderiza en SSR como visible
 * para evitar flash post-hidratación, se desvanece tras
 * `document.readyState === 'complete'` o tras un tiempo máximo,
 * y se desmonta al terminar la transición.
 *
 * Respeta `prefers-reduced-motion` y bloquea interacción mientras
 * es visible para evitar clics accidentales.
 */
export function LoadingScreen() {
  const [hidden, setHidden] = useState(false);
  const [unmounted, setUnmounted] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const totalMs = reduced ? 200 : 1200;
    const start = performance.now();
    let timer: ReturnType<typeof setTimeout> | null = null;
    const finish = () => {
      setHidden(true);
      timer = setTimeout(() => setUnmounted(true), 500);
    };
    if (document.readyState === 'complete') {
      const remaining = Math.max(0, totalMs - (performance.now() - start));
      timer = setTimeout(finish, remaining);
    } else {
      const onLoad = () => {
        const remaining = Math.max(0, totalMs - (performance.now() - start));
        timer = setTimeout(finish, remaining);
      };
      window.addEventListener('load', onLoad, { once: true });
      timer = setTimeout(finish, totalMs);
      return () => {
        window.removeEventListener('load', onLoad);
        if (timer) clearTimeout(timer);
      };
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (unmounted) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={!hidden}
      aria-hidden="true"
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
