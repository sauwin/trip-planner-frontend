import type { Interaction } from '@/types/interaction.types';
import type { TripWithFinancials } from '@/types/trip.types';
import { getDestinationDisplayName } from '@/utils/destinationName';
import {
  getCountryDestinationInterestBreakdown,
  getCumulativeRecordedSpending,
  getTripCostsPerDay,
} from '@/utils/dashboardAnalytics';
import { getExpenseBreakdown } from '@/utils/expenseBreakdown';
import { formatCalendarDate } from '@/utils/formatDate';
import type { ExportCell, ExportSheet } from './exportReports';

export function createDashboardExportSheets(
  interactions: Interaction[],
  trips: TripWithFinancials[],
  locale: string,
  labels: {
    overview: string;
    metric: string;
    value: string;
    totalInteractions: string;
    likes: string;
    saved: string;
    averageRating: string;
    countries: string;
    tripsCount: string;
    tripSummary: string;
    trip: string;
    startDate: string;
    endDate: string;
    budget: string;
    trackedCost: string;
    people: string;
    category: string;
    accommodation: string;
    transport: string;
    food: string;
    activities: string;
    other: string;
    total: string;
    activity: string;
    destination: string;
    country: string;
    rating: string;
    type: string;
    valueColumn: string;
    date: string;
    noData: string;
    cumulativeExpenses: string;
    monthlyAmount: string;
    cumulativeAmount: string;
    dailyTripCosts: string;
    dailyCostPerPerson: string;
    tripDays: string;
    interestedDestinations: string;
    interactionBreakdown: string;
    countryBreakdown: string;
    tripExpenses: string;
    expenseDate: string;
    expenseAmount: string;
    byCategory: string;
    tripCategory: string;
  },
): ExportSheet[] {
  interactions = interactions.filter(({ type }) => type !== 'VIEW');
  const likes = interactions.filter(({ type }) => type === 'LIKE');
  const savedCount = interactions.filter(({ type }) => type === 'SAVE').length;
  const ratings = interactions
    .filter(({ type, value }) => type === 'RATING' && value !== null)
    .map(({ value }) => value as number);
  const countries = new Set(interactions.map(({ destination }) => destination.country));
  const formatDate = (value: string | null) => value ? new Date(value).toLocaleDateString(locale) : '—';
  const formatAmount = (value: number) => Number(value.toFixed(2));

  const overview = [
    [labels.metric, labels.value],
    [labels.totalInteractions, interactions.length],
    [labels.likes, likes.length],
    [labels.saved, savedCount],
    [labels.averageRating, ratings.length ? Number((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(2)) : '—'],
    [labels.countries, countries.size],
    [labels.tripsCount, trips.length],
  ];

  const interactionCounts: Record<string, number> = { LIKE: 0, RATING: 0, SAVE: 0 };
  for (const interaction of interactions) {
    interactionCounts[interaction.type] = (interactionCounts[interaction.type] ?? 0) + 1;
  }
  const interactionRows: ExportCell[][] = [
    [labels.type, labels.total],
    ...Object.entries(interactionCounts).map(([type, count]) => [type, count]),
  ];
  const countryRows: ExportCell[][] = [
    [labels.country, labels.interestedDestinations, labels.likes, labels.saved, labels.rating],
    ...getCountryDestinationInterestBreakdown(interactions, Number.POSITIVE_INFINITY)
      .map(({ country, destinations, likes: countryLikes, saves, ratings: countryRatings }) => [
        country,
        destinations,
        countryLikes,
        saves,
        countryRatings,
      ]),
  ];
  const dailyTripCostRows: ExportCell[][] = [
    [labels.trip, labels.tripDays, labels.people, labels.trackedCost, labels.dailyCostPerPerson],
    ...getTripCostsPerDay(trips).map(({ name, days, travelers, trackedTotal, costPerPersonPerDay }) => [
      name,
      days,
      travelers,
      formatAmount(trackedTotal),
      formatAmount(costPerPersonPerDay),
    ]),
  ];
  const cumulativeExpenseRows: ExportCell[][] = [
    [labels.date, labels.monthlyAmount, labels.cumulativeAmount],
    ...getCumulativeRecordedSpending(trips).map(({ month, monthlyAmount, cumulativeAmount }) => [
      formatCalendarDate(`${month}-01`, locale),
      formatAmount(monthlyAmount),
      formatAmount(cumulativeAmount),
    ]),
  ];

  const tripRows: ExportCell[][] = [[
    labels.trip, labels.startDate, labels.endDate, labels.budget, labels.trackedCost, labels.people,
  ]];
  const categoryTotals = { accommodation: 0, transport: 0, food: 0, activities: 0, other: 0, total: 0 };
  const expenseRows: ExportCell[][] = [[labels.category, labels.total]];
  const detailExpenseRows: ExportCell[][] = [[
    labels.trip, labels.expenseDate, labels.category, labels.expenseAmount,
  ]];
  const perTripCategoryRows: ExportCell[][] = [[labels.trip, labels.tripCategory, labels.total]];
  for (const trip of trips) {
    const breakdown = getExpenseBreakdown(trip.destinations, trip.expenses);
    tripRows.push([
      trip.title,
      trip.startDate ? formatCalendarDate(trip.startDate, locale) : '—',
      trip.endDate ? formatCalendarDate(trip.endDate, locale) : '—',
      trip.budgetTotal === null ? '—' : formatAmount(trip.budgetTotal),
      formatAmount(breakdown.total),
      trip.peopleCount,
    ]);
    for (const key of Object.keys(categoryTotals) as (keyof typeof categoryTotals)[]) {
      categoryTotals[key] += breakdown[key];
    }
    const categories = new Map<string, number>();
    for (const expense of trip.expenses) {
      const categoryLabel = labels[expense.category.toLowerCase() as 'transport' | 'food' | 'activities' | 'other'];
      const amount = formatAmount(expense.amount);
      categories.set(categoryLabel, (categories.get(categoryLabel) ?? 0) + amount);
      detailExpenseRows.push([
        trip.title,
        formatDate(expense.date),
        categoryLabel,
        amount,
      ]);
    }
    categories.set(labels.accommodation, breakdown.accommodation);
    for (const [category, amount] of categories) {
      perTripCategoryRows.push([trip.title, category, formatAmount(amount)]);
    }
  }
  expenseRows.push(
    [labels.accommodation, formatAmount(categoryTotals.accommodation)],
    [labels.transport, formatAmount(categoryTotals.transport)],
    [labels.food, formatAmount(categoryTotals.food)],
    [labels.activities, formatAmount(categoryTotals.activities)],
    [labels.other, formatAmount(categoryTotals.other)],
    [labels.total, formatAmount(categoryTotals.total)],
  );

  const activityRows: ExportCell[][] = [[
    labels.date, labels.type, labels.destination, labels.country, labels.valueColumn,
  ]];
  for (const interaction of [...interactions].sort((a, b) => b.createdAt.localeCompare(a.createdAt))) {
    activityRows.push([
      formatDate(interaction.createdAt),
      interaction.type,
      getDestinationDisplayName(interaction.destination, locale),
      interaction.destination.country,
      interaction.value ?? '',
    ]);
  }

  return [
    { name: labels.overview, rows: overview },
    { name: labels.cumulativeExpenses, rows: cumulativeExpenseRows },
    { name: labels.dailyTripCosts, rows: dailyTripCostRows },
    { name: labels.interactionBreakdown, rows: interactionRows },
    { name: labels.countryBreakdown, rows: countryRows.length > 1 ? countryRows : [[labels.country, labels.noData]] },
    { name: labels.tripSummary, rows: tripRows },
    { name: labels.byCategory, rows: perTripCategoryRows },
    { name: labels.category, rows: expenseRows },
    { name: labels.tripExpenses, rows: detailExpenseRows.length > 1 ? detailExpenseRows : [[labels.noData]] },
    { name: labels.activity, rows: activityRows.length > 1 ? activityRows : [[labels.noData]] },
  ];
}
