'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

const profileChangeSchema = z.object({
  display_name: z.string().trim().min(2).max(120),
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
  schedule_kind: z
    .enum(['', 'open_now', 'closes_in_weeks', 'waitlist_only', 'by_request'])
    .optional()
    .default(''),
  schedule_weeks: z
    .union([z.string(), z.number()])
    .transform((v) => (v === '' || v === undefined ? null : Number(v)))
    .refine((n) => n === null || (Number.isFinite(n) && n >= 1 && n <= 52), {
      message: 'Entre 1 y 52',
    })
    .nullable(),
  instagram: z
    .string()
    .trim()
    .max(60)
    .regex(/^[a-zA-Z0-9._-]*$/, 'Solo letras, números, "." "_" "-"')
    .optional()
    .or(z.literal('')),
  twitter: z
    .string()
    .trim()
    .max(60)
    .regex(/^[a-zA-Z0-9._-]*$/, 'Solo letras, números, "." "_" "-"')
    .optional()
    .or(z.literal('')),
  youtube: z
    .string()
    .trim()
    .max(60)
    .regex(/^[a-zA-Z0-9._-]*$/, 'Solo letras, números, "." "_" "-"')
    .optional()
    .or(z.literal('')),
  website: z
    .string()
    .trim()
    .max(200)
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || /^https?:\/\//i.test(v), 'Debe iniciar con http:// o https://'),
  avatar_path: z.string().trim().max(500).optional().or(z.literal('')),
});

export type ArtistChangeActionResult =
  { ok: true; changeId: string } | { ok: false; message: string };

export async function submitArtistProfileChange(
  _prev: ArtistChangeActionResult | undefined,
  formData: FormData,
): Promise<ArtistChangeActionResult> {
  const parsed = profileChangeSchema.safeParse({
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
    avatar_path: formData.get('avatar_path') ?? '',
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, message: issue?.message ?? 'Datos invalidos' };
  }

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { ok: false, message: 'No autenticado' };

  const { data: artistRow } = await supabase
    .from('tattoo_artists')
    .select('id, studio_id')
    .eq('profile_id', userData.user.id)
    .limit(1);
  const artist = (artistRow ?? [])[0] as { id: string; studio_id: string } | undefined;
  if (!artist) return { ok: false, message: 'No estas vinculado a una fila de tatuador.' };

  const scheduleKind = parsed.data.schedule_kind
    ? (parsed.data.schedule_kind as 'open_now' | 'closes_in_weeks' | 'waitlist_only' | 'by_request')
    : null;
  const scheduleWeeks = scheduleKind === 'closes_in_weeks' ? parsed.data.schedule_weeks : null;

  const proposedChanges: Record<string, unknown> = {
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
  };
  if (parsed.data.avatar_path) {
    proposedChanges.avatar_path = parsed.data.avatar_path;
  }

  const { data: inserted, error } = await supabase
    .from('artist_profile_changes')
    .insert({
      studio_id: artist.studio_id,
      artist_id: artist.id,
      proposed_changes: proposedChanges,
      status: 'pending',
    })
    .select('id')
    .single();

  if (error || !inserted) {
    return { ok: false, message: error?.message ?? 'No se pudo enviar la propuesta.' };
  }

  revalidatePath('/admin/artists');
  revalidatePath('/cuenta/perfil');
  return { ok: true, changeId: (inserted as { id: string }).id };
}

