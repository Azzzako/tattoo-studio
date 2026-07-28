import Link from 'next/link';
import { Instagram, Twitter, Youtube, Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ImagePlaceholder } from '@/components/ui/image-placeholder';
import { EmptyState } from '@/components/feedback/empty-state';

const ARTISTS = [
  {
    slug: 'inka',
    name: 'Inka',
    headline: 'Geometría con intención.',
    styles: ['Blackwork', 'Dotwork'],
    bio: 'Siete años tatuando líneas que sobreviven al tiempo. Piezas geométricas y mandalas contemporáneos.',
    location: 'CDMX',
    experience: 7,
    socials: { instagram: '#', twitter: '#', youtube: '#', website: '#' },
    featured: true,
  },
  {
    slug: 'mara',
    name: 'Mara',
    headline: 'Acuarela que respira.',
    styles: ['Color', 'Fine-line'],
    bio: 'Especialista en piezas pequeñas con línea fina y composiciones botánicas en acuarela.',
    location: 'CDMX',
    experience: 5,
    socials: { instagram: '#', twitter: '#' },
    featured: false,
  },
  {
    slug: 'yael',
    name: 'Yael',
    headline: 'Retratos sobre piel.',
    styles: ['Realismo', 'Microrealismo'],
    bio: 'Retratos familiares y piezas que buscan capturar un instante, no una pose.',
    location: 'CDMX',
    experience: 9,
    socials: { instagram: '#', youtube: '#' },
    featured: false,
  },
];

const SOCIAL_ICONS = {
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
  website: Globe,
};

export default function ArtistsPage() {
  return (
    <div className="container py-20 md:py-28">
      <header className="mx-auto mb-16 max-w-3xl text-center">
        <p className="mb-3 text-xs uppercase tracking-[0.2em] text-gold">Tatuadores</p>
        <h1 className="font-display text-6xl leading-[1] md:text-7xl">
          Conoce a quien llevará tu historia a la piel.
        </h1>
      </header>

      <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
        {ARTISTS.map((artist) => (
          <Link key={artist.slug} href={`/tatuadores/${artist.slug}`} className="group flex flex-col">
            <div className="relative aspect-[3/4] overflow-hidden border border-border">
              <ImagePlaceholder
                seed={`artist-portrait-${artist.slug}`}
                ratio="3/4"
                alt={`Retrato de ${artist.name}`}
              />
              {artist.featured && (
                <Badge variant="default" className="absolute left-4 top-4">
                  Destacado
                </Badge>
              )}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-gold">
                  {artist.styles.join(' · ')}
                </p>
                <h2 className="mt-2 font-display text-4xl text-foreground transition-colors group-hover:text-gold">
                  {artist.name}
                </h2>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between">
              <p className="text-sm text-ink-300">{artist.location} · {artist.experience} años</p>
              <div className="flex gap-2 text-ink-400">
                {Object.keys(artist.socials).map((network) => {
                  const Icon = SOCIAL_ICONS[network as keyof typeof SOCIAL_ICONS];
                  return Icon ? (
                    <span key={network} className="rounded-sm border border-border p-1.5">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                  ) : null;
                })}
              </div>
            </div>
            <p className="mt-4 font-display text-2xl leading-tight text-foreground">
              {artist.headline}
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-20">
        <EmptyState
          title="¿Buscas un estilo que no ves?"
          description="Si tienes una idea distinta a la de nuestros tatuadores, escríbenos y te orientamos."
        />
      </div>
    </div>
  );
}