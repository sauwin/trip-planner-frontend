<script setup lang="ts">
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import { BarElement, CategoryScale, Chart as ChartJS, LinearScale, Tooltip, type ChartOptions } from 'chart.js';
import { useI18n } from 'vue-i18n';
import type { TripWithFinancials } from '@/types/trip.types';
import { getTripCostsPerDay } from '@/utils/dashboardAnalytics';
import { formatCurrency } from '@/utils/formatCurrency';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

const props = defineProps<{
  trips: TripWithFinancials[];
}>();

const { t, locale } = useI18n();
const items = computed(() => getTripCostsPerDay(props.trips));

const chartData = computed(() => ({
  labels: items.value.map(({ name }) => name),
  datasets: [
    {
      label: t('charts.dailyCostPerPerson'),
      backgroundColor: '#0F52BA',
      borderRadius: 6,
      borderSkipped: false,
      data: items.value.map(({ costPerPersonPerDay }) => costPerPersonPerDay),
    },
  ],
}));

const chartOptions = computed<ChartOptions<'bar'>>(() => ({
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context) => `${context.dataset.label ?? ''}: ${formatCurrency(Number(context.raw), locale.value)}`,
        afterLabel: (context) => {
          const item = items.value[context.dataIndex];
          if (!item) return [];
          return [
            `${t('charts.trackedCost')}: ${formatCurrency(item.trackedTotal, locale.value)}`,
            `${t('charts.tripDays')}: ${item.days}`,
            `${t('charts.travelers')}: ${item.travelers}`,
          ];
        },
      },
    },
  },
  scales: {
    x: {
      beginAtZero: true,
      ticks: {
        color: '#64748B',
        font: { size: 11 },
        callback: (value) => formatCurrency(Number(value), locale.value),
      },
      grid: { color: '#E2E8F0', drawBorder: false },
    },
    y: { grid: { display: false }, ticks: { color: '#64748B', font: { size: 11 } } },
  },
}));
</script>

<template>
  <div>
    <h2 class="section-heading">{{ t('charts.tripCostPerDay') }}</h2>
    <div class="card-surface relative rounded-lg p-8">
      <div class="absolute left-0 right-0 top-0 mx-auto" aria-hidden="true">
        <div class="h-[3px] w-full -translate-y-px bg-accent"></div>
      </div>
      <p class="section-caption">{{ t('charts.tripCostPerDayDescription') }}</p>
      <div v-if="items.length > 0" :style="{ height: `${Math.max(240, items.length * 42)}px` }">
        <Bar :data="chartData" :options="chartOptions" />
      </div>
      <p v-else class="chart-empty-state">{{ t('charts.noTripCostPerDayData') }}</p>
    </div>
  </div>
</template>
