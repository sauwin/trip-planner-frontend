import type { ExpenseCategory, Expense } from '@/types/expense.types';
import type { AccommodationStay } from '@/types/trip.types';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function getNights(start: string | null, end: string | null): number | null {
  if (!start || !end) return null;
  const nights = Math.round((new Date(end).getTime() - new Date(start).getTime()) / MS_PER_DAY);
  return Math.max(1, nights);
}

export function getAccommodationCost(stay: AccommodationStay): number {
  if (!stay.accommodationPrice) return 0;
  const nights = getNights(stay.plannedDateStart, stay.plannedDateEnd) ?? 1;
  return stay.accommodationPrice * nights;
}

export function getTotalAccommodationCost(stays: AccommodationStay[]): number {
  return stays.reduce((sum, stay) => sum + getAccommodationCost(stay), 0);
}

export interface ExpenseBreakdown {
  accommodation: number;
  transport: number;
  food: number;
  activities: number;
  other: number;
  total: number;
}

const CATEGORY_KEYS: Record<ExpenseCategory, keyof Omit<ExpenseBreakdown, 'accommodation' | 'total'>> = {
  TRANSPORT: 'transport',
  FOOD: 'food',
  ACTIVITIES: 'activities',
  OTHER: 'other',
};

export function getExpenseBreakdown(
  destinations: AccommodationStay[],
  expenses: Pick<Expense, 'amount' | 'category'>[],
): ExpenseBreakdown {
  const breakdown: ExpenseBreakdown = {
    accommodation: getTotalAccommodationCost(destinations),
    transport: 0,
    food: 0,
    activities: 0,
    other: 0,
    total: 0,
  };

  for (const expense of expenses) {
    const key = CATEGORY_KEYS[expense.category] ?? 'other';
    breakdown[key] += expense.amount;
  }

  breakdown.total = breakdown.accommodation + breakdown.transport + breakdown.food + breakdown.activities + breakdown.other;
  return breakdown;
}