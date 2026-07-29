import Link from 'next/link';
import { ArrowRight, Sparkles, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ImagePlaceholder } from '@/components/ui/image-placeholder';
import { Carousel, CarouselItem } from '@/components/ui/carousel';
import { Marquee } from '@/components/ui/marquee';
import { CountUp } from '@/components/animations/count-up';
import { MaskReveal } from '@/components/animations/mask-reveal';
import { Parallax } from '@/components/animations/parallax';
import { TextReveal } from '@/components/animations/text-reveal';

const STYLES = [
  'Blackwork',
  'Fine-line',
  'Realismo',
  'Color',
  'Acuarela',
  'Tradicional',
  'Dotwork',
  'Microrealismo',
  'Japonés',
  'Geométrico',
];

const ARTISTS = [
  {
    slug: 'inka',
    name: 'Inka',
    styles: 'Blackwork · Dotwork',
    bio: 'Siete años dibujando geometría sobre piel.',
  },
  {
    slug: 'mara',
    name: 'Mara',
    styles: 'Color · Fine-line',
    bio: 'Especialista en piezas pequeñas con línea fina.',
  },
  {
    slug: 'yael',
    name: 'Yael',
    styles: 'Realismo · Microrealismo',
    bio: 'Retratos que respiran sobre piel.',
  },
];

const PORTFOLIO = ['inka-1', 'inka-2', 'mara-1', 'yael-1', 'inka-3', 'mara-2'];

const EVENTS = [
  {
    slug: 'convencion-tinta-2026',
    title: 'Convención Tinta 2026',
    city: 'CDMX',
    date: '30 de agosto',
  },
  { slug: 'ink-fest-paris', title: 'Ink Fest Paris', city: 'París', date: '15 de octubre' },
];

