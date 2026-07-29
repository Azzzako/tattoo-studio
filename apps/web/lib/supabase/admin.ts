import 'server-only';

import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

export type TypedSupabaseAdminClient = SupabaseClient;

// Bypasses RLS. Use only in trusted server contexts (cron, route handlers
// with verified auth, server actions guarded by admin checks). Never expose
// this to the client.
export function createSupabaseAdminClient(): TypedSupabaseAdminClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'Supabase admin env vars missing. Configure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
    );
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
