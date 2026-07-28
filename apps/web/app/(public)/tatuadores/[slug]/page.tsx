import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Carousel, CarouselItem } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';

interface ArtistPageProps {
  params: { slug: string };
}

export default function ArtistDetailPage({ params }: ArtistPageProps) {
  if (!['inka', 'mara'].includes(params.slug)) notFound();
  const portfolio = [
    '/placeholder-1.svg',
    '/placeholder-2.svg',
    '/placeholder-3.svg',
  ];
  return (
    <article className="container flex flex-col gap-12 py-12">
      <header>
        <p className="text-sm uppercase tracking-wider text-muted-foreground">Tatuador</p>
        <h1 className="font-display text-5xl font-semibold capitalize">{params.slug}</h1>
      </header>
      <Carousel className="w-full">
        {portfolio.map((src, i) => (
          <CarouselItem key={src}>
            <div
              role="img"
              aria-label={`Trabajo ${i + 1}`}
              className="flex aspect-[4/3] w-full items-center justify-center rounded-lg bg-ink-200 dark:bg-ink-800"
            >
              <span className="text-sm text-muted-foreground">Imagen {i + 1}</span>
            </div>
          </CarouselItem>
        ))}
      </Carousel>
      <section className="prose max-w-2xl">
        <h2>Sobre el tatuador</h2>
        <p>Biografía y estilos se renderizarán desde la base de datos.</p>
      </section>
      <Button asChild>
        <Link href={`/tatuadores/${params.slug}/reservar`}>Reservar cita</Link>
      </Button>
    </article>
  );
}