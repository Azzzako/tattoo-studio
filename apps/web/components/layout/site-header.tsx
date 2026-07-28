'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/cn';

const NAV = [
  { href: '/tatuadores', label: 'Tatuadores' },
  { href: '/eventos', label: 'Eventos' },
  { href: '/styleguide', label: 'Estilos' },
] as const;

export function SiteHeader({ className }: { className?: string }) {
  const pathname = usePathname();
  const [hidden, setHidden] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const lastY = React.useRef(0);
  const navRefs = React.useRef<Map<string, HTMLAnchorElement>>(new Map());
  const [indicator, setIndicator] = React.useState<{
    left: number;
    width: number;
    opacity: number;
  }>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  React.useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const delta = y - lastY.current;
      if (y < 80) {
        setHidden(false);
      } else if (delta > 6) {
        setHidden(true);
      } else if (delta < -6) {
        setHidden(false);
      }
      setScrolled(y > 8);
      lastY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  React.useEffect(() => {
    const update = () => {
      const active = NAV.find(
        (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
      );
      if (!active) {
        setIndicator((s) => ({ ...s, opacity: 0 }));
        return;
      }
      const el = navRefs.current.get(active.href);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const parent = el.parentElement?.getBoundingClientRect();
      if (!parent) return;
      setIndicator({
        left: rect.left - parent.left,
        width: rect.width,
        opacity: 1,
      });
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [pathname]);

  return (
    <header
      className={cn(
        'bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 border-b backdrop-blur transition-transform duration-300 will-change-transform',
        scrolled ? 'border-border/80' : 'border-transparent',
        hidden && '-translate-y-full',
        className,
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" aria-label="Ir al inicio" className="transition-opacity hover:opacity-80">
          <Logo />
        </Link>
        <nav aria-label="Principal" className="relative hidden items-center gap-8 md:flex">
          <span
            aria-hidden="true"
            className="bg-gold pointer-events-none absolute -bottom-2 h-px transition-all duration-300 ease-out"
            style={{
              transform: `translateX(${indicator.left}px)`,
              width: `${indicator.width}px`,
              opacity: indicator.opacity,
            }}
          />
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              ref={(el) => {
                if (el) navRefs.current.set(item.href, el);
              }}
              className="text-ink-300 hover:text-gold text-xs font-medium uppercase tracking-[0.18em] transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/tatuadores/inka/reservar">Reservar</Link>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Abrir menú" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-sm">
              <div className="flex items-center justify-between">
                <Logo />
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Cerrar menú">
                    <X className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
              </div>
              <nav className="mt-12 flex flex-col gap-6">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="font-display text-foreground hover:text-gold text-3xl"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <Button asChild className="mt-12 w-full">
                <Link href="/tatuadores/inka/reservar">Reservar cita</Link>
              </Button>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
