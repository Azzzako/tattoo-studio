import { createHash, createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import type { BusyEvent, TimeRange } from '../booking/types';

export interface GoogleEventInput {
  id: string;
  summary: string;
  start: string;
  end: string;
  etag?: string;
  iCalUID?: string;
  status?: 'confirmed' | 'cancelled' | 'tentative';
}

export interface CalendarSyncResult {
  externalEvents: BusyEvent[];
  needsFullSync: boolean;
  nextSyncToken: string | null;
}

const SOURCE: BusyEvent['source'] = 'google';

export function mapGoogleEventToBusy(event: GoogleEventInput): BusyEvent | null {
  if (event.status === 'cancelled') return null;
  return {
    range: { start: event.start, end: event.end } satisfies TimeRange,
    source: SOURCE,
    title: event.summary,
    externalId: event.id,
  };
}

export function isGoogleEventConflict(local: TimeRange, external: BusyEvent): boolean {
  return (
    external.source === 'google' &&
    new Date(local.start) < new Date(external.range.end) &&
    new Date(external.range.start) < new Date(local.end)
  );
}

export function eventFingerprint(input: { id: string; etag?: string; updated?: string }): string {
  return createHash('sha256')
    .update(`${input.id}|${input.etag ?? ''}|${input.updated ?? ''}`)
    .digest('hex');
}

export function authorityConflictResolver(
  local: { lastModified: string; source: 'app' },
  remote: { lastModified: string; source: 'google' },
): 'local' | 'remote' {
  if (local.source === 'app' && remote.source === 'google') {
    return local.lastModified >= remote.lastModified ? 'local' : 'remote';
  }
  return 'local';
}

const ALGO = 'aes-256-gcm';

export function encryptToken(plain: string, key: string): string {
  const keyBuf = Buffer.from(key.padEnd(32, '0').slice(0, 32), 'utf8');
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, keyBuf, iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64url');
}

export function decryptToken(payload: string, key: string): string {
  const buf = Buffer.from(payload, 'base64url');
  const iv = buf.subarray(0, 12);
  const tag = buf.subarray(12, 28);
  const data = buf.subarray(28);
  const keyBuf = Buffer.from(key.padEnd(32, '0').slice(0, 32), 'utf8');
  const decipher = createDecipheriv(ALGO, keyBuf, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8');
}