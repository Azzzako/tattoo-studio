import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ImagePlaceholder } from '@/components/ui/image-placeholder';

interface EventPageProps {
  params: { slug: string };
}

const EVENTS: Record<string, {
  title: string;
  city: string;
  country: string;
  venue: string;
  date: string;
  description: string;
  artists: Array<{ slug: string; name: string; styles: string[] }>;
  address: string;
}> = {
  'convencion-tinta-2026': {
    title: 'Convención Tinta 2026',
    city: 'CDMX',
    country: 'México',
    venue: 'Centro de Convenciones Insurgentes',
    date: '30 ago – 1 sep 2026',
    description:
      'La convención de tatuajes más grande de México. Tres días con 80 tatuadores internacionales, conciertos y talleres. Inka participa como invitado en el bloque de blackwork el sábado 31 de agosto.',
    artists: [
      { slug: 'inka', name: 'Inka', styles: ['Blackwork'] },
      { slug: 'mara', name: 'Mara', styles: ['Color'] },
    ],
    address: 'Av. Insurgentes Sur 1234, Del Valle, 03100 CDMX',
  },
  'ink-fest-paris': {
    title: 'Ink Fest Paris',
    city: 'París',
    country: 'Francia',
    venue: 'Le Grand Rex',
    date: '15 – 17 oct 2026',
    description:
      'Festival europeo dedicado al tatuaje contemporáneo. Mara participa como guest artist en la sección de color y fine-line.',
    artists: [{ slug: 'mara', name: 'Mara', styles: ['Color', 'Fine-line'] }],
    address: '1 Bd Poissonnière, 75002 Paris, Francia',
  },
};

export default function EventDetailPage({ params }: EventPageProps) {
  const event = EVENTS[params.slug];
  if (!event) notFound();

  return (
    <article>
      <header className="relative overflow-hidden border-b border-border">
        <div className="container grid gap-12 py-16 md:grid-cols-[1.2fr_1fr] md:py-24">
          <div className="flex flex-col gap-6">
            <Button asChild variant="ghost" size="sm" className="w-fit gap-2 px-0 text-ink-400 hover:text-gold">
              <Link href="/eventos">
                <ArrowLeft className="h-3.5 w-3.5" />
                Todos los eventos
              </Link>
            </Button>
            <p className="text-xs uppercase tracking-[0.2em] text-gold">{event.date}</p>
            <h1 className="font-display text-6xl leading-[0.95] md:text-7xl">{event.title}</h1>
            <ul className="space-y-2 text-sm text-ink-300">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gold" />
                {event.venue}, {event.city}, {event.country}
              </li>
              <li className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gold" />
                Apertura de puertas 11:00 · cierre 21:00
              </li>
            </ul>
            <p className="max-w-xl text-base leading-relaxed text-ink-200">{event.description}</p>
          </div>
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden border border-border">
              <ImagePlaceholder seed={`event-hero-${params.slug}`} ratio="4/5" alt={event.title} />
            </div>
          </div>
        </div>
      </header>

      <section aria-labelledby="artistas" className="border-b border-border py-20">
        <div className="container">
          <p className="text-xs uppercase tracking-[0.2em] text-gold">Tatuadores</p>
          <h2 id="artistas" className="mt-3 mb-10 font-display text-4xl">
            Del estudio en {event.title}.
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {event.artists.map((artist) => (
              <Link
                key={artist.slug}
                href={`/tatuadores/${artist.slug}`}
                className="group flex flex-col gap-4 border border-border bg-ink-900 p-6 transition-colors hover:border-gold/50"
              >
                <div className="flex flex-wrap gap-2">
                  {artist.styles.map((style) => (
                    <Badge key={style} variant="default">
                      {style}
                    </Badge>
                  ))}
                </div>
                <h3 className="font-display text-3xl text-foreground transition-colors group-hover:text-gold">
                  {artist.name}
                </h3>
                <p className="text-sm text-ink-300">Reservar guest spot en este evento.</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="ubicacion" className="py-20">
        <div className="container grid gap-12 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-gold">Ubicación</p>
            <h2 id="ubicacion" className="mt-3 font-display text-4xl">
              {event.venue}
            </h2>
            <p className="mt-4 max-w-md text-sm text-ink-300">{event.address}</p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden border border-border bg-ink-900">
            <ImagePlaceholder seed={`event-map-${params.slug}`} ratio="4/3" alt="Mapa del evento" overlay="none" />
          </div>
        </div>
      </section>
    </article>
  );
}