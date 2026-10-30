import { describe, it, expect } from 'vitest';
import {
    getNights,
    getAccommodationCost,
    getTotalAccommodationCost,
    getExpenseBreakdown,
} from '@/utils/expenseBreakdown';

describe('getNights', () => {
    it('vráti null, ak chýba začiatok alebo koniec', () => {
        expect(getNights(null, '2026-07-05')).toBeNull();
        expect(getNights('2026-07-01', null)).toBeNull();
    });

    it('spočíta počet nocí medzi dátumami', () => {
        expect(getNights('2026-07-01T00:00:00.000Z', '2026-07-04T00:00:00.000Z')).toBe(3);
    });

    it('minimálne 1 noc, aj keď sú dátumy rovnaké alebo prehodené', () => {
        expect(getNights('2026-07-01T00:00:00.000Z', '2026-07-01T00:00:00.000Z')).toBe(1);
        expect(getNights('2026-07-05T00:00:00.000Z', '2026-07-01T00:00:00.000Z')).toBe(1);
    });
});

describe('getAccommodationCost', () => {
    it('0, ak nie je zadaná cena', () => {
        expect(getAccommodationCost({ accommodationPrice: null, plannedDateStart: null, plannedDateEnd: null })).toBe(0);
    });

    it('cena za noc krát počet nocí', () => {
        expect(
        getAccommodationCost({
            accommodationPrice: 80,
            plannedDateStart: '2026-07-01T00:00:00.000Z',
            plannedDateEnd: '2026-07-04T00:00:00.000Z',
        }),
        ).toBe(240);
    });

    it('bez dátumov sa počíta jedna noc', () => {
        expect(getAccommodationCost({ accommodationPrice: 80, plannedDateStart: null, plannedDateEnd: null })).toBe(80);
    });
});

describe('getTotalAccommodationCost', () => {
    it('sčíta ubytovanie vo všetkých destináciách', () => {
        const stays = [
        { accommodationPrice: 50, plannedDateStart: '2026-07-01T00:00:00.000Z', plannedDateEnd: '2026-07-03T00:00:00.000Z' },
        { accommodationPrice: 100, plannedDateStart: null, plannedDateEnd: null },
        { accommodationPrice: null, plannedDateStart: null, plannedDateEnd: null },
        ];
        expect(getTotalAccommodationCost(stays)).toBe(200);
    });

    it('prázdny zoznam dáva 0', () => {
        expect(getTotalAccommodationCost([])).toBe(0);
    });
});

describe('getExpenseBreakdown', () => {
    it('rozdelí výdavky podľa kategórií a spočíta celkovú sumu vrátane ubytovania', () => {
        const result = getExpenseBreakdown(
            [{ accommodationPrice: 100, plannedDateStart: null, plannedDateEnd: null }],
            [
                { amount: 30, category: 'TRANSPORT' },
                { amount: 20, category: 'FOOD' },
                { amount: 15, category: 'FOOD' },
                { amount: 40, category: 'ACTIVITIES' },
                { amount: 5, category: 'OTHER' },
            ],
        );

        expect(result).toEqual({ accommodation: 100, transport: 30, food: 35, activities: 40, other: 5, total: 210 });
    });

    it('neznáma kategória sa započíta do other', () => {
        const result = getExpenseBreakdown([], [{ amount: 10, category: 'NIECO' as never }]);
        expect(result.other).toBe(10);
        expect(result.total).toBe(10);
    });

    it('bez dát vráti samé nuly', () => {
            expect(getExpenseBreakdown([], [])).toEqual({
            accommodation: 0,
            transport: 0,
            food: 0,
            activities: 0,
            other: 0,
            total: 0,
        });
    });
});