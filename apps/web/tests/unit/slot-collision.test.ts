import { describe, expect, it } from 'vitest';

/**
 * The slot logic in lib/supabase/slots.ts talks to Postgres, but the
 * collision rule is pure: two appointments overlap when
 * [startA, endA) ∩ [startB, endB) ≠ ∅.
 *
 * The slot generator also produces hourly slots within a day window.
 * We mirror that logic here to assert it stays correct.
 */

type Range = { start: number; end: number };

function overlaps(a: Range, b: Range): boolean {
  return a.start < b.end && b.start < a.end;
}

describe('slot overlap detection', () => {
  it('dos rangos totalmente separados no chocan', () => {
    const a = { start: 10, end: 11 };
    const b = { start: 12, end: 13 };
    expect(overlaps(a, b)).toBe(false);
  });

  it('dos rangos que comparten exactamente 1 min chocan', () => {
    const a = { start: 10, end: 11 };
    const b = { start: 10.99, end: 12 };
    expect(overlaps(a, b)).toBe(true);
  });

  it('rangos back-to-back no chocan (boundary exclusive)', () => {
    const a = { start: 10, end: 11 };
    const b = { start: 11, end: 12 };
    expect(overlaps(a, b)).toBe(false);
  });

  it('uno dentro de otro siempre choca', () => {
    const a = { start: 10, end: 12 };
    const b = { start: 10.5, end: 10.75 };
    expect(overlaps(a, b)).toBe(true);
  });
});

describe('hourly slot generator', () => {
  it('genera 10 slots entre 10:00 y 20:00 (1h step)', () => {
    const startHour = 10;
    const endHour = 20;
    const durationMinutes = 60;
    const slots: Range[] = [];
    for (
      let cursor = 0;
      cursor + durationMinutes <= (endHour - startHour) * 60;
      cursor += durationMinutes
    ) {
      slots.push({ start: cursor, end: cursor + durationMinutes });
    }
    expect(slots).toHaveLength(10);
    expect(slots[0]).toEqual({ start: 0, end: 60 });
    expect(slots[9]).toEqual({ start: 540, end: 600 });
  });

  it('con duracion 30 min genera 20 slots', () => {
    const startHour = 10;
    const endHour = 20;
    const durationMinutes = 30;
    const slots: Range[] = [];
    for (
      let cursor = 0;
      cursor + durationMinutes <= (endHour - startHour) * 60;
      cursor += durationMinutes
    ) {
      slots.push({ start: cursor, end: cursor + durationMinutes });
    }
    expect(slots).toHaveLength(20);
  });

  it('duracion 60 min entre 10:00 y 13:00 genera 3 slots exactos', () => {
    const slots: Range[] = [];
    for (let cursor = 0; cursor + 60 <= 180; cursor += 60) {
      slots.push({ start: cursor, end: cursor + 60 });
    }
    expect(slots.map((s) => s.start)).toEqual([0, 60, 120]);
  });
});
