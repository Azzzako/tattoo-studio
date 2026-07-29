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
import {
  ScheduleBadge,
  ScheduleText,
  type ScheduleKind,
} from '@/components/artists/schedule-badge';
import { createSupabaseServerClient } from '@/lib/supabase/server';

interface ArtistPageProps {
  params: Promise<{ slug: string }>;
}

const SOCIAL_ICONS: Record<'instagram' | 'twitter' | 'youtube' | 'website', typeof Instagram> = {
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
  website: Globe,
};

const SOCIAL_LABELS: Record<'instagram' | 'twitter' | 'youtube' | 'website', string> = {
  instagram: 'Instagram',
  twitter: 'X',
  youtube: 'YouTube',
  website: 'Sitio web',
};

type ArtistRow = {
  id: string;
  slug: string;
  display_name: string;
  headline: string | null;
  bio: string | null;
  long_bio: string | null;
  specialties: string[] | null;
  city: string | null;
  years_active: number | null;
  schedule_kind: ScheduleKind | null;
  schedule_weeks: number | null;
  avatar_path: string | null;
  instagram: string | null;
  twitter: string | null;
  youtube: string | null;
  website: string | null;
};

type PortfolioRow = {
  id: string;
  storage_path: string | null;
  seed: string | null;
  alt_text: string | null;
  style_tags: string[] | null;
};

export const dynamic = 'force-dynamic';

