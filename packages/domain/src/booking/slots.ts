import { addMinutes, rangesOverlap } from './duration';
import type {
  AvailabilityException,
  AvailabilityRule,
  BusyEvent,
  ServiceDuration,
  Slot,
  TimeRange,
} from './types';

const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
type WeekdayKey = (typeof WEEKDAY_KEYS)[number];

const MS_DAY = 24 * 60 * 60 * 1000;

function toIso(date: Date): string {
  return date.toISOString();
}

function startOfDayInTz(date: Date, tz: string): Date {
  const local = new Date(date.toLocaleString('en-US', { timeZone: tz }));
  return new Date(Date.UTC(local.getFullYear(), local.getMonth(), local.getDate()));
}

function rangeFromLocal(date: Date, tz: string, time: string, minutes: number): TimeRange {
  const parts = time.split(':').map((n) => Number(n));
  const h = parts[0] ?? 0;
  const m = parts[1] ?? 0;
  const day = startOfDayInTz(date, tz);
  const start = new Date(day);
  start.setUTCHours(h, m, 0, 0);
  return { start: toIso(start), end: addMinutes(toIso(start), minutes) };
}

function isRuleEffective(rule: AvailabilityRule, day: Date): boolean {
  const from = new Date(rule.effectiveFrom + 'T00:00:00Z');
  if (day < from) return false;
  if (rule.effectiveTo) {
    const to = new Date(rule.effectiveTo + 'T23:59:59Z');
    if (day > to) return false;
  }
  return true;
}

function dayWeekday(date: Date, tz: string): WeekdayKey {
  const formatter = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: tz });
  const mapped = formatter.format(date).toLowerCase().slice(0, 3) as WeekdayKey;
  return mapped;
}

function exceptionCovers(ex: AvailabilityException, range: TimeRange): boolean {
  if (!ex.startsAt || !ex.endsAt) {
    const start = new Date(ex.date + 'T00:00:00Z').getTime();
    const end = start + MS_DAY;
    return new Date(range.start).getTime() < end && start < new Date(range.end).getTime();
  }
  const start = new Date(`${ex.date}T${ex.startsAt}Z`).getTime();
  const end = new Date(`${ex.date}T${ex.endsAt}Z`).getTime();
  return new Date(range.start).getTime() < end && start < new Date(range.end).getTime();
}

export interface SlotGenerationInput {
  service: ServiceDuration;
  rules: AvailabilityRule[];
  exceptions: AvailabilityException[];
  busy: BusyEvent[];
  rangeStart: string;
  rangeEnd: string;
  timezone: string;
  stepMinutes?: number;
}

export function generateSlots(input: SlotGenerationInput): Slot[] {
  const step = input.stepMinutes ?? 15;
  const slots: Slot[] = [];
  const totalMinutes = input.service.durationMinutes + input.service.bufferMinutes;

  let cursor = new Date(input.rangeStart);
  const limit = new Date(input.rangeEnd);
  while (cursor < limit) {
    const day = new Date(cursor);
    const weekday = dayWeekday(day, input.timezone);
    const todaysRules = input.rules.filter((r) => r.weekday === weekday && isRuleEffective(r, day));
    for (const rule of todaysRules) {
      const window = rangeFromLocal(
        day,
        input.timezone,
        rule.startsAt,
        diff(rule.startsAt, rule.endsAt),
      );
      let t = new Date(window.start);
      while (new Date(t.getTime() + totalMinutes * 60_000) <= new Date(window.end)) {
        const start = toIso(t);
        const end = addMinutes(start, input.service.durationMinutes);
        const candidate: Slot = { range: { start, end }, serviceId: input.service.id };
        if (
          !input.exceptions.some(
            (ex) => ex.kind === 'block' && exceptionCovers(ex, candidate.range),
          )
        ) {
          const conflict = input.busy.some((busy) =>
            rangesOverlap(
              busy.range.start,
              busy.range.end,
              candidate.range.start,
              candidate.range.end,
            ),
          );
          if (!conflict) slots.push(candidate);
        }
        t = new Date(t.getTime() + step * 60_000);
      }
    }
    cursor = new Date(cursor.getTime() + MS_DAY);
    cursor.setUTCHours(0, 0, 0, 0);
  }
  return slots;
}

function diff(start: string, end: string): number {
  const sParts = start.split(':').map((n) => Number(n));
  const eParts = end.split(':').map((n) => Number(n));
  const sh = sParts[0] ?? 0;
  const sm = sParts[1] ?? 0;
  const eh = eParts[0] ?? 0;
  const em = eParts[1] ?? 0;
  return eh * 60 + em - (sh * 60 + sm);
}
