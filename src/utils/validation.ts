export function isRequired(value: string): boolean {
  return value.trim().length > 0;
}

type OptionalNumberInput = number | '' | null | undefined;

export function isPositiveNumber(value: OptionalNumberInput): boolean {
  if (value === null || value === undefined || value === '') return true;
  return typeof value === 'number' && !Number.isNaN(value) && value > 0;
}

export function isNonNegativeNumber(value: OptionalNumberInput): boolean {
  if (value === null || value === undefined || value === '') return true;
  return typeof value === 'number' && !Number.isNaN(value) && value >= 0;
}

export function isPositiveNumberRequired(value: number | null | undefined): boolean {
  return typeof value === 'number' && !Number.isNaN(value) && value > 0;
}

export function isPositiveInteger(value: OptionalNumberInput): boolean {
  if (value === null || value === undefined || value === '') return true;
  return Number.isInteger(value) && value > 0;
}

export function isValidUrl(value: string): boolean {
  if (!value.trim()) return true;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

export function isDateRangeValid(start: string, end: string): boolean {
  if (!start || !end) return true;
  return end >= start;
}

export function isDateRangeWithinBounds(
  start: string,
  end: string,
  tripStart?: string | null,
  tripEnd?: string | null,
): boolean {
  if (tripStart && start && start < tripStart.slice(0, 10)) return false;
  if (tripEnd && end && end > tripEnd.slice(0, 10)) return false;
  return true;
}

export function areDestinationDatesWithinTripRange(
  tripStart: string,
  tripEnd: string,
  destinations: { plannedDateStart: string | null; plannedDateEnd: string | null }[],
  destinationDateOffsetDays = 0,
): boolean {
  return destinations.every(({ plannedDateStart, plannedDateEnd }) => {
    for (const date of [plannedDateStart, plannedDateEnd]) {
      if (!date) continue;
      const calendarDate = shiftCalendarDate(date, destinationDateOffsetDays);
      if (tripStart && calendarDate < tripStart) return false;
      if (tripEnd && calendarDate > tripEnd) return false;
    }
    return true;
  });
}

export function getCalendarDateOffsetDays(from: string | null, to: string | null): number {
  if (!from || !to) return 0;
  const fromDate = new Date(`${from.slice(0, 10)}T00:00:00.000Z`);
  const toDate = new Date(`${to.slice(0, 10)}T00:00:00.000Z`);
  return Math.round((toDate.getTime() - fromDate.getTime()) / (24 * 60 * 60 * 1000));
}

function shiftCalendarDate(date: string, offsetDays: number): string {
  const shifted = new Date(`${date.slice(0, 10)}T00:00:00.000Z`);
  shifted.setUTCDate(shifted.getUTCDate() + offsetDays);
  return shifted.toISOString().slice(0, 10);
}