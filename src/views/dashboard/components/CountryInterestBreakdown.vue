<script setup lang="ts">
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
  type ChartOptions,
} from 'chart.js';
import { useI18n } from 'vue-i18n';
import type { Interaction } from '@/types/interaction.types';
import { getDestinationDisplayName } from '@/utils/destinationName';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const props = defineProps<{
  interactions: Interaction[];
}>();

const { t, locale } = useI18n();

const countryInterests = computed(() => {
  const countries = new Map<string, Map<string, {
    id: string;
    name: string;
    liked: boolean;
    saved: boolean;
    rating: number | null;
    ratingUpdatedAt: string;
  }>>();

  for (const interaction of props.interactions) {
    if (interaction.type === 'VIEW') continue;

    const country = interaction.destination.country;
    let destinations = countries.get(country);
    if (!destinations) {
      destinations = new Map();
      countries.set(country, destinations);
    }

    let destination = destinations.get(interaction.destinationId);
    if (!destination) {
      destination = {
        id: interaction.destinationId,
        name: getDestinationDisplayName(interaction.destination, locale.value),
        liked: false,
        saved: false,
        rating: null,
        ratingUpdatedAt: '',
      };
      destinations.set(interaction.destinationId, destination);
    }

    if (interaction.type === 'LIKE') destination.liked = true;
    if (interaction.type === 'SAVE') destination.saved = true;
    if (interaction.type === 'RATING' && interaction.createdAt >= destination.ratingUpdatedAt) {
      destination.rating = interaction.value;
      destination.ratingUpdatedAt = interaction.createdAt;
    }
  }

  return [...countries.entries()]
    .map(([country, destinations]) => ({
      country,
      label: country || t('dashboard.unknown'),
      destinations: [...destinations.values()].sort((a, b) => a.name.localeCompare(b.name)),
      likes: [...destinations.values()].filter((destination) => destination.liked).length,
      saves: [...destinations.values()].filter((destination) => destination.saved).length,
      ratings: [...destinations.values()].filter((destination) => destination.rating !== null).length,
      engagement: [...destinations.values()].filter((destination) => destination.liked || destination.saved || destination.rating !== null).length,
    }))
    .sort((a, b) => b.engagement - a.engagement || a.country.localeCompare(b.country))
    .slice(0, 6);
});

const chartData = computed(() => ({
  labels: countryInterests.value.map(({ label }) => label),
  datasets: [
    {
      label: t('dashboard.liked'),
      backgroundColor: '#10B981',
      borderRadius: 6,
      data: countryInterests.value.map(({ likes }) => likes),
    },
    {
      label: t('dashboard.savedAction'),
      backgroundColor: '#0F52BA',
      borderRadius: 6,
      data: countryInterests.value.map(({ saves }) => saves),
    },
    {
      label: t('dashboard.ratings'),
      backgroundColor: '#F59E0B',
      borderRadius: 6,
      data: countryInterests.value.map(({ ratings }) => ratings),
    },
  ],
}));

const chartOptions = computed<ChartOptions<'bar'>>(() => ({
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { color: '#64748B', font: { size: 11 }, boxWidth: 12, padding: 12 },
    },
    tooltip: {
      callbacks: {
        label: (context) => `${context.dataset.label ?? ''}: ${Number(context.raw)}`,
      },
    },
  },
  scales: {
    x: {
      beginAtZero: true,
      ticks: { color: '#64748B', font: { size: 11 } },
      grid: { color: '#E2E8F0', drawBorder: false },
    },
    y: {
      grid: { display: false },
      ticks: { color: '#64748B', font: { size: 11 } },
    },
  },
}));
</script>

<template>
  <div>
    <h2 class="section-heading">{{ t('dashboard.destinationInterests') }}</h2>

    <div class="card-surface relative rounded-lg p-8">
      <div class="absolute left-0 right-0 top-0 mx-auto" aria-hidden="true">
        <div class="h-[3px] w-full -translate-y-px bg-sage"></div>
      </div>
      <h3 class="section-caption">{{ t('dashboard.interestsByCountry') }}</h3>
      <p class="mb-5 text-sm leading-6 text-ink-soft">{{ t('dashboard.interestsByCountryDescription') }}</p>

      <div v-if="countryInterests.length > 0" class="space-y-6">
        <div class="h-[260px]">
          <Bar :data="chartData" :options="chartOptions" />
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <article
            v-for="country in countryInterests"
            :key="country.country"
            class="rounded-lg border border-line bg-paper-dim p-4"
          >
            <div class="mb-3 flex items-center justify-between gap-3">
              <h4 class="font-semibold text-ink">{{ country.label }}</h4>
              <span class="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent">
                {{ country.engagement }}
              </span>
            </div>

            <div class="grid grid-cols-3 gap-2 text-xs text-ink-soft">
              <div class="rounded bg-sage/10 px-2 py-2 text-center">
                <div class="font-semibold text-ink">{{ country.likes }}</div>
                <div>{{ t('dashboard.liked') }}</div>
              </div>
              <div class="rounded bg-accent/10 px-2 py-2 text-center">
                <div class="font-semibold text-ink">{{ country.saves }}</div>
                <div>{{ t('dashboard.savedAction') }}</div>
              </div>
              <div class="rounded bg-secondary/15 px-2 py-2 text-center">
                <div class="font-semibold text-ink">{{ country.ratings }}</div>
                <div>{{ t('dashboard.ratings') }}</div>
              </div>
            </div>
          </article>
        </div>
      </div>
      <p v-else class="chart-empty-state">{{ t('dashboard.noInterestData') }}</p>
    </div>
  </div>
</template>
