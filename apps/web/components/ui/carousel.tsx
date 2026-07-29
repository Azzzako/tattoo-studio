'use client';

import useEmblaCarousel from 'embla-carousel-react';
import * as React from 'react';
import { cn } from '@/lib/cn';

export interface CarouselProps {
  children: React.ReactNode;
  options?: Parameters<typeof useEmblaCarousel>[0];
  className?: string;
}

export function Carousel({ children, options, className }: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    ...options,
  });
  const [canPrev, setCanPrev] = React.useState(false);
  const [canNext, setCanNext] = React.useState(false);

  React.useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setCanPrev(emblaApi.canScrollPrev());
      setCanNext(emblaApi.canScrollNext());
    };
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    onSelect();
  }, [emblaApi]);

  return (
    <div className={cn('relative', className)} aria-roledescription="carousel">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">{children}</div>
      </div>
      <button
        type="button"
        aria-label="Anterior"
        onClick={() => emblaApi?.scrollPrev()}
        disabled={!canPrev}
        className="bg-background/80 absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-2 shadow disabled:opacity-30"
      >
        ‹
      </button>
      <button
        type="button"
        aria-label="Siguiente"
        onClick={() => emblaApi?.scrollNext()}
        disabled={!canNext}
        className="bg-background/80 absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 shadow disabled:opacity-30"
      >
        ›
      </button>
    </div>
  );
}

export function CarouselItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn('min-w-0 shrink-0 grow-0 basis-full px-2', className)}
      aria-roledescription="slide"
    >
      {children}
    </div>
  );
}
