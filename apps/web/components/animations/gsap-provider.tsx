'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect } from 'react';

/**
 * Provider que registra plugins de GSAP y refresca ScrollTrigger
 * tras eventos del navegador que afectan el layout (resize, fonts loaded).
 */
export function GsapProvider() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);
    const triggerRefresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', triggerRefresh);
    if ('fonts' in document) {
      document.fonts.ready.then(triggerRefresh).catch(() => undefined);
    }
    return () => {
      window.removeEventListener('load', triggerRefresh);
      ScrollTrigger.killAll();
    };
  }, []);

  return null;
}