<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Bar, Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';
import { getInteractions } from '@/api/interactions.api';
import { getDestinations } from '@/api/destinations.api';
import { getTrips } from '@/api/trips.api';
import type { Interaction } from '@/types/interaction.types';
import type { Destination } from '@/types/destination.types';
import type { TripWithFinancials } from '@/types/trip.types';
import { getExpenseBreakdown } from '@/utils/expenseBreakdown';
import { useI18n } from 'vue-i18n';
import ExpensesByCategoryChart from '@/components/ExpensesByCategoryChart.vue';
import BudgetVsActualChart from '@/components/BudgetVsActualChart.vue';

ChartJS.register(Title, Tooltip, Legend, BarElement, LineElement, PointElement, CategoryScale, LinearScale);

const interactions = ref<Interaction[]>([]);
const destinations = ref<Destination[]>([]);
const trips = ref<TripWithFinancials[]>([]);
const isLoading = ref(true);
const errorMessage = ref('');
const { t, locale } = useI18n();

onMounted(async () => {
  try {
    const [interactionsResp, destinationsResp, tripsResp] = await Promise.all([
      getInteractions(),
      getDestinations({ limit: 100 }),
      getTrips(),
    ]);
    interactions.value = interactionsResp.data;
    destinations.value = destinationsResp.data.items;
    trips.value = tripsResp.data;
  } catch {
    errorMessage.value = t('dashboard.failed');
  } finally {
    isLoading.value = false;
  }
});

const allDestinationStays = computed(() => trips.value.flatMap((trip) => trip.destinations));
const allExpenses = computed(() => trips.value.flatMap((trip) => trip.expenses));
const spendingBreakdown = computed(() => getExpenseBreakdown(allDestinationStays.value, allExpenses.value));

const budgetVsActual = computed(() => {
  return trips.value
    .filter((trip) => trip.budgetTotal != null)
    .sort((a, b) => {
      if (a.startDate && b.startDate) return a.startDate.localeCompare(b.startDate);
      if (a.startDate) return -1;
      if (b.startDate) return 1;
      return a.createdAt.localeCompare(b.createdAt);
    })
    .map((trip) => ({
      name: trip.title,
      budget: trip.budgetTotal as number,
      actual: getExpenseBreakdown(trip.destinations, trip.expenses).total,
    }));
});

function getName(destination: Destination) {
  return destination.translations[locale.value]?.name ?? destination.translations.en?.name ?? destination.slug;
}

function findDestination(destinationId: string) {
  return destinations.value.find((d) => d.id === destinationId);
}

const totalInteractions = computed(() => interactions.value.length);
const totalLikes = computed(() => interactions.value.filter((i) => i.type === 'LIKE').length);
const totalSaved = computed(() => interactions.value.filter((i) => i.type === 'SAVE').length);

const ratingValues = computed(() =>
  interactions.value.filter((i) => i.type === 'RATING' && typeof i.value === 'number').map((i) => i.value as number),
);
const avgRating = computed(() => {
  if (ratingValues.value.length === 0) return null;
  const sum = ratingValues.value.reduce((acc, v) => acc + v, 0);
  return sum / ratingValues.value.length;
});

const countriesExploredCount = computed(() => {
  const countries = new Set<string>();
  for (const i of interactions.value) {
    const dest = findDestination(i.destinationId);
    if (dest) countries.add(dest.country);
  }
  return countries.size;
});

const topDestinationName = computed(() => {
  const counts: Record<string, number> = {};
  for (const i of interactions.value) {
    if (i.type !== 'LIKE') continue;
    counts[i.destinationId] = (counts[i.destinationId] ?? 0) + 1;
  }

  const sortedEntries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const topEntry = sortedEntries[0];
  if (!topEntry) return '—';

  const [topId] = topEntry;
  const dest = destinations.value.find((d) => d.id === topId);
  return dest ? getName(dest) : '—';
});

const byTypeData = computed(() => {
  const counts: Record<string, number> = { VIEW: 0, LIKE: 0, RATING: 0, SAVE: 0 };
  for (const i of interactions.value) {
    counts[i.type] = (counts[i.type] ?? 0) + 1;
  }
  return {
    labels: Object.keys(counts),
    datasets: [
      {
        label: t('dashboard.interactions'),
        backgroundColor: '#0F52BA',
        borderRadius: 6,
        borderSkipped: false,
        data: Object.values(counts),
      },
    ],
  };
});

const byDestinationData = computed(() => {
  const counts: Record<string, number> = {};
  for (const i of interactions.value) {
    if (i.type !== 'LIKE') continue;
    const dest = destinations.value.find((d) => d.id === i.destinationId);
    const name = dest ? getName(dest) : t('dashboard.unknown');
    counts[name] = (counts[name] ?? 0) + 1;
  }
  return {
    labels: Object.keys(counts),
    datasets: [
      {
        label: 'Likes',
        backgroundColor: '#FF7A59',
        borderRadius: 6,
        borderSkipped: false,
        data: Object.values(counts),
      },
    ],
  };
});

