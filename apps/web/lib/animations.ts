'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';

/**
 * Hook para animar la entrada de elementos usando GSAP.
 *
 * Aplica fade + translate desde abajo, respeta `prefers-reduced-motion`
 * (en cuyo caso solo aparece sin animar).
 */
export function useFadeUp(ref: React.RefObject<HTMLElement | null>, delay = 0, distance = 24) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }

    gsap.fromTo(
      el,
      { opacity: 0, y: distance },
      { opacity: 1, y: 0, duration: 0.8, delay, ease: 'power3.out' },
    );

    return () => {
      gsap.killTweensOf(el);
    };
  }, [ref, delay, distance]);
}

/**
 * Hook para animar hijos directos con stagger.
 */
export function useStaggerChildren(
  ref: React.RefObject<HTMLElement | null>,
  selector = ':scope > *',
  stagger = 0.08,
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      gsap.set(el.querySelectorAll(selector), { opacity: 1, y: 0 });
      return;
    }

    gsap.fromTo(
      el.querySelectorAll(selector),
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.7, stagger, ease: 'power3.out' },
    );

    return () => {
      gsap.killTweensOf(el.querySelectorAll(selector));
    };
  }, [ref, selector, stagger]);
}
