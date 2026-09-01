<script setup lang="ts">
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js';
import { useI18n } from 'vue-i18n';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

export interface DestinationCost {
  name: string;
  amount: number;
}

const props = defineProps<{
  items: DestinationCost[];
}>();

const { t } = useI18n();

const withCost = computed(() => props.items.filter((i) => i.amount > 0));
const hasData = computed(() => withCost.value.length > 0);

const chartData = computed(() => ({
  labels: withCost.value.map((i) => i.name),
  datasets: [
    {
      label: t('charts.spend'),
      backgroundColor: '#0F52BA',
      borderRadius: 6,
      borderSkipped: false,
      data: withCost.value.map((i) => i.amount),
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
    <Bar :data="chartData" :options="chartOptions" />
  </div>
  <p v-else class="text-sm text-center py-10" style="color: var(--color-ink-faint)">{{ t('charts.noData') }}</p>
</template>