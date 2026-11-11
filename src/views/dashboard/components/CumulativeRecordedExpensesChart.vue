<script setup lang="ts">
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
  type ChartOptions,
} from 'chart.js';
import { useI18n } from 'vue-i18n';
import type { TripWithFinancials } from '@/types/trip.types';
import { getCumulativeRecordedSpending } from '@/utils/dashboardAnalytics';
import { formatCalendarDate } from '@/utils/formatDate';
import { formatCurrency } from '@/utils/formatCurrency';

ChartJS.register(LineElement, LinearScale, PointElement, Tooltip);

const props = defineProps<{
  trips: TripWithFinancials[];
}>();

const { t, locale } = useI18n();
const spending = computed(() => getCumulativeRecordedSpending(props.trips));
const singleMonth = computed(() => spending.value[0] ?? null);
const singleMonthLabel = computed(() => {
  if (!singleMonth.value) return '';
  return formatCalendarDate(`${singleMonth.value.month}-01`, locale.value, { month: 'long', year: 'numeric' });
});

const chartData = computed(() => ({
  datasets: [
    {
      label: t('charts.cumulativeExpenses'),
      data: spending.value.map(({ month, cumulativeAmount }) => {
        const [year = Number.NaN, monthNumber = Number.NaN] = month.split('-').map(Number);
        return { x: Date.UTC(year, monthNumber - 1, 15), y: cumulativeAmount };
      }),
      borderColor: '#0F52BA',
      backgroundColor: '#0F52BA',
      borderWidth: 3,
      pointRadius: 3,
      pointHoverRadius: 6,
      stepped: 'before' as const,
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
        title: (items) => {
          const timestamp = items[0]?.parsed.x;
          if (typeof timestamp !== 'number') return '';
          return formatCalendarDate(new Date(timestamp).toISOString(), locale.value, { month: 'long', year: 'numeric' });
        },
        label: (context) => `${t('charts.cumulativeExpenses')}: ${formatCurrency(Number(context.parsed.y), locale.value)}`,
        afterLabel: (context) => {
          const item = spending.value[context.dataIndex];
          return item
            ? `${t('charts.recordedExpenses')}: ${formatCurrency(item.monthlyAmount, locale.value)}`
            : '';
        },
      },
    },
  },
  scales: {
    x: {
      type: 'linear',
      ticks: {
        color: '#64748B',
        font: { size: 11 },
        maxTicksLimit: 8,
        callback: (value) => {
          const date = new Date(Number(value));
          return formatCalendarDate(date.toISOString(), locale.value, { month: 'short', year: '2-digit' });
        },
      },
      grid: { color: '#E2E8F0', drawBorder: false },
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
      <p class="section-caption">{{ t('charts.cumulativeExpenseDescription') }}</p>
      <div v-if="spending.length > 1" class="h-[280px]">
        <Line :data="chartData" :options="chartOptions" />
      </div>
      <div v-else-if="singleMonth" class="flex min-h-[280px] flex-col items-center justify-center text-center">
        <p class="mb-2 text-sm font-semibold text-ink-soft">{{ t('charts.singleMonthExpenseTitle', { month: singleMonthLabel }) }}</p>
        <p class="text-4xl font-bold text-accent">{{ formatCurrency(singleMonth.monthlyAmount, locale) }}</p>
        <p class="mt-3 max-w-lg text-sm text-ink-faint">{{ t('charts.expenseTrendNeedsMoreMonths') }}</p>
      </div>
      <p v-else class="chart-empty-state">{{ t('charts.noRecordedExpenses') }}</p>
    </div>
  </div>
</template>
