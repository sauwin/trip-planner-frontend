import { describe, it, expect } from 'vitest';
import { getApiErrorMessage, getApiErrorCode } from '@/utils/apiError';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatCalendarDate } from '@/utils/formatDate';
import { formatNumber } from '@/utils/formatNumber';
import { getDestinationDisplayName } from '@/utils/destinationName';
import { getTopFeatureInCategory, getTopFeatureOverall } from '@/utils/destinationFeatures';

const apiError = (data: unknown) => ({ response: { data } });

describe('getApiErrorMessage', () => {
    it('použije text chyby z backendu', () => {
        expect(getApiErrorMessage(apiError({ error: 'Email already registered' }), 'fallback')).toBe('Email already registered');
    });

    it('pri validačných detailoch spojí ich správy', () => {
        const err = apiError({
            error: 'Validation failed',
            details: [
                { field: 'password', message: 'Too short.' },
                { field: 'email', message: 'Invalid email.' },
            ],
        });
        expect(getApiErrorMessage(err, 'fallback')).toBe('Too short. Invalid email.');
    });

    it('vráti fallback, ak odpoveď nemá použiteľné dáta', () => {
        expect(getApiErrorMessage(new Error('network'), 'fallback')).toBe('fallback');
        expect(getApiErrorMessage(null, 'fallback')).toBe('fallback');
        expect(getApiErrorMessage(apiError('text'), 'fallback')).toBe('fallback');
    });

    it('ignoruje poškodené položky v details', () => {
        const err = apiError({ error: 'Chyba', details: [{ field: 1 }, 'x'] });
        expect(getApiErrorMessage(err, 'fallback')).toBe('Chyba');
    });
});

describe('getApiErrorCode', () => {
    it('vráti kód chyby, ak existuje', () => {
        expect(getApiErrorCode(apiError({ code: 'NO_PREFERENCES' }))).toBe('NO_PREFERENCES');
        expect(getApiErrorCode(apiError({}))).toBeUndefined();
    });
});

describe('formátovače', () => {
    it('formatCurrency formátuje sumu v eurách', () => {
        expect(formatCurrency(1234.5, 'en')).toBe('€1,234.50');
        expect(formatCurrency(1234.5, 'sk')).toMatch(/1\s?234,50\s?€/);
    });

    it('formatCalendarDate používa UTC, takže deň sa nezmení podľa časového pásma', () => {
        expect(formatCalendarDate('2026-07-01T00:00:00.000Z', 'en', { day: 'numeric', month: 'numeric', year: 'numeric' })).toBe('7/1/2026');
    });

    it('formatNumber rešpektuje lokalitu', () => {
        expect(formatNumber(1234.5, 'en')).toBe('1,234.5');
    });
});

describe('getDestinationDisplayName', () => {
    const dest = { slug: 'rome', translations: { en: { name: 'Rome' }, sk: { name: 'Rím' } } };

    it('vráti preklad pre danú lokalitu', () => {
        expect(getDestinationDisplayName(dest, 'sk')).toBe('Rím');
    });

    it('pri chýbajúcom preklade použije angličtinu', () => {
        expect(getDestinationDisplayName(dest, 'de')).toBe('Rome');
    });

    it('bez prekladov vráti slug', () => {
        expect(getDestinationDisplayName({ slug: 'rome', translations: {} }, 'en')).toBe('rome');
    });
});

describe('destinationFeatures', () => {
    const features = [
        { featureId: '1', key: 'summer', categoryKey: 'season', weight: 0.4 },
        { featureId: '2', key: 'winter', categoryKey: 'season', weight: 0.9 },
        { featureId: '3', key: 'budget-value', categoryKey: 'budget', weight: 0.7 },
        { featureId: '4', key: 'spring', categoryKey: 'season', weight: 0 },
    ];

    it('getTopFeatureInCategory vyberie vlastnosť s najväčšou váhou v kategórii', () => {
        expect(getTopFeatureInCategory(features, 'season')?.key).toBe('winter');
    });

    it('getTopFeatureInCategory ignoruje nulové váhy a vráti null pre prázdny výsledok', () => {
        expect(getTopFeatureInCategory(features, 'unknown')).toBeNull();
        expect(getTopFeatureInCategory([features[3]!], 'season')).toBeNull();
        expect(getTopFeatureInCategory(undefined, 'season')).toBeNull();
    });

    it('getTopFeatureOverall vyberie najlepšiu vlastnosť a vie vylúčiť kategórie', () => {
        expect(getTopFeatureOverall(features)?.key).toBe('winter');
        expect(getTopFeatureOverall(features, ['season'])?.key).toBe('budget-value');
        expect(getTopFeatureOverall([], [])).toBeNull();
    });
});