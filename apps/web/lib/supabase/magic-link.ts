import 'server-only';

import { createSupabaseAdminClient } from './admin';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.APP_URL ?? 'http://localhost:3000';

export type MagicLinkResult = {
  ok: boolean;
  actionLink?: string;
  error?: string;
};

/**
 * Generates a Supabase magic link for the given email.
 * Returns the full action_link that the recipient can use to sign in.
 *
 * Used by:
 *   - /api/dev/auth-link (login flow testing)
 *   - createArtistAsAdmin (admin creates an artist and shares the link)
 */
export async function generateMagicLink(email: string): Promise<MagicLinkResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return { ok: false, error: 'SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY missing' };
  }

  const redirect = `${SITE_URL}/auth/callback`;
  const res = await fetch(`${supabaseUrl}/auth/v1/admin/generate_link`, {
    method: 'POST',
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ type: 'magiclink', email, redirect_to: redirect }),
  });

  const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok) {
    return {
      ok: false,
      error: typeof body.message === 'string' ? body.message : `HTTP ${res.status}`,
    };
  }
  const actionLink = typeof body.action_link === 'string' ? body.action_link : null;
  if (!actionLink) return { ok: false, error: 'no action_link in response' };
  return { ok: true, actionLink };
}

/**
 * Checks if a Supabase auth user exists for the given email.
 */
export async function authUserExists(email: string): Promise<boolean> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.auth.admin.listUsers({});
  if (error || !data) return false;
  return data.users.some((u) => u.email === email);
}
