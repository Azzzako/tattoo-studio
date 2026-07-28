import Link from 'next/link';
import { ArrowRight, Sparkles, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ImagePlaceholder } from '@/components/ui/image-placeholder';
import { Carousel, CarouselItem } from '@/components/ui/carousel';
import { Marquee } from '@/components/ui/marquee';
import { SectionReveal } from '@/components/animations/section-reveal';

const STYLES = ['Blackwork', 'Fine-line', 'Realismo', 'Color', 'Acuarela', 'Tradicional', 'Dotwork', 'Microrealismo', 'Japonés', 'Geométrico'];
const ARTISTS = [
  { slug: 'inka', name: 'Inka', styles: 'Blackwork · Dotwork', bio: 'Siete años dibujando geometría sobre piel.' },
  { slug: 'mara', name: 'Mara', styles: 'Color · Fine-line', bio: 'Especialista en piezas pequeñas con línea fina.' },
  { slug: 'yael', name: 'Yael', styles: 'Realismo · Microrealismo', bio: 'Retratos que respiran sobre piel.' },
];
const PORTFOLIO = ['inka-1', 'inka-2', 'mara-1', 'yael-1', 'inka-3', 'mara-2'];
const EVENTS = [
  { slug: 'convencion-tinta-2026', title: 'Convención Tinta 2026', city: 'CDMX', date: '30 de agosto' },
  { slug: 'ink-fest-paris', title: 'Ink Fest Paris', city: 'París', date: '15 de octubre' },
];

