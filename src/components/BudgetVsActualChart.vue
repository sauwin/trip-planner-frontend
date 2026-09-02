<script setup lang="ts">
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import { Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { useI18n } from 'vue-i18n';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

export interface BudgetVsActualItem {
  name: string;
  budget: number;
  actual: number;
}

const props = defineProps<{
  items: BudgetVsActualItem[];
}>();

const { t } = useI18n();

const hasData = computed(() => props.items.length > 0);

const chartData = computed(() => ({
  labels: props.items.map((i) => i.name),
  datasets: [
    {
      label: t('charts.budget'),
      borderColor: '#94A3B8',
      backgroundColor: '#94A3B8',
      pointRadius: 3,
      borderDash: [6, 4],
      tension: 0.2,
      data: props.items.map((i) => i.budget),
    },
    {
      label: t('charts.actualSpend'),
      borderColor: '#0F52BA',
      backgroundColor: '#0F52BA',
      pointRadius: 3,
      tension: 0.2,
      data: props.items.map((i) => i.actual),
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' as const, labels: { color: '#64748B', font: { size: 11 }, boxWidth: 14, padding: 12 } },
  },
  scales: {
    y: { beginAtZero: true, ticks: { color: '#64748B', font: { size: 11 } }, grid: { color: '#E2E8F0', drawBorder: false } },
    x: { grid: { display: false }, ticks: { color: '#64748B', font: { size: 11 } } },
  },
};
</script>

<template>
  <div v-if="hasData" style="height: 280px">
    <Line :data="chartData" :options="chartOptions" />
  </div>
  <p v-else class="text-sm text-center py-10" style="color: var(--color-ink-faint)">{{ t('charts.noData') }}</p>
</template>