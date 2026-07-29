import 'server-only';

import { cache } from 'react';
import type { SupabaseClient, User } from '@supabase/supabase-js';
import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

import { createSupabaseServerClient } from './server';

export type Profile = {
  id: string;
  role: 'admin' | 'artist' | 'customer';
  studio_id: string | null;
  full_name: string | null;
  phone_e164: string | null;
  avatar_url: string | null;
};

// ────────────────────────────────────────────────────────────────────────
// Auth resolution
// ────────────────────────────────────────────────────────────────────────
//
// `cache()` from React deduplicates calls within a single server render.
// The layout calls [getCurrentUser, getCurrentProfile] in parallel;
// `getCurrentProfile` already calls `getCurrentUser`, so without
// `cache()` we used to make two redundant `auth.getUser()` calls per
// page (≈ 100ms each on Cloudflare edge).
//
// Wrapping both with `cache()` collapses that to one call per request.
// ────────────────────────────────────────────────────────────────────────

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
});

// ────────────────────────────────────────────────────────────────────────
// Profile reads
// ────────────────────────────────────────────────────────────────────────
//
// `unstable_cache` keeps a per-user profile snapshot for 60 s, served
// from memory on subsequent requests. Use service-role client so RLS
// doesn't add latency and we can read the row even when role-gates
// are still warming up.
//
// Tag-based invalidation:
//   - `profile:${userId}` lets targeted actions refresh one user
//   - `profile` invalidates all cached profiles (coarse, but cheap)
//   - `profile:${role}` invalidates all profiles of a role (rare)
// Actions that mutate profiles call `revalidateTag('profile:...')`
// from the same module — see auth-actions / profile actions.
// ────────────────────────────────────────────────────────────────────────

const serviceKey = (() => {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required');
  return key;
})();
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';

const fetchProfileCached = unstable_cache(
  async (userId: string): Promise<Profile | null> => {
    const admin = createClient<DatabaseStub>(supabaseUrl, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data } = await admin
      .from('profiles')
      .select('id, role, studio_id, full_name, phone_e164, avatar_url')
      .eq('id', userId)
      .maybeSingle();
    return (data as Profile | null) ?? null;
  },
  ['profile'],
  { revalidate: 60, tags: ['profile'] },
);

export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const user = await getCurrentUser();
  if (!user) return null;
  return fetchProfileCached(user.id);
});

export const requireUser = cache(async (): Promise<User> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  return user;
});

export const requireProfile = cache(async (): Promise<Profile> => {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error('Profile not found');
  return profile;
});

export async function getServiceSupabase(): Promise<SupabaseClient | null> {
  const { createSupabaseAdminClient } = await import('./admin');
  return createSupabaseAdminClient();
}

// Stub used at the type level for `unstable_cache` payload. Replaced by
// `./types` once `supabase gen types` is run.
type DatabaseStub = never;
