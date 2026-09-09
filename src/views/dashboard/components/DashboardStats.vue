<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Interaction, InteractionDestination } from '@/types/interaction.types';
import { getDestinationDisplayName } from '@/utils/destinationName';

const props = defineProps<{
  interactions: Interaction[];
}>();

const { t, locale } = useI18n();

function getName(destination: InteractionDestination) {
  return getDestinationDisplayName(destination, locale.value);
}

const totalInteractions = computed(() => props.interactions.length);
const totalLikes = computed(() => props.interactions.filter((i) => i.type === 'LIKE').length);
const totalSaved = computed(() => props.interactions.filter((i) => i.type === 'SAVE').length);

const ratingValues = computed(() =>
  props.interactions.filter((i) => i.type === 'RATING' && typeof i.value === 'number').map((i) => i.value as number),
);
const avgRating = computed(() => {
  if (ratingValues.value.length === 0) return null;
  const sum = ratingValues.value.reduce((acc, v) => acc + v, 0);
  return sum / ratingValues.value.length;
});

const countriesExploredCount = computed(() => {
  const countries = new Set<string>();
  for (const i of props.interactions) {
    countries.add(i.destination.country);
  }
  return countries.size;
});

const topDestinationName = computed(() => {
  const counts = new Map<string, { count: number; destination: InteractionDestination }>();
  for (const i of props.interactions) {
    if (i.type !== 'LIKE') continue;
    const entry = counts.get(i.destinationId);
    if (entry) {
      entry.count += 1;
    } else {
      counts.set(i.destinationId, { count: 1, destination: i.destination });
    }
  }

  let top: { count: number; destination: InteractionDestination } | null = null;
  for (const entry of counts.values()) {
    if (!top || entry.count > top.count) top = entry;
  }

  return top ? getName(top.destination) : '—';
});
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

    <div class="rounded-lg p-8" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
      <div class="flex items-center justify-between mb-4">
        <p class="tag-mono text-xs font-bold" style="color: var(--color-ink-faint); text-transform: uppercase">{{ t('dashboard.totalActivity') }}</p>
        <div style="width: 40px; height: 40px; background-color: rgba(15, 82, 186, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="color: var(--color-accent)">
            <rect x="3" y="4" width="4" height="16"/>
            <rect x="10" y="6" width="4" height="14"/>
            <rect x="17" y="2" width="4" height="18"/>
          </svg>
        </div>
      </div>
      <p class="font-display text-4xl font-bold" style="color: var(--color-accent)">{{ totalInteractions }}</p>
      <p class="text-xs mt-3" style="color: var(--color-ink-faint)">{{ t('dashboard.interactionsTracked') }}</p>
    </div>

    <div class="rounded-lg p-8" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
      <div class="flex items-center justify-between mb-4">
        <p class="tag-mono text-xs font-bold" style="color: var(--color-ink-faint); text-transform: uppercase">{{ t('dashboard.favorites') }}</p>
        <div style="width: 40px; height: 40px; background-color: rgba(255, 122, 89, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="color: var(--color-secondary)">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </div>
      </div>
      <p class="font-display text-4xl font-bold" style="color: var(--color-secondary)">{{ totalLikes }}</p>
      <p class="text-xs mt-3" style="color: var(--color-ink-faint)">{{ t('dashboard.destinationsLiked') }}</p>
    </div>

    <div class="rounded-lg p-8" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
      <div class="flex items-center justify-between mb-4">
        <p class="tag-mono text-xs font-bold" style="color: var(--color-ink-faint); text-transform: uppercase">{{ t('dashboard.topPick') }}</p>
        <div style="width: 40px; height: 40px; background-color: rgba(16, 185, 129, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="color: var(--color-sage)">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
      </div>
      <p class="font-display text-xl font-bold truncate" style="color: var(--color-ink)">{{ topDestinationName }}</p>
      <p class="text-xs mt-3" style="color: var(--color-ink-faint)">{{ t('dashboard.mostLiked') }}</p>
    </div>

    <div class="rounded-lg p-8" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
      <div class="flex items-center justify-between mb-4">
        <p class="tag-mono text-xs font-bold" style="color: var(--color-ink-faint); text-transform: uppercase">{{ t('dashboard.saved') }}</p>
        <div style="width: 40px; height: 40px; background-color: rgba(16, 185, 129, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="color: var(--color-sage)">
            <path d="M6 2h12a1 1 0 0 1 1 1v19l-7-4-7 4V3a1 1 0 0 1 1-1z"/>
          </svg>
        </div>
      </div>
      <p class="font-display text-4xl font-bold" style="color: var(--color-sage)">{{ totalSaved }}</p>
      <p class="text-xs mt-3" style="color: var(--color-ink-faint)">{{ t('dashboard.destinationsSaved') }}</p>
    </div>

    <div class="rounded-lg p-8" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
      <div class="flex items-center justify-between mb-4">
        <p class="tag-mono text-xs font-bold" style="color: var(--color-ink-faint); text-transform: uppercase">{{ t('dashboard.avgRating') }}</p>
        <div style="width: 40px; height: 40px; background-color: rgba(245, 158, 11, 0.12); border-radius: 8px; display: flex; align-items: center; justify-content: center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="color: var(--color-warning)">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
      </div>
      <p v-if="avgRating !== null" class="font-display text-4xl font-bold" style="color: var(--color-warning)">{{ avgRating.toFixed(1) }}<span class="text-lg font-semibold" style="color: var(--color-ink-faint)"> / 5</span></p>
      <p v-else class="font-display text-xl font-bold" style="color: var(--color-ink-faint)">{{ t('dashboard.noRatings') }}</p>
      <p class="text-xs mt-3" style="color: var(--color-ink-faint)">{{ t('dashboard.outOfFive') }}</p>
    </div>

    <div class="rounded-lg p-8" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
      <div class="flex items-center justify-between mb-4">
        <p class="tag-mono text-xs font-bold" style="color: var(--color-ink-faint); text-transform: uppercase">{{ t('dashboard.countriesExplored') }}</p>
        <div style="width: 40px; height: 40px; background-color: rgba(15, 82, 186, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--color-accent)">
            <circle cx="12" cy="12" r="9"/>
            <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>
          </svg>
        </div>
      </div>
      <p class="font-display text-4xl font-bold" style="color: var(--color-accent)">{{ countriesExploredCount }}</p>
      <p class="text-xs mt-3" style="color: var(--color-ink-faint)">{{ t('dashboard.uniqueCountries') }}</p>
    </div>
  </div>
</template>