const topCountriesData = computed(() => {
  const counts: Record<string, number> = {};
  for (const i of interactions.value) {
    const dest = findDestination(i.destinationId);
    if (!dest) continue;
    counts[dest.country] = (counts[dest.country] ?? 0) + 1;
  }
  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  return {
    labels: sorted.map(([country]) => country),
    datasets: [
      {
        label: t('dashboard.interactions'),
        backgroundColor: '#10B981',
        borderRadius: 6,
        borderSkipped: false,
        data: sorted.map(([, count]) => count),
      },
    ],
  };
});

const activityOverTimeData = computed(() => {
  const days: string[] = [];
  const counts: Record<string, number> = {};
  const today = new Date();
  for (let offset = 13; offset >= 0; offset -= 1) {
    const day = new Date(today);
    day.setDate(day.getDate() - offset);
    const key = day.toISOString().slice(0, 10);
    days.push(key);
    counts[key] = 0;
  }
  for (const i of interactions.value) {
    const key = i.createdAt.slice(0, 10);
    if (key in counts) counts[key] = (counts[key] ?? 0) + 1;
  }
  return {
    labels: days.map((d) => new Date(d).toLocaleDateString(locale.value, { day: 'numeric', month: 'short' })),
    datasets: [
      {
        label: t('dashboard.interactions'),
        borderColor: '#0F52BA',
        backgroundColor: 'rgba(15, 82, 186, 0.12)',
        pointBackgroundColor: '#0F52BA',
        pointRadius: 3,
        tension: 0.35,
        fill: true,
        data: days.map((d) => counts[d] ?? 0),
      },
    ],
  };
});

const recentActivity = computed(() => {
  return [...interactions.value]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)
    .map((i) => {
      const dest = findDestination(i.destinationId);
      return {
        id: i.id,
        type: i.type,
        value: i.value,
        destinationName: dest ? getName(dest) : t('dashboard.unknown'),
        createdAt: i.createdAt,
      };
    });
});

const activityMeta: Record<string, { icon: 'view' | 'like' | 'rating' | 'save'; color: string; labelKey: string }> = {
  VIEW: { icon: 'view', color: '#0F52BA', labelKey: 'dashboard.viewed' },
  LIKE: { icon: 'like', color: '#FF7A59', labelKey: 'dashboard.liked' },
  RATING: { icon: 'rating', color: '#F59E0B', labelKey: 'dashboard.ratedValue' },
  SAVE: { icon: 'save', color: '#10B981', labelKey: 'dashboard.savedAction' },
};

function activityLabel(item: { type: string; value: number | null }) {
  const meta = activityMeta[item.type];
  if (!meta) return item.type;
  if (item.type === 'RATING') return t('dashboard.ratedValue', { value: item.value ?? '—' });
  return t(meta.labelKey);
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, ticks: { stepSize: 1, color: '#64748B', font: { size: 11 } }, grid: { color: '#E2E8F0', drawBorder: false } },
    x: { grid: { display: false }, ticks: { color: '#64748B', font: { size: 11 } } },
  },
};

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, ticks: { stepSize: 1, color: '#64748B', font: { size: 11 } }, grid: { color: '#E2E8F0', drawBorder: false } },
    x: { grid: { display: false }, ticks: { color: '#64748B', font: { size: 11 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 7 } },
  },
};
</script>

