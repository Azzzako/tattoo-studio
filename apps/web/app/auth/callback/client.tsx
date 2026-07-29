'use client';

import { Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import type { Session } from '@supabase/supabase-js';

import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { bootstrapProfileIfMissing } from './actions';

function safeNext(raw: string | null | undefined): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return '/';
  return raw;
}

export default function CallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ran = React.useRef(false);

  React.useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    void (async () => {
      const sp = Object.fromEntries(searchParams.entries());
      const errorDesc = (sp.error_description ?? sp['error'] ?? '').trim();
      if (errorDesc) {
        router.replace(`/login?message=${encodeURIComponent(errorDesc)}`);
        return;
      }

      const supabase = createSupabaseBrowserClient();

      let session: Session | null = null;

      if (sp.code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(sp.code);
        if (error) {
          router.replace(`/login?message=${encodeURIComponent(error.message)}`);
          return;
        }
        session = data.session;
      } else if (sp.token_hash && sp.type) {
        const type = sp.type as 'magiclink' | 'signup' | 'recovery';
        const { data, error } = await supabase.auth.verifyOtp({
          type,
          token_hash: sp.token_hash,
        });
        if (error) {
          router.replace(`/login?message=${encodeURIComponent(error.message)}`);
          return;
        }
        session = data.session;
      } else {
        // Implicit grant (hash tokens): read fragment directly and call
        // setSession. `detectSessionInUrl` in @supabase/ssr can race with
        // client mount when the navigation came from a 303 redirect, so we
        // do it explicitly.
        const fragment = window.location.hash.startsWith('#')
          ? new URLSearchParams(window.location.hash.slice(1))
          : null;
        const accessToken = fragment?.get('access_token') ?? null;
        const refreshToken = fragment?.get('refresh_token') ?? null;

        if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) {
            router.replace(`/login?message=${encodeURIComponent(error.message)}`);
            return;
          }
          session = data.session;
        } else {
          const { data } = await supabase.auth.getSession();
          session = data.session;
        }
      }

      if (!session) {
        router.replace('/login?message=Sesi%C3%B3n+inv%C3%A1lida+o+expirada');
        return;
      }

      const result = await bootstrapProfileIfMissing();
      if (!result.ok && result.reason && result.reason !== 'no_session') {
        console.warn('profile bootstrap:', result.reason);
      }

      router.replace(safeNext(sp.next));
    })();
  }, [router, searchParams]);

  return (
    <div className="bg-background flex min-h-dvh flex-col items-center justify-center gap-3">
      <Loader2 className="text-gold h-6 w-6 animate-spin" aria-hidden="true" />
      <p className="text-muted-foreground text-sm">Completando sesión…</p>
    </div>
  );
}
