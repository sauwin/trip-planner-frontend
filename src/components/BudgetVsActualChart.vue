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

const hasData = computed(() => props.items.length > 0);

const chartData = computed(() => ({
  labels: props.items.map((item) => item.name),
  datasets: [
    {
      label: t('charts.budget'),
      backgroundColor: '#94A3B8',
      borderRadius: 4,
      borderSkipped: false,
      data: props.items.map((item) => item.budget ?? 0),
    },
    {
      label: t('charts.trackedCost'),
      backgroundColor: props.items.map((item) => item.trackedTotal > (item.budget ?? 0) ? '#FF7A59' : '#10B981'),
      borderRadius: 4,
      borderSkipped: false,
      data: props.items.map((item) => item.trackedTotal),
    },
  ],
}));

const chartOptions = computed<ChartOptions<'bar'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom', labels: { color: '#64748B', font: { size: 11 }, boxWidth: 14, padding: 12 } },
    tooltip: {
      callbacks: {
        label: (context) => {
          const item = props.items[context.dataIndex];
          const amount = formatCurrency(Number(context.raw), locale.value);
          if (context.datasetIndex !== 1 || !item) return `${context.dataset.label ?? ''}: ${amount}`;
          return [
            `${context.dataset.label ?? ''}: ${amount}`,
            `${t('charts.recordedExpenses')}: ${formatCurrency(item.recordedExpenses, locale.value)}`,
            `${t('charts.estimatedAccommodation')}: ${formatCurrency(item.estimatedAccommodation, locale.value)}`,
          ];
        },
      },
    },
  },
  scales: {
    x: {
      ticks: {
        color: '#64748B',
        font: { size: 11 },
        autoSkip: false,
        maxRotation: 45,
        minRotation: 25,
      },
      grid: { display: false },
    },
    y: {
      beginAtZero: true,
      ticks: {
        color: '#64748B',
        font: { size: 11 },
        callback: (value) => formatCurrency(Number(value), locale.value),
      },
      grid: { color: '#E2E8F0', drawBorder: false },
    },
  },
}));
</script>

<template>
  <div v-if="hasData" class="overflow-x-auto">
    <div :style="{ width: '100%', minWidth: `${Math.max(640, items.length * 130)}px`, height: '360px' }">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
  </div>
  <p v-else class="chart-empty-state">{{ t('charts.noData') }}</p>
</template>
