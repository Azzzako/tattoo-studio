# Animaciones

Las animaciones de Insigne Tattoo están construidas sobre **GSAP** + **ScrollTrigger** con un set de hooks de React que respetan `prefers-reduced-motion`.

## Stack

- **gsap**: motor de animaciones.
- **gsap/ScrollTrigger**: animaciones disparadas por scroll.
- **react**: hooks de cliente (`useStaggerChildren`, `useTextReveal`, `useCountUp`, `useParallax`, `useMaskReveal`, `useFadeUp`).
- **TailwindCSS**: utilidades para microinteracciones de hover y transiciones CSS.

## Componentes

| Componente                  | Descripción                                                            |
| --------------------------- | ---------------------------------------------------------------------- |
| `<GsapProvider />`          | Registra plugins, refresca ScrollTrigger en resize y carga de fuentes. |
| `<TextReveal text="..." />` | Divide el texto en palabras y las anima al entrar en viewport.         |
| `<CountUp to={n} />`        | Anima de 0 al valor objetivo al entrar en viewport.                    |
| `<Parallax speed={0.2} />`  | Parallax vertical u horizontal basado en scroll.                       |
| `<MaskReveal />`            | Reveal con clip-path animado (por defecto desde la izquierda).         |
| `<LoadingScreen />`         | Intro de un segundo con línea dorada. Se desvanece tras hidratación.   |

## Hooks (`lib/animations.ts`)

| Hook                             | Uso                                               |
| -------------------------------- | ------------------------------------------------- |
| `useFadeUp(ref, opts?)`          | Fade + translateY desde abajo.                    |
| `useStaggerChildren(ref, opts?)` | Anima hijos con stagger al entrar en viewport.    |
| `useTextReveal(ref, opts?)`      | Split manual de palabras (sin SplitText de pago). |
| `useCountUp(ref, opts?)`         | Hook que devuelve el número actual formateado.    |
| `useParallax(ref, opts?)`        | Parallax con ScrollTrigger scrub.                 |
| `useMaskReveal(ref, opts?)`      | clip-path reveal.                                 |

Todos los hooks:

- Detectan `prefers-reduced-motion` y muestran el estado final sin animar.
- Limpian sus tweens/triggers en el unmount.

## Defaults de GSAP

`GsapProvider` aplica:

```ts
gsap.defaults({ ease: 'power3.out', duration: 0.8 });
```

## Patrones de uso

### Reveal de sección con stagger

```tsx
'use client';
import { useRef } from 'react';
import { useStaggerChildren } from '@/lib/animations';

export function MySection({ children }) {
  const ref = useRef<HTMLDivElement>(null);
  useStaggerChildren(ref, { stagger: 0.08 });
  return <div ref={ref}>{children}</div>;
}
```

### Hero con text reveal y parallax

```tsx
<h1>
  <TextReveal as="span" text="Tinta," />
  <TextReveal as="span" text="historia y oficio." options={{ delay: 0.15 }} className="text-gold" />
</h1>
<Parallax speed={0.15}>
  <img src="/hero.jpg" alt="Tatuaje" />
</Parallax>
```

### Stats con count-up

```tsx
<CountUp to={12} duration={1.6} suffix=" años" />
```

### Hover microinteractions

```tsx
<button className="group/btn">
  Reservar
  <ArrowRight className="transition-transform group-hover/btn:translate-x-0.5" />
</button>
```

## Header

- **Auto-hide** al hacer scroll down, aparece al scroll up.
- **Indicador de ruta activa**: línea dorada de 1px que se desliza al nav item activo.

## Botones

- **Shine effect**: al hover, una capa blanca sesgada con gradiente atraviesa el botón.
- **Glow pulse**: shadow dorado animado en hover para `variant="default"`.

## Cards

- **Image scale**: la imagen hace `scale(1.05)` con `duration-700 ease-out` al hover.
- **Text reveal**: el caption aparece desde abajo (`translate-y-4 → 0`) con fade.
- **Arrow shift**: las flechas hacen `translate-x-1` al hover del grupo.

## Wizard de reserva

- **Step transition**: cada step se anima con `animate-fade-up` al cambiar la key.
- **Items stagger**: los items dentro de cada step aparecen con delay incremental.
- **Día seleccionado** (calendar): pulse dorado al elegir.

## Reduced motion

Toda animación respeta `@media (prefers-reduced-motion: reduce)`. La implementación vive en:

- `lib/animations.ts` (hooks): fallback al estado final.
- `app/globals.css`: reset global de `animation-duration` y `transition-duration`.
- Componentes CSS (`animate-fade-up`): definidos en `tailwind.config.ts`.

## Bundle

- GSAP core: ~25 kB gzip
- ScrollTrigger: ~7 kB gzip
- Total animaciones: ~32 kB gzip

Aceptable para el sitio estático en GitHub Pages.