export default function HomePage() {
  return (
    <main className="flex flex-col">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="container grid gap-12 py-20 md:grid-cols-[1.1fr_1fr] md:py-32">
          <div className="flex flex-col gap-8">
            <Badge variant="default" className="w-fit">
              <Sparkles className="h-3 w-3" />
              Agenda abierta · Semana 5
            </Badge>
            <h1 className="font-display text-6xl leading-[0.95] tracking-tight md:text-[7.5rem]">
              Tinta, <span className="text-gold">historia</span><br />
              y oficio.
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-ink-200 md:text-lg">
              Insigne Tattoo es un estudio independiente en Ciudad de México. Trabajamos contigo en cada decisión,
              desde el trazo hasta la cura final.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/tatuadores/inka/reservar">
                  Reservar cita
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/tatuadores">Ver tatuadores</Link>
              </Button>
            </div>
            <dl className="mt-8 grid grid-cols-3 gap-6 border-t border-border pt-8 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-[0.18em] text-ink-400">Tatuadores</dt>
                <dd className="mt-1 font-display text-3xl text-foreground">8</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.18em] text-ink-400">Años</dt>
                <dd className="mt-1 font-display text-3xl text-foreground">12</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-[0.18em] text-ink-400">Estilos</dt>
                <dd className="mt-1 font-display text-3xl text-foreground">10+</dd>
              </div>
            </dl>
          </div>
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden border border-border">
              <ImagePlaceholder seed="insigne-hero" ratio="4/5" alt="Tatuaje blackwork en antebrazo" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="font-display text-2xl leading-tight text-foreground">
                  Geometría braquial
                </p>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-ink-300">Inka · 6h</p>
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 hidden border border-gold/40 bg-background p-4 md:block glow-gold">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-gold">
                <Star className="h-3.5 w-3.5 fill-gold text-gold" />
                4.9 / 5
              </div>
              <p className="mt-2 max-w-[14rem] text-sm text-ink-200">
                «La atención al detalle es de otro nivel. Salí con algo que nunca olvidaré.»
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-border bg-ink-950">
          <Marquee speed={50}>
            {STYLES.map((style) => (
              <span
                key={style}
                className="font-display text-3xl uppercase tracking-[0.2em] text-ink-300"
              >
                {style} <span className="text-gold">·</span>
              </span>
            ))}
          </Marquee>
        </div>
      </section>

      {/* TATUADORES */}
      <section aria-labelledby="tatuadores" className="border-b border-border py-24">
        <div className="container">
          <div className="mb-12 flex items-end justify-between gap-6">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-gold">Tatuadores</p>
              <h2 id="tatuadores" className="font-display text-5xl md:text-6xl">
                Las manos detrás de la tinta.
              </h2>
            </div>
            <Button asChild variant="ghost" className="hidden gap-2 text-gold hover:text-gold md:inline-flex">
              <Link href="/tatuadores">
                Ver todos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <SectionReveal className="grid gap-8 md:grid-cols-3">
            {ARTISTS.map((artist) => (
              <Link
                key={artist.slug}
                href={`/tatuadores/${artist.slug}`}
                className="group block"
              >
                <div className="relative aspect-[3/4] overflow-hidden border border-border">
                  <ImagePlaceholder
                    seed={`artist-${artist.slug}`}
                    ratio="3/4"
                    overlay="fade"
                    alt={`Retrato de ${artist.name}`}
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <p className="text-xs uppercase tracking-[0.2em] text-gold">{artist.styles}</p>
                    <h3 className="mt-2 font-display text-4xl text-foreground transition-colors group-hover:text-gold">
                      {artist.name}
                    </h3>
                  </div>
                </div>
                <p className="mt-4 text-sm text-ink-300">{artist.bio}</p>
              </Link>
            ))}
          </SectionReveal>
        </div>
      </section>

      {/* PORTAFOLIO */}
      <section aria-labelledby="portafolio" className="border-b border-border bg-ink-950 py-24">
        <div className="container">
          <div className="mb-12 max-w-2xl">
            <p className="mb-2 text-xs uppercase tracking-[0.2em] text-gold">Portafolio</p>
            <h2 id="portafolio" className="font-display text-5xl md:text-6xl">
              Trabajos recientes.
            </h2>
          </div>
          <Carousel className="w-full">
            {PORTFOLIO.map((seed, i) => (
              <CarouselItem key={seed} className="basis-full md:basis-1/2 lg:basis-1/3">
                <div className="relative aspect-[3/4] overflow-hidden border border-border">
                  <ImagePlaceholder seed={`portfolio-${seed}`} ratio="3/4" alt={`Trabajo ${i + 1}`} overlay="fade" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-gold">
                      {ARTISTS[i % ARTISTS.length]?.name}
                    </p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </Carousel>
        </div>
      </section>

      {/* EVENTOS */}
      <section aria-labelledby="eventos" className="border-b border-border py-24">
        <div className="container">
          <div className="mb-12 flex items-end justify-between gap-6">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.2em] text-gold">Eventos</p>
              <h2 id="eventos" className="font-display text-5xl md:text-6xl">
                Convenciones y guest spots.
              </h2>
            </div>
            <Button asChild variant="ghost" className="hidden gap-2 text-gold hover:text-gold md:inline-flex">
              <Link href="/eventos">
                Ver agenda
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {EVENTS.map((event) => (
              <Link
                key={event.slug}
                href={`/eventos/${event.slug}`}
                className="group relative flex flex-col justify-between gap-8 border border-border bg-ink-900 p-8 transition-colors hover:border-gold/50"
              >
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gold">{event.date}</p>
                  <h3 className="mt-4 font-display text-4xl text-foreground transition-colors group-hover:text-gold">
                    {event.title}
                  </h3>
                  <p className="mt-2 text-sm text-ink-300">{event.city}</p>
                </div>
                <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink-400">
                  Conoce a nuestros tatuadores
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container">
          <div className="relative overflow-hidden border border-border bg-ink-950 p-12 md:p-20">
            <div className="divider-gold absolute inset-x-0 top-0 h-px" />
            <div className="divider-gold absolute inset-x-0 bottom-0 h-px" />
            <div className="relative grid gap-8 md:grid-cols-[1.5fr_1fr] md:items-end">
              <div>
                <p className="mb-4 text-xs uppercase tracking-[0.2em] text-gold">¿Listo?</p>
                <h2 className="font-display text-5xl leading-tight md:text-7xl">
                  Reservar con Insigne.
                </h2>
                <p className="mt-6 max-w-xl text-base text-ink-200">
                  Cuéntanos tu idea. Te responderemos en menos de 24 horas para agendar una consulta
                  con el tatuador ideal para tu pieza.
                </p>
              </div>
              <div className="flex flex-col gap-3">
                <Button asChild size="lg">
                  <Link href="/tatuadores/inka/reservar">
                    Iniciar reserva
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/tatuadores">Explorar tatuadores</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}