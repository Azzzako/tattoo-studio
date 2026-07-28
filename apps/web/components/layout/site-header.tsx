'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/cn';

const NAV = [
  { href: '/tatuadores', label: 'Tatuadores' },
  { href: '/eventos', label: 'Eventos' },
  { href: '/estilos', label: 'Estilos' },
  { href: '/proceso', label: 'Proceso' },
] as const;

export function SiteHeader({ className }: { className?: string }) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className,
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" aria-label="Ir al inicio">
          <Logo />
        </Link>
        <nav aria-label="Principal" className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-xs font-medium uppercase tracking-[0.18em] text-ink-300 transition-colors hover:text-gold"
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
                    className="font-display text-3xl text-foreground hover:text-gold"
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