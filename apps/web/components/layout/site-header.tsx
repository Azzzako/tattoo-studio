'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/cn';
import { UserMenu } from '@/components/layout/user-menu';

const NAV = [
  { href: '/tatuadores', label: 'Tatuadores' },
  { href: '/eventos', label: 'Eventos' },
  { href: '/styleguide', label: 'Estilos' },
] as const;

export interface HeaderUser {
  email: string;
  displayName: string | null;
  role: 'admin' | 'artist' | 'customer';
  avatarUrl: string | null;
}

export function SiteHeader({ className, user }: { className?: string; user?: HeaderUser | null }) {
  const pathname = usePathname();
  const [hidden, setHidden] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const lastY = React.useRef(0);
  const navRefs = React.useRef<Map<string, HTMLAnchorElement>>(new Map());
  const navContainerRef = React.useRef<HTMLElement>(null);
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
    lastY.current = window.scrollY;
    setScrolled(window.scrollY > 8);

    let frame: number | null = null;
    const onScroll = () => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(() => {
        frame = null;
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
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, []);

  const updateIndicator = React.useCallback(() => {
    const active = NAV.find(
      (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
    );
    if (!active) {
      setIndicator((s) => ({ ...s, opacity: 0 }));
      return;
    }
    const el = navRefs.current.get(active.href);
    if (!el || !navContainerRef.current) return;
    const rect = el.getBoundingClientRect();
    const parent = navContainerRef.current.getBoundingClientRect();
    setIndicator({
      left: rect.left - parent.left,
      width: rect.width,
      opacity: 1,
    });
  }, [pathname]);

  React.useEffect(() => {
    updateIndicator();
    const onResize = () => updateIndicator();
    window.addEventListener('resize', onResize);
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && navContainerRef.current) {
      ro = new ResizeObserver(updateIndicator);
      ro.observe(navContainerRef.current);
    }
    const onFonts = () => updateIndicator();
    if ('fonts' in document) {
      document.fonts.ready.then(onFonts).catch(() => undefined);
    }
    return () => {
      window.removeEventListener('resize', onResize);
      ro?.disconnect();
    };
  }, [updateIndicator]);

  const setNavRef = React.useCallback(
    (href: string) => (el: HTMLAnchorElement | null) => {
      if (el) navRefs.current.set(href, el);
      else navRefs.current.delete(href);
    },
    [],
  );

  return (
    <header
      className={cn(
        'bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 border-b backdrop-blur transition-transform duration-300',
        scrolled ? 'border-border/80' : 'border-transparent',
        hidden && '-translate-y-full',
        className,
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" aria-label="Ir al inicio" className="transition-opacity hover:opacity-80">
          <Logo />
        </Link>
        <nav
          ref={navContainerRef}
          aria-label="Principal"
          className="relative hidden items-center gap-8 md:flex"
        >
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
              ref={setNavRef(item.href)}
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
          {user ? (
            <UserMenu
              email={user.email}
              displayName={user.displayName}
              role={user.role}
              avatarUrl={user.avatarUrl}
            />
          ) : (
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/login">Entrar</Link>
            </Button>
          )}
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
              {!user && (
                <Button asChild variant="outline" className="mt-4 w-full">
                  <Link href="/login">Entrar</Link>
                </Button>
              )}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
