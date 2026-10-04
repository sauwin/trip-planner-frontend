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