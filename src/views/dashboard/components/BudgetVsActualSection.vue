<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { TripWithFinancials } from '@/types/trip.types';
import { getExpenseBreakdown } from '@/utils/expenseBreakdown';
import BudgetVsActualChart from '@/components/BudgetVsActualChart.vue';

const props = defineProps<{
  trips: TripWithFinancials[];
}>();

const { t } = useI18n();

const budgetVsActual = computed(() => {
  return props.trips
    .filter((trip) => trip.budgetTotal != null)
    .sort((a, b) => {
      if (a.startDate && b.startDate) return a.startDate.localeCompare(b.startDate);
      if (a.startDate) return -1;
      if (b.startDate) return 1;
      return a.createdAt.localeCompare(b.createdAt);
    })
    .map((trip) => ({
      name: trip.title,
      budget: trip.budgetTotal as number,
      actual: getExpenseBreakdown(trip.destinations, trip.expenses).total,
    }));
});
</script>

<template>
  <div v-if="budgetVsActual.length > 0">
    <h2 class="section-heading">{{ t('charts.budgetVsActual') }}</h2>
    <div class="card-surface relative rounded-lg p-8">
      <div class="absolute left-0 right-0 top-0 mx-auto" aria-hidden="true">
        <div class="h-[3px] w-full -translate-y-px bg-sage"></div>
      </div>
      <BudgetVsActualChart :items="budgetVsActual" />
    </div>
  </div>
</template>