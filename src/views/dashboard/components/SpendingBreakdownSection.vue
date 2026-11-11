<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { TripWithFinancials } from '@/types/trip.types';
import { getTripSpendingBreakdowns } from '@/utils/dashboardAnalytics';
import SpendingCompositionChart from './SpendingCompositionChart.vue';
import SpendingByTripChart from './SpendingByTripChart.vue';

const props = defineProps<{
  trips: TripWithFinancials[];
}>();

const { t } = useI18n();

const spendingByTrip = computed(() => getTripSpendingBreakdowns(props.trips));
const hasSpending = computed(() => spendingByTrip.value.some((trip) => trip.trackedTotal > 0));
</script>

<template>
  <div v-if="hasSpending">
    <h2 class="section-heading">{{ t('charts.spendingBreakdown') }}</h2>

    <div class="card-surface relative rounded-lg p-8">
      <div class="absolute left-0 right-0 top-0 mx-auto" aria-hidden="true">
        <div class="h-[3px] w-full -translate-y-px bg-accent"></div>
      </div>
      <div class="grid gap-10 xl:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
        <div>
          <h3 class="section-caption">{{ t('charts.spendingByTrip') }}</h3>
          <p class="mb-5 text-sm leading-6 text-ink-soft">{{ t('charts.spendingByTripDescription') }}</p>
          <SpendingByTripChart :items="spendingByTrip" />
        </div>
        <div>
          <h3 class="section-caption">{{ t('charts.spendingComposition') }}</h3>
          <p class="mb-5 text-sm leading-6 text-ink-soft">{{ t('charts.spendingCompositionDescription') }}</p>
          <SpendingCompositionChart :trips="trips" />
        </div>
      </div>
    </div>
  </div>
</template>