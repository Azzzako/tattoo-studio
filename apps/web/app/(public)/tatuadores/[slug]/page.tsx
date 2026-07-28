import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Globe, Instagram, MapPin, Twitter, Youtube } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselItem } from '@/components/ui/carousel';
import { ImagePlaceholder } from '@/components/ui/image-placeholder';
import { PortfolioItem } from '@/components/portfolio/portfolio-item';
import { MaskReveal } from '@/components/animations/mask-reveal';
import { TextReveal } from '@/components/animations/text-reveal';

interface ArtistPageProps {
  params: { slug: string };
}

const ARTISTS: Record<
  string,
  {
    name: string;
    headline: string;
    bio: string;
    longBio: string;
    styles: string[];
    location: string;
    experience: number;
    socials: Array<{ network: 'instagram' | 'twitter' | 'youtube' | 'website'; url: string }>;
    services: Array<{ name: string; duration: string; price: string }>;
    portfolio: string[];
  }
> = {
  inka: {
    name: 'Inka',
    headline: 'Geometría con intención.',
    bio: 'Siete años tatuando líneas que sobreviven al tiempo. Piezas geométricas y mandalas contemporáneos.',
    longBio:
      'Inka descubrió el tatuaje mientras estudiaba arquitectura. Esa formación se nota en cada pieza: precisión milimétrica, composición limpia y respeto por los ritmos naturales del cuerpo. Su trabajo se mueve entre la geometría sagrada, el blackwork denso y las composiciones contemporáneas que dialogan con el espacio negativo.',
    styles: ['Blackwork', 'Dotwork', 'Geometría'],
    location: 'CDMX',
    experience: 7,
    socials: [
      { network: 'instagram', url: '#' },
      { network: 'twitter', url: '#' },
      { network: 'youtube', url: '#' },
      { network: 'website', url: '#' },
    ],
    services: [
      { name: 'Consulta + diseño', duration: '45 min', price: 'Gratis' },
      { name: 'Sesión corta', duration: '2 h', price: 'Desde $2,500 MXN' },
      { name: 'Sesión larga', duration: '5 h', price: 'Desde $6,000 MXN' },
    ],
    portfolio: ['inka-1', 'inka-2', 'inka-3', 'inka-4', 'inka-5', 'inka-6'],
  },
  mara: {
    name: 'Mara',
    headline: 'Acuarela que respira.',
    bio: 'Especialista en piezas pequeñas con línea fina y composiciones botánicas en acuarela.',
    longBio:
      'Mara viene del mundo de la ilustración botánica. Eso se traduce en tatuajes con líneas finas, vibrantes pero contenidas, donde cada color respira. Trabaja especialmente composiciones inspiradas en flora y fauna local.',
    styles: ['Color', 'Fine-line', 'Acuarela'],
    location: 'CDMX',
    experience: 5,
    socials: [
      { network: 'instagram', url: '#' },
      { network: 'twitter', url: '#' },
    ],
    services: [
      { name: 'Consulta + diseño', duration: '30 min', price: 'Gratis' },
      { name: 'Sesión corta', duration: '1.5 h', price: 'Desde $1,800 MXN' },
      { name: 'Sesión estándar', duration: '3 h', price: 'Desde $3,500 MXN' },
    ],
    portfolio: ['mara-1', 'mara-2', 'mara-3', 'mara-4'],
  },
  yael: {
    name: 'Yael',
    headline: 'Retratos sobre piel.',
    bio: 'Retratos familiares y piezas que buscan capturar un instante, no una pose.',
    longBio:
      'Yael lleva casi una década tatuando retratos que respiran. Su trabajo es técnico, paciente y profundamente humano: cada pieza es una conversación que puede durar meses antes de tocar la piel.',
    styles: ['Realismo', 'Microrealismo'],
    location: 'CDMX',
    experience: 9,
    socials: [
      { network: 'instagram', url: '#' },
      { network: 'youtube', url: '#' },
    ],
    services: [
      { name: 'Consulta', duration: '60 min', price: 'Gratis' },
      { name: 'Sesión estándar', duration: '4 h', price: 'Desde $5,500 MXN' },
    ],
    portfolio: ['yael-1', 'yael-2', 'yael-3'],
  },
};

const SOCIAL_ICONS = {
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
  website: Globe,
};

export function generateStaticParams() {
  return Object.keys(ARTISTS).map((slug) => ({ slug }));
}

