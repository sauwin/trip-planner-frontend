import type { Interaction } from '@/types/interaction.types';
import type { ExpenseCategory } from '@/types/expense.types';
import type { TripWithFinancials } from '@/types/trip.types';
import { getTotalAccommodationCost } from '@/utils/expenseBreakdown';

const EXPENSE_CATEGORIES: ExpenseCategory[] = ['TRANSPORT', 'FOOD', 'ACTIVITIES', 'OTHER'];

export interface TripSpendingBreakdown {
  name: string;
  budget: number | null;
  transport: number;
  food: number;
  activities: number;
  other: number;
  recordedExpenses: number;
  estimatedAccommodation: number;
  trackedTotal: number;
}

export interface TripCostPerDay {
  name: string;
  days: number;
  travelers: number;
  trackedTotal: number;
  costPerPersonPerDay: number;
}

export interface CumulativeRecordedSpend {
  month: string;
  monthlyAmount: number;
  cumulativeAmount: number;
}

export interface SpendingCategoryTotal {
  category: 'accommodation' | 'transport' | 'food' | 'activities' | 'other';
  amount: number;
}

export interface CountryDestinationInterest {
  country: string;
  destinations: number;
  likes: number;
  saves: number;
  ratings: number;
}

export function getTripSpendingBreakdowns(trips: TripWithFinancials[]): TripSpendingBreakdown[] {
  return trips.map((trip) => {
    const categories: Record<ExpenseCategory, number> = {
      TRANSPORT: 0,
      FOOD: 0,
      ACTIVITIES: 0,
      OTHER: 0,
    };

    for (const expense of trip.expenses) {
      categories[expense.category] += expense.amount;
    }

    const recordedExpenses = EXPENSE_CATEGORIES.reduce((sum, category) => sum + categories[category], 0);
    const estimatedAccommodation = getTotalAccommodationCost(trip.destinations);

    return {
      name: trip.title,
      budget: trip.budgetTotal,
      transport: categories.TRANSPORT,
      food: categories.FOOD,
      activities: categories.ACTIVITIES,
      other: categories.OTHER,
      recordedExpenses,
      estimatedAccommodation,
      trackedTotal: recordedExpenses + estimatedAccommodation,
    };
  });
}

export function getTripCostsPerDay(trips: TripWithFinancials[]): TripCostPerDay[] {
  const spendingBreakdowns = getTripSpendingBreakdowns(trips);

  return trips.flatMap((trip, index) => {
    if (!trip.startDate || !trip.endDate || trip.peopleCount <= 0) return [];

    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime())) return [];

    const startDay = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
    const endDay = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
    const days = Math.floor((endDay - startDay) / 86_400_000) + 1;
    const trackedTotal = spendingBreakdowns[index]!.trackedTotal;
    if (days <= 0 || trackedTotal <= 0) return [];

    return [{
      name: trip.title,
      days,
      travelers: trip.peopleCount,
      trackedTotal,
      costPerPersonPerDay: trackedTotal / days / trip.peopleCount,
    }];
  }).sort((a, b) => b.costPerPersonPerDay - a.costPerPersonPerDay);
}

export function getCumulativeRecordedSpending(trips: TripWithFinancials[]): CumulativeRecordedSpend[] {
  const monthlyTotals = new Map<string, number>();

  for (const trip of trips) {
    for (const expense of trip.expenses) {
      const date = new Date(expense.date);
      if (!Number.isFinite(date.getTime())) continue;

      const month = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
      monthlyTotals.set(month, (monthlyTotals.get(month) ?? 0) + expense.amount);
    }
  }

  const months = [...monthlyTotals.keys()].sort();
  if (months.length === 0) return [];

  const firstMonth = months[0]!;
  const lastMonth = months[months.length - 1]!;

  const parseMonth = (value: string): [number, number] => {
    const separator = value.lastIndexOf('-');
    return [
      Number(value.slice(0, separator)),
      Number(value.slice(separator + 1)),
    ];
  };
  const [startYear, startMonth] = parseMonth(firstMonth);
  const [endYear, endMonth] = parseMonth(lastMonth);

  const result: CumulativeRecordedSpend[] = [];
  let year = startYear;
  let monthNumber = startMonth;
  let cumulativeAmount = 0;

  while (year < endYear || (year === endYear && monthNumber <= endMonth)) {
    const month = `${year}-${String(monthNumber).padStart(2, '0')}`;
    const monthlyAmount = monthlyTotals.get(month) ?? 0;
    cumulativeAmount += monthlyAmount;
    result.push({ month, monthlyAmount, cumulativeAmount });

    monthNumber += 1;
    if (monthNumber > 12) {
      monthNumber = 1;
      year += 1;
    }
  }

  return result;
}

export function getTotalSpendingByCategory(trips: TripWithFinancials[]): SpendingCategoryTotal[] {
  const totals = getTripSpendingBreakdowns(trips).reduce(
    (sum, trip) => ({
      accommodation: sum.accommodation + trip.estimatedAccommodation,
      transport: sum.transport + trip.transport,
      food: sum.food + trip.food,
      activities: sum.activities + trip.activities,
      other: sum.other + trip.other,
    }),
    { accommodation: 0, transport: 0, food: 0, activities: 0, other: 0 },
  );

  return (Object.entries(totals) as [SpendingCategoryTotal['category'], number][])
    .map(([category, amount]) => ({ category, amount }))
    .filter(({ amount }) => amount > 0);
}

export function getCountryDestinationInterestBreakdown(
  interactions: Interaction[],
  limit = 6,
): CountryDestinationInterest[] {
  const countries = new Map<string, {
    destinations: Set<string>;
    likes: Set<string>;
    saves: Set<string>;
    ratings: Set<string>;
  }>();

  for (const interaction of interactions) {
    if (interaction.type === 'VIEW') continue;

    const country = interaction.destination.country;
    let destinations = countries.get(country);
    if (!destinations) {
      destinations = {
        destinations: new Set(),
        likes: new Set(),
        saves: new Set(),
        ratings: new Set(),
      };
      countries.set(country, destinations);
    }

    destinations.destinations.add(interaction.destinationId);
    if (interaction.type === 'LIKE') destinations.likes.add(interaction.destinationId);
    if (interaction.type === 'SAVE') destinations.saves.add(interaction.destinationId);
    if (interaction.type === 'RATING') destinations.ratings.add(interaction.destinationId);
  }

  return [...countries.entries()]
    .map(([country, destinations]) => ({
      country,
      destinations: destinations.destinations.size,
      likes: destinations.likes.size,
      saves: destinations.saves.size,
      ratings: destinations.ratings.size,
    }))
    .sort((a, b) => b.destinations - a.destinations || a.country.localeCompare(b.country))
    .slice(0, limit);
}
