import { describe, it, expect } from 'vitest';
import { getTopFeatureOverall } from '@/utils/destinationFeatures';

describe('destinationFeatures – nepokryté vstupy', () => {
    it('getTopFeatureOverall vráti null, ak zoznam vlastností nie je zadaný', () => {
        expect(getTopFeatureOverall(undefined)).toBeNull();
    });
});
