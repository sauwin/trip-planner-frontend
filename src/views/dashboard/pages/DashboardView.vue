<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getInteractions } from '@/api/interactions.api';
import { getTrips } from '@/api/trips.api';
import type { Interaction } from '@/types/interaction.types';
import type { TripWithFinancials } from '@/types/trip.types';
import { useI18n } from 'vue-i18n';

import DashboardStats from '../components/DashboardStats.vue';
import ActivityOverTimeChart from '../components/ActivityOverTimeChart.vue';
import BudgetVsActualSection from '../components/BudgetVsActualSection.vue';
import SpendingBreakdownSection from '../components/SpendingBreakdownSection.vue';
import InteractionBreakdown from '../components/InteractionBreakdown.vue';
import RecentActivityList from '../components/RecentActivityList.vue';

const interactions = ref<Interaction[]>([]);
const trips = ref<TripWithFinancials[]>([]);
const isLoading = ref(true);
const errorMessage = ref('');
const { t } = useI18n();

onMounted(async () => {
  try {
    const [interactionsResp, tripsResp] = await Promise.all([
      getInteractions(),
      getTrips(),
    ]);
    interactions.value = interactionsResp.data;
    trips.value = tripsResp.data;
  } catch {
    errorMessage.value = t('dashboard.failed');
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div style="background-color: var(--color-paper); min-height: 100vh">
    <div class="max-w-7xl mx-auto px-6 py-12">

      <div class="mb-12">
        <div class="inline-flex items-center gap-3 mb-6">
          <div style="width: 4px; height: 24px; background-color: var(--color-accent-dark); border-radius: 2px"></div>
          <span class="tag-mono text-xs font-bold tracking-widest" style="color: var(--color-accent-dark); text-transform: uppercase">{{ t('dashboard.label') }}</span>
        </div>
        <h1 class="font-display text-5xl font-bold mb-4" style="color: var(--color-ink)">{{ t('dashboard.title') }}</h1>
        <p class="text-lg" style="color: var(--color-ink-soft)">{{ t('dashboard.description') }}</p>
      </div>

      <p v-if="isLoading" class="text-center py-20" style="color: var(--color-ink-faint); font-size: 16px">{{ t('dashboard.loading') }}</p>

      <p v-else-if="errorMessage" class="text-center py-16" style="color: var(--color-alert)">{{ errorMessage }}</p>

      <div v-else-if="interactions.length === 0" class="text-center py-20 rounded-lg" style="background-color: var(--color-paper-dim); border: 1px dashed var(--color-line)">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--color-ink-faint); margin: 0 auto 16px">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <p class="text-lg font-semibold mb-2" style="color: var(--color-ink)">{{ t('dashboard.noActivity') }}</p>
        <p style="color: var(--color-ink-soft)">{{ t('dashboard.noActivityDescription') }}</p>
      </div>

      <div v-else class="space-y-12">
        <DashboardStats :interactions="interactions" />
        <ActivityOverTimeChart :interactions="interactions" />
        <BudgetVsActualSection :trips="trips" />
        <SpendingBreakdownSection :trips="trips" />
        <InteractionBreakdown :interactions="interactions" />
        <RecentActivityList :interactions="interactions" />
      </div>
    </div>
  </div>
</template>