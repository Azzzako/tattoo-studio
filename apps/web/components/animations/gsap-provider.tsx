'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect } from 'react';

/**
 * Provider que registra plugins de GSAP, refresca ScrollTrigger
 * tras eventos que afectan el layout (resize, fonts loaded) y
 * configura defaults para alinear con la identidad.
 */
export function GsapProvider() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);
    gsap.defaults({ ease: 'power3.out', duration: 0.8 });

    const triggerRefresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', triggerRefresh);
    if ('fonts' in document) {
      document.fonts.ready.then(triggerRefresh).catch(() => undefined);
    }
    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const onResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(triggerRefresh, 150);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('load', triggerRefresh);
      window.removeEventListener('resize', onResize);
      if (resizeTimer) clearTimeout(resizeTimer);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return null;
}
