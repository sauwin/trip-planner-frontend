<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { TripWithFinancials } from '@/types/trip.types';
import { getTripSpendingBreakdowns } from '@/utils/dashboardAnalytics';
import BudgetVsActualChart from '@/components/BudgetVsActualChart.vue';

const props = defineProps<{
  trips: TripWithFinancials[];
}>();

const { t } = useI18n();

const budgetVsActual = computed(() => {
  return getTripSpendingBreakdowns(props.trips)
    .filter((trip) => trip.budget !== null)
    .sort((a, b) => {
      const aRatio = a.trackedTotal / (a.budget ?? 1);
      const bRatio = b.trackedTotal / (b.budget ?? 1);
      return bRatio - aRatio;
    });
});
</script>

<template>
  <div v-if="budgetVsActual.length > 0">
    <h2 class="section-heading">{{ t('charts.budgetVsTracked') }}</h2>
    <div class="card-surface relative rounded-lg p-8">
      <div class="absolute left-0 right-0 top-0 mx-auto" aria-hidden="true">
        <div class="h-[3px] w-full -translate-y-px bg-sage"></div>
      </div>
      <p class="mb-5 text-xs text-ink-faint">{{ t('charts.trackedCostDescription') }}</p>
      <BudgetVsActualChart :items="budgetVsActual" />
    </div>
  </div>
</template>