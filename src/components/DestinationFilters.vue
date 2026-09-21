<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getFeatureCategories } from '@/api/meta.api';
import type { FeatureCategory } from '@/types/feature.types';

defineProps<{ total?: number | null }>();

const selections = defineModel<Record<string, string>>('selections', { default: () => ({}) });

const emit = defineEmits<{ change: [] }>();

const categories = ref<FeatureCategory[]>([]);
const isLoading = ref(true);
const isOpen = ref(false);

const { t, te } = useI18n();

const BLUE = 'var(--color-accent)';
const GREEN = 'var(--color-sage-dark)';
const ORANGE = 'var(--color-secondary-dark)';
const toneByKey: Record<string, string> = {
  activity: BLUE,
  budget: GREEN,
  climate: ORANGE,
  landscape: BLUE,
  season: GREEN,
};
const fallbackTones = [BLUE, GREEN, ORANGE];

function getTone(key: string, index: number) {
  return toneByKey[key] ?? fallbackTones[index % fallbackTones.length] ?? BLUE;
}

function getCategoryLabel(key: string) {
  const path = `preferences.categories.${key}`;
  return te(path) ? t(path) : key;
}

function getFeatureLabel(key: string) {
  const path = `preferences.features.${key}`;
  return te(path) ? t(path) : key;
}

onMounted(async () => {
  try {
    const response = await getFeatureCategories();
    categories.value = response.data;
  } catch {
    
  } finally {
    isLoading.value = false;
  }
});

function toggleFeature(categoryId: string, featureId: string) {
  const current = { ...selections.value };
  if (current[categoryId] === featureId) {
    delete current[categoryId];
  } else {
    current[categoryId] = featureId;
  }
  selections.value = current;
  emit('change');
}

function clearAll() {
  selections.value = {};
  emit('change');
}

const activeCount = computed(() => Object.keys(selections.value).length);
</script>

<template>
  <section v-if="isLoading || categories.length > 0" class="relative mb-10 overflow-hidden rounded-lg border border-t-0 border-line bg-paper-dim">
    <div class="absolute inset-x-0 top-0 flex h-[3px]" aria-hidden="true">
      <span class="flex-1 bg-accent"></span>
      <span class="flex-1 bg-secondary"></span>
      <span class="flex-1 bg-sage"></span>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 pb-4 pt-6">
      <button
        type="button"
        class="flex items-center gap-2 rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:hidden"
        aria-controls="destination-filters"
        :aria-expanded="isOpen"
        @click="isOpen = !isOpen"
      >
        {{ t('destinations.filters.title') }}
        <span v-if="activeCount > 0" class="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs text-white">{{ activeCount }}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="transition-transform" :class="{ 'rotate-180': isOpen }" aria-hidden="true">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <h2 class="hidden items-center gap-3 text-xs font-semibold uppercase tracking-[0.1em] text-ink md:flex">
        {{ t('destinations.filters.title') }}
        <span v-if="activeCount > 0" class="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-xs text-white">{{ activeCount }}</span>
      </h2>

      <div class="flex items-center gap-6">
        <button
          v-if="activeCount > 0"
          type="button"
          class="whitespace-nowrap rounded-sm text-sm font-semibold text-accent transition-colors hover:text-accent-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
          @click="clearAll"
        >
          {{ t('destinations.filters.clear') }}
        </button>
        <p v-if="total !== null && total !== undefined" class="flex items-baseline gap-2">
          <span class="font-display text-2xl font-bold text-accent">{{ total }}</span>
          <span class="tag-mono uppercase tracking-wider">{{ t('destinations.available') }}</span>
        </p>
      </div>
    </div>

    <div v-if="isLoading" class="divide-y divide-line border-t border-line">
      <div v-for="n in 5" :key="n" class="flex h-16 items-center px-6">
        <div class="h-4 w-28 animate-pulse rounded bg-line"></div>
      </div>
    </div>

    <div
      v-else
      id="destination-filters"
      class="divide-y divide-line border-t border-line"
      :class="isOpen ? 'block' : 'hidden md:block'"
    >
      <div
        v-for="(category, index) in categories"
        :key="category.id"
        role="group"
        :aria-labelledby="`filter-${category.id}`"
        class="grid gap-x-8 gap-y-3 px-6 py-4 md:grid-cols-[11rem_1fr] md:items-center"
        :style="{ '--tone': getTone(category.key, index) }"
      >
        <p :id="`filter-${category.id}`" class="flex items-center gap-2.5 text-sm font-semibold text-ink">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--tone)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0" aria-hidden="true">
            <path v-if="category.key === 'activity'" d="M22 12h-4l-3 9L9 3l-3 9H2" />
            <path v-else-if="category.key === 'budget'" d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            <g v-else-if="category.key === 'climate'">
              <circle cx="12" cy="12" r="4.5" />
              <path d="M12 1.5v2M12 20.5v2M4.6 4.6L6 6M18 18l1.4 1.4M1.5 12h2M20.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4" />
            </g>
            <path v-else-if="category.key === 'landscape'" d="M2 20l6.5-11 4 6.5 3-4.5L22 20z" />
            <g v-else-if="category.key === 'season'">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </g>
            <path v-else d="M4 6h16M7 12h10M10 18h4" />
          </svg>
          {{ getCategoryLabel(category.key) }}
        </p>

        <div class="flex flex-wrap gap-2">
          <button
            v-for="feature in category.features"
            :key="feature.id"
            type="button"
            :aria-pressed="selections[category.id] === feature.id"
            class="filter-chip"
            @click="toggleFeature(category.id, feature.id)"
          >
            <svg
              v-if="selections[category.id] === feature.id"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--tone)"
              stroke-width="3.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
            {{ getFeatureLabel(feature.key) }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.875rem;
  border: 1px solid var(--color-line);
  border-radius: 0.5rem;
  background-color: var(--color-paper-dim);
  color: var(--color-ink);
  font-size: 0.875rem;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}

.filter-chip:hover {
  border-color: var(--tone);
}

.filter-chip:focus-visible {
  outline: 2px solid var(--tone);
  outline-offset: 2px;
}

.filter-chip[aria-pressed='true'] {
  border-color: var(--tone);
  background-color: color-mix(in srgb, var(--tone) 10%, var(--color-paper-dim));
  font-weight: 600;
}
</style>