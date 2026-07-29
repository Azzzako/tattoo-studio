export function isValidTimezone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export function formatInTz(iso: string, tz: string, locale = 'es-MX'): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: tz,
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso));
}

export function nowInTz(tz: string, locale = 'es-MX'): string {
  return formatInTz(new Date().toISOString(), tz, locale);
}