export default function HomePage() {
  return (
    <main className="flex flex-col">
      {/* HERO */}
      <section className="border-border relative overflow-hidden border-b">
        <div className="container grid gap-12 py-20 md:grid-cols-[1.1fr_1fr] md:py-32">
          <div className="flex flex-col gap-8">
            <Badge variant="default" className="w-fit">
              <Sparkles className="h-3 w-3 animate-pulse" />
              Agenda abierta · Semana 5
            </Badge>
            <h1 className="font-display text-6xl leading-[0.95] tracking-tight md:text-[7.5rem]">
              <TextReveal as="span" text="Tinta," />
              <br />
              <TextReveal
                as="span"
                text="historia y oficio."
                options={{ delay: 0.15, stagger: 0.06, y: 24 }}
                className="text-gold"
              />
            </h1>
            <TextReveal
              as="p"
              text="Insigne Tattoo es un estudio independiente en Ciudad de México. Trabajamos contigo en cada decisión, desde el trazo hasta la cura final."
              options={{ stagger: 0.02, y: 16, delay: 0.4 }}
              className="text-ink-200 max-w-lg text-base leading-relaxed md:text-lg"
            />
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/tatuadores/inka/reservar">
                  Reservar cita
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/tatuadores">Ver tatuadores</Link>
              </Button>
            </div>
            <dl className="border-border mt-8 grid grid-cols-3 gap-6 border-t pt-8 text-sm">
              <div>
                <dt className="text-ink-400 text-xs uppercase tracking-[0.18em]">Tatuadores</dt>
                <dd className="font-display text-foreground mt-1 text-3xl">
                  <CountUp to={8} duration={1.6} />
                </dd>
              </div>
              <div>
                <dt className="text-ink-400 text-xs uppercase tracking-[0.18em]">Años</dt>
                <dd className="font-display text-foreground mt-1 text-3xl">
                  <CountUp to={12} duration={1.6} delay={0.1} />
                </dd>
              </div>
              <div>
                <dt className="text-ink-400 text-xs uppercase tracking-[0.18em]">Estilos</dt>
                <dd className="font-display text-foreground mt-1 text-3xl">
                  <CountUp to={10} duration={1.6} delay={0.2} suffix="+" />
                </dd>
              </div>
            </dl>
          </div>
          <div className="relative">
            <Parallax speed={0.12} className="relative aspect-[4/5]">
              <MaskReveal
                options={{ duration: 1.4, delay: 0.2 }}
                className="border-border relative h-full w-full overflow-hidden border"
              >
                <ImagePlaceholder
                  seed="insigne-hero"
                  ratio="4/5"
                  alt="Tatuaje blackwork en antebrazo"
                />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="font-display text-foreground text-2xl leading-tight">
                    Geometría braquial
                  </p>
                  <p className="text-ink-300 mt-1 text-xs uppercase tracking-[0.18em]">Inka · 6h</p>
                </div>
              </MaskReveal>
            </Parallax>
            <div className="border-gold/40 bg-background glow-gold absolute -bottom-6 -left-6 hidden border p-4 md:block">
              <div className="text-gold flex items-center gap-2 text-xs uppercase tracking-[0.18em]">
                <Star className="fill-gold text-gold h-3.5 w-3.5" />
                4.9 / 5
              </div>
              <p className="text-ink-200 mt-2 max-w-[14rem] text-sm">
                «La atención al detalle es de otro nivel. Salí con algo que nunca olvidaré.»
              </p>
            </div>
          </div>
        </div>
        <div className="border-border bg-ink-950 border-t">
          <Marquee speed={50}>
            {STYLES.map((style) => (
              <span
                key={style}
                className="font-display text-ink-300 hover:text-gold text-3xl uppercase tracking-[0.2em] transition-colors"
              >
                {style} <span className="text-gold">·</span>
              </span>
            ))}
          </Marquee>
        </div>
      </section>

      {/* TATUADORES */}
      <section aria-labelledby="tatuadores" className="border-border border-b py-24">
        <div className="container">
          <div className="mb-12 flex items-end justify-between gap-6">
            <div>
              <p className="text-gold mb-2 text-xs uppercase tracking-[0.2em]">Tatuadores</p>
              <TextReveal
                as="h2"
                id="tatuadores"
                text="Las manos detrás de la tinta."
                options={{ stagger: 0.04 }}
                className="font-display text-5xl md:text-6xl"
              />
            </div>
            <Button
              asChild
              variant="ghost"
              className="text-gold hover:text-gold hidden gap-2 md:inline-flex"
            >
              <Link href="/tatuadores">
                Ver todos
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {ARTISTS.map((artist) => (
              <Link key={artist.slug} href={`/tatuadores/${artist.slug}`} className="group block">
                <div className="border-border relative aspect-[3/4] overflow-hidden border">
                  <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105">
                    <ImagePlaceholder
                      seed={`artist-${artist.slug}`}
                      ratio="3/4"
                      overlay="fade"
                      alt={`Retrato de ${artist.name}`}
                    />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <p className="text-gold text-xs uppercase tracking-[0.2em] transition-transform duration-500 group-hover:-translate-y-1">
                      {artist.styles}
                    </p>
                    <h3 className="font-display text-foreground group-hover:text-gold mt-2 text-4xl transition-colors duration-500">
                      {artist.name}
                    </h3>
                  </div>
                </div>
                <p className="text-ink-300 mt-4 text-sm">{artist.bio}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* PORTAFOLIO */}
      <section aria-labelledby="portafolio" className="border-border bg-ink-950 border-b py-24">
        <div className="container">
          <div className="mb-12 max-w-2xl">
            <p className="text-gold mb-2 text-xs uppercase tracking-[0.2em]">Portafolio</p>
            <TextReveal
              as="h2"
              id="portafolio"
              text="Trabajos recientes."
              options={{ stagger: 0.04 }}
              className="font-display text-5xl md:text-6xl"
            />
          </div>
          <Carousel className="w-full">
            {PORTFOLIO.map((seed, i) => (
              <CarouselItem key={seed} className="basis-full md:basis-1/2 lg:basis-1/3">
                <div className="border-border group relative aspect-[3/4] overflow-hidden border">
                  <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105">
                    <ImagePlaceholder
                      seed={`portfolio-${seed}`}
                      ratio="3/4"
                      alt={`Trabajo ${i + 1}`}
                      overlay="fade"
                    />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <p className="text-gold text-xs uppercase tracking-[0.2em]">
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
      <section aria-labelledby="eventos" className="border-border border-b py-24">
        <div className="container">
          <div className="mb-12 flex items-end justify-between gap-6">
            <div>
              <p className="text-gold mb-2 text-xs uppercase tracking-[0.2em]">Eventos</p>
              <TextReveal
                as="h2"
                id="eventos"
                text="Convenciones y guest spots."
                options={{ stagger: 0.04 }}
                className="font-display text-5xl md:text-6xl"
              />
            </div>
            <Button
              asChild
              variant="ghost"
              className="text-gold hover:text-gold hidden gap-2 md:inline-flex"
            >
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
                className="border-border bg-ink-900 hover:border-gold/50 group relative flex flex-col justify-between gap-8 border p-8 transition-[color,background-color,border-color,transform] duration-500 hover:-translate-y-1"
              >
                <div>
                  <p className="text-gold text-xs uppercase tracking-[0.2em]">{event.date}</p>
                  <h3 className="font-display text-foreground group-hover:text-gold mt-4 text-4xl transition-colors duration-500 md:text-5xl">
                    {event.title}
                  </h3>
                  <p className="text-ink-300 mt-2 text-sm">{event.city}</p>
                </div>
                <span className="text-ink-400 group-hover:text-gold inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] transition-all duration-500 group-hover:gap-3">
                  Conoce a nuestros tatuadores
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container">
          <div className="border-border bg-ink-950 relative overflow-hidden border p-12 md:p-20">
            <div className="divider-gold absolute inset-x-0 top-0 h-px" />
            <div className="divider-gold absolute inset-x-0 bottom-0 h-px" />
            <div className="relative grid gap-8 md:grid-cols-[1.5fr_1fr] md:items-end">
              <div>
                <p className="text-gold mb-4 text-xs uppercase tracking-[0.2em]">¿Listo?</p>
                <TextReveal
                  as="h2"
                  text="Reservar con Insigne."
                  options={{ stagger: 0.04 }}
                  className="font-display text-5xl leading-tight md:text-7xl"
                />
                <p className="text-ink-200 mt-6 max-w-xl text-base">
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