export async function approveProfileChange(formData: FormData): Promise<void> {
  const changeId = String(formData.get('change_id') ?? '');
  if (!changeId) return;

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  const { data: profileRow } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .maybeSingle();
  if (profileRow?.role !== 'admin') return;

  const admin = createSupabaseAdminClient();

  const { data: changeRow } = await admin
    .from('artist_profile_changes')
    .select('id, artist_id, studio_id, proposed_changes, status')
    .eq('id', changeId)
    .maybeSingle();

  if (!changeRow) return;
  if ((changeRow as { status: string }).status !== 'pending') return;

  const proposed = (changeRow as { proposed_changes: Record<string, unknown> }).proposed_changes;

  const { error: updateErr } = await admin
    .from('tattoo_artists')
    .update(proposed)
    .eq('id', (changeRow as { artist_id: string }).artist_id);

  if (updateErr) {
    await admin
      .from('artist_profile_changes')
      .update({
        status: 'rejected',
        reviewed_by: userData.user.id,
        reviewed_at: new Date().toISOString(),
        review_note: `Fallo al aplicar: ${updateErr.message}`,
      })
      .eq('id', changeId);
    return;
  }

  await admin
    .from('artist_profile_changes')
    .update({
      status: 'approved',
      reviewed_by: userData.user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', changeId);

  revalidatePath('/admin/artists');
  revalidatePath(`/tatuadores`, 'layout');
}

export async function rejectProfileChange(formData: FormData): Promise<void> {
  const changeId = String(formData.get('change_id') ?? '');
  const note = String(formData.get('review_note') ?? '').trim();
  if (!changeId) return;

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return;

  const { data: profileRow } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .maybeSingle();
  if (profileRow?.role !== 'admin') return;

  const admin = createSupabaseAdminClient();
  await admin
    .from('artist_profile_changes')
    .update({
      status: 'rejected',
      reviewed_by: userData.user.id,
      reviewed_at: new Date().toISOString(),
      review_note: note || 'Rechazado',
    })
    .eq('id', changeId);

  revalidatePath('/admin/artists');
}

export type AdminArtistResult = { ok: true } | { ok: false; message: string };

const adminArtistSchema = profileChangeSchema.extend({
  is_active: z.boolean().optional(),
  featured: z.boolean().optional(),
});

export async function updateArtistAsAdmin(formData: FormData): Promise<AdminArtistResult> {
  const isActiveRaw = formData.get('is_active');
  const featuredRaw = formData.get('featured');
  const parsed = adminArtistSchema.safeParse({
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
    avatar_path: formData.get('avatar_path') ?? '',
    is_active: isActiveRaw === 'on' || isActiveRaw === 'true' || isActiveRaw === '1',
    featured: featuredRaw === 'on' || featuredRaw === 'true' || featuredRaw === '1',
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, message: issue?.message ?? 'Datos invalidos' };
  }

  const artistId = String(formData.get('artist_id') ?? '');
  if (!artistId) return { ok: false, message: 'artist_id requerido' };

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { ok: false, message: 'No autenticado' };

  const { data: profileRow } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userData.user.id)
    .maybeSingle();
  if (profileRow?.role !== 'admin') return { ok: false, message: 'Solo administradores.' };

  const scheduleKind = parsed.data.schedule_kind
    ? (parsed.data.schedule_kind as 'open_now' | 'closes_in_weeks' | 'waitlist_only' | 'by_request')
    : null;
  const scheduleWeeks = scheduleKind === 'closes_in_weeks' ? parsed.data.schedule_weeks : null;

  const updatePayload: Record<string, unknown> = {
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
    is_active: parsed.data.is_active ?? true,
    featured: parsed.data.featured ?? false,
  };
  if (parsed.data.avatar_path) {
    updatePayload.avatar_path = parsed.data.avatar_path;
  }

  const { error } = await supabase.from('tattoo_artists').update(updatePayload).eq('id', artistId);

  if (error) return { ok: false, message: error.message };

  revalidatePath('/admin/artists');
  revalidatePath(`/tatuadores`, 'layout');
  return { ok: true };
}

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ALLOWED_AVATAR_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function uploadAvatarProposal(
  _prev: ArtistChangeActionResult | undefined,
  formData: FormData,
): Promise<ArtistChangeActionResult> {
  const file = formData.get('file');
  if (!(file instanceof File)) {
    return { ok: false, message: 'No se recibio archivo.' };
  }
  if (file.size === 0) return { ok: false, message: 'Archivo vacio.' };
  if (file.size > MAX_AVATAR_BYTES) {
    return { ok: false, message: 'Maximo 5 MB.' };
  }
  if (!ALLOWED_AVATAR_MIME.has(file.type)) {
    return { ok: false, message: 'Tipo no permitido (jpeg/png/webp).' };
  }

  const supabase = await createSupabaseServerClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { ok: false, message: 'No autenticado' };

  const { data: artistRow } = await supabase
    .from('tattoo_artists')
    .select('id, studio_id, avatar_path')
    .eq('profile_id', userData.user.id)
    .limit(1);
  const artist = (artistRow ?? [])[0] as
    { id: string; studio_id: string; avatar_path: string | null } | undefined;
  if (!artist) return { ok: false, message: 'No estas vinculado a una fila de tatuador.' };

  const studioId = artist.studio_id;
  if (!studioId) return { ok: false, message: 'La fila de tatuador no tiene studio_id.' };

  const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
  const path = `${studioId}/${artist.id}/avatar-${Date.now()}.${ext}`;

  const { createSupabaseAdminClient: adminFactory } = await import('@/lib/supabase/admin');
  const adminClient = adminFactory();
  const { error: uploadErr } = await adminClient.storage
    .from('artist-avatars')
    .upload(path, new Uint8Array(await file.arrayBuffer()), {
      upsert: false,
      contentType: file.type,
    });

  if (uploadErr) {
    return {
      ok: false,
      message: `Storage: ${uploadErr.message}. ¿Corriste 0008 (bucket) en SQL Editor?`,
    };
  }

  const {
    data: { publicUrl },
  } = adminClient.storage.from('artist-avatars').getPublicUrl(path);

  // Avatar change goes via proposal too.
  const { data: inserted, error: propErr } = await supabase
    .from('artist_profile_changes')
    .insert({
      studio_id: studioId,
      artist_id: artist.id,
      proposed_changes: {
        avatar_path: publicUrl,
      },
      status: 'pending',
    })
    .select('id')
    .single();

  if (propErr || !inserted) {
    return { ok: false, message: propErr?.message ?? 'No se pudo encolar la propuesta.' };
  }

  revalidatePath('/admin/artists');
  revalidatePath('/cuenta/perfil');
  return { ok: true, changeId: (inserted as { id: string }).id };
}
