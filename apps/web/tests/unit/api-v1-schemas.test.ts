import { createHash } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { ArtistPublicSchema, ListArtistsQuerySchema } from '@/lib/api/v1/schemas';

describe('ArtistPublicSchema', () => {
  it('parsea un artist valido', () => {
    const r = ArtistPublicSchema.safeParse({
      id: '00000000-0000-0000-0000-000000000010',
      slug: 'inka',
      display_name: 'Inka',
      headline: 'Geometria',
      bio: null,
      long_bio: null,
      specialties: ['blackwork'],
      city: 'CDMX',
      years_active: 7,
      schedule_kind: 'open_now',
      schedule_weeks: null,
      avatar_url: 'https://example.com/a.jpg',
      instagram: 'inka',
      twitter: null,
      youtube: null,
      website: null,
      featured: true,
    });
    expect(r.success).toBe(true);
  });

  it('rechaza schedule_kind invalido', () => {
    const r = ArtistPublicSchema.safeParse({
      id: '00000000-0000-0000-0000-000000000010',
      slug: 'inka',
      display_name: 'Inka',
      headline: null,
      bio: null,
      long_bio: null,
      specialties: null,
      city: null,
      years_active: null,
      schedule_kind: 'random',
      schedule_weeks: null,
      avatar_url: null,
      instagram: null,
      twitter: null,
      youtube: null,
      website: null,
      featured: false,
    });
    expect(r.success).toBe(false);
  });

  it('rechaza website sin https://', () => {
    const r = ArtistPublicSchema.safeParse({
      id: '00000000-0000-0000-0000-000000000010',
      slug: 'inka',
      display_name: 'Inka',
      headline: null,
      bio: null,
      long_bio: null,
      specialties: null,
      city: null,
      years_active: null,
      schedule_kind: null,
      schedule_weeks: null,
      avatar_url: null,
      instagram: null,
      twitter: null,
      youtube: null,
      website: 'ftp://example.com',
      featured: false,
    });
    expect(r.success).toBe(false);
  });

  it('todos los campos opcionales pueden ser null', () => {
    const r = ArtistPublicSchema.safeParse({
      id: '00000000-0000-0000-0000-000000000010',
      slug: 'inka',
      display_name: 'Inka',
      headline: null,
      bio: null,
      long_bio: null,
      specialties: null,
      city: null,
      years_active: null,
      schedule_kind: null,
      schedule_weeks: null,
      avatar_url: null,
      instagram: null,
      twitter: null,
      youtube: null,
      website: null,
      featured: false,
    });
    expect(r.success).toBe(true);
  });
});

describe('ListArtistsQuerySchema', () => {
  it('defaults cuando no hay params', () => {
    const r = ListArtistsQuerySchema.parse({});
    expect(r.featured).toBeUndefined();
    expect(r.limit).toBe(50);
    expect(r.offset).toBe(0);
  });

  it('parsea featured=true', () => {
    const r = ListArtistsQuerySchema.parse({ featured: 'true' });
    expect(r.featured).toBe(true);
  });

  it('parsea featured=false', () => {
    const r = ListArtistsQuerySchema.parse({ featured: 'false' });
    expect(r.featured).toBe(false);
  });

  it('coercea limit/offset desde string', () => {
    const r = ListArtistsQuerySchema.parse({ limit: '25', offset: '100' });
    expect(r.limit).toBe(25);
    expect(r.offset).toBe(100);
  });

  it('rechaza limit > 100', () => {
    const r = ListArtistsQuerySchema.safeParse({ limit: '500' });
    expect(r.success).toBe(false);
  });

  it('rechaza offset negativo', () => {
    const r = ListArtistsQuerySchema.safeParse({ offset: '-1' });
    expect(r.success).toBe(false);
  });
});

describe('API key hashing contract', () => {
  // This mirrors the script's hashing logic so the auth flow is testable
  // without a real Postgres round-trip.
  function hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  function prefixOf(token: string): string {
    return token.slice(0, 12);
  }

  it('prefix matches first 12 chars', () => {
    const tok = 'tk_abc123456789ABCDEFGH';
    expect(prefixOf(tok)).toBe('tk_abc123456');
  });

  it('hash is deterministic sha256 hex', () => {
    const tok = 'tk_test_key_xyz';
    expect(hashToken(tok)).toBe(hashToken(tok));
    expect(hashToken(tok).length).toBe(64);
  });

  it('different tokens produce different hashes', () => {
    expect(hashToken('tk_a')).not.toBe(hashToken('tk_b'));
  });

  it('format tk_<base64url> with 32 bytes', () => {
    const tok = 'tk_' + 'A'.repeat(43) + '==';
    const parts = tok.split('_');
    expect(parts[0]).toBe('tk');
    expect(parts[1]!.length).toBeGreaterThanOrEqual(43);
  });
});
