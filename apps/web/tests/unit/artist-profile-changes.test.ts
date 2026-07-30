import { describe, expect, it } from 'vitest';

/**
 * Validates the rules used by `approveProfileChange` /
 * `rejectProfileChange` server actions in
 * `/admin/artists/actions.ts`. Pure functions over the
 * `proposed_changes` JSONB shape — no Supabase involved.
 */

type ProposedChanges = Record<string, unknown>;

const ALLOWED_KEYS = new Set([
  'display_name',
  'bio',
  'long_bio',
  'headline',
  'specialties',
  'city',
  'years_active',
  'schedule_kind',
  'schedule_weeks',
  'instagram',
  'twitter',
  'youtube',
  'website',
  'avatar_path',
]);

function validateProposedChanges(input: ProposedChanges): {
  ok: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  for (const key of Object.keys(input)) {
    if (!ALLOWED_KEYS.has(key)) {
      errors.push(`Campo no permitido: ${key}`);
    }
  }
  if ('display_name' in input) {
    const name = input.display_name;
    if (typeof name !== 'string' || name.trim().length < 2) {
      errors.push('display_name debe ser string con al menos 2 caracteres');
    }
  }
  if ('years_active' in input && input.years_active !== null) {
    const y = input.years_active;
    if (typeof y !== 'number' || y < 0 || y > 80) {
      errors.push('years_active fuera de rango');
    }
  }
  if ('schedule_weeks' in input && input.schedule_weeks !== null) {
    const w = input.schedule_weeks;
    if (typeof w !== 'number' || w < 1 || w > 52) {
      errors.push('schedule_weeks fuera de rango');
    }
  }
  if (
    'schedule_kind' in input &&
    input.schedule_kind !== null &&
    !['open_now', 'closes_in_weeks', 'waitlist_only', 'by_request'].includes(
      input.schedule_kind as string,
    )
  ) {
    errors.push('schedule_kind invalido');
  }
  if ('avatar_path' in input && input.avatar_path !== null) {
    if (typeof input.avatar_path !== 'string' || !input.avatar_path.startsWith('http')) {
      errors.push('avatar_path debe ser URL valida');
    }
  }
  return { ok: errors.length === 0, errors };
}

describe('validateProposedChanges', () => {
  it('acepta un payload minimo valido', () => {
    const r = validateProposedChanges({ display_name: 'Mateo Reyes' });
    expect(r.ok).toBe(true);
    expect(r.errors).toEqual([]);
  });

  it('rechaza campos no permitidos', () => {
    const r = validateProposedChanges({ display_name: 'OK', is_active: true });
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('is_active'))).toBe(true);
  });

  it('rechaza display_name vacio', () => {
    const r = validateProposedChanges({ display_name: '' });
    expect(r.ok).toBe(false);
  });

  it('acepta years_active en rango', () => {
    expect(validateProposedChanges({ years_active: 5 }).ok).toBe(true);
    expect(validateProposedChanges({ years_active: 0 }).ok).toBe(true);
    expect(validateProposedChanges({ years_active: 80 }).ok).toBe(true);
  });

  it('rechaza years_active fuera de rango', () => {
    expect(validateProposedChanges({ years_active: -1 }).ok).toBe(false);
    expect(validateProposedChanges({ years_active: 81 }).ok).toBe(false);
  });

  it('acepta schedule_kind valido', () => {
    for (const k of ['open_now', 'closes_in_weeks', 'waitlist_only', 'by_request']) {
      expect(validateProposedChanges({ schedule_kind: k }).ok).toBe(true);
    }
  });

  it('rechaza schedule_kind invalido', () => {
    expect(validateProposedChanges({ schedule_kind: 'random' }).ok).toBe(false);
  });

  it('null en campos opcionales es valido', () => {
    expect(validateProposedChanges({ years_active: null, schedule_weeks: null }).ok).toBe(true);
  });

  it('acepta avatar_path URL valida', () => {
    expect(
      validateProposedChanges({
        avatar_path: 'https://example.supabase.co/storage/v1/object/public/artist-avatars/x.jpg',
      }).ok,
    ).toBe(true);
  });

  it('rechaza avatar_path no-URL', () => {
    expect(validateProposedChanges({ avatar_path: 'not-a-url' }).ok).toBe(false);
  });
});
