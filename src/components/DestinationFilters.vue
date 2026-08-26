<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { getFeatureCategories } from '@/api/meta.api';
import type { FeatureCategory } from '@/types/feature.types';

// selections: categoryId -> featureId (at most one feature chosen per category)
const selections = defineModel<Record<string, string>>('selections', { default: () => ({}) });

const emit = defineEmits<{ change: [] }>();

const categories = ref<FeatureCategory[]>([]);
const isLoading = ref(true);

const { t, te } = useI18n();

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
    // Filters are an enhancement — fail silently and just show no filter chips.
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
  <div v-if="!isLoading && categories.length > 0" class="mb-10 rounded-lg p-6" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
    <div class="flex items-center justify-between gap-4 mb-5">
      <span class="tag-mono text-xs font-bold tracking-widest" style="color: var(--color-ink-faint); text-transform: uppercase">{{ t('destinations.filters.title') }}</span>
      <button
        v-if="activeCount > 0"
        type="button"
        class="tag-mono text-xs font-semibold"
        style="color: var(--color-accent)"
        @click="clearAll"
      >
        {{ t('destinations.filters.clear') }} ({{ activeCount }})
      </button>
    </div>

    <div class="flex flex-col gap-4">
      <div v-for="category in categories" :key="category.id">
        <p class="text-xs font-semibold mb-2" style="color: var(--color-ink-soft)">{{ getCategoryLabel(category.key) }}</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="feature in category.features"
            :key="feature.id"
            type="button"
            @click="toggleFeature(category.id, feature.id)"
            class="px-4 py-2 rounded-full text-sm font-semibold transition-all focus:outline-none"
            :style="{
              backgroundColor: selections[category.id] === feature.id ? 'var(--color-secondary)' : 'var(--color-paper)',
              color: selections[category.id] === feature.id ? 'white' : 'var(--color-ink)',
              border: selections[category.id] === feature.id ? '1px solid var(--color-secondary)' : '1px solid var(--color-line)',
            }"
          >
            {{ getFeatureLabel(feature.key) }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
