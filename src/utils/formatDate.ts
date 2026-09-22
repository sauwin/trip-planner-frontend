export function formatCalendarDate(value: string, locale: string, options?: Intl.DateTimeFormatOptions): string {
  return new Date(value).toLocaleDateString(locale, { timeZone: 'UTC', ...options });
}