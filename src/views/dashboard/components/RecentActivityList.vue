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

const recentActivity = computed(() => {
  return [...props.interactions]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)
    .map((i) => ({
      id: i.id,
      type: i.type,
      value: i.value,
      destinationName: getName(i.destination),
      createdAt: i.createdAt,
    }));
});

const activityMeta: Record<string, { icon: 'view' | 'like' | 'rating' | 'save'; color: string; labelKey: string }> = {
  VIEW: { icon: 'view', color: '#0F52BA', labelKey: 'dashboard.viewed' },
  LIKE: { icon: 'like', color: '#FF7A59', labelKey: 'dashboard.liked' },
  RATING: { icon: 'rating', color: '#F59E0B', labelKey: 'dashboard.ratedValue' },
  SAVE: { icon: 'save', color: '#10B981', labelKey: 'dashboard.savedAction' },
};

function activityLabel(item: { type: string; value: number | null }) {
  const meta = activityMeta[item.type];
  if (!meta) return item.type;
  if (item.type === 'RATING') return t('dashboard.ratedValue', { value: item.value ?? '—' });
  return t(meta.labelKey);
}
</script>

<template>
  <div>
    <h2 class="font-display text-2xl font-bold mb-2" style="color: var(--color-ink)">{{ t('dashboard.recentActivity') }}</h2>
    <p class="text-sm mb-6" style="color: var(--color-ink-soft)">{{ t('dashboard.recentActivityDescription') }}</p>

    <div class="card-surface rounded-lg">
      <div
        v-for="(item, index) in recentActivity"
        :key="item.id"
        class="flex items-center gap-4 px-8 py-5"
        :style="index !== recentActivity.length - 1 ? 'border-bottom: 1px solid var(--color-line)' : ''"
      >
        <div
          style="width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0"
          :style="{ backgroundColor: activityMeta[item.type]?.color + '1A' }"
        >
          <svg v-if="item.type === 'VIEW'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" :style="{ color: activityMeta[item.type]?.color }">
            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <svg v-else-if="item.type === 'LIKE'" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" :style="{ color: activityMeta[item.type]?.color }">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <svg v-else-if="item.type === 'RATING'" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" :style="{ color: activityMeta[item.type]?.color }">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="currentColor" :style="{ color: activityMeta[item.type]?.color }">
            <path d="M6 2h12a1 1 0 0 1 1 1v19l-7-4-7 4V3a1 1 0 0 1 1-1z"/>
          </svg>
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold truncate" style="color: var(--color-ink)">{{ item.destinationName }}</p>
          <p class="text-xs mt-0.5" style="color: var(--color-ink-faint)">{{ activityLabel(item) }}</p>
        </div>
        <p class="text-xs whitespace-nowrap" style="color: var(--color-ink-faint)">{{ new Date(item.createdAt).toLocaleDateString(locale, { day: 'numeric', month: 'short' }) }}</p>
      </div>
    </div>
  </div>
</template>