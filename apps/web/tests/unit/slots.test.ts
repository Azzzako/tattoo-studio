import { describe, expect, it } from 'vitest';
import { generateSlots } from '@tattoo/domain/booking/slots';

describe('generateSlots', () => {
  const rules = [
    { weekday: 'tue' as const, startsAt: '10:00', endsAt: '12:00', effectiveFrom: '2026-01-01' },
  ];
  const service = { id: 'svc', durationMinutes: 60, bufferMinutes: 0 };

  it('emits a slot inside the rule window', () => {
    const slots = generateSlots({
      service,
      rules,
      exceptions: [],
      busy: [],
      rangeStart: '2026-01-06T00:00:00.000Z',
      rangeEnd: '2026-01-07T00:00:00.000Z',
      timezone: 'UTC',
      stepMinutes: 60,
    });
    expect(slots.length).toBeGreaterThan(0);
    expect(slots[0]?.range.end).toBe('2026-01-06T11:00:00.000Z');
  });

  it('skips slots overlapping busy events', () => {
    const slots = generateSlots({
      service,
      rules,
      exceptions: [],
      busy: [
        {
          range: { start: '2026-01-06T10:30:00.000Z', end: '2026-01-06T11:30:00.000Z' },
          source: 'app',
          title: 'occupied',
        },
      ],
      rangeStart: '2026-01-06T00:00:00.000Z',
      rangeEnd: '2026-01-07T00:00:00.000Z',
      timezone: 'UTC',
      stepMinutes: 30,
    });
    expect(slots.every((s: { range: { start: string; end: string } }) => !(s.range.start >= '2026-01-06T10:30:00.000Z' && s.range.start < '2026-01-06T11:30:00.000Z'))).toBe(true);
  });
});