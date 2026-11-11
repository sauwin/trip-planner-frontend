<script setup lang="ts">
import { computed } from 'vue';
import { Doughnut } from 'vue-chartjs';
import { ArcElement, Chart as ChartJS, Legend, Tooltip, type ChartOptions } from 'chart.js';
import { useI18n } from 'vue-i18n';
import type { TripWithFinancials } from '@/types/trip.types';
import type { SpendingCategoryTotal } from '@/utils/dashboardAnalytics';
import { getTotalSpendingByCategory } from '@/utils/dashboardAnalytics';
import { formatCurrency } from '@/utils/formatCurrency';

ChartJS.register(ArcElement, Tooltip, Legend);

const props = defineProps<{
  trips: TripWithFinancials[];
}>();

const { t, locale } = useI18n();
const categoryTotals = computed(() => getTotalSpendingByCategory(props.trips));

const categoryLabels = computed<Record<SpendingCategoryTotal['category'], string>>(() => ({
  accommodation: t('charts.categories.accommodation'),
  transport: t('tripDetail.expenseCategories.TRANSPORT'),
  food: t('tripDetail.expenseCategories.FOOD'),
  activities: t('tripDetail.expenseCategories.ACTIVITIES'),
  other: t('tripDetail.expenseCategories.OTHER'),
}));

const chartData = computed(() => ({
  labels: categoryTotals.value.map(({ category }) => categoryLabels.value[category]),
  datasets: [
    {
      data: categoryTotals.value.map(({ amount }) => amount),
      backgroundColor: ['#FF7A59', '#0F52BA', '#10B981', '#F59E0B', '#94A3B8'],
      borderColor: '#FFFFFF',
      borderWidth: 3,
      hoverOffset: 6,
    },
  ],
}));

const chartOptions = computed<ChartOptions<'doughnut'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '62%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: { color: '#64748B', font: { size: 11 }, boxWidth: 12, padding: 12 },
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const amount = Number(context.raw);
          const total = context.dataset.data.reduce((sum, value) => sum + Number(value), 0);
          const percentage = total > 0 ? (amount / total) * 100 : 0;
          return `${context.label}: ${formatCurrency(amount, locale.value)} (${percentage.toFixed(1)}%)`;
        },
      },
    },
  },
}));
</script>

<template>
  <div class="h-[300px]">
    <Doughnut :data="chartData" :options="chartOptions" />
  </div>
</template>
