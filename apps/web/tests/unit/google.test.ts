import { describe, expect, it } from 'vitest';
import { authorityConflictResolver, decryptToken, encryptToken, mapGoogleEventToBusy } from '@tattoo/domain/google/sync';

describe('google sync helpers', () => {
  it('maps a confirmed event to busy', () => {
    expect(
      mapGoogleEventToBusy({
        id: 'e1',
        summary: 'cita',
        start: '2026-01-01T10:00:00.000Z',
        end: '2026-01-01T11:00:00.000Z',
      }),
    ).toEqual({
      range: { start: '2026-01-01T10:00:00.000Z', end: '2026-01-01T11:00:00.000Z' },
      source: 'google',
      title: 'cita',
      externalId: 'e1',
    });
  });

  it('drops cancelled events', () => {
    expect(
      mapGoogleEventToBusy({
        id: 'e2',
        summary: 'cancelada',
        start: '2026-01-01T10:00:00.000Z',
        end: '2026-01-01T11:00:00.000Z',
        status: 'cancelled',
      }),
    ).toBeNull();
  });

  it('encrypts and decrypts a token', () => {
    const key = '0123456789abcdef0123456789abcdef';
    const cipher = encryptToken('refresh_token_value', key);
    expect(cipher).not.toContain('refresh_token_value');
    expect(decryptToken(cipher, key)).toBe('refresh_token_value');
  });

  it('resolves authority by recency', () => {
    expect(
      authorityConflictResolver(
        { lastModified: '2026-01-02T10:00:00.000Z', source: 'app' },
        { lastModified: '2026-01-02T09:00:00.000Z', source: 'google' },
      ),
    ).toBe('local');
    expect(
      authorityConflictResolver(
        { lastModified: '2026-01-02T09:00:00.000Z', source: 'app' },
        { lastModified: '2026-01-02T10:00:00.000Z', source: 'google' },
      ),
    ).toBe('remote');
  });
});