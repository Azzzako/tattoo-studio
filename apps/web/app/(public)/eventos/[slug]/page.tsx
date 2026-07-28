import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ImagePlaceholder } from '@/components/ui/image-placeholder';

interface EventPageProps {
  params: { slug: string };
}

const EVENTS: Record<
  string,
  {
    title: string;
    city: string;
    country: string;
    venue: string;
    date: string;
    description: string;
    artists: Array<{ slug: string; name: string; styles: string[] }>;
    address: string;
  }
> = {
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
      <header className="border-border relative overflow-hidden border-b">
        <div className="container grid gap-12 py-16 md:grid-cols-[1.2fr_1fr] md:py-24">
          <div className="flex flex-col gap-6">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-ink-400 hover:text-gold w-fit gap-2 px-0"
            >
              <Link href="/eventos">
                <ArrowLeft className="h-3.5 w-3.5" />
                Todos los eventos
              </Link>
            </Button>
            <p className="text-gold text-xs uppercase tracking-[0.2em]">{event.date}</p>
            <h1 className="font-display text-6xl leading-[0.95] md:text-7xl">{event.title}</h1>
            <ul className="text-ink-300 space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <MapPin className="text-gold h-4 w-4" />
                {event.venue}, {event.city}, {event.country}
              </li>
              <li className="flex items-center gap-2">
                <Calendar className="text-gold h-4 w-4" />
                Apertura de puertas 11:00 · cierre 21:00
              </li>
            </ul>
            <p className="text-ink-200 max-w-xl text-base leading-relaxed">{event.description}</p>
          </div>
          <div className="relative">
            <div className="border-border relative aspect-[4/5] overflow-hidden border">
              <ImagePlaceholder seed={`event-hero-${params.slug}`} ratio="4/5" alt={event.title} />
            </div>
          </div>
        </div>
      </header>

      <section aria-labelledby="artistas" className="border-border border-b py-20">
        <div className="container">
          <p className="text-gold text-xs uppercase tracking-[0.2em]">Tatuadores</p>
          <h2 id="artistas" className="font-display mb-10 mt-3 text-4xl">
            Del estudio en {event.title}.
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {event.artists.map((artist) => (
              <Link
                key={artist.slug}
                href={`/tatuadores/${artist.slug}`}
                className="border-border bg-ink-900 hover:border-gold/50 group flex flex-col gap-4 border p-6 transition-colors"
              >
                <div className="flex flex-wrap gap-2">
                  {artist.styles.map((style) => (
                    <Badge key={style} variant="default">
                      {style}
                    </Badge>
                  ))}
                </div>
                <h3 className="font-display text-foreground group-hover:text-gold text-3xl transition-colors">
                  {artist.name}
                </h3>
                <p className="text-ink-300 text-sm">Reservar guest spot en este evento.</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="ubicacion" className="py-20">
        <div className="container grid gap-12 md:grid-cols-2">
          <div>
            <p className="text-gold text-xs uppercase tracking-[0.2em]">Ubicación</p>
            <h2 id="ubicacion" className="font-display mt-3 text-4xl">
              {event.venue}
            </h2>
            <p className="text-ink-300 mt-4 max-w-md text-sm">{event.address}</p>
          </div>
          <div className="border-border bg-ink-900 relative aspect-[4/3] overflow-hidden border">
            <ImagePlaceholder
              seed={`event-map-${params.slug}`}
              ratio="4/3"
              alt="Mapa del evento"
              overlay="none"
            />
          </div>
        </div>
      </section>
    </article>
  );
}
