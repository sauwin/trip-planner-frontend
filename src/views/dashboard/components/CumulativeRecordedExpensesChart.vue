<script setup lang="ts">
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import {
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
  LineElement,
  PointElement,
  type ChartOptions,
} from 'chart.js';
import { useI18n } from 'vue-i18n';
import type { TripWithFinancials } from '@/types/trip.types';
import { getCumulativeRecordedSpending } from '@/utils/dashboardAnalytics';
import { formatCalendarDate } from '@/utils/formatDate';
import { formatCurrency } from '@/utils/formatCurrency';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip);

const props = defineProps<{
  trips: TripWithFinancials[];
}>();

const { t, locale } = useI18n();
const spending = computed(() => getCumulativeRecordedSpending(props.trips));
const totalRecorded = computed(() => spending.value.reduce((sum, item) => sum + item.monthlyAmount, 0));
const monthlyAverage = computed(() => spending.value.length > 0 ? totalRecorded.value / spending.value.length : 0);
const peakMonth = computed(() => {
  if (spending.value.length === 0) return null;
  const first = spending.value[0];
  if (!first) return null;
  return spending.value.slice(1).reduce((peak, current) => (current.monthlyAmount > peak.monthlyAmount ? current : peak), first);
});

const chartData = computed(() => ({
  labels: spending.value.map(({ month }) =>
    formatCalendarDate(`${month}-01`, locale.value, { month: 'short', year: '2-digit' })),
  datasets: [
    {
      label: t('charts.recordedExpenses'),
      borderColor: '#0F52BA',
      backgroundColor: 'rgba(15, 82, 186, 0.12)',
      borderWidth: 3,
      pointBackgroundColor: '#0F52BA',
      pointBorderColor: '#FFFFFF',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 7,
      tension: 0.35,
      fill: true,
      data: spending.value.map(({ monthlyAmount }) => monthlyAmount),
    },
  ],
}));

const chartOptions = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        title: (items) => items[0]?.label ?? '',
        label: (context) => `${t('charts.recordedExpenses')}: ${formatCurrency(Number(context.raw), locale.value)}`,
      },
    },
  },
  scales: {
    x: {
      grid: { color: '#E2E8F0', drawBorder: false },
      ticks: { color: '#64748B', font: { size: 11 } },
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
  <div>
    <h2 class="section-heading">{{ t('charts.cumulativeExpenseTrend') }}</h2>
    <div class="card-surface relative rounded-lg p-8">
      <div class="absolute left-0 right-0 top-0 mx-auto" aria-hidden="true">
        <div class="h-[3px] w-full -translate-y-px bg-accent"></div>
      </div>
      <p class="mb-5 text-sm leading-6 text-ink-soft">{{ t('charts.cumulativeExpenseDescription') }}</p>

      <div v-if="spending.length > 0" class="space-y-5">
        <div class="grid gap-3 sm:grid-cols-3">
          <div class="rounded-lg border border-line bg-paper-dim px-3 py-2">
            <p class="text-xs font-medium text-ink-faint">{{ t('charts.totalRecordedExpenses') }}</p>
            <p class="mt-1 font-display text-lg font-bold text-ink">{{ formatCurrency(totalRecorded, locale) }}</p>
          </div>
          <div class="rounded-lg border border-line bg-paper-dim px-3 py-2">
            <p class="text-xs font-medium text-ink-faint">{{ t('charts.averageMonthlyExpenses') }}</p>
            <p class="mt-1 font-display text-lg font-bold text-ink">{{ formatCurrency(monthlyAverage, locale) }}</p>
          </div>
          <div v-if="peakMonth" class="rounded-lg border border-line bg-paper-dim px-3 py-2">
            <p class="text-xs font-medium text-ink-faint">
              {{ t('charts.highestSpendingMonth') }} · {{ formatCalendarDate(`${peakMonth.month}-01`, locale, { month: 'short', year: '2-digit' }) }}
            </p>
            <p class="mt-1 font-display text-lg font-bold text-ink">{{ formatCurrency(peakMonth.monthlyAmount, locale) }}</p>
          </div>
        </div>
        <div class="h-[280px]">
          <Line :data="chartData" :options="chartOptions" />
        </div>
      </div>
      <p v-else class="chart-empty-state">{{ t('charts.noRecordedExpenses') }}</p>
    </div>
  </div>
</template>
