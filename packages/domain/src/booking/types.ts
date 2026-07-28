export type Role = 'platform_superadmin' | 'studio_owner' | 'artist_admin' | 'staff_readonly';

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';

export interface TimeRange {
  start: string;
  end: string;
}

export interface Slot {
  range: TimeRange;
  serviceId: string;
}

export interface AvailabilityRule {
  weekday: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
  startsAt: string;
  endsAt: string;
  effectiveFrom: string;
  effectiveTo?: string;
}

export interface AvailabilityException {
  date: string;
  startsAt?: string;
  endsAt?: string;
  kind: 'block' | 'extra';
  reason?: string;
}

export interface BusyEvent {
  range: TimeRange;
  source: 'app' | 'google';
  title: string;
  externalId?: string;
}

export interface ServiceDuration {
  id: string;
  durationMinutes: number;
  bufferMinutes: number;
}
