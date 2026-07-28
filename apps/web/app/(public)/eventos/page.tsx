import Link from 'next/link';
import { ArrowRight, Calendar, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ImagePlaceholder } from '@/components/ui/image-placeholder';

const EVENTS = [
  {
    slug: 'convencion-tinta-2026',
    title: 'Convención Tinta 2026',
    city: 'CDMX',
    country: 'México',
    venue: 'Centro de Convenciones Insurgentes',
    date: '30 ago – 1 sep 2026',
    description:
      'Tres días con 80 tatuadores invitados. Inka participa como invitado en el bloque de blackwork.',
    featured: true,
    artists: ['Inka', 'Mara'],
  },
  {
    slug: 'ink-fest-paris',
    title: 'Ink Fest Paris',
    city: 'París',
    country: 'Francia',
    venue: 'Le Grand Rex',
    date: '15 – 17 oct 2026',
    description:
      'Mara participa como guest artist. Agenda limitada abierta solo durante el evento.',
    featured: false,
    artists: ['Mara'],
  },
];

export default function EventsPage() {
  return (
    <div className="container py-20 md:py-28">
      <header className="mx-auto mb-16 max-w-3xl text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold">Eventos</p>
        <h1 className="font-display text-6xl leading-[1] md:text-7xl">
          Convenciones, guest spots y presentaciones.
        </h1>
      </header>

      <div className="grid gap-8">
        {EVENTS.map((event) => (
          <Link
            key={event.slug}
            href={`/eventos/${event.slug}`}
            className="group grid gap-8 border border-border bg-ink-900 p-8 transition-colors hover:border-gold/50 md:grid-cols-[1fr_1.5fr] md:p-12"
          >
            <div className="relative aspect-[4/3] overflow-hidden border border-border md:aspect-[3/4]">
              <ImagePlaceholder seed={`event-${event.slug}`} ratio="3/4" alt={event.title} />
              {event.featured && (
                <Badge variant="default" className="absolute left-4 top-4">
                  Próximamente
                </Badge>
              )}
            </div>
            <div className="flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <p className="text-xs uppercase tracking-[0.2em] text-gold">{event.date}</p>
                <h2 className="font-display text-4xl text-foreground transition-colors group-hover:text-gold md:text-6xl">
                  {event.title}
                </h2>
                <ul className="space-y-1 text-sm text-ink-300">
                  <li className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gold" />
                    {event.venue}, {event.city}, {event.country}
                  </li>
                  <li className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gold" />
                    {event.artists.length} tatuador{event.artists.length > 1 ? 'es' : ''} del estudio
                  </li>
                </ul>
                <p className="font-display text-xl leading-relaxed text-ink-100">
                  {event.description}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4">
                <div className="flex flex-wrap gap-2">
                  {event.artists.map((artist) => (
                    <Badge key={artist} variant="muted">
                      {artist}
                    </Badge>
                  ))}
                </div>
                <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink-400 transition-transform group-hover:translate-x-1 group-hover:text-gold">
                  Ver detalle
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}