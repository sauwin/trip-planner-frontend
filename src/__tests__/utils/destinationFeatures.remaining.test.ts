import { describe, it, expect } from 'vitest';
import {
    getTopFeatureInCategory,
    getTopFeatureOverall,
} from '@/utils/destinationFeatures';
import type { DestinationFeatureView } from '@/types/destination.types';

describe('destinationFeatures – zostávajúce vetvy', () => {
    const highWeight: DestinationFeatureView = {
        featureId: '1',
        key: 'high',
        categoryKey: 'season',
        weight: 0.9,
    };

    const lowWeight: DestinationFeatureView = {
        featureId: '2',
        key: 'low',
        categoryKey: 'season',
        weight: 0.3,
    };

    it('getTopFeatureInCategory ponechá aktuálne najlepšiu vlastnosť, ak ďalšia má nižšiu váhu', () => {
        const result = getTopFeatureInCategory(
            [highWeight, lowWeight],
            'season',
        );

        expect(result?.key).toBe('high');
    });

    it('getTopFeatureOverall ponechá aktuálne najlepšiu vlastnosť, ak ďalšia má nižšiu váhu', () => {
        const result = getTopFeatureOverall([
            highWeight,
            lowWeight,
        ]);

        expect(result?.key).toBe('high');
    });

    it('getTopFeatureOverall vráti null, ak všetky vlastnosti majú nulovú váhu', () => {
        const result = getTopFeatureOverall([
            { ...highWeight, weight: 0 },
            { ...lowWeight, weight: 0 },
        ]);

        expect(result).toBeNull();
    });

    it('getTopFeatureOverall vráti null, ak všetky vlastnosti patria do vylúčených kategórií', () => {
        const result = getTopFeatureOverall(
            [highWeight, lowWeight],
            ['season'],
        );

        expect(result).toBeNull();
    });
});
