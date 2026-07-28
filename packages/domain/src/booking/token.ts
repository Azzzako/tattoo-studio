import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

const TOKEN_BYTES = 32;
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface IssuedToken {
  token: string;
  hash: string;
  expiresAt: string;
}

export function issueClientToken(now = new Date(), ttlMs = TTL_MS): IssuedToken {
  const token = randomBytes(TOKEN_BYTES).toString('base64url');
  const hash = hashToken(token);
  const expiresAt = new Date(now.getTime() + ttlMs).toISOString();
  return { token, hash, expiresAt };
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function tokenIsFresh(token: IssuedToken, now = new Date()): boolean {
  return new Date(token.expiresAt).getTime() > now.getTime();
}

export function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}