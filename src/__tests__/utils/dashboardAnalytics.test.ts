import { describe, expect, it } from 'vitest';
import type { Interaction } from '@/types/interaction.types';
import type { TripWithFinancials } from '@/types/trip.types';
import {
  getCountryDestinationInterestBreakdown,
  getCumulativeRecordedSpending,
  getTotalSpendingByCategory,
  getTripSpendingBreakdowns,
  getTripCostsPerDay,
} from '@/utils/dashboardAnalytics';

function createTrip(expenses: TripWithFinancials['expenses']): TripWithFinancials {
  return {
    id: 'trip-1',
    userId: 'user-1',
    title: 'Weekend away',
    budgetTotal: 250,
    peopleCount: 2,
    startDate: '2025-01-01T00:00:00.000Z',
    endDate: '2025-01-03T00:00:00.000Z',
    createdAt: '2024-12-01T00:00:00.000Z',
    destinations: [{
      accommodationPrice: 80,
      plannedDateStart: '2025-01-01T00:00:00.000Z',
      plannedDateEnd: '2025-01-03T00:00:00.000Z',
    }],
    expenses,
  };
}

function createInteraction(
  type: Interaction['type'],
  destinationId: string,
  country: string,
): Interaction {
  return {
    id: `${type}-${destinationId}`,
    userId: 'user-1',
    destinationId,
    type,
    value: type === 'RATING' ? 5 : null,
    createdAt: '2025-01-01T00:00:00.000Z',
    destination: { slug: destinationId, country, translations: {} },
  };
}

describe('getTripSpendingBreakdowns', () => {
  it('separates entered expenses from estimated accommodation', () => {
    const trip = createTrip([
      { amount: 20, category: 'FOOD', date: '2025-01-01T00:00:00.000Z' },
      { amount: 10, category: 'TRANSPORT', date: '2025-01-02T00:00:00.000Z' },
    ]);

    expect(getTripSpendingBreakdowns([trip])).toEqual([{
      name: 'Weekend away',
      budget: 250,
      transport: 10,
      food: 20,
      activities: 0,
      other: 0,
      recordedExpenses: 30,
      estimatedAccommodation: 160,
      trackedTotal: 190,
    }]);
  });
});

describe('getTripCostsPerDay', () => {
  it('normalizes tracked costs by inclusive trip days and traveler count', () => {
    const trip = createTrip([
      { amount: 30, category: 'FOOD', date: '2025-01-01T00:00:00.000Z' },
    ]);

    expect(getTripCostsPerDay([trip])).toEqual([{
      name: 'Weekend away',
      days: 3,
      travelers: 2,
      trackedTotal: 190,
      costPerPersonPerDay: 190 / 3 / 2,
    }]);
  });

  it('skips trips without a valid date range or tracked costs', () => {
    const noDates = { ...createTrip([]), startDate: null };
    const noCosts = { ...createTrip([]), destinations: [] };
    const reversedDates = { ...createTrip([]), startDate: '2025-01-04T00:00:00.000Z' };

    expect(getTripCostsPerDay([noDates, noCosts, reversedDates])).toEqual([]);
  });
});

describe('getCumulativeRecordedSpending', () => {
  it('returns a cumulative monthly series only between the first and last expense months', () => {
    const trip = createTrip([
      { amount: 10, category: 'FOOD', date: '2024-12-10T00:00:00.000Z' },
      { amount: 20, category: 'TRANSPORT', date: '2025-02-02T00:00:00.000Z' },
    ]);

    expect(getCumulativeRecordedSpending([trip])).toEqual([
      { month: '2024-12', monthlyAmount: 10, cumulativeAmount: 10 },
      { month: '2025-01', monthlyAmount: 0, cumulativeAmount: 10 },
      { month: '2025-02', monthlyAmount: 20, cumulativeAmount: 30 },
    ]);
  });

  it('returns no points when there are no recorded expenses', () => {
    expect(getCumulativeRecordedSpending([createTrip([])])).toEqual([]);
  });
});

describe('getTotalSpendingByCategory', () => {
  it('aggregates recorded costs and accommodation estimates across trips', () => {
    const trip = createTrip([
      { amount: 25, category: 'FOOD', date: '2025-01-01T00:00:00.000Z' },
      { amount: 10, category: 'TRANSPORT', date: '2025-01-02T00:00:00.000Z' },
    ]);

    expect(getTotalSpendingByCategory([trip])).toEqual([
      { category: 'accommodation', amount: 160 },
      { category: 'transport', amount: 10 },
      { category: 'food', amount: 25 },
    ]);
  });
});

describe('getCountryDestinationInterestBreakdown', () => {
  it('ranks countries by unique destinations and counts each action once', () => {
    const interactions = [
      createInteraction('LIKE', 'lisbon', 'Portugal'),
      createInteraction('LIKE', 'lisbon', 'Portugal'),
      createInteraction('SAVE', 'porto', 'Portugal'),
      createInteraction('RATING', 'lisbon', 'Portugal'),
      createInteraction('VIEW', 'madrid', 'Spain'),
      createInteraction('SAVE', 'madrid', 'Spain'),
      createInteraction('LIKE', 'seville', 'Spain'),
      createInteraction('RATING', 'cordoba', 'Spain'),
    ];

    expect(getCountryDestinationInterestBreakdown(interactions)).toEqual([
      { country: 'Spain', destinations: 3, likes: 1, saves: 1, ratings: 1 },
      { country: 'Portugal', destinations: 2, likes: 1, saves: 1, ratings: 1 },
    ]);
  });
});
