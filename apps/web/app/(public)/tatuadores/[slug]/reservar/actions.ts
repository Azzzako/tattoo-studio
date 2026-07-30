'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { buildWhatsAppUrl, studioWhatsAppNumber } from '@/lib/whatsapp/build-url';
import { formatQuoteMessage } from '@/lib/whatsapp/format-quote-message';
import { formatBookingMessage } from '@/lib/whatsapp/format-booking-message';
import { getQuoteAttachmentPublicUrl, uploadQuoteAttachment } from '@/lib/supabase/storage';

const phoneSchema = z
  .string()
  .trim()
  .min(8, 'Telefono invalido')
  .regex(/^\+?[0-9\s()-]{8,20}$/u, 'Solo digitos, opcional +, espacios y guiones')
  .transform((s) => s.replace(/[\s()+-]/g, ''));

const MAX_ATTACHMENTS = 5;
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

const quoteSchema = z.object({
  artist_slug: z.string().trim().optional().or(z.literal('')),
  customer_name: z.string().trim().min(2, 'Tu nombre').max(120),
  customer_phone: phoneSchema,
  customer_email: z.string().trim().email('Email invalido').optional().or(z.literal('')),
  idea_text: z.string().trim().min(10, 'Cuentanos tu idea (minimo 10 chars)').max(2000),
  budget_mxn: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .transform((s) => (s === '' ? null : Number(s)))
    .refine((n) => n === null || (Number.isFinite(n) && n >= 0 && n <= 1_000_000), {
      message: 'Entre 0 y 1,000,000 MXN',
    }),
});

export type QuoteActionResult =
  { ok: true; whatsappUrl: string; quoteId: string } | { ok: false; message: string };

