<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { TripWithFinancials } from '@/types/trip.types';
import { getExpenseBreakdown } from '@/utils/expenseBreakdown';
import ExpensesByCategoryChart from '@/components/ExpensesByCategoryChart.vue';
import TotalSpendByTripChart from '@/components/TotalSpendByTripChart.vue';

const props = defineProps<{
  trips: TripWithFinancials[];
}>();

const { t } = useI18n();

const allDestinationStays = computed(() => props.trips.flatMap((trip) => trip.destinations));
const allExpenses = computed(() => props.trips.flatMap((trip) => trip.expenses));
const spendingBreakdown = computed(() => getExpenseBreakdown(allDestinationStays.value, allExpenses.value));

const spendByTrip = computed(() => {
  return props.trips.map((trip) => ({
    name: trip.title,
    amount: getExpenseBreakdown(trip.destinations, trip.expenses).total,
  }));
});
</script>

<template>
  <div v-if="spendingBreakdown.total > 0">
    <h2 class="font-display text-2xl font-bold mb-6" style="color: var(--color-ink)">{{ t('charts.spendingBreakdown') }}</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card-surface rounded-lg p-8">
        <h3 class="tag-mono text-xs font-bold mb-6" style="color: var(--color-ink-faint); text-transform: uppercase">{{ t('charts.byCategory') }}</h3>
        <ExpensesByCategoryChart :breakdown="spendingBreakdown" />
      </div>
      <div class="card-surface rounded-lg p-8">
        <h3 class="tag-mono text-xs font-bold mb-6" style="color: var(--color-ink-faint); text-transform: uppercase">{{ t('charts.spendByTrip') }}</h3>
        <TotalSpendByTripChart :items="spendByTrip" />
      </div>
    </div>
  </div>
</template>