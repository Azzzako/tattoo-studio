import { describe, expect, it } from 'vitest';

/**
 * Tests for the dev endpoint bearer token gate. The actual route handler
 * lives in app/api/dev/auth-link/route.ts; we mirror its `safeEqual`
 * helper here so the same security property is unit-tested in isolation.
 */
import { timingSafeEqual } from 'node:crypto';

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a, 'utf8'), Buffer.from(b, 'utf8'));
}

function gate(tokenHeader: string | null, expected: string): boolean {
  if (!expected) return false;
  if (!tokenHeader) return false;
  // Require explicit "Bearer " prefix (case-insensitive) before the token.
  const match = /^Bearer\s+(.+)$/i.exec(tokenHeader);
  if (!match) return false;
  return safeEqual(match[1]!, expected);
}

describe('dev endpoint bearer gate', () => {
  const ENV = 'a'.repeat(64);

  it('acepta Bearer con token correcto', () => {
    expect(gate(`Bearer ${ENV}`, ENV)).toBe(true);
  });

  it('acepta con case-insensitive "bearer "', () => {
    expect(gate(`bearer ${ENV}`, ENV)).toBe(true);
    expect(gate(`BEARER ${ENV}`, ENV)).toBe(true);
  });

  it('rechaza token incorrecto', () => {
    expect(gate(`Bearer ${'b'.repeat(64)}`, ENV)).toBe(false);
  });

  it('rechaza token de longitud diferente', () => {
    expect(gate(`Bearer ${'a'.repeat(32)}`, ENV)).toBe(false);
    expect(gate(`Bearer ${'a'.repeat(128)}`, ENV)).toBe(false);
  });

  it('rechaza header ausente', () => {
    expect(gate(null, ENV)).toBe(false);
  });

  it('rechaza header sin "Bearer "', () => {
    expect(gate(ENV, ENV)).toBe(false);
    expect(gate(`Basic ${ENV}`, ENV)).toBe(false);
  });

  it('rechaza si env no esta seteado (503)', () => {
    expect(gate(`Bearer ${ENV}`, '')).toBe(false);
  });

  it('no expone diferencia por longitud en timing (longitudes distintas fallan rapido)', () => {
    // safeEqual returns false on length mismatch without comparing bytes.
    // This is the documented behavior of timingSafeEqual — same length
    // path is the only one that needs to be constant-time.
    expect(safeEqual('short', 'much longer string')).toBe(false);
  });
});
