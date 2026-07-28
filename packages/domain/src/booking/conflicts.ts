import { rangesOverlap } from './duration.js';
import type { BusyEvent, TimeRange } from './types.js';

export function findConflicts(range: TimeRange, busy: BusyEvent[]): BusyEvent[] {
  return busy.filter((event) =>
    rangesOverlap(event.range.start, event.range.end, range.start, range.end),
  );
}

export function hasConflict(range: TimeRange, busy: BusyEvent[]): boolean {
  return busy.some((event) =>
    rangesOverlap(event.range.start, event.range.end, range.start, range.end),
  );
}