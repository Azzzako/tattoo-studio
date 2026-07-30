import { json, jsonError, unauthorized } from '@/lib/api/v1/errors';
import { hasScope, verifyApiKey } from '@/lib/api/v1/auth';
import { ListArtistsQuerySchema, ListArtistsResponseSchema } from '@/lib/api/v1/schemas';
import { listArtistsPublic } from '@/lib/api/v1/artists';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/artists
 *
 * Query params:
 *   - featured: 'true' | 'false'  (filter by featured flag)
 *   - limit:    1-100 (default 50)
 *   - offset:   >= 0 (default 0)
 *
 * Auth:
 *   Authorization: Bearer <api-key>
 *
 * Returns 200 with { data: ArtistPublic[], pagination: { total, limit, offset } }
 */
export async function GET(request: Request): Promise<Response> {
  const key = await verifyApiKey(request.headers.get('authorization'));
  if (!key) return unauthorized();
  if (!hasScope(key, 'read:artists')) {
    return jsonError(
      Object.assign(new Error('Scope read:artists requerido'), { code: 'forbidden' }),
    );
  }

  const url = new URL(request.url);
  const parse = ListArtistsQuerySchema.safeParse({
    featured: url.searchParams.get('featured') ?? undefined,
    limit: url.searchParams.get('limit') ?? undefined,
    offset: url.searchParams.get('offset') ?? undefined,
  });
  if (!parse.success) return jsonError(parse.error);

  const { items, total } = await listArtistsPublic(parse.data);

  const body = ListArtistsResponseSchema.parse({
    data: items,
    pagination: { total, limit: parse.data.limit, offset: parse.data.offset },
  });

  return json(body, {
    headers: {
      'Cache-Control': 'public, max-age=30, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
