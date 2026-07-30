import 'server-only';

import { createClient } from '@supabase/supabase-js';

import type { ScheduleKind } from '@/components/artists/schedule-badge';

let cachedClient: ReturnType<typeof createClient> | null = null;

function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY required for service-role client');
  }
  if (!cachedClient) {
    cachedClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return cachedClient;
}

export type QuoteAttachmentUpload = {
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
};

export async function uploadQuoteAttachment(
  studioId: string,
  quoteId: string,
  file: { mimeType: string; sizeBytes: number; bytes: Uint8Array },
  position: number,
): Promise<QuoteAttachmentUpload> {
  const ext =
    file.mimeType === 'image/png' ? 'png' : file.mimeType === 'image/webp' ? 'webp' : 'jpg';
  const path = `${studioId}/${quoteId}/${position}.${ext}`;

  const { error } = await client().storage.from('quote-attachments').upload(path, file.bytes, {
    contentType: file.mimeType,
    upsert: false,
  });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  return {
    storagePath: path,
    mimeType: file.mimeType,
    sizeBytes: file.sizeBytes,
  };
}

export async function getQuoteAttachmentPublicUrl(storagePath: string): Promise<string> {
  const { data } = client().storage.from('quote-attachments').getPublicUrl(storagePath);
  return data.publicUrl;
}

export type StudioStudioContext = {
  studioName: string;
  scheduleKind: ScheduleKind | null;
};

export async function getStudioMeta(studioId: string): Promise<StudioStudioContext> {
  const { data } = await client().from('studios').select('name').eq('id', studioId).maybeSingle();
  return {
    studioName: (data as { name?: string } | null)?.name ?? 'Estudio',
    scheduleKind: null,
  };
}
