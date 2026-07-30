import { z } from 'zod';

// ──────────────────────────────────────────────────────────────────────
// Public-facing artist shape (no profile_id, no internal fields).
// ──────────────────────────────────────────────────────────────────────

const scheduleKindSchema = z.enum(['open_now', 'closes_in_weeks', 'waitlist_only', 'by_request']);

export const ArtistPublicSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  display_name: z.string(),
  headline: z.string().nullable(),
  bio: z.string().nullable(),
  long_bio: z.string().nullable(),
  specialties: z.array(z.string()).nullable(),
  city: z.string().nullable(),
  years_active: z.number().int().nullable(),
  schedule_kind: scheduleKindSchema.nullable(),
  schedule_weeks: z.number().int().nullable(),
  avatar_url: z.string().url().nullable(),
  instagram: z.string().nullable(),
  twitter: z.string().nullable(),
  youtube: z.string().nullable(),
  website: z
    .string()
    .refine((v) => /^https?:\/\//i.test(v), 'Debe iniciar con http:// o https://')
    .nullable(),
  featured: z.boolean(),
});
export type ArtistPublic = z.infer<typeof ArtistPublicSchema>;

export const PortfolioItemPublicSchema = z.object({
  id: z.string().uuid(),
  storage_url: z.string().url().nullable(),
  seed: z.string().nullable(),
  alt_text: z.string().nullable(),
  style_tags: z.array(z.string()).nullable(),
  position: z.number().int(),
});
export type PortfolioItemPublic = z.infer<typeof PortfolioItemPublicSchema>;

export const ArtistWithPortfolioSchema = ArtistPublicSchema.extend({
  portfolio: z.array(PortfolioItemPublicSchema),
});
export type ArtistWithPortfolio = z.infer<typeof ArtistWithPortfolioSchema>;

// ──────────────────────────────────────────────────────────────────────
// Pagination + list response.
// ──────────────────────────────────────────────────────────────────────

export const ListArtistsQuerySchema = z.object({
  featured: z
    .union([z.literal('true'), z.literal('false')])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});
export type ListArtistsQuery = z.infer<typeof ListArtistsQuerySchema>;

export const ListArtistsResponseSchema = z.object({
  data: z.array(ArtistPublicSchema),
  pagination: z.object({
    total: z.number().int(),
    limit: z.number().int(),
    offset: z.number().int(),
  }),
});
export type ListArtistsResponse = z.infer<typeof ListArtistsResponseSchema>;