export async function submitQuote(
  _prev: QuoteActionResult | undefined,
  formData: FormData,
): Promise<QuoteActionResult> {
  const parsed = quoteSchema.safeParse({
    artist_slug: formData.get('artist_slug') ?? '',
    customer_name: formData.get('customer_name') ?? '',
    customer_phone: formData.get('customer_phone') ?? '',
    customer_email: formData.get('customer_email') ?? '',
    idea_text: formData.get('idea_text') ?? '',
    budget_mxn: formData.get('budget_mxn') ?? '',
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, message: issue?.message ?? 'Datos invalidos' };
  }

  const files = formData.getAll('attachments').filter((f): f is File => f instanceof File);
  const validFiles = files.filter((f) => f.size > 0).slice(0, MAX_ATTACHMENTS);
  if (validFiles.length === 0) {
    return { ok: false, message: 'Adjunta al menos una imagen de referencia.' };
  }
  for (const f of validFiles) {
    if (f.size > MAX_FILE_BYTES) {
      return { ok: false, message: 'Una de las imagenes excede 8 MB.' };
    }
    if (!ALLOWED_MIME.has(f.type)) {
      return { ok: false, message: 'Solo jpeg, png o webp.' };
    }
  }

  const admin = createSupabaseAdminClient();

  const studioId = process.env.STUDIO_ID ?? null;
  if (!studioId) return { ok: false, message: 'STUDIO_ID no configurado.' };

  let artistId: string | null = null;
  let artistDisplayName: string | null = null;
  if (parsed.data.artist_slug) {
    const { data: artistRow } = await admin
      .from('tattoo_artists')
      .select('id, display_name')
      .eq('slug', parsed.data.artist_slug)
      .eq('is_active', true)
      .maybeSingle();
    if (artistRow) {
      artistId = (artistRow as { id: string }).id;
      artistDisplayName = (artistRow as { display_name: string }).display_name;
    }
  }

  const { data: studioRow } = await admin
    .from('studios')
    .select('name')
    .eq('id', studioId)
    .maybeSingle();
  const studioName = (studioRow as { name?: string } | null)?.name ?? 'Estudio';

  const budgetCents =
    parsed.data.budget_mxn === null ? null : Math.round(parsed.data.budget_mxn * 100);

  const { data: quoteInsert, error: quoteErr } = await admin
    .from('quotes')
    .insert({
      studio_id: studioId,
      artist_id: artistId,
      customer_name: parsed.data.customer_name,
      customer_phone: parsed.data.customer_phone,
      customer_email: parsed.data.customer_email || null,
      idea_text: parsed.data.idea_text,
      budget_cents: budgetCents,
      status: 'sent',
      source: 'web',
    })
    .select('id')
    .single();

  if (quoteErr || !quoteInsert) {
    return { ok: false, message: quoteErr?.message ?? 'No se pudo crear la cotizacion.' };
  }
  const quoteId = (quoteInsert as { id: string }).id;

  const attachmentRows: Array<{
    quote_id: string;
    storage_path: string;
    mime_type: string;
    size_bytes: number;
    position: number;
  }> = [];

  for (let i = 0; i < validFiles.length; i++) {
    const file = validFiles[i]!;
    const buf = new Uint8Array(await file.arrayBuffer());
    try {
      const upload = await uploadQuoteAttachment(
        studioId,
        quoteId,
        {
          mimeType: file.type,
          sizeBytes: file.size,
          bytes: buf,
        },
        i,
      );
      attachmentRows.push({
        quote_id: quoteId,
        storage_path: upload.storagePath,
        mime_type: upload.mimeType,
        size_bytes: upload.sizeBytes,
        position: i,
      });
    } catch (e) {
      const { error: cleanupErr } = await admin.from('quotes').delete().eq('id', quoteId);
      void cleanupErr;
      return {
        ok: false,
        message: e instanceof Error ? e.message : 'Error subiendo imagen, cotizacion cancelada.',
      };
    }
  }

  if (attachmentRows.length > 0) {
    const { error: attachErr } = await admin.from('quote_attachments').insert(attachmentRows);
    if (attachErr) {
      const { error: cleanupErr } = await admin.from('quotes').delete().eq('id', quoteId);
      void cleanupErr;
      return { ok: false, message: `Adjuntos: ${attachErr.message}` };
    }
  }

  const urls = await Promise.all(
    attachmentRows.map((row) => getQuoteAttachmentPublicUrl(row.storage_path)),
  );

  const message = formatQuoteMessage({
    artistSlug: parsed.data.artist_slug || null,
    artistDisplayName,
    customerName: parsed.data.customer_name,
    phone: parsed.data.customer_phone,
    email: parsed.data.customer_email || null,
    idea: parsed.data.idea_text,
    budgetCents,
    attachmentUrls: urls,
    studioName,
  });

  const studioWa = studioWhatsAppNumber();
  if (!studioWa) return { ok: false, message: 'WhatsApp del estudio no configurado.' };

  revalidatePath('/admin/quotes');
  return {
    ok: true,
    whatsappUrl: buildWhatsAppUrl(studioWa, message),
    quoteId,
  };
}
export type BookingActionResult =
  { ok: true; whatsappUrl: string; appointmentId: string } | { ok: false; message: string };

const bookingSchema = z.object({
  artist_slug: z.string().trim().min(1),
  service_id: z.string().trim().min(1),
  starts_at: z.string().trim().min(20),
  customer_name: z.string().trim().min(2).max(120),
  customer_phone: z
    .string()
    .trim()
    .min(8)
    .regex(/^\+?[0-9\s()-]{8,20}$/u)
    .transform((s) => s.replace(/[\s()+-]/g, '')),
  customer_email: z.string().trim().email().optional().or(z.literal('')),
  notes: z.string().trim().max(500).optional().or(z.literal('')),
});

export async function submitBooking(
  _prev: BookingActionResult | undefined,
  formData: FormData,
): Promise<BookingActionResult> {
  const parsed = bookingSchema.safeParse({
    artist_slug: formData.get('artist_slug') ?? '',
    service_id: formData.get('service_id') ?? '',
    starts_at: formData.get('starts_at') ?? '',
    customer_name: formData.get('customer_name') ?? '',
    customer_phone: formData.get('customer_phone') ?? '',
    customer_email: formData.get('customer_email') ?? '',
    notes: formData.get('notes') ?? '',
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, message: issue?.message ?? 'Datos invalidos' };
  }

  const admin = createSupabaseAdminClient();

  const { data: artistRow } = await admin
    .from('tattoo_artists')
    .select('id, slug, display_name, studio_id')
    .eq('slug', parsed.data.artist_slug)
    .eq('is_active', true)
    .maybeSingle();

  if (!artistRow) {
    return { ok: false, message: 'Tatuador no disponible.' };
  }
  const artist = artistRow as {
    id: string;
    slug: string;
    display_name: string;
    studio_id: string;
  };

  const { data: serviceRow } = await admin
    .from('services')
    .select('id, name, duration_minutes, studio_id')
    .eq('id', parsed.data.service_id)
    .eq('is_active', true)
    .maybeSingle();

  if (!serviceRow) {
    return { ok: false, message: 'Servicio no disponible.' };
  }
  const service = serviceRow as {
    id: string;
    name: string;
    duration_minutes: number;
    studio_id: string;
  };

  if (service.studio_id !== artist.studio_id) {
    return { ok: false, message: 'Servicio no pertenece al estudio.' };
  }

  const start = new Date(parsed.data.starts_at);
  if (Number.isNaN(start.getTime())) {
    return { ok: false, message: 'Slot invalido.' };
  }
  const end = new Date(start.getTime() + service.duration_minutes * 60_000);

  // Slot collision check (admin bypasses RLS).
  const { data: collisions } = await admin
    .from('appointments')
    .select('id')
    .eq('artist_id', artist.id)
    .neq('status', 'cancelled')
    .lt('starts_at', end.toISOString())
    .gt('ends_at', start.toISOString())
    .limit(1);

  if (collisions && collisions.length > 0) {
    return { ok: false, message: 'Ese horario ya esta ocupado. Elige otro.' };
  }

  // Upsert customer by (studio_id, phone_e164).
  const phone = parsed.data.customer_phone.replace(/[\s()-]/g, '');
  const { data: customerRow, error: customerErr } = await admin
    .from('customers')
    .upsert(
      {
        studio_id: artist.studio_id,
        phone_e164: phone,
        full_name: parsed.data.customer_name,
        email: parsed.data.customer_email || null,
      },
      { onConflict: 'studio_id,phone_e164' },
    )
    .select('id')
    .single();

  if (customerErr || !customerRow) {
    return {
      ok: false,
      message: customerErr?.message ?? 'No se pudo registrar el cliente.',
    };
  }
  const customerId = (customerRow as { id: string }).id;

  const { data: apptRow, error: apptErr } = await admin
    .from('appointments')
    .insert({
      studio_id: artist.studio_id,
      artist_id: artist.id,
      service_id: service.id,
      customer_id: customerId,
      starts_at: start.toISOString(),
      ends_at: end.toISOString(),
      status: 'pending',
      source: 'web',
      notes: parsed.data.notes || null,
    })
    .select('id')
    .single();

  if (apptErr || !apptRow) {
    return { ok: false, message: apptErr?.message ?? 'No se pudo crear la reserva.' };
  }

  const studioWa = studioWhatsAppNumber();
  if (!studioWa) return { ok: false, message: 'WhatsApp del estudio no configurado.' };

  const message = formatBookingMessage({
    artistSlug: artist.slug,
    artistDisplayName: artist.display_name,
    serviceName: service.name,
    dateIso: start.toLocaleString('es-MX', { dateStyle: 'full', timeStyle: 'short' }),
    slot: `${formatHm(start)} – ${formatHm(end)}`,
    customerName: parsed.data.customer_name,
    phone,
    email: parsed.data.customer_email || null,
    reference: parsed.data.notes || undefined,
  });

  revalidatePath('/admin/calendar');
  revalidatePath('/admin');

  return {
    ok: true,
    whatsappUrl: buildWhatsAppUrl(studioWa, message),
    appointmentId: (apptRow as { id: string }).id,
  };
}

function formatHm(d: Date): string {
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}
