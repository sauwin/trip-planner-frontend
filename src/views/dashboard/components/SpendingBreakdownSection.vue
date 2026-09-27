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
    <h2 class="section-heading">{{ t('charts.spendingBreakdown') }}</h2>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card-surface relative rounded-lg p-8">
        <div class="absolute left-0 right-0 top-0 mx-auto" aria-hidden="true">
          <div class="flex h-[3px] w-full -translate-y-px">
            <span class="flex-1 bg-[var(--color-ink-faint)]"></span>
          </div>
        </div>
        <h3 class="section-caption">{{ t('charts.byCategory') }}</h3>
        <ExpensesByCategoryChart :breakdown="spendingBreakdown" />
      </div>
      <div class="card-surface relative rounded-lg p-8">
        <div class="absolute left-0 right-0 top-0 mx-auto" aria-hidden="true">
          <div class="flex h-[3px] w-full -translate-y-px">
            <span class="flex-1 bg-accent"></span>
            <span class="flex-1 bg-secondary"></span>
            <span class="flex-1 bg-sage"></span>
          </div>
        </div>
        <h3 class="section-caption">{{ t('charts.spendByTrip') }}</h3>
        <TotalSpendByTripChart :items="spendByTrip" />
      </div>
    </div>
  </div>
</template>