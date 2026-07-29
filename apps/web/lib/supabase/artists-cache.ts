import 'server-only';

import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

import type { ScheduleKind } from '@/components/artists/schedule-badge';

const serviceKey = (() => {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
  return key;
})();
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';

export type ArtistRow = {
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
  featured: boolean;
  is_active: boolean;
  profile_id: string | null;
};

// ────────────────────────────────────────────────────────────────────────
// Artist fetches with tag-based cache
// ────────────────────────────────────────────────────────────────────────
//   - `tattoo-artists:list` — listing
//   - `tattoo-artists:slug:{slug}` — single artist detail
//   - `tattoo-artists:profile:{profileId}` — by linked auth user
//
// Default revalidate: 30 s. Mutations (admin toggling featured,
// profile / avatar upload, schedule_kind edits) call
// revalidateTag('tattoo-artists:...') in the same actions file.
// ────────────────────────────────────────────────────────────────────────

const fetchArtistsListCached = unstable_cache(
  async (): Promise<ArtistRow[]> => {
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data } = await admin
      .from('tattoo_artists')
      .select(
        'id, slug, display_name, headline, bio, long_bio, specialties, city, years_active, schedule_kind, schedule_weeks, avatar_path, instagram, twitter, youtube, website, featured, is_active, profile_id',
      )
      .eq('is_active', true)
      .order('featured', { ascending: false })
      .order('display_name', { ascending: true });
    return (data as ArtistRow[] | null) ?? [];
  },
  ['tattoo-artists:list'],
  { revalidate: 30, tags: ['tattoo-artists:list'] },
);

const fetchArtistBySlugCached = unstable_cache(
  async (slug: string): Promise<ArtistRow | null> => {
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data } = await admin
      .from('tattoo_artists')
      .select(
        'id, slug, display_name, headline, bio, long_bio, specialties, city, years_active, schedule_kind, schedule_weeks, avatar_path, instagram, twitter, youtube, website, featured, is_active, profile_id',
      )
      .eq('slug', slug)
      .eq('is_active', true)
      .maybeSingle();
    return (data as ArtistRow | null) ?? null;
  },
  ['tattoo-artists:slug'],
  { revalidate: 30, tags: ['tattoo-artists:list'] },
);

const fetchArtistByProfileIdCached = unstable_cache(
  async (profileId: string): Promise<ArtistRow | null> => {
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data } = await admin
      .from('tattoo_artists')
      .select(
        'id, slug, display_name, headline, bio, long_bio, specialties, city, years_active, schedule_kind, schedule_weeks, avatar_path, instagram, twitter, youtube, website, featured, is_active, profile_id',
      )
      .eq('profile_id', profileId)
      .order('updated_at', { ascending: false })
      .limit(1);
    return ((data as ArtistRow[] | null) ?? [])[0] ?? null;
  },
  ['tattoo-artists:profile'],
  { revalidate: 30, tags: ['tattoo-artists:list'] },
);

export const getArtistsList = cache(async (): Promise<ArtistRow[]> => {
  return fetchArtistsListCached();
});

export const getArtistBySlug = cache(async (slug: string): Promise<ArtistRow | null> => {
  return fetchArtistBySlugCached(slug);
});

export const getArtistByProfileId = cache(async (profileId: string): Promise<ArtistRow | null> => {
  return fetchArtistByProfileIdCached(profileId);
});
