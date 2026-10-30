import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getTripStatus } from '@/utils/tripStatus';

beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-15T12:00:00Z'));
});
afterEach(() => vi.useRealTimers());

describe('getTripStatus', () => {
    it('planning, ak cesta nemá začiatok', () => {
        expect(getTripStatus(null, null)).toBe('planning');
        expect(getTripStatus(null, '2026-07-20T00:00:00.000Z')).toBe('planning');
    });

    it('upcoming, ak začiatok je v budúcnosti', () => {
        expect(getTripStatus('2026-08-01T00:00:00.000Z', '2026-08-10T00:00:00.000Z')).toBe('upcoming');
    });

    it('completed, ak koniec je v minulosti', () => {
        expect(getTripStatus('2026-06-01T00:00:00.000Z', '2026-06-10T00:00:00.000Z')).toBe('completed');
    });

    it('active, ak dnešok leží medzi začiatkom a koncom', () => {
        expect(getTripStatus('2026-07-10T00:00:00.000Z', '2026-07-20T00:00:00.000Z')).toBe('active');
    });

    it('active v prvý a v posledný deň cesty (hranice sú vrátane)', () => {
        expect(getTripStatus('2026-07-15T00:00:00.000Z', '2026-07-20T00:00:00.000Z')).toBe('active');
        expect(getTripStatus('2026-07-10T00:00:00.000Z', '2026-07-15T00:00:00.000Z')).toBe('active');
    });

    it('bez koncového dátumu sa cesta berie ako jednodňová', () => {
        expect(getTripStatus('2026-07-15T00:00:00.000Z', null)).toBe('active');
        expect(getTripStatus('2026-07-14T00:00:00.000Z', null)).toBe('completed');
    });
});