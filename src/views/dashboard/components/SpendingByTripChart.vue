<script setup lang="ts">
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import { BarElement, CategoryScale, Chart as ChartJS, LinearScale, Tooltip, Legend, type ChartOptions } from 'chart.js';
import { useI18n } from 'vue-i18n';
import type { TripSpendingBreakdown } from '@/utils/dashboardAnalytics';
import { formatCurrency } from '@/utils/formatCurrency';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const props = defineProps<{
  items: TripSpendingBreakdown[];
}>();

const { t, locale } = useI18n();

const ranked = computed(() => [...props.items].filter((item) => item.trackedTotal > 0).sort((a, b) => b.trackedTotal - a.trackedTotal));
const hasData = computed(() => ranked.value.length > 0);

const chartData = computed(() => ({
  labels: ranked.value.map((item) => item.name),
  datasets: [
    { label: t('tripDetail.expenseCategories.TRANSPORT'), backgroundColor: '#0F52BA', data: ranked.value.map((item) => item.transport) },
    { label: t('tripDetail.expenseCategories.FOOD'), backgroundColor: '#10B981', data: ranked.value.map((item) => item.food) },
    { label: t('tripDetail.expenseCategories.ACTIVITIES'), backgroundColor: '#F59E0B', data: ranked.value.map((item) => item.activities) },
    { label: t('tripDetail.expenseCategories.OTHER'), backgroundColor: '#94A3B8', data: ranked.value.map((item) => item.other) },
    { label: t('charts.estimatedAccommodation'), backgroundColor: '#FF7A59', data: ranked.value.map((item) => item.estimatedAccommodation) },
  ],
}));

const chartOptions = computed<ChartOptions<'bar'>>(() => ({
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { color: '#64748B', font: { size: 11 }, boxWidth: 12, padding: 12 } },
    tooltip: {
      callbacks: {
        label: (context) => `${context.dataset.label ?? ''}: ${formatCurrency(Number(context.raw), locale.value)}`,
      },
    },
  },
  scales: {
    x: {
      stacked: true,
      beginAtZero: true,
      ticks: {
        color: '#64748B',
        font: { size: 11 },
        callback: (value) => formatCurrency(Number(value), locale.value),
      },
      grid: { color: '#E2E8F0', drawBorder: false },
    },
    y: { stacked: true, grid: { display: false }, ticks: { color: '#64748B', font: { size: 11 } } },
  },
}));
</script>

<template>
  <div v-if="hasData" :style="{ height: `${Math.max(260, ranked.length * 42)}px` }">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
  <p v-else class="chart-empty-state">{{ t('charts.noData') }}</p>
</template>
