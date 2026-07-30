import { describe, expect, it } from 'vitest';

import {
  bookingFormSchema,
  normalizeBudgetCents,
  normalizePhone,
  quoteFormSchema,
} from '@/lib/booking/quote-form-schema';

describe('quoteFormSchema', () => {
  it('acepta un quote minimo valido', () => {
    const r = quoteFormSchema.safeParse({
      artist_slug: 'inka',
      customer_name: 'Ana Garcia',
      customer_phone: '+525512345678',
      customer_email: '',
      idea_text: 'Quiero un tatuaje geometrico en el antebrazo.',
      budget_mxn: '',
    });
    expect(r.success).toBe(true);
  });

  it('rechaza idea_text de menos de 10 chars', () => {
    const r = quoteFormSchema.safeParse({
      artist_slug: '',
      customer_name: 'Ana Garcia',
      customer_phone: '+525512345678',
      customer_email: '',
      idea_text: 'corto',
      budget_mxn: '',
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      const ideaIssue = r.error.issues.find((i: { path: Array<string | number> }) =>
        i.path.includes('idea_text'),
      );
      expect(ideaIssue).toBeDefined();
    }
  });

  it('rechaza nombre vacio', () => {
    const r = quoteFormSchema.safeParse({
      artist_slug: '',
      customer_name: '',
      customer_phone: '+525512345678',
      customer_email: '',
      idea_text: 'Una idea suficientemente larga para pasar.',
      budget_mxn: '',
    });
    expect(r.success).toBe(false);
  });

  it('rechaza telefono invalido', () => {
    const r = quoteFormSchema.safeParse({
      artist_slug: '',
      customer_name: 'Ana Garcia',
      customer_phone: 'no',
      customer_email: '',
      idea_text: 'Una idea suficientemente larga para pasar.',
      budget_mxn: '',
    });
    expect(r.success).toBe(false);
  });

  it('rechaza budget_mxn fuera de rango', () => {
    const r = quoteFormSchema.safeParse({
      artist_slug: '',
      customer_name: 'Ana Garcia',
      customer_phone: '+525512345678',
      customer_email: '',
      idea_text: 'Una idea suficientemente larga para pasar.',
      budget_mxn: '2000000',
    });
    expect(r.success).toBe(false);
  });
});

describe('bookingFormSchema', () => {
  it('acepta un booking valido', () => {
    const r = bookingFormSchema.safeParse({
      artist_slug: 'inka',
      service_id: '11111111-1111-1111-1111-111111111111',
      starts_at: '2026-12-31T15:00:00.000Z',
      customer_name: 'Ana Garcia',
      customer_phone: '+525512345678',
      customer_email: '',
      notes: '',
    });
    expect(r.success).toBe(true);
  });

  it('rechaza starts_at vacio', () => {
    const r = bookingFormSchema.safeParse({
      artist_slug: 'inka',
      service_id: '11111111-1111-1111-1111-111111111111',
      starts_at: '',
      customer_name: 'Ana Garcia',
      customer_phone: '+525512345678',
      customer_email: '',
      notes: '',
    });
    expect(r.success).toBe(false);
  });
});

describe('normalizePhone', () => {
  it('quita espacios, parentesis y guiones', () => {
    expect(normalizePhone('+52 (55) 1234-5678')).toBe('525512345678');
    expect(normalizePhone('525512345678')).toBe('525512345678');
  });
});

describe('normalizeBudgetCents', () => {
  it('convierte MXN a centavos', () => {
    expect(normalizeBudgetCents('1000')).toBe(100_000);
    expect(normalizeBudgetCents('1500.50')).toBe(150_050);
  });

  it('null cuando vacio', () => {
    expect(normalizeBudgetCents('')).toBe(null);
    expect(normalizeBudgetCents('abc')).toBe(null);
  });
});
