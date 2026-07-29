import { Instagram, Twitter, Youtube, Globe } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { ImagePlaceholder } from '@/components/ui/image-placeholder';
import { EmptyState } from '@/components/feedback/empty-state';
import { ArtistGrid } from '@/components/artists/artist-grid';
import { TextReveal } from '@/components/animations/text-reveal';
import { getArtistsList, type ArtistRow } from '@/lib/supabase/artists-cache';

type SocialNetwork = 'instagram' | 'twitter' | 'youtube' | 'website';

const SOCIAL_ICONS: Record<SocialNetwork, typeof Instagram> = {
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
  website: Globe,
};

const SOCIAL_LABELS: Record<SocialNetwork, string> = {
  instagram: 'Instagram',
  twitter: 'X',
  youtube: 'YouTube',
  website: 'Sitio web',
};

type SocialLink = { network: SocialNetwork; url: string };

function buildSocials(a: ArtistRow): SocialLink[] {
  const out: SocialLink[] = [];
  if (a.instagram) out.push({ network: 'instagram', url: `https://instagram.com/${a.instagram}` });
  if (a.twitter) out.push({ network: 'twitter', url: `https://twitter.com/${a.twitter}` });
  if (a.youtube)
    out.push({
      network: 'youtube',
      url: a.youtube.startsWith('@')
        ? `https://youtube.com/${a.youtube}`
        : `https://youtube.com/@${a.youtube}`,
    });
  if (a.website) out.push({ network: 'website', url: a.website });
  return out;
}

export const dynamic = 'force-dynamic';

export default async function ArtistsPage() {
  const artists = await getArtistsList();

  return (
    <div className="container py-20 md:py-28">
      <header className="mx-auto mb-16 max-w-3xl text-center">
        <p className="text-gold mb-3 text-xs uppercase tracking-[0.2em]">Tatuadores</p>
        <TextReveal
          as="h1"
          text="Conoce a quien llevará tu historia a la piel."
          options={{ stagger: 0.04 }}
          className="font-display text-6xl leading-[1] md:text-7xl"
        />
      </header>

      {artists.length === 0 ? (
        <EmptyState
          title="Aún no hay tatuadores publicados"
          description="Pronto you'll see artists here."
        />
      ) : (
        <ArtistGrid className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          {artists.map((artist) => {
            const socials = buildSocials(artist);
            return (
              <article key={artist.id} className="group block">
                <Link
                  href={`/tatuadores/${artist.slug}`}
                  className="block focus-visible:outline-none"
                  aria-label={`Ver perfil de ${artist.display_name}`}
                >
                  <div className="border-border relative aspect-[3/4] overflow-hidden border">
                    {artist.avatar_path ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={artist.avatar_path}
                        alt={`Retrato de ${artist.display_name}`}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-focus-within:scale-105 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 transition-transform duration-700 ease-out group-focus-within:scale-105 group-hover:scale-105">
                        <ImagePlaceholder
                          seed={`artist-portrait-${artist.slug}`}
                          ratio="3/4"
                          alt={`Retrato de ${artist.display_name}`}
                        />
                      </div>
                    )}
                    {artist.featured && (
                      <Badge variant="default" className="absolute left-4 top-4">
                        Destacado
                      </Badge>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <p className="text-gold text-xs uppercase tracking-[0.2em] transition-transform duration-500 group-focus-within:-translate-y-1 group-hover:-translate-y-1">
                        {(artist.specialties ?? []).join(' · ') || 'Tatuador'}
                      </p>
                      <h2 className="font-display text-foreground group-hover:text-gold group-focus-within:text-gold mt-2 text-4xl transition-colors duration-500">
                        {artist.display_name}
                      </h2>
                    </div>
                  </div>
                </Link>
                <div className="mt-5 flex items-center justify-between">
                  <p className="text-ink-300 text-sm">
                    {artist.city ?? '—'}
                    {artist.years_active !== null ? ` · ${artist.years_active} años` : ''}
                  </p>
                  <ul
                    className="text-ink-400 flex gap-2"
                    aria-label={`Redes de ${artist.display_name}`}
                  >
                    {socials.map((social) => {
                      const Icon = SOCIAL_ICONS[social.network];
                      return (
                        <li key={social.network}>
                          <a
                            href={social.url}
                            rel="noreferrer"
                            target="_blank"
                            aria-label={`${SOCIAL_LABELS[social.network]} de ${artist.display_name}`}
                            className="border-border hover:text-gold focus-visible:ring-ring inline-flex rounded-sm border p-1.5 transition-transform hover:rotate-12 focus-visible:outline-none focus-visible:ring-2"
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                {artist.headline && (
                  <p className="text-foreground font-display mt-4 text-2xl leading-tight">
                    {artist.headline}
                  </p>
                )}
              </article>
            );
          })}
        </ArtistGrid>
      )}

      <div className="mt-20">
        <EmptyState
          title="¿Buscas un estilo que no ves?"
          description="Si tienes una idea distinta a la de nuestros tatuadores, escríbenos y te orientamos."
        />
      </div>
    </div>
  );
}
