import { json, jsonError, unauthorized } from '@/lib/api/v1/errors';
import { hasScope, verifyApiKey } from '@/lib/api/v1/auth';
import { ArtistWithPortfolioSchema } from '@/lib/api/v1/schemas';
import { getArtistBySlugPublic } from '@/lib/api/v1/artists';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/artists/[slug]
 *
 * Auth:
 *   Authorization: Bearer <api-key>
 *
 * Returns 200 with ArtistWithPortfolio (incluye array de portfolio publico).
 * 404 si el slug no existe o el artista no esta activo.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const key = await verifyApiKey(request.headers.get('authorization'));
  if (!key) return unauthorized();
  if (!hasScope(key, 'read:artists')) {
    return jsonError(
      Object.assign(new Error('Scope read:artists requerido'), { code: 'forbidden' }),
    );
  }

  const { slug } = await context.params;
  const artist = await getArtistBySlugPublic(slug);
  if (!artist)
    return jsonError(Object.assign(new Error('Tatuador no encontrado'), { code: 'not_found' }));

  const body = ArtistWithPortfolioSchema.parse(artist);
  return json(body, {
    headers: {
      'Cache-Control': 'public, max-age=30, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
