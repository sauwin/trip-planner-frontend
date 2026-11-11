import { describe, it, expect } from 'vitest';
import {
    isRequired,
    isPositiveNumber,
    isNonNegativeNumber,
    isPositiveNumberRequired,
    isPositiveInteger,
    isValidUrl,
    isDateRangeValid,
    isDateRangeWithinBounds,
    areDestinationDatesWithinTripRange,
    getCalendarDateOffsetDays,
} from '@/utils/validation';

describe('isRequired', () => {
    it.each([
        ['text', true],
        ['  x  ', true],
        ['', false],
        ['   ', false],
    ])('%j => %s', (value, expected) => expect(isRequired(value)).toBe(expected));
});

describe('isPositiveNumber (voliteľné pole)', () => {
    it.each([
        [5, true],
        [0.1, true],
        [0, false],
        [-1, false],
        [NaN, false],
        ['', true],
        [null, true],
        [undefined, true],
    ])('%j => %s', (value, expected) => expect(isPositiveNumber(value as never)).toBe(expected));
});

describe('isNonNegativeNumber', () => {
    it.each([
        [0, true],
        [10, true],
        [-0.5, false],
        [NaN, false],
        ['', true],
    ])('%j => %s', (value, expected) => expect(isNonNegativeNumber(value as never)).toBe(expected));
});

describe('isPositiveNumberRequired', () => {
    it.each([
        [1, true],
        [0, false],
        [null, false],
        [undefined, false],
        [NaN, false],
    ])('%j => %s', (value, expected) => expect(isPositiveNumberRequired(value as never)).toBe(expected));
});

describe('isPositiveInteger', () => {
    it.each([
        [1, true],
        [3, true],
        [1.5, false],
        [0, false],
        [-2, false],
        ['', true],
        [null, true],
    ])('%j => %s', (value, expected) => expect(isPositiveInteger(value as never)).toBe(expected));
});

describe('isValidUrl', () => {
    it.each([
        ['https://example.com/hotel', true],
        ['http://localhost:3000', true],
        ['', true],
        ['   ', true],
        ['example.com', false],
        ['not a url', false],
    ])('%j => %s', (value, expected) => expect(isValidUrl(value)).toBe(expected));
});

describe('isDateRangeValid', () => {
    it('prázdny začiatok alebo koniec je v poriadku', () => {
        expect(isDateRangeValid('', '2026-07-01')).toBe(true);
        expect(isDateRangeValid('2026-07-01', '')).toBe(true);
    });

    it('koniec rovný alebo po začiatku je platný, pred začiatkom nie', () => {
        expect(isDateRangeValid('2026-07-01', '2026-07-01')).toBe(true);
        expect(isDateRangeValid('2026-07-01', '2026-07-05')).toBe(true);
        expect(isDateRangeValid('2026-07-05', '2026-07-01')).toBe(false);
    });
});

describe('isDateRangeWithinBounds', () => {
    const tripStart = '2026-07-01T00:00:00.000Z';
    const tripEnd = '2026-07-10T00:00:00.000Z';

    it('rozsah vo vnútri cesty je platný', () => {
        expect(isDateRangeWithinBounds('2026-07-02', '2026-07-05', tripStart, tripEnd)).toBe(true);
    });

    it('hranice cesty sú povolené', () => {
        expect(isDateRangeWithinBounds('2026-07-01', '2026-07-10', tripStart, tripEnd)).toBe(true);
    });

    it('začiatok pred cestou alebo koniec po ceste je neplatný', () => {
        expect(isDateRangeWithinBounds('2026-06-30', '2026-07-05', tripStart, tripEnd)).toBe(false);
        expect(isDateRangeWithinBounds('2026-07-02', '2026-07-11', tripStart, tripEnd)).toBe(false);
    });

    it('bez dátumov cesty je všetko povolené', () => {
        expect(isDateRangeWithinBounds('2030-01-01', '2030-02-01', null, null)).toBe(true);
    });
});

describe('areDestinationDatesWithinTripRange', () => {
    const destinations = [
        {
            plannedDateStart: '2026-07-03T00:00:00.000Z',
            plannedDateEnd: '2026-07-05T00:00:00.000Z',
        },
        { plannedDateStart: null, plannedDateEnd: '2026-07-08T00:00:00.000Z' },
    ];

    it('allows destination dates on the trip boundaries', () => {
        expect(areDestinationDatesWithinTripRange('2026-07-03', '2026-07-08', destinations)).toBe(true);
    });

    it('rejects a trip range that excludes any planned destination date', () => {
        expect(areDestinationDatesWithinTripRange('2026-07-04', '2026-07-08', destinations)).toBe(false);
        expect(areDestinationDatesWithinTripRange('2026-07-03', '2026-07-07', destinations)).toBe(false);
    });

    it('allows an open-ended trip range', () => {
        expect(areDestinationDatesWithinTripRange('', '', destinations)).toBe(true);
    });

    it('validates destination dates after shifting them with the trip', () => {
        expect(areDestinationDatesWithinTripRange('2026-09-01', '2026-09-10', destinations, 60)).toBe(true);
        expect(areDestinationDatesWithinTripRange('2026-09-01', '2026-09-04', destinations, 60)).toBe(false);
    });
});

describe('getCalendarDateOffsetDays', () => {
    it('returns a calendar-day offset across month boundaries', () => {
        expect(getCalendarDateOffsetDays('2026-09-01', '2026-11-01')).toBe(61);
        expect(getCalendarDateOffsetDays('2026-11-01', '2026-09-01')).toBe(-61);
    });

    it('returns zero when either date is unset', () => {
        expect(getCalendarDateOffsetDays(null, '2026-11-01')).toBe(0);
    });
});