import 'server-only';

import { createHash, timingSafeEqual } from 'node:crypto';

import { cache } from 'react';

import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export type ApiKey = {
  id: string;
  studio_id: string;
  name: string;
  prefix: string;
  scopes: string[];
};

const PREFIX_RE = /^Bearer\s+(\S+)$/i;

/**
 * Verifies a `Authorization: Bearer <token>` header against the api_keys
 * table. Returns the key row (with scopes) or null.
 *
 * Uses sha256 hash + timing-safe compare to mitigate timing attacks.
 * Result is `cache()`-wrapped per render so multiple route handlers in the
 * same request hit Postgres once.
 */
export const verifyApiKey = cache(
  async (authorizationHeader: string | null): Promise<ApiKey | null> => {
    if (!authorizationHeader) return null;
    const match = PREFIX_RE.exec(authorizationHeader);
    if (!match) return null;
    const token = match[1]!;

    const prefix = token.slice(0, 12);
    const hash = createHash('sha256').update(token).digest('hex');

    const admin = createSupabaseAdminClient();
    const { data: rows, error } = await admin
      .from('api_keys')
      .select('id, studio_id, name, prefix, hash, scopes, revoked_at')
      .eq('prefix', prefix)
      .is('revoked_at', null)
      .limit(5);

    if (error || !rows) return null;

    const expected = Buffer.from(hash, 'hex');
    for (const row of rows) {
      const actual = Buffer.from((row as { hash: string }).hash, 'hex');
      if (actual.length !== expected.length) continue;
      if (timingSafeEqual(actual, expected)) {
        // Fire-and-forget last_used_at update (don't block the response).
        void admin
          .from('api_keys')
          .update({ last_used_at: new Date().toISOString() })
          .eq('id', (row as { id: string }).id);

        return {
          id: (row as { id: string }).id,
          studio_id: (row as { studio_id: string }).studio_id,
          name: (row as { name: string }).name,
          prefix: (row as { prefix: string }).prefix,
          scopes: (row as { scopes: string[] }).scopes,
        };
      }
    }
    return null;
  },
);

export function hasScope(key: ApiKey, scope: string): boolean {
  return key.scopes.includes(scope);
}
