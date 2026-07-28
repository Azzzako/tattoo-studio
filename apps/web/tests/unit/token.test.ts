import { describe, expect, it } from 'vitest';
import { constantTimeEquals, hashToken, issueClientToken, tokenIsFresh } from '@tattoo/domain/booking';

describe('client token', () => {
  it('produces a hash that matches its token', () => {
    const issued = issueClientToken();
    expect(hashToken(issued.token)).toBe(issued.hash);
  });

  it('is fresh within ttl', () => {
    const issued = issueClientToken(new Date(), 60_000);
    expect(tokenIsFresh(issued, new Date())).toBe(true);
  });

  it('expire after ttl', () => {
    const issued = issueClientToken(new Date('2026-01-01T00:00:00.000Z'), 0);
    expect(tokenIsFresh(issued, new Date('2026-01-01T00:01:00.000Z'))).toBe(false);
  });

  it('constant time equals is symmetric', () => {
    expect(constantTimeEquals('abc', 'abc')).toBe(true);
    expect(constantTimeEquals('abc', 'abd')).toBe(false);
  });
});