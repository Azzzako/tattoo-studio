import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? '',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(items: Array<{ name: string; value: string; options?: Parameters<typeof cookieStore.set>[2] }>) {
          try {
            for (const { name, value, options } of items) {
              if (options) {
                cookieStore.set(name, value, options);
              } else {
                cookieStore.set(name, value);
              }
            }
          } catch {
            // ignored in server components
          }
        },
      },
    },
  );
}

export function createServiceClient() {
  return createServerClient(
    process.env.SUPABASE_URL ?? '',
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // service role has no cookies
        },
      },
    },
  );
}