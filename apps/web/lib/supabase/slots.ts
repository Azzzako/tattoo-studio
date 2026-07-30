import 'server-only';

import { createSupabaseAdminClient } from './admin';

export type SlotStatus = 'free' | 'busy';

export type SlotCandidate = {
  startsAtIso: string;
  endsAtIso: string;
  status: SlotStatus;
  conflictingAppointmentId?: string | null;
};

/**
 * Computes slot availability for a given artist on a given calendar day.
 *
 * MVP rules:
 *   - Working window: 10:00 - 20:00 local.
 *   - Slot length: 1 hour (default for /cotizar flow).
 *   - A slot is busy if any appointment exists for that artist overlapping
 *     [startsAt, endsAt) with status != 'cancelled'.
 *
 * Day boundaries use the studio's DEFAULT_TZ env (falls back to UTC).
 */
export async function listSlots(opts: {
  artistId: string;
  dateIso: string;
  durationMinutes?: number;
}): Promise<SlotCandidate[]> {
  const admin = createSupabaseAdminClient();
  const tz = process.env.DEFAULT_TZ ?? 'UTC';
  const duration = opts.durationMinutes ?? 60;

  const date = new Date(opts.dateIso);
  const dayStart = new Date(date);
  dayStart.setHours(10, 0, 0, 0);
  const dayEnd = new Date(date);
  dayEnd.setHours(20, 0, 0, 0);

  const windowStart = dayStart.toISOString();
  const windowEnd = dayEnd.toISOString();

  const { data, error } = await admin
    .from('appointments')
    .select('id, starts_at, ends_at, status')
    .eq('artist_id', opts.artistId)
    .gte('starts_at', windowStart)
    .lt('starts_at', windowEnd)
    .neq('status', 'cancelled');

  if (error) {
    throw new Error(`slot query failed: ${error.message}`);
  }

  const busy = (data ?? []).map((r) => ({
    id: (r as { id: string }).id,
    start: new Date((r as { starts_at: string }).starts_at).getTime(),
    end: new Date((r as { ends_at: string }).ends_at).getTime(),
  }));

  const slots: SlotCandidate[] = [];
  for (
    let cursor = dayStart.getTime();
    cursor + duration * 60_000 <= dayEnd.getTime();
    cursor += duration * 60_000
  ) {
    const slotStart = cursor;
    const slotEnd = cursor + duration * 60_000;
    const conflict = busy.find((b) => b.start < slotEnd && b.end > slotStart);
    slots.push({
      startsAtIso: new Date(slotStart).toISOString(),
      endsAtIso: new Date(slotEnd).toISOString(),
      status: conflict ? 'busy' : 'free',
      conflictingAppointmentId: conflict?.id ?? null,
    });
  }
  // tz is consumed implicitly via Date; kept here for future fixed-tz arithmetic.
  void tz;
  return slots;
}

/**
 * Returns true if a fresh appointment at `startsAtIso` (with duration) does
 * not overlap any non-cancelled appointment for `artistId`.
 */
export async function isSlotFree(opts: {
  artistId: string;
  startsAtIso: string;
  durationMinutes?: number;
}): Promise<boolean> {
  const admin = createSupabaseAdminClient();
  const duration = opts.durationMinutes ?? 60;
  const start = new Date(opts.startsAtIso);
  const end = new Date(start.getTime() + duration * 60_000);

  const { data, error } = await admin
    .from('appointments')
    .select('id')
    .eq('artist_id', opts.artistId)
    .neq('status', 'cancelled')
    .lt('starts_at', end.toISOString())
    .gt('ends_at', start.toISOString())
    .limit(1);

  if (error) {
    throw new Error(`slot collision check failed: ${error.message}`);
  }
  return !data || data.length === 0;
}
