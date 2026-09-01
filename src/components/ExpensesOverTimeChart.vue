<script setup lang="ts">
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale, Tooltip } from 'chart.js';
import { useI18n } from 'vue-i18n';
import type { DailySpend } from '@/utils/expenseBreakdown';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip);

const props = defineProps<{
  points: DailySpend[];
}>();

const { t, locale } = useI18n();

const hasData = computed(() => props.points.length > 0);

const chartData = computed(() => ({
  labels: props.points.map((p) => new Date(p.date).toLocaleDateString(locale.value, { day: 'numeric', month: 'short' })),
  datasets: [
    {
      label: t('charts.spend'),
      borderColor: '#0F52BA',
      backgroundColor: 'rgba(15, 82, 186, 0.12)',
      pointBackgroundColor: '#0F52BA',
      pointRadius: 3,
      tension: 0.35,
      fill: true,
      data: props.points.map((p) => p.amount),
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, ticks: { color: '#64748B', font: { size: 11 } }, grid: { color: '#E2E8F0', drawBorder: false } },
    x: { grid: { display: false }, ticks: { color: '#64748B', font: { size: 11 } } },
  },
};
</script>

<template>
  <div v-if="hasData" style="height: 260px">
    <Line :data="chartData" :options="chartOptions" />
  </div>
  <p v-else class="text-sm text-center py-10" style="color: var(--color-ink-faint)">{{ t('charts.noData') }}</p>
</template>