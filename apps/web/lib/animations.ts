'use client';

import { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let registered = false;

function ensurePlugins(): void {
  if (typeof window === 'undefined') return;
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return true;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export interface FadeUpOptions {
  delay?: number;
  distance?: number;
  duration?: number;
}

/**
 * Fade + translate desde abajo. Respeta reduced motion.
 */
export function useFadeUp(
  ref: React.RefObject<HTMLElement | null>,
  { delay = 0, distance = 24, duration = 0.8 }: FadeUpOptions = {},
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1, y: 0 });
      return;
    }
    gsap.fromTo(
      el,
      { opacity: 0, y: distance },
      { opacity: 1, y: 0, duration, delay, ease: 'power3.out' },
    );
    return () => {
      gsap.killTweensOf(el);
    };
  }, [ref, delay, distance, duration]);
}

export interface StaggerOptions {
  stagger?: number;
  selector?: string;
  distance?: number;
  duration?: number;
  start?: string;
}

/**
 * Anima hijos directos (o selector) con stagger fade-up al entrar
 * en viewport. Usa gsap.fromTo con scrollTrigger para ser robusto
 * ante scroll restaurado y refreshes.
 */
export function useStaggerChildren(
  ref: React.RefObject<HTMLElement | null>,
  {
    stagger = 0.08,
    selector = ':scope > *',
    distance = 24,
    duration = 0.7,
    start = 'top 85%',
  }: StaggerOptions = {},
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    ensurePlugins();
    const targets = Array.from(el.querySelectorAll<HTMLElement>(selector));
    if (targets.length === 0) return;

    if (prefersReducedMotion()) {
      gsap.set(targets, { opacity: 1, y: 0, clearProps: 'opacity,transform' });
      return;
    }

    const tween = gsap.fromTo(
      targets,
      { opacity: 0, y: distance },
      {
        opacity: 1,
        y: 0,
        duration,
        stagger,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start,
          once: true,
        },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      gsap.set(targets, { clearProps: 'opacity,transform,willChange' });
    };
  }, [ref, selector, stagger, distance, duration, start]);
}

export interface WordRevealOptions {
  stagger?: number;
  duration?: number;
  start?: string;
  y?: number;
  delay?: number;
}

/**
 * Anima los hijos (spans/palabras) del contenedor. El componente
 * es responsable de renderizar los spans declarativamente; este
 * hook solo dispara la animación. Sin mutación imperativa del DOM.
 */
export function useWordReveal(
  ref: React.RefObject<HTMLElement | null>,
  { stagger = 0.04, duration = 0.8, start = 'top 85%', y = 32, delay = 0 }: WordRevealOptions = {},
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    ensurePlugins();
    const words = Array.from(el.querySelectorAll<HTMLElement>('[data-word]'));
    if (words.length === 0) return;

    if (prefersReducedMotion()) {
      gsap.set(words, { opacity: 1, y: 0, clearProps: 'opacity,transform' });
      return;
    }

    const tween = gsap.fromTo(
      words,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        duration,
        stagger,
        delay,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start, once: true },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      gsap.set(words, { clearProps: 'opacity,transform,willChange' });
    };
  }, [ref, stagger, duration, start, y, delay]);
}

export interface CountUpOptions {
  to: number;
  duration?: number;
  start?: string;
  delay?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

/**
 * Anima un contador de 0 al valor objetivo cuando entra en viewport.
 * Devuelve el valor actual formateado. El valor final debe estar
 * presente en SSR (semánticamente) vía el atributo `data-final`.
 */
export function useCountUp(
  ref: React.RefObject<HTMLElement | null>,
  {
    to,
    duration = 1.8,
    start = 'top 85%',
    delay = 0,
    prefix = '',
    suffix = '',
    decimals = 0,
  }: CountUpOptions,
) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      setValue(to);
      return;
    }
    ensurePlugins();
    const counter = { v: 0 };
    const tween = gsap.to(counter, {
      v: to,
      duration,
      delay,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start, once: true },
      onUpdate: () => {
        setValue(parseFloat(counter.v.toFixed(decimals)));
      },
      onComplete: () => {
        setValue(to);
      },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      gsap.killTweensOf(counter);
    };
  }, [ref, to, duration, start, delay, decimals]);

  return {
    current: `${prefix}${value.toFixed(decimals)}${suffix}`,
    final: `${prefix}${to.toFixed(decimals)}${suffix}`,
  };
}

export interface ParallaxOptions {
  speed?: number;
  axis?: 'y' | 'x';
}

/**
 * Parallax con scrub. El elemento con ref se mueve dentro del
 * rango visible del padre.
 */
export function useParallax(
  ref: React.RefObject<HTMLElement | null>,
  { speed = 0.2, axis = 'y' }: ParallaxOptions = {},
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;
    ensurePlugins();
    const tween = gsap.fromTo(
      el,
      { [axis === 'y' ? 'yPercent' : 'xPercent']: -speed * 100 },
      {
        [axis === 'y' ? 'yPercent' : 'xPercent']: speed * 100,
        ease: 'none',
        scrollTrigger: {
          trigger: el.parentElement ?? el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      },
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [ref, speed, axis]);
}

export interface MaskRevealOptions {
  start?: string;
  duration?: number;
  delay?: number;
  axis?: 'x' | 'y';
}

/**
 * Reveal con clip-path. Se aplica vía scrollTrigger.fromTo.
 */
export function useMaskReveal(
  ref: React.RefObject<HTMLElement | null>,
  { start = 'top 85%', duration = 1.1, delay = 0, axis = 'x' }: MaskRevealOptions = {},
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.style.clipPath = 'inset(0 0% 0 0%)';
      return;
    }
    ensurePlugins();
    const from = axis === 'x' ? 'inset(0 100% 0 0)' : 'inset(100% 0 0 0)';
    const to = 'inset(0 0% 0 0)';
    el.style.clipPath = from;
    const tween = gsap.to(el, {
      clipPath: to,
      duration,
      delay,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start, once: true },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      el.style.clipPath = to;
    };
  }, [ref, start, duration, delay, axis]);
}
