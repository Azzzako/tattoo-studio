import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// Database types live in ./types once generated with:
//   supabase gen types typescript --linked > apps/web/lib/supabase/types.ts
// Until that runs, the untyped SupabaseClient is used. Do not cast as `any`.
export type TypedSupabaseClient = SupabaseClient;

export function createSupabaseBrowserClient(): TypedSupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'Supabase env vars missing. Configure SUPABASE_URL and SUPABASE_ANON_KEY (or their NEXT_PUBLIC_ variants).',
    );
  }

  return createBrowserClient(url, key);
}
