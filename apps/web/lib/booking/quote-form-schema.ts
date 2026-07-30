import { z } from 'zod';

/**
 * Validates the "cotizar" / "reservar" submission flow data.
 * Extracted from the server action so tests can exercise it in isolation.
 */
export const quoteFormSchema = z.object({
  artist_slug: z.string().trim().optional().or(z.literal('')),
  customer_name: z.string().trim().min(2, 'Tu nombre').max(120),
  customer_phone: z
    .string()
    .trim()
    .min(8, 'Telefono invalido')
    .regex(/^\+?[0-9\s()-]{8,20}$/u, 'Solo digitos, opcional +, espacios y guiones'),
  customer_email: z.string().trim().email('Email invalido').optional().or(z.literal('')),
  idea_text: z.string().trim().min(10, 'Cuentanos tu idea').max(2000),
  budget_mxn: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((s) => {
      if (s === '' || s === undefined) return true;
      const n = Number(s);
      return Number.isFinite(n) && n >= 0 && n <= 1_000_000;
    }, 'Entre 0 y 1,000,000 MXN'),
});

export const bookingFormSchema = z.object({
  artist_slug: z.string().trim().min(1),
  service_id: z.string().trim().min(1),
  starts_at: z.string().trim().min(20, 'Slot invalido'),
  customer_name: z.string().trim().min(2).max(120),
  customer_phone: z
    .string()
    .trim()
    .min(8)
    .regex(/^\+?[0-9\s()-]{8,20}$/u),
  customer_email: z.string().trim().email().optional().or(z.literal('')),
  notes: z.string().trim().max(500).optional().or(z.literal('')),
});

export type QuoteFormInput = z.input<typeof quoteFormSchema>;
export type BookingFormInput = z.input<typeof bookingFormSchema>;

export function normalizePhone(input: string): string {
  return input.replace(/[\s()+-]/g, '');
}

export function normalizeBudgetCents(input: string): number | null {
  if (!input) return null;
  const n = Number(input);
  if (!Number.isFinite(n)) return null;
  return Math.round(n * 100);
}
