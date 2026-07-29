'use client';

import { usePathname } from 'next/navigation';
import * as React from 'react';

import { cn } from '@/lib/cn';

/**
 * Loader + barra de progreso para cada navegación de la app.
 *
 * Tres disparadores:
 *   1. Mount inicial → splash con duración mínima de 1.2 s.
 *   2. pathname cambia (`router.push/replace/back`) → client-side nav:
 *      abre, drena hasta 100 % cuando termina el RSC, fade out 350 ms.
 *   3. `beforeunload` + `pageshow` → full-page nav (server `redirect`):
 *      abre en `beforeunload`, cierra en `pageshow` del nuevo documento.
 *
 * Línea dorada: `scaleX(progress/100)` controlado por rAF. Curva de
 * trickle:
 *   0   → 30 % en 150 ms
 *   30  → 70 % en 250 ms
 *   70  → 95 % en 600 ms (ralentiza = "casi listo")
 *   95  → 100 % al evento de cierre.
 *
 * Respeta `prefers-reduced-motion` ajustando el tiempo mínimo de cierre.
 */
export function LoadingScreen() {
  const pathname = usePathname();
  const [phase, setPhase] = React.useState<'hidden' | 'showing' | 'done'>('hidden');
  const [progress, setProgress] = React.useState(0);

  const rafRef = React.useRef<number | null>(null);
  const endTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstPathnameRef = React.useRef(true);

  const cancelLoop = React.useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (endTimerRef.current !== null) {
      clearTimeout(endTimerRef.current);
      endTimerRef.current = null;
    }
  }, []);

  const start = React.useCallback(() => {
    cancelLoop();
    const startedAt = performance.now();
    setPhase('showing');
    setProgress(0);

    const tick = () => {
      const elapsed = performance.now() - startedAt;
      let p: number;
      if (elapsed < 150) {
        p = (elapsed / 150) * 30;
      } else if (elapsed < 400) {
        p = 30 + ((elapsed - 150) / 250) * 40;
      } else if (elapsed < 1000) {
        p = 70 + ((elapsed - 400) / 600) * 25;
      } else {
        p = 95;
      }
      setProgress(p);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [cancelLoop]);

  const finish = React.useCallback(() => {
    cancelLoop();
    setProgress(100);
    setPhase('done');
    endTimerRef.current = setTimeout(() => {
      setPhase('hidden');
      setProgress(0);
      endTimerRef.current = null;
    }, 350);
  }, [cancelLoop]);

  // 1. Splash inicial
  React.useEffect(() => {
    start();
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const minMs = reduced ? 200 : 1200;
    const t = setTimeout(finish, minMs);
    return () => {
      clearTimeout(t);
      cancelLoop();
    };
  }, [start, finish, cancelLoop]);

  // 2. Client-side nav (router.push/replace/back)
  React.useEffect(() => {
    if (firstPathnameRef.current) {
      firstPathnameRef.current = false;
      return;
    }
    start();
    // El RSC + fetch de Next suele resolverse en < 500ms;
    // si termina antes, `pageshow`/`pathname` (siguiente tick) cierra.
    const t = setTimeout(finish, 1500);
    return () => clearTimeout(t);
  }, [pathname, start, finish]);

  // 3. Full-page nav (server `redirect`, recargas, history deep-link)
  React.useEffect(() => {
    const onBeforeUnload = () => {
      start();
    };
    const onPageShow = () => {
      requestAnimationFrame(finish);
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    window.addEventListener('pageshow', onPageShow);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      window.removeEventListener('pageshow', onPageShow);
    };
  }, [start, finish]);

  if (phase === 'hidden') return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy={phase === 'showing'}
      className={cn(
        'bg-background pointer-events-none fixed inset-0 z-[100] flex items-center justify-center transition-opacity duration-300',
        phase === 'done' ? 'opacity-0' : 'opacity-100',
      )}
    >
      <div className="relative px-6 text-center">
        <p className="font-display text-foreground text-3xl md:text-4xl">Insigne</p>
        <div className="bg-ink-800 relative mt-3 h-px w-32 overflow-hidden" aria-hidden="true">
          <span
            className="bg-gold absolute inset-y-0 left-0 block origin-left transition-transform duration-150 ease-out"
            style={{ transform: `scaleX(${Math.max(0, progress / 100)})`, width: '100%' }}
          />
        </div>
        <p
          aria-hidden="true"
          className="text-muted-foreground mt-2 text-[0.65rem] font-medium uppercase tabular-nums tracking-[0.2em]"
        >
          {Math.round(progress)}%
        </p>
      </div>
    </div>
  );
}
