import { describe, expect, it } from 'vitest';

/**
 * Validates the slug regex used by the createArtistAsAdmin server action.
 * Mirrors the Zod schema so the same constraint can be unit-tested.
 */
const SLUG_REGEX = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

function isValidSlug(value: string): boolean {
  if (value.length < 2 || value.length > 60) return false;
  return SLUG_REGEX.test(value);
}

describe('artist slug validation', () => {
  it('acepta slugs lowercase simples', () => {
    expect(isValidSlug('inka')).toBe(true);
    expect(isValidSlug('mara')).toBe(true);
    expect(isValidSlug('lucia')).toBe(true);
  });

  it('acepta guiones internos', () => {
    expect(isValidSlug('maria-jose')).toBe(true);
    expect(isValidSlug('el-arte-de-tatuar')).toBe(true);
  });

  it('acepta numeros', () => {
    expect(isValidSlug('artist1')).toBe(true);
    expect(isValidSlug('123abc')).toBe(true);
  });

  it('rechaza mayusculas', () => {
    expect(isValidSlug('Inka')).toBe(false);
    expect(isValidSlug('ARTIST')).toBe(false);
  });

  it('rechaza caracteres no permitidos', () => {
    expect(isValidSlug('maría')).toBe(false);
    expect(isValidSlug('art ist')).toBe(false);
    expect(isValidSlug('art.ist')).toBe(false);
    expect(isValidSlug('art_ist')).toBe(false);
  });

  it('rechaza guion al inicio o final', () => {
    expect(isValidSlug('-foo')).toBe(false);
    expect(isValidSlug('foo-')).toBe(false);
    expect(isValidSlug('--')).toBe(false);
  });

  it('rechaza muy cortos', () => {
    expect(isValidSlug('a')).toBe(false);
    expect(isValidSlug('')).toBe(false);
  });

  it('rechaza muy largos', () => {
    expect(isValidSlug('a'.repeat(61))).toBe(false);
  });
});
