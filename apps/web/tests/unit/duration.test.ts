import { describe, expect, it } from 'vitest';
import { addMinutes, diffMinutes, rangesOverlap } from '@tattoo/domain/booking/duration';

describe('duration', () => {
  it('adds minutes', () => {
    expect(addMinutes('2026-01-01T12:00:00.000Z', 30)).toBe('2026-01-01T12:30:00.000Z');
  });

  it('diffs minutes', () => {
    expect(diffMinutes('2026-01-01T12:00:00.000Z', '2026-01-01T13:00:00.000Z')).toBe(60);
  });

  it('detects overlap', () => {
    expect(
      rangesOverlap(
        '2026-01-01T12:00:00.000Z',
        '2026-01-01T13:00:00.000Z',
        '2026-01-01T12:30:00.000Z',
        '2026-01-01T13:30:00.000Z',
      ),
    ).toBe(true);
  });

  it('detects disjoint ranges', () => {
    expect(
      rangesOverlap(
        '2026-01-01T12:00:00.000Z',
        '2026-01-01T13:00:00.000Z',
        '2026-01-01T13:00:00.000Z',
        '2026-01-01T14:00:00.000Z',
      ),
    ).toBe(false);
  });
});
