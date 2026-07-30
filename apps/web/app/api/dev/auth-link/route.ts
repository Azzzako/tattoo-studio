import { type NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';

import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { generateMagicLink } from '@/lib/supabase/magic-link';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const paramsSchema = z.object({
  email: z.string().trim().email('invalid email'),
  role: z.enum(['customer', 'artist', 'admin']).default('customer'),
  slug: z.string().trim().min(2).max(60).optional(),
  name: z.string().trim().min(1).max(120).optional(),
});

function wantsHtml(request: NextRequest): boolean {
  return (request.headers.get('accept') ?? '').includes('text/html');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function htmlPage(args: {
  email: string;
  role: 'customer' | 'artist' | 'admin';
  actionLink: string;
  artist?: { slug: string; displayName: string };
}): string {
  const line =
    args.role === 'artist' && args.artist
      ? `<p>Tatuador simulado: <code>${escapeHtml(args.artist.displayName)}</code> · slug <code>${escapeHtml(args.artist.slug)}</code></p>`
      : args.role === 'admin'
        ? `<p>Perfil: <code>admin</code> (control total)</p>`
        : `<p>Perfil: <code>customer</code></p>`;
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>Dev auth-link (${escapeHtml(args.role)})</title>
<style>
  body{font-family:system-ui;background:#0f0f10;color:#eee;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;padding:24px}
  main{max-width:560px;width:100%;background:#18181b;border:1px solid #27272a;border-radius:12px;padding:32px;line-height:1.5}
  h1{margin:0 0 8px;font-size:22px}
  p{color:#a1a1aa;font-size:14px;margin:8px 0}
  code{background:#27272a;border-radius:4px;padding:2px 6px;font-size:12px;color:#fbbf24}
  a.btn{display:inline-block;margin-top:16px;padding:12px 20px;background:#fbbf24;color:#0f0f10;border-radius:8px;text-decoration:none;font-weight:600}
</style>
</head>
<body>
<main>
  <h1>Dev auth-link · role ${escapeHtml(args.role)}</h1>
  <p>Cuenta preparada para <code>${escapeHtml(args.email)}</code>.</p>
  ${line}
  <p>No envía email (esquiva el rate limit SMTP). Link single-use, expira 1h.</p>
  <a class="btn" href="${escapeHtml(args.actionLink)}" rel="nofollow">Entrar como ${escapeHtml(args.email)}</a>
</main>
</body>
</html>`;
}

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'dev-only endpoint' }, { status: 404 });
  }

  const url = request.nextUrl;
  const parsed = paramsSchema.safeParse({
    email: url.searchParams.get('email') ?? undefined,
    role: (url.searchParams.get('role') as 'customer' | 'artist' | 'admin' | null) ?? undefined,
    slug: url.searchParams.get('slug') ?? undefined,
    name: url.searchParams.get('name') ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'invalid params' },
      { status: 400 },
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json(
      { error: 'SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing on server' },
      { status: 500 },
    );
  }

  const admin = createSupabaseAdminClient();
  const studioId = process.env.STUDIO_ID ?? null;

  // 1. Require pre-existing user. The dev endpoint is for testing login
  //    flows only — new accounts must be created via the admin UI or
  //    Supabase dashboard.
  const { data: existing } = await admin.auth.admin.listUsers({});
  const found = existing?.users.find((u) => u.email === parsed.data.email);
  if (!found) {
    return NextResponse.json(
      {
        error: 'user_not_registered',
        message: `No existe un usuario con email ${parsed.data.email}. Solo los dados de alta pueden solicitar link.`,
      },
      { status: 404 },
    );
  }
  const userId = found.id;

  // 2. Upsert profile with role.
  const { error: profileErr } = await admin
    .from('profiles')
    .upsert({ id: userId, role: parsed.data.role, studio_id: studioId });
  if (profileErr) {
    return NextResponse.json(
      { error: 'profile upsert failed', detail: profileErr.message },
      { status: 500 },
    );
  }

  // 3. If artist: upsert tattoo_artists row linked to this profile.
  let artistRow: { slug: string; displayName: string } | undefined;
  let diagnostics: Record<string, unknown> | null = null;
  if (parsed.data.role === 'artist') {
    const emailLocal = parsed.data.email.split('@')[0] ?? 'artist';
    const displayName = parsed.data.name ?? `Tatuador ${emailLocal}`;
    const slug = parsed.data.slug ?? slugify(emailLocal) ?? 'artist';

    const { error: upsertErr } = await admin.from('tattoo_artists').upsert(
      {
        studio_id: studioId,
        profile_id: userId,
        slug,
        display_name: displayName,
        is_active: true,
      },
      { onConflict: 'studio_id,slug' },
    );
    if (upsertErr) {
      return NextResponse.json(
        { error: 'artist upsert failed', detail: upsertErr.message },
        { status: 500 },
      );
    }
    artistRow = { slug, displayName };

    // Diagnostics (post-upsert) — full studio snapshot so we can see if
    // seeded artist row IDs match the IDs referenced by appointments.
    const [{ data: allArtists }, { data: allAppts }] = await Promise.all([
      admin
        .from('tattoo_artists')
        .select('id, slug, display_name, profile_id')
        .eq('studio_id', studioId)
        .order('slug', { ascending: true }),
      admin
        .from('appointments')
        .select('id, artist_id, starts_at, status')
        .eq('studio_id', studioId)
        .gte('starts_at', new Date().toISOString())
        .order('starts_at', { ascending: true })
        .limit(50),
    ]);

    const inkaRow = (allArtists ?? []).find((a) => (a as { slug: string }).slug === 'inka');
    const apptsForInka = (allAppts ?? []).filter(
      (a) => inkaRow && (a as { artist_id: string }).artist_id === (inkaRow as { id: string }).id,
    );

    diagnostics = {
      studio_id: studioId,
      all_artist_rows_in_studio: allArtists ?? [],
      all_appointments_in_studio: allAppts ?? [],
      inka_row_id: inkaRow ? (inkaRow as { id: string }).id : null,
      inka_row_profile_id: inkaRow
        ? ((inkaRow as { profile_id: string | null }).profile_id ?? null)
        : null,
      appointments_for_inka_count: apptsForInka.length,
      appointments_for_inka: apptsForInka,
    };

    // Pull profile row to debug role mismatch
    const { data: profileRow } = await admin
      .from('profiles')
      .select('id, role, studio_id')
      .eq('id', userId)
      .maybeSingle();
    diagnostics.profile_row = profileRow ?? null;
  }

  // 4. Generate a magic link with redirect to /auth/callback.
  const linkResult = await generateMagicLink(parsed.data.email);
  if (!linkResult.ok || !linkResult.actionLink) {
    return NextResponse.json(
      { error: 'generate_link failed', detail: linkResult.error ?? null },
      { status: 502 },
    );
  }
  const actionLink = linkResult.actionLink;

  if (wantsHtml(request)) {
    const htmlArgs = {
      email: parsed.data.email,
      role: parsed.data.role,
      actionLink,
      ...(artistRow ? { artist: artistRow } : {}),
    };
    return new NextResponse(htmlPage(htmlArgs), {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    });
  }

  revalidateTag('tattoo-artists:list');

  return NextResponse.json({
    email: parsed.data.email,
    role: parsed.data.role,
    user_id: userId,
    artist: artistRow ?? null,
    action_link: actionLink,
    diagnostics,
    profile: { id: userId, role: parsed.data.role },
  });
}
