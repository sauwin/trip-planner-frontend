import type { Interaction } from '@/types/interaction.types';
import type { TripWithFinancials } from '@/types/trip.types';
import { getDestinationDisplayName } from '@/utils/destinationName';
import { getExpenseBreakdown } from '@/utils/expenseBreakdown';
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
    tripSummary: string;
    trip: string;
    startDate: string;
    endDate: string;
    budget: string;
    actualSpend: string;
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
    type: string;
    valueColumn: string;
    date: string;
    topPick: string;
    noData: string;
    dailyActivity: string;
    dailyCount: string;
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
  const likedDestinations = new Map<string, { count: number; name: string }>();
  for (const interaction of likes) {
    const current = likedDestinations.get(interaction.destinationId);
    if (current) current.count += 1;
    else likedDestinations.set(interaction.destinationId, {
      count: 1,
      name: getDestinationDisplayName(interaction.destination, locale),
    });
  }
  const topPick = [...likedDestinations.values()].sort((a, b) => b.count - a.count)[0]?.name ?? '—';
  const formatDate = (value: string | null) => value ? new Date(value).toLocaleDateString(locale) : '—';
  const formatAmount = (value: number) => Number(value.toFixed(2));

  const overview = [
    [labels.metric, labels.value],
    [labels.totalInteractions, interactions.length],
    [labels.likes, likes.length],
    [labels.saved, savedCount],
    [labels.averageRating, ratings.length ? Number((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(2)) : '—'],
    [labels.countries, countries.size],
    [labels.topPick, topPick],
  ];

  const interactionCounts: Record<string, number> = { LIKE: 0, RATING: 0, SAVE: 0 };
  const countryCounts = new Map<string, number>();
  for (const interaction of interactions) {
    interactionCounts[interaction.type] = (interactionCounts[interaction.type] ?? 0) + 1;
    const country = interaction.destination.country;
    countryCounts.set(country, (countryCounts.get(country) ?? 0) + 1);
  }
  const interactionRows: ExportCell[][] = [
    [labels.type, labels.total],
    ...Object.entries(interactionCounts).map(([type, count]) => [type, count]),
  ];
  const countryRows: ExportCell[][] = [
    [labels.country, labels.total],
    ...[...countryCounts.entries()].sort((a, b) => b[1] - a[1]).map(([country, count]) => [country, count]),
  ];
  const today = new Date();
  const activityCounts = new Map<string, number>();
  for (let offset = 13; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    activityCounts.set(date.toISOString().slice(0, 10), 0);
  }
  for (const interaction of interactions) {
    const key = interaction.createdAt.slice(0, 10);
    if (activityCounts.has(key)) activityCounts.set(key, (activityCounts.get(key) ?? 0) + 1);
  }
  const dailyRows: ExportCell[][] = [
    [labels.date, labels.dailyCount],
    ...[...activityCounts.entries()].map(([date, count]) => [formatDate(date), count]),
  ];

  const tripRows: ExportCell[][] = [[
    labels.trip, labels.startDate, labels.endDate, labels.budget, labels.actualSpend, labels.people,
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
      formatDate(trip.startDate),
      formatDate(trip.endDate),
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
    { name: labels.dailyActivity, rows: dailyRows },
    { name: labels.interactionBreakdown, rows: interactionRows },
    { name: labels.countryBreakdown, rows: countryRows.length > 1 ? countryRows : [[labels.country, labels.noData]] },
    { name: labels.tripSummary, rows: tripRows },
    { name: labels.byCategory, rows: perTripCategoryRows },
    { name: labels.category, rows: expenseRows },
    { name: labels.tripExpenses, rows: detailExpenseRows.length > 1 ? detailExpenseRows : [[labels.noData]] },
    { name: labels.activity, rows: activityRows.length > 1 ? activityRows : [[labels.noData]] },
  ];
}
