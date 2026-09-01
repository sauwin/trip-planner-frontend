<script setup lang="ts">
import { computed } from 'vue';
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useI18n } from 'vue-i18n';
import type { ExpenseBreakdown } from '@/utils/expenseBreakdown';

ChartJS.register(ArcElement, Tooltip, Legend);

const props = defineProps<{
  breakdown: ExpenseBreakdown;
}>();

const { t } = useI18n();

const SEGMENT_COLORS: Record<string, string> = {
  accommodation: '#0F52BA',
  transport: '#FF7A59',
  food: '#10B981',
  activities: '#F59E0B',
  other: '#94A3B8',
};

const segments = computed(() => {
  const entries: { key: string; label: string; value: number }[] = [
    { key: 'accommodation', label: t('charts.categories.accommodation'), value: props.breakdown.accommodation },
    { key: 'transport', label: t('tripDetail.expenseCategories.TRANSPORT'), value: props.breakdown.transport },
    { key: 'food', label: t('tripDetail.expenseCategories.FOOD'), value: props.breakdown.food },
    { key: 'activities', label: t('tripDetail.expenseCategories.ACTIVITIES'), value: props.breakdown.activities },
    { key: 'other', label: t('tripDetail.expenseCategories.OTHER'), value: props.breakdown.other },
  ];
  return entries.filter((e) => e.value > 0);
});

const hasData = computed(() => segments.value.length > 0);

const chartData = computed(() => ({
  labels: segments.value.map((s) => s.label),
  datasets: [
    {
      data: segments.value.map((s) => s.value),
      backgroundColor: segments.value.map((s) => SEGMENT_COLORS[s.key]),
      borderWidth: 0,
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' as const, labels: { color: '#64748B', font: { size: 11 }, boxWidth: 10, padding: 12 } },
  },
};
</script>

<template>
  <div v-if="hasData" style="height: 260px">
    <Doughnut :data="chartData" :options="chartOptions" />
  </div>
  <p v-else class="text-sm text-center py-10" style="color: var(--color-ink-faint)">{{ t('charts.noData') }}</p>
</template>