import 'server-only';

import { cache } from 'react';

import { createSupabaseAdminClient } from '@/lib/supabase/admin';

import type { ArtistPublic, ArtistWithPortfolio, PortfolioItemPublic } from './schemas';
import { unstable_cache } from 'next/cache';

/**
 * Public-facing artist fetcher. Uses admin client to bypass RLS and read
 * fields the artist can edit; the ArtistPublicSchema then strips internals.
 *
 * Cached via unstable_cache with the same tag as the internal artist cache
 * (`tattoo-artists:list`) so admin edits invalidate both paths.
 */

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
  schedule_kind: 'open_now' | 'closes_in_weeks' | 'waitlist_only' | 'by_request' | null;
  schedule_weeks: number | null;
  avatar_path: string | null;
  instagram: string | null;
  twitter: string | null;
  youtube: string | null;
  website: string | null;
  featured: boolean;
};

type PortfolioRow = {
  id: string;
  storage_path: string | null;
  seed: string | null;
  alt_text: string | null;
  style_tags: string[] | null;
};

const BASE_PUBLIC_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';

function buildPublicUrl(storagePath: string | null): string | null {
  if (!storagePath) return null;
  return `${BASE_PUBLIC_URL}/storage/v1/object/public/artist-avatars/${storagePath}`;
}

function rowToPublic(row: ArtistRow): ArtistPublic {
  return {
    id: row.id,
    slug: row.slug,
    display_name: row.display_name,
    headline: row.headline,
    bio: row.bio,
    long_bio: row.long_bio,
    specialties: row.specialties,
    city: row.city,
    years_active: row.years_active,
    schedule_kind: row.schedule_kind,
    schedule_weeks: row.schedule_weeks,
    avatar_url: buildPublicUrl(row.avatar_path),
    instagram: row.instagram,
    twitter: row.twitter,
    youtube: row.youtube,
    website: row.website,
    featured: row.featured,
  };
}

const fetchArtistsList = unstable_cache(
  async (): Promise<ArtistRow[]> => {
    const admin = createSupabaseAdminClient();
    const { data } = await admin
      .from('tattoo_artists')
      .select(
        'id, slug, display_name, headline, bio, long_bio, specialties, city, years_active, schedule_kind, schedule_weeks, avatar_path, instagram, twitter, youtube, website, featured',
      )
      .eq('is_active', true)
      .order('featured', { ascending: false })
      .order('display_name', { ascending: true });
    return (data as ArtistRow[] | null) ?? [];
  },
  ['api-v1:artists:list'],
  { revalidate: 30, tags: ['tattoo-artists:list'] },
);

const fetchArtistBySlug = unstable_cache(
  async (slug: string): Promise<ArtistRow | null> => {
    const admin = createSupabaseAdminClient();
    const { data } = await admin
      .from('tattoo_artists')
      .select(
        'id, slug, display_name, headline, bio, long_bio, specialties, city, years_active, schedule_kind, schedule_weeks, avatar_path, instagram, twitter, youtube, website, featured',
      )
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();
    return (data as ArtistRow | null) ?? null;
  },
  ['api-v1:artists:slug'],
  { revalidate: 30, tags: ['tattoo-artists:list'] },
);

const fetchPortfolio = unstable_cache(
  async (artistId: string): Promise<PortfolioRow[]> => {
    const admin = createSupabaseAdminClient();
    const { data } = await admin
      .from('portfolio_items')
      .select('id, storage_path, seed, alt_text, style_tags')
      .eq('artist_id', artistId)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(24);
    return (data as PortfolioRow[] | null) ?? [];
  },
  ['api-v1:artists:portfolio'],
  { revalidate: 30, tags: ['tattoo-artists:list'] },
);

export interface ListArtistsArgs {
  featured?: boolean | undefined;
  limit: number;
  offset: number;
}

export const listArtistsPublic = cache(
  async (
    args: ListArtistsArgs,
  ): Promise<{
    items: ArtistPublic[];
    total: number;
  }> => {
    const all = await fetchArtistsList();
    const filtered =
      args.featured === undefined ? all : all.filter((a) => a.featured === args.featured);
    const total = filtered.length;
    const slice = filtered.slice(args.offset, args.offset + args.limit);
    return { items: slice.map(rowToPublic), total };
  },
);

export const getArtistBySlugPublic = cache(
  async (slug: string): Promise<ArtistWithPortfolio | null> => {
    const row = await fetchArtistBySlug(slug);
    if (!row) return null;
    const portfolioRows = await fetchPortfolio(row.id);
    const portfolio: PortfolioItemPublic[] = portfolioRows.map((p, i) => ({
      id: p.id,
      storage_url: p.storage_path
        ? `${BASE_PUBLIC_URL}/storage/v1/object/public/artist-portfolio/${p.storage_path}`
        : null,
      seed: p.seed,
      alt_text: p.alt_text,
      style_tags: p.style_tags,
      position: i,
    }));
    return { ...rowToPublic(row), portfolio };
  },
);
