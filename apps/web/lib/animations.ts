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

function parseWords(text: string): string[] {
  return text.split(/(\s+)/).filter((part) => part.length > 0);
}

function createWordSpans(text: string, container: HTMLElement): HTMLSpanElement[] {
  const words = parseWords(text);
  const fragment = document.createDocumentFragment();
  const spans: HTMLSpanElement[] = [];
  for (const word of words) {
    if (/^\s+$/.test(word)) {
      fragment.appendChild(document.createTextNode(word));
    } else {
      const span = document.createElement('span');
      span.style.display = 'inline-block';
      span.style.willChange = 'transform, opacity';
      span.textContent = word;
      fragment.appendChild(span);
      spans.push(span);
    }
  }
  container.textContent = '';
  container.appendChild(fragment);
  return spans;
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
 * Anima hijos directos (o selector) con stagger fade-up. Trigger ScrollTrigger.
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
      gsap.set(targets, { opacity: 1, y: 0 });
      return;
    }

    const trigger = ScrollTrigger.create({
      trigger: el,
      start,
      once: true,
      onEnter: () => {
        gsap.fromTo(
          targets,
          { opacity: 0, y: distance },
          { opacity: 1, y: 0, duration, stagger, ease: 'power3.out' },
        );
      },
    });
    return () => {
      trigger.kill();
      gsap.killTweensOf(targets);
    };
  }, [ref, selector, stagger, distance, duration, start]);
}

export interface TextRevealOptions {
  stagger?: number;
  duration?: number;
  start?: string;
  y?: number;
  delay?: number;
}

/**
 * Divide el texto del nodo en palabras y las anima al entrar en viewport.
 * Resetea el nodo a su contenido original al limpiar.
 */
export function useTextReveal(
  ref: React.RefObject<HTMLElement | null>,
  { stagger = 0.04, duration = 0.8, start = 'top 85%', y = 32, delay = 0 }: TextRevealOptions = {},
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    ensurePlugins();
    const original = el.textContent ?? '';
    const spans = createWordSpans(original, el);

    if (prefersReducedMotion()) {
      gsap.set(spans, { opacity: 1, y: 0 });
      return;
    }

    const trigger = ScrollTrigger.create({
      trigger: el,
      start,
      once: true,
      onEnter: () => {
        gsap.fromTo(
          spans,
          { opacity: 0, y },
          { opacity: 1, y: 0, duration, stagger, delay, ease: 'power3.out' },
        );
      },
    });
    return () => {
      trigger.kill();
      gsap.killTweensOf(spans);
      el.textContent = original;
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
 * Si reduced motion, muestra el valor final directamente.
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
    const trigger = ScrollTrigger.create({
      trigger: el,
      start,
      once: true,
      onEnter: () => {
        gsap.to(counter, {
          v: to,
          duration,
          delay,
          ease: 'power2.out',
          onUpdate: () => {
            setValue(parseFloat(counter.v.toFixed(decimals)));
          },
          onComplete: () => {
            setValue(to);
          },
        });
      },
    });
    return () => {
      trigger.kill();
      gsap.killTweensOf(counter);
    };
  }, [ref, to, duration, start, delay, decimals]);

  return `${prefix}${value.toFixed(decimals)}${suffix}`;
}

export interface ParallaxOptions {
  speed?: number;
  axis?: 'y' | 'x';
}

/**
 * Parallax simple basado en scroll. Speed positivo = más rápido, negativo = más lento.
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
 * Reveal con clip-path. El contenedor se recorta desde un lado.
 */
export function useMaskReveal(
  ref: React.RefObject<HTMLElement | null>,
  { start = 'top 85%', duration = 1.1, delay = 0, axis = 'x' }: MaskRevealOptions = {},
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      gsap.set(el, { clipPath: 'inset(0 0% 0 0%)' });
      return;
    }
    ensurePlugins();
    const from = axis === 'x' ? 'inset(0 100% 0 0)' : 'inset(100% 0 0 0)';
    const to = 'inset(0 0% 0 0)';
    gsap.set(el, { clipPath: from });
    const trigger = ScrollTrigger.create({
      trigger: el,
      start,
      once: true,
      onEnter: () => {
        gsap.to(el, { clipPath: to, duration, delay, ease: 'power3.out' });
      },
    });
    return () => {
      trigger.kill();
      gsap.killTweensOf(el);
    };
  }, [ref, start, duration, delay, axis]);
}

/**
 * Hook para limpiar todos los ScrollTriggers de un contenedor.
 */
export function useScrollTriggerCleanup(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    return () => {
      if (!ref.current) return;
      ScrollTrigger.getAll()
        .filter((t) => ref.current?.contains(t.trigger as Node | null))
        .forEach((t) => t.kill());
    };
  }, [ref]);
}
