'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { createSupabaseServerClient } from '@/lib/supabase/server';

const urlSchema = z
  .string()
  .trim()
  .max(200)
  .refine((v) => v === '' || /^https?:\/\//i.test(v), 'Debe iniciar con http:// o https://')
  .optional()
  .or(z.literal(''));

const handleOptionalSchema = z
  .string()
  .trim()
  .max(60)
  .regex(/^[a-zA-Z0-9._-]*$/, 'Solo letras, números, "." "_" "-"')
  .optional()
  .or(z.literal(''));

const scheduleKindSchema = z.enum(['open_now', 'closes_in_weeks', 'waitlist_only', 'by_request']);

const profileSchema = z.object({
  display_name: z.string().trim().min(2, 'Mínimo 2 caracteres').max(120),
  bio: z.string().trim().max(2000).optional().or(z.literal('')),
  long_bio: z.string().trim().max(4000).optional().or(z.literal('')),
  headline: z.string().trim().max(160).optional().or(z.literal('')),
  specialties: z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal(''))
    .transform((s) =>
      s
        ? s
            .split(',')
            .map((t) => t.trim().toLowerCase())
            .filter((t) => t.length > 0 && t.length <= 30)
        : [],
    ),
  city: z.string().trim().max(120).optional().or(z.literal('')),
  years_active: z
    .union([z.string(), z.number()])
    .transform((v) => (v === '' || v === undefined ? null : Number(v)))
    .refine((n) => n === null || (Number.isFinite(n) && n >= 0 && n <= 80), {
      message: 'Entre 0 y 80',
    })
    .nullable(),
  schedule_kind: scheduleKindSchema.optional().or(z.literal('')),
  schedule_weeks: z
    .union([z.string(), z.number()])
    .transform((v) => (v === '' || v === undefined ? null : Number(v)))
    .refine((n) => n === null || (Number.isFinite(n) && n >= 1 && n <= 52), {
      message: 'Entre 1 y 52',
    })
    .nullable(),
  instagram: handleOptionalSchema,
  twitter: handleOptionalSchema,
  youtube: handleOptionalSchema,
  website: urlSchema,
});

export type ProfileActionResult = { ok: true } | { ok: false; message: string };

export async function updateMyArtistProfile(
  _prev: ProfileActionResult | undefined,
  formData: FormData,
): Promise<ProfileActionResult> {
  const parsed = profileSchema.safeParse({
    display_name: formData.get('display_name') ?? '',
    bio: formData.get('bio') ?? '',
    long_bio: formData.get('long_bio') ?? '',
    headline: formData.get('headline') ?? '',
    specialties: formData.get('specialties') ?? '',
    city: formData.get('city') ?? '',
    years_active: formData.get('years_active') ?? '',
    schedule_kind: formData.get('schedule_kind') ?? '',
    schedule_weeks: formData.get('schedule_weeks') ?? '',
    instagram: formData.get('instagram') ?? '',
    twitter: formData.get('twitter') ?? '',
    youtube: formData.get('youtube') ?? '',
    website: formData.get('website') ?? '',
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, message: issue?.message ?? 'Datos inválidos' };
  }

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { ok: false, message: 'No autenticado' };

  const { data: profileRow } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .maybeSingle();
  if (profileRow?.role !== 'artist' && profileRow?.role !== 'admin') {
    return { ok: false, message: 'Solo artistas pueden editar su perfil.' };
  }

  const scheduleKind = parsed.data.schedule_kind
    ? (parsed.data.schedule_kind as 'open_now' | 'closes_in_weeks' | 'waitlist_only' | 'by_request')
    : null;
  const scheduleWeeks = scheduleKind === 'closes_in_weeks' ? parsed.data.schedule_weeks : null;

  const { error } = await supabase
    .from('tattoo_artists')
    .update({
      display_name: parsed.data.display_name,
      bio: parsed.data.bio || null,
      long_bio: parsed.data.long_bio || null,
      headline: parsed.data.headline || null,
      specialties: parsed.data.specialties,
      city: parsed.data.city || null,
      years_active: parsed.data.years_active,
      schedule_kind: scheduleKind,
      schedule_weeks: scheduleWeeks,
      instagram: parsed.data.instagram || null,
      twitter: parsed.data.twitter || null,
      youtube: parsed.data.youtube || null,
      website: parsed.data.website || null,
    })
    .eq('profile_id', userData.user.id);

  if (error) return { ok: false, message: error.message };

  revalidatePath('/cuenta');
  revalidatePath('/cuenta/perfil');
  revalidatePath(`/tatuadores`, 'layout');
  return { ok: true };
}

export async function toggleFeaturedForArtist(formData: FormData): Promise<void> {
  const artistId = String(formData.get('artist_id') ?? '');
  if (!artistId) return;

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  const { data: profileRow } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .maybeSingle();
  if (profileRow?.role !== 'admin') return;

  const target = formData.get('featured');
  const featured = target === 'on' || target === 'true' || target === '1';

  await supabase.from('tattoo_artists').update({ featured }).eq('id', artistId);

  revalidatePath('/admin/artists');
  revalidatePath(`/tatuadores`, 'layout');
}

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function uploadAvatar(
  _prev: ProfileActionResult | undefined,
  formData: FormData,
): Promise<ProfileActionResult> {
  const file = formData.get('file');
  if (!(file instanceof File)) {
    return { ok: false, message: 'No se recibió archivo.' };
  }
  if (file.size === 0) return { ok: false, message: 'Archivo vacío.' };
  if (file.size > MAX_AVATAR_BYTES) {
    return { ok: false, message: 'Máximo 5 MB.' };
  }
  if (!ALLOWED_MIME.has(file.type)) {
    return { ok: false, message: 'Tipo no permitido (jpeg/png/webp).' };
  }

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { ok: false, message: 'No autenticado' };

  const { data: artistRows } = await supabase
    .from('tattoo_artists')
    .select('id, studio_id')
    .eq('profile_id', userData.user.id)
    .order('updated_at', { ascending: false })
    .limit(1);
  const artistRow = artistRows?.[0] ?? null;
  if (!artistRow) {
    return { ok: false, message: 'No estás vinculado a una fila de tatuador.' };
  }

  const studioId = artistRow.studio_id as string | null;
  if (!studioId) {
    return { ok: false, message: 'La fila de tatuador no tiene studio_id.' };
  }

  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const path = `${studioId}/${artistRow.id as string}/avatar-${Date.now()}.${ext}`;

  const { createSupabaseAdminClient } = await import('@/lib/supabase/admin');
  const admin = createSupabaseAdminClient();
  const { error: uploadErr } = await admin.storage
    .from('artist-avatars')
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadErr) {
    return {
      ok: false,
      message: `Storage: ${uploadErr.message}. ¿Corriste 0008 (bucket) en SQL Editor?`,
    };
  }

  const {
    data: { publicUrl },
  } = admin.storage.from('artist-avatars').getPublicUrl(path);

  const { error: updateErr } = await supabase
    .from('tattoo_artists')
    .update({ avatar_path: publicUrl })
    .eq('profile_id', userData.user.id);

  if (updateErr) return { ok: false, message: updateErr.message };

  revalidatePath('/cuenta');
  revalidatePath('/cuenta/perfil');
  revalidatePath(`/tatuadores`, 'layout');
  return { ok: true };
}
