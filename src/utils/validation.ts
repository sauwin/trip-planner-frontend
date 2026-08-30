export function isRequired(value: string): boolean {
  return value.trim().length > 0;
}

export function isPositiveNumber(value: number | null | undefined): boolean {
  if (value === null || value === undefined || (value as unknown as string) === '') return true;
  return typeof value === 'number' && !Number.isNaN(value) && value > 0;
}

export function isNonNegativeNumber(value: number | null | undefined): boolean {
  if (value === null || value === undefined || (value as unknown as string) === '') return true;
  return typeof value === 'number' && !Number.isNaN(value) && value >= 0;
}

export function isPositiveNumberRequired(value: number | null | undefined): boolean {
  return typeof value === 'number' && !Number.isNaN(value) && value > 0;
}

export function isPositiveInteger(value: number | null | undefined): boolean {
  if (value === null || value === undefined || (value as unknown as string) === '') return true;
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