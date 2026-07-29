import 'server-only';

import type { SupabaseClient, User } from '@supabase/supabase-js';

import { createSupabaseServerClient } from './server';

export type Profile = {
  id: string;
  role: 'admin' | 'artist' | 'customer';
  studio_id: string | null;
  full_name: string | null;
  phone_e164: string | null;
  avatar_url: string | null;
};

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, studio_id, full_name, phone_e164, avatar_url')
    .eq('id', user.id)
    .maybeSingle();
  if (error || !data) return null;
  return data as Profile;
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized');
  return user;
}

export async function requireProfile(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) throw new Error('Profile not found');
  return profile;
}

export async function getServiceSupabase(): Promise<SupabaseClient | null> {
  // Service role is only loaded on demand inside server contexts that need to
  // bypass RLS (e.g. profile bootstrap on signup). Imported lazily so this
  // file stays safe to import anywhere on the server.
  const { createSupabaseAdminClient } = await import('./admin');
  return createSupabaseAdminClient();
}
