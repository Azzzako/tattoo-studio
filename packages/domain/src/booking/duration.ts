export function addMinutes(iso: string, minutes: number): string {
  const date = new Date(iso);
  date.setUTCMinutes(date.getUTCMinutes() + minutes);
  return date.toISOString();
}

export function diffMinutes(start: string, end: string): number {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60_000);
}

export function rangesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return new Date(aStart) < new Date(bEnd) && new Date(bStart) < new Date(aEnd);
}