<script setup lang="ts">
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js';
import { useI18n } from 'vue-i18n';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

export interface TripSpend {
  name: string;
  amount: number;
}

const props = defineProps<{
  items: TripSpend[];
}>();

const { t } = useI18n();

const ranked = computed(() => [...props.items].filter((i) => i.amount > 0).sort((a, b) => b.amount - a.amount));
const hasData = computed(() => ranked.value.length > 0);

const chartData = computed(() => ({
  labels: ranked.value.map((i) => i.name),
  datasets: [
    {
      label: t('charts.spend'),
      backgroundColor: '#10B981',
      borderRadius: 6,
      borderSkipped: false,
      data: ranked.value.map((i) => i.amount),
    },
  ],
}));

const chartOptions = {
  indexAxis: 'y' as const,
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { beginAtZero: true, ticks: { color: '#64748B', font: { size: 11 } }, grid: { color: '#E2E8F0', drawBorder: false } },
    y: { grid: { display: false }, ticks: { color: '#64748B', font: { size: 11 } } },
  },
};
</script>

<template>
  <div v-if="hasData" style="height: 260px">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
  <p v-else class="text-sm text-center py-10" style="color: var(--color-ink-faint)">{{ t('charts.noData') }}</p>
</template>