/**
 * Builds a `wa.me` URL that opens WhatsApp with a pre-filled message
 * to the studio's number. The studio number is read from
 * `NEXT_PUBLIC_STUDIO_WHATSAPP` (server-side env). Digits only, no "+".
 *
 * Per WhatsApp Cloud docs, wa.me URLs accept E.164 numbers without the
 * leading "+". For example: `https://wa.me/5215512345678?text=...`
 */
export function buildWhatsAppUrl(phoneE164: string, text: string): string {
  const digits = phoneE164.replace(/[^\d]/g, '');
  const params = new URLSearchParams({ text });
  return `https://wa.me/${digits}?${params.toString()}`;
}

export function studioWhatsAppNumber(): string {
  const raw = process.env.NEXT_PUBLIC_STUDIO_WHATSAPP ?? process.env.WHATSAPP_PHONE_ID ?? '';
  // WHATSAPP_PHONE_ID comes from Meta as digits-only; coerce just in case.
  return raw.replace(/[^\d]/g, '');
}
