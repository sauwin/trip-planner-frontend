<script setup lang="ts">
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { useI18n } from 'vue-i18n';
import type { Interaction } from '@/types/interaction.types';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const props = defineProps<{
  interactions: Interaction[];
}>();

const { t } = useI18n();
const interactionColors = ['#94A3B8', '#10B981', '#FF7A59', '#0F52BA'];
const countryColors = ['#0F52BA', '#FF7A59', '#10B981'];

const byTypeData = computed(() => {
  const counts: Record<string, number> = { VIEW: 0, LIKE: 0, RATING: 0, SAVE: 0 };
  for (const i of props.interactions) {
    counts[i.type] = (counts[i.type] ?? 0) + 1;
  }
  return {
    labels: Object.keys(counts),
    datasets: [
      {
        label: t('dashboard.interactions'),
        backgroundColor: interactionColors,
        borderRadius: 6,
        borderSkipped: false,
        data: Object.values(counts),
      },
    ],
  };
});

const topCountriesData = computed(() => {
  const counts: Record<string, number> = {};
  for (const i of props.interactions) {
    counts[i.destination.country] = (counts[i.destination.country] ?? 0) + 1;
  }
  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  return {
    labels: sorted.map(([country]) => country),
    datasets: [
      {
        label: t('dashboard.interactions'),
        backgroundColor: sorted.map((_, index) => countryColors[index % countryColors.length]),
        borderRadius: 6,
        borderSkipped: false,
        data: sorted.map(([, count]) => count),
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, ticks: { stepSize: 1, color: '#64748B', font: { size: 11 } }, grid: { color: '#E2E8F0', drawBorder: false } },
    x: { grid: { display: false }, ticks: { color: '#64748B', font: { size: 11 } } },
  },
};
</script>

<template>
  <div>
    <h2 class="section-heading">{{ t('dashboard.breakdown') }}</h2>

    <div class="grid grid-cols-1 gap-6">
      <div class="card-surface relative rounded-lg p-8">
        <div class="absolute left-0 right-0 top-0 mx-auto" aria-hidden="true">
          <div class="flex h-[3px] w-full -translate-y-px">
            <span class="flex-1 bg-[var(--color-ink-faint)]"></span>
            <span class="flex-1 bg-sage"></span>
            <span class="flex-1 bg-secondary"></span>
            <span class="flex-1 bg-accent"></span>
          </div>
        </div>
        <h3 class="section-caption">{{ t('dashboard.byType') }}</h3>
        <div class="h-[300px]">
          <Bar :data="byTypeData" :options="chartOptions" />
        </div>
      </div>

      <div class="card-surface relative rounded-lg p-8">
        <div class="absolute left-0 right-0 top-0 mx-auto" aria-hidden="true">
          <div class="flex h-[3px] w-full -translate-y-px">
            <span class="flex-1 bg-accent"></span>
            <span class="flex-1 bg-secondary"></span>
            <span class="flex-1 bg-sage"></span>
          </div>
        </div>
        <h3 class="section-caption">{{ t('dashboard.topCountries') }}</h3>
        <div class="h-[280px]">
          <Bar :data="topCountriesData" :options="chartOptions" />
        </div>
      </div>
    </div>
  </div>
</template>