export default async function ArtistDetailPage({ params }: ArtistPageProps) {
  const { slug } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: artistData } = await supabase
    .from('tattoo_artists')
    .select(
      'id, slug, display_name, headline, bio, long_bio, specialties, city, years_active, schedule_kind, schedule_weeks, avatar_path, instagram, twitter, youtube, website',
    )
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (!artistData) notFound();
  const artist = artistData as ArtistRow;

  const { data: portfolioData } = await supabase
    .from('portfolio_items')
    .select('id, storage_path, seed, alt_text, style_tags')
    .eq('artist_id', artist.id)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(24);
  const portfolio = (portfolioData ?? []) as PortfolioRow[];

  const socials: Array<{ network: 'instagram' | 'twitter' | 'youtube' | 'website'; url: string }> =
    [];
  if (artist.instagram)
    socials.push({ network: 'instagram', url: `https://instagram.com/${artist.instagram}` });
  if (artist.twitter)
    socials.push({ network: 'twitter', url: `https://twitter.com/${artist.twitter}` });
  if (artist.youtube)
    socials.push({
      network: 'youtube',
      url: artist.youtube.startsWith('@')
        ? `https://youtube.com/${artist.youtube}`
        : `https://youtube.com/@${artist.youtube}`,
    });
  if (artist.website) socials.push({ network: 'website', url: artist.website });

  const specialties = artist.specialties ?? [];

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
              {specialties.join(' · ') || 'Tatuador'}
            </p>
            <TextReveal
              as="h1"
              text={artist.display_name}
              options={{ stagger: 0.06 }}
              className="font-display text-6xl leading-[0.95] md:text-8xl"
            />
            {artist.headline && (
              <TextReveal
                as="p"
                text={artist.headline}
                options={{ stagger: 0.04, delay: 0.2, y: 16 }}
                className="font-display text-ink-200 text-3xl"
              />
            )}
            {artist.bio && (
              <p className="text-ink-300 max-w-xl text-base leading-relaxed">{artist.bio}</p>
            )}

            {artist.schedule_kind && (
              <div className="space-y-2">
                <ScheduleBadge kind={artist.schedule_kind} weeks={artist.schedule_weeks} />
                <p className="text-ink-300 text-sm">
                  <ScheduleText kind={artist.schedule_kind} weeks={artist.schedule_weeks} />
                </p>
              </div>
            )}

            <dl className="border-border mt-4 flex flex-wrap gap-6 border-t pt-6 text-sm">
              {artist.city && (
                <div>
                  <dt className="text-ink-400 text-xs uppercase tracking-[0.18em]">Ciudad</dt>
                  <dd className="text-ink-100 mt-1 flex items-center gap-2">
                    <MapPin className="text-gold h-3.5 w-3.5" />
                    {artist.city}
                  </dd>
                </div>
              )}
              {artist.years_active !== null && (
                <div>
                  <dt className="text-ink-400 text-xs uppercase tracking-[0.18em]">
                    Años tatuando
                  </dt>
                  <dd className="text-ink-100 mt-1">{artist.years_active}</dd>
                </div>
              )}
              <div>
                <dt className="text-ink-400 text-xs uppercase tracking-[0.18em]">Agenda</dt>
                <dd className="text-ink-100 mt-1 flex items-center gap-2">
                  <Calendar className="text-gold h-3.5 w-3.5" />
                  {artist.schedule_kind ? (
                    <ScheduleText kind={artist.schedule_kind} weeks={artist.schedule_weeks} />
                  ) : (
                    'Por definir'
                  )}
                </dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-3 pt-4">
              {socials.map((social) => {
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
                      {SOCIAL_LABELS[social.network]}
                    </a>
                  </Button>
                );
              })}
              <Button asChild size="sm">
                <Link href={`/tatuadores/${slug}/reservar`}>
                  Reservar con {artist.display_name}
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <MaskReveal
              options={{ duration: 1.4 }}
              className="border-border relative aspect-[4/5] overflow-hidden border"
            >
              {artist.avatar_path ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={artist.avatar_path}
                  alt={`Retrato de ${artist.display_name}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <ImagePlaceholder
                  seed={`artist-hero-${slug}`}
                  ratio="4/5"
                  alt={`Retrato editorial de ${artist.display_name}`}
                />
              )}
            </MaskReveal>
          </div>
        </div>
      </header>

      {artist.long_bio && (
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
              text={artist.long_bio}
              options={{ stagger: 0.015, y: 12 }}
              className="font-display text-ink-100 text-2xl leading-relaxed"
            />
          </div>
        </section>
      )}

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
              {portfolio.length} piezas
            </Badge>
          </div>
          {portfolio.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Aún no hay piezas publicadas en el portafolio.
            </p>
          ) : (
            <Carousel className="w-full">
              {portfolio.map((item, i) => (
                <CarouselItem key={item.id} className="basis-full md:basis-1/2">
                  <PortfolioItem
                    seed={item.seed ?? `work-${item.id}`}
                    title={item.alt_text ?? `Trabajo ${i + 1}`}
                    styles={item.style_tags ?? specialties}
                    alt={item.alt_text ?? `Trabajo ${i + 1} de ${artist.display_name}`}
                    storagePath={item.storage_path}
                  />
                </CarouselItem>
              ))}
            </Carousel>
          )}
        </div>
      </section>

      <section aria-labelledby="servicios" className="border-border border-b py-20">
        <div className="container">
          <div className="mb-10">
            <p className="text-gold text-xs uppercase tracking-[0.2em]">Servicios</p>
            <h2 id="servicios" className="font-display mt-3 text-4xl">
              Cómo se trabaja con {artist.display_name}.
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <ServiceCard name="Consulta + diseño" duration="30-60 min" price="Gratis" />
            <ServiceCard name="Sesión estándar" duration="2-4 horas" price="Cotización" />
            <ServiceCard name="Proyecto largo" duration="Múltiples sesiones" price="Cotización" />
          </div>
          <div className="mt-10">
            <Button asChild size="lg">
              <Link href={`/tatuadores/${slug}/reservar`}>
                Iniciar reserva con {artist.display_name}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </article>
  );
}

function ServiceCard({ name, duration, price }: { name: string; duration: string; price: string }) {
  return (
    <div className="border-border bg-ink-900 hover:border-gold/50 flex flex-col gap-4 border p-6 transition-colors">
      <h3 className="font-display text-2xl">{name}</h3>
      <p className="text-ink-300 text-sm">{duration}</p>
      <p className="font-display text-gold text-3xl">{price}</p>
    </div>
  );
}