<template>
  <div style="background-color: var(--color-paper); min-height: 100vh">
    <div class="max-w-6xl mx-auto px-6 py-12">
      
      <div class="mb-12">
        <div class="inline-flex items-center gap-3 mb-6">
          <div style="width: 4px; height: 24px; background-color: var(--color-accent); border-radius: 2px"></div>
          <span class="tag-mono text-xs font-bold tracking-widest" style="color: var(--color-accent); text-transform: uppercase">{{ t('dashboard.label') }}</span>
        </div>
        <h1 class="font-display text-5xl font-bold mb-4" style="color: var(--color-ink)">{{ t('dashboard.title') }}</h1>
        <p class="text-lg" style="color: var(--color-ink-soft)">{{ t('dashboard.description') }}</p>
      </div>

      <p v-if="isLoading" class="text-center py-20" style="color: var(--color-ink-faint); font-size: 16px">{{ t('dashboard.loading') }}</p>

      <p v-else-if="errorMessage" class="text-center py-16" style="color: var(--color-alert)">{{ errorMessage }}</p>

      <div v-else-if="interactions.length === 0" class="text-center py-20 rounded-lg" style="background-color: var(--color-paper-dim); border: 1px dashed var(--color-line)">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--color-ink-faint); margin: 0 auto 16px">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <p class="text-lg font-semibold mb-2" style="color: var(--color-ink)">{{ t('dashboard.noActivity') }}</p>
        <p style="color: var(--color-ink-soft)">{{ t('dashboard.noActivityDescription') }}</p>
      </div>

      <div v-else class="space-y-12">
  
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div class="rounded-lg p-8" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
            <div class="flex items-center justify-between mb-4">
              <p class="tag-mono text-xs font-bold" style="color: var(--color-ink-faint); text-transform: uppercase">{{ t('dashboard.totalActivity') }}</p>
              <div style="width: 40px; height: 40px; background-color: rgba(15, 82, 186, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="color: var(--color-accent)">
                  <rect x="3" y="4" width="4" height="16"/>
                  <rect x="10" y="6" width="4" height="14"/>
                  <rect x="17" y="2" width="4" height="18"/>
                </svg>
              </div>
            </div>
            <p class="font-display text-4xl font-bold" style="color: var(--color-accent)">{{ totalInteractions }}</p>
            <p class="text-xs mt-3" style="color: var(--color-ink-faint)">{{ t('dashboard.interactionsTracked') }}</p>
          </div>

          <div class="rounded-lg p-8" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
            <div class="flex items-center justify-between mb-4">
              <p class="tag-mono text-xs font-bold" style="color: var(--color-ink-faint); text-transform: uppercase">{{ t('dashboard.favorites') }}</p>
              <div style="width: 40px; height: 40px; background-color: rgba(255, 122, 89, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="color: var(--color-secondary)">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
            </div>
            <p class="font-display text-4xl font-bold" style="color: var(--color-secondary)">{{ totalLikes }}</p>
            <p class="text-xs mt-3" style="color: var(--color-ink-faint)">{{ t('dashboard.destinationsLiked') }}</p>
          </div>

          <div class="rounded-lg p-8" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
            <div class="flex items-center justify-between mb-4">
              <p class="tag-mono text-xs font-bold" style="color: var(--color-ink-faint); text-transform: uppercase">{{ t('dashboard.topPick') }}</p>
              <div style="width: 40px; height: 40px; background-color: rgba(16, 185, 129, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="color: var(--color-sage)">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
            </div>
            <p class="font-display text-xl font-bold truncate" style="color: var(--color-ink)">{{ topDestinationName }}</p>
            <p class="text-xs mt-3" style="color: var(--color-ink-faint)">{{ t('dashboard.mostLiked') }}</p>
          </div>

          <div class="rounded-lg p-8" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
            <div class="flex items-center justify-between mb-4">
              <p class="tag-mono text-xs font-bold" style="color: var(--color-ink-faint); text-transform: uppercase">{{ t('dashboard.saved') }}</p>
              <div style="width: 40px; height: 40px; background-color: rgba(16, 185, 129, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="color: var(--color-sage)">
                  <path d="M6 2h12a1 1 0 0 1 1 1v19l-7-4-7 4V3a1 1 0 0 1 1-1z"/>
                </svg>
              </div>
            </div>
            <p class="font-display text-4xl font-bold" style="color: var(--color-sage)">{{ totalSaved }}</p>
            <p class="text-xs mt-3" style="color: var(--color-ink-faint)">{{ t('dashboard.destinationsSaved') }}</p>
          </div>

          <div class="rounded-lg p-8" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
            <div class="flex items-center justify-between mb-4">
              <p class="tag-mono text-xs font-bold" style="color: var(--color-ink-faint); text-transform: uppercase">{{ t('dashboard.avgRating') }}</p>
              <div style="width: 40px; height: 40px; background-color: rgba(245, 158, 11, 0.12); border-radius: 8px; display: flex; align-items: center; justify-content: center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="color: var(--color-warning)">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
            </div>
            <p v-if="avgRating !== null" class="font-display text-4xl font-bold" style="color: var(--color-warning)">{{ avgRating.toFixed(1) }}<span class="text-lg font-semibold" style="color: var(--color-ink-faint)"> / 5</span></p>
            <p v-else class="font-display text-xl font-bold" style="color: var(--color-ink-faint)">{{ t('dashboard.noRatings') }}</p>
            <p class="text-xs mt-3" style="color: var(--color-ink-faint)">{{ t('dashboard.outOfFive') }}</p>
          </div>

          <div class="rounded-lg p-8" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
            <div class="flex items-center justify-between mb-4">
              <p class="tag-mono text-xs font-bold" style="color: var(--color-ink-faint); text-transform: uppercase">{{ t('dashboard.countriesExplored') }}</p>
              <div style="width: 40px; height: 40px; background-color: rgba(15, 82, 186, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--color-accent)">
                  <circle cx="12" cy="12" r="9"/>
                  <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>
                </svg>
              </div>
            </div>
            <p class="font-display text-4xl font-bold" style="color: var(--color-accent)">{{ countriesExploredCount }}</p>
            <p class="text-xs mt-3" style="color: var(--color-ink-faint)">{{ t('dashboard.uniqueCountries') }}</p>
          </div>
        </div>

        <div>
          <h2 class="font-display text-2xl font-bold mb-6" style="color: var(--color-ink)">{{ t('dashboard.activityOverTime') }}</h2>
          <div class="rounded-lg p-8" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
            <h3 class="tag-mono text-xs font-bold mb-6" style="color: var(--color-ink-faint); text-transform: uppercase">{{ t('dashboard.last14Days') }}</h3>
            <div style="height: 260px">
              <Line :data="activityOverTimeData" :options="lineChartOptions" />
            </div>
          </div>
        </div>

        <div v-if="budgetVsActual.length > 0">
          <h2 class="font-display text-2xl font-bold mb-6" style="color: var(--color-ink)">{{ t('charts.budgetVsActual') }}</h2>
          <div class="rounded-lg p-8" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
            <BudgetVsActualChart :items="budgetVsActual" />
          </div>
        </div>

        <div v-if="spendingBreakdown.total > 0">
          <h2 class="font-display text-2xl font-bold mb-6" style="color: var(--color-ink)">{{ t('charts.spendingBreakdown') }}</h2>

          <div class="max-w-xl">
            <div class="rounded-lg p-8" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
              <h3 class="tag-mono text-xs font-bold mb-6" style="color: var(--color-ink-faint); text-transform: uppercase">{{ t('charts.byCategory') }}</h3>
              <ExpensesByCategoryChart :breakdown="spendingBreakdown" />
            </div>
          </div>
        </div>

        <div>
          <h2 class="font-display text-2xl font-bold mb-6" style="color: var(--color-ink)">{{ t('dashboard.breakdown') }}</h2>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <div class="rounded-lg p-8" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
              <h3 class="tag-mono text-xs font-bold mb-6" style="color: var(--color-ink-faint); text-transform: uppercase">{{ t('dashboard.byType') }}</h3>
              <div style="height: 300px">
                <Bar :data="byTypeData" :options="chartOptions" />
              </div>
            </div>

            <div class="rounded-lg p-8" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
              <h3 class="tag-mono text-xs font-bold mb-6" style="color: var(--color-ink-faint); text-transform: uppercase">{{ t('dashboard.topDestinations') }}</h3>
              <div style="height: 300px">
                <Bar :data="byDestinationData" :options="chartOptions" />
              </div>
            </div>

            <div class="rounded-lg p-8 lg:col-span-2" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
              <h3 class="tag-mono text-xs font-bold mb-6" style="color: var(--color-ink-faint); text-transform: uppercase">{{ t('dashboard.topCountries') }}</h3>
              <div style="height: 280px">
                <Bar :data="topCountriesData" :options="chartOptions" />
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 class="font-display text-2xl font-bold mb-2" style="color: var(--color-ink)">{{ t('dashboard.recentActivity') }}</h2>
          <p class="text-sm mb-6" style="color: var(--color-ink-soft)">{{ t('dashboard.recentActivityDescription') }}</p>

          <div class="rounded-lg" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
            <div
              v-for="(item, index) in recentActivity"
              :key="item.id"
              class="flex items-center gap-4 px-8 py-5"
              :style="index !== recentActivity.length - 1 ? 'border-bottom: 1px solid var(--color-line)' : ''"
            >
              <div
                style="width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0"
                :style="{ backgroundColor: activityMeta[item.type]?.color + '1A' }"
              >
                <svg v-if="item.type === 'VIEW'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" :style="{ color: activityMeta[item.type]?.color }">
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <svg v-else-if="item.type === 'LIKE'" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" :style="{ color: activityMeta[item.type]?.color }">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <svg v-else-if="item.type === 'RATING'" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" :style="{ color: activityMeta[item.type]?.color }">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor" :style="{ color: activityMeta[item.type]?.color }">
                  <path d="M6 2h12a1 1 0 0 1 1 1v19l-7-4-7 4V3a1 1 0 0 1 1-1z"/>
                </svg>
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-semibold truncate" style="color: var(--color-ink)">{{ item.destinationName }}</p>
                <p class="text-xs mt-0.5" style="color: var(--color-ink-faint)">{{ activityLabel(item) }}</p>
              </div>
              <p class="text-xs whitespace-nowrap" style="color: var(--color-ink-faint)">{{ new Date(item.createdAt).toLocaleDateString(locale, { day: 'numeric', month: 'short' }) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>