export default function ArtistDetailPage({ params }: ArtistPageProps) {
  const artist = ARTISTS[params.slug];
  if (!artist) notFound();

  return (
    <article>
      <header className="border-border relative overflow-hidden border-b">
        <div className="container grid gap-12 py-16 md:grid-cols-[1.1fr_1fr] md:py-24">
          <div className="flex flex-col gap-6">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-ink-400 hover:text-gold w-fit gap-2 px-0"
            >
              <Link href="/tatuadores">
                <ArrowLeft className="h-3.5 w-3.5" />
                Todos los tatuadores
              </Link>
            </Button>
            <p className="text-gold text-xs uppercase tracking-[0.2em]">
              {artist.styles.join(' · ')}
            </p>
            <TextReveal
              as="h1"
              text={artist.name}
              options={{ stagger: 0.06 }}
              className="font-display text-6xl leading-[0.95] md:text-8xl"
            />
            <TextReveal
              as="p"
              text={artist.headline}
              options={{ stagger: 0.04, delay: 0.2, y: 16 }}
              className="font-display text-ink-200 text-3xl"
            />
            <p className="text-ink-300 max-w-xl text-base leading-relaxed">{artist.bio}</p>
            <dl className="border-border mt-4 flex flex-wrap gap-6 border-t pt-6 text-sm">
              <div>
                <dt className="text-ink-400 text-xs uppercase tracking-[0.18em]">Ciudad</dt>
                <dd className="text-ink-100 mt-1 flex items-center gap-2">
                  <MapPin className="text-gold h-3.5 w-3.5" />
                  {artist.location}
                </dd>
              </div>
              <div>
                <dt className="text-ink-400 text-xs uppercase tracking-[0.18em]">Años tatuando</dt>
                <dd className="text-ink-100 mt-1">{artist.experience}</dd>
              </div>
              <div>
                <dt className="text-ink-400 text-xs uppercase tracking-[0.18em]">Agenda</dt>
                <dd className="text-ink-100 mt-1 flex items-center gap-2">
                  <Calendar className="text-gold h-3.5 w-3.5" />
                  Cierra en ~3 semanas
                </dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-3 pt-4">
              {artist.socials.map((social) => {
                const Icon = SOCIAL_ICONS[social.network];
                return (
                  <Button
                    key={social.network}
                    asChild
                    variant="outline"
                    size="sm"
                    className="gap-2 capitalize"
                  >
                    <a href={social.url} rel="noreferrer" target="_blank">
                      <Icon className="h-3.5 w-3.5" />
                      {social.network}
                    </a>
                  </Button>
                );
              })}
              <Button asChild size="sm">
                <Link href={`/tatuadores/${params.slug}/reservar`}>Reservar con {artist.name}</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <MaskReveal
              options={{ duration: 1.4 }}
              className="border-border relative aspect-[4/5] overflow-hidden border"
            >
              <ImagePlaceholder
                seed={`artist-hero-${params.slug}`}
                ratio="4/5"
                alt={`Retrato editorial de ${artist.name}`}
              />
            </MaskReveal>
          </div>
        </div>
      </header>

      <section aria-labelledby="bio" className="border-border border-b py-20">
        <div className="container grid gap-12 md:grid-cols-[1fr_2fr]">
          <div>
            <p className="text-gold text-xs uppercase tracking-[0.2em]">Bio</p>
            <h2 id="bio" className="font-display mt-3 text-4xl">
              Una conversación larga.
            </h2>
          </div>
          <TextReveal
            as="p"
            text={artist.longBio}
            options={{ stagger: 0.015, y: 12 }}
            className="font-display text-ink-100 text-2xl leading-relaxed"
          />
        </div>
      </section>

      <section aria-labelledby="portafolio" className="border-border border-b py-20">
        <div className="container">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="text-gold text-xs uppercase tracking-[0.2em]">Portafolio</p>
              <h2 id="portafolio" className="font-display mt-3 text-4xl">
                Trabajos recientes.
              </h2>
            </div>
            <Badge variant="muted" className="hidden md:inline-flex">
              {artist.portfolio.length} piezas
            </Badge>
          </div>
          <Carousel className="w-full">
            {artist.portfolio.map((seed, i) => (
              <CarouselItem key={seed} className="basis-full md:basis-1/2">
                <PortfolioItem
                  seed={`work-${seed}`}
                  title={`Trabajo ${i + 1}`}
                  styles={artist.styles}
                  alt={`Trabajo ${i + 1} de ${artist.name}`}
                />
              </CarouselItem>
            ))}
          </Carousel>
        </div>
      </section>

      <section aria-labelledby="servicios" className="border-border border-b py-20">
        <div className="container">
          <div className="mb-10">
            <p className="text-gold text-xs uppercase tracking-[0.2em]">Servicios</p>
            <h2 id="servicios" className="font-display mt-3 text-4xl">
              Cómo se trabaja con {artist.name}.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {artist.services.map((service) => (
              <div
                key={service.name}
                className="border-border bg-ink-900 hover:border-gold/50 flex flex-col gap-4 border p-6 transition-colors"
              >
                <h3 className="font-display text-2xl">{service.name}</h3>
                <p className="text-ink-300 text-sm">{service.duration}</p>
                <p className="font-display text-gold text-3xl">{service.price}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Button asChild size="lg">
              <Link href={`/tatuadores/${params.slug}/reservar`}>
                Iniciar reserva con {artist.name}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </article>
  );
}
