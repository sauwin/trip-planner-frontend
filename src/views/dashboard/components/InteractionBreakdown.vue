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
        backgroundColor: '#0F52BA',
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
        backgroundColor: '#10B981',
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
    <h2 class="font-display text-2xl font-bold mb-6" style="color: var(--color-ink)">{{ t('dashboard.breakdown') }}</h2>

    <div class="grid grid-cols-1 gap-6">
      <div class="card-surface rounded-lg p-8">
        <h3 class="tag-mono text-xs font-bold mb-6" style="color: var(--color-ink-faint); text-transform: uppercase">{{ t('dashboard.byType') }}</h3>
        <div style="height: 300px">
          <Bar :data="byTypeData" :options="chartOptions" />
        </div>
      </div>

      <div class="card-surface rounded-lg p-8">
        <h3 class="tag-mono text-xs font-bold mb-6" style="color: var(--color-ink-faint); text-transform: uppercase">{{ t('dashboard.topCountries') }}</h3>
        <div style="height: 280px">
          <Bar :data="topCountriesData" :options="chartOptions" />
        </div>
      </div>
    </div>
  </div>
</template>