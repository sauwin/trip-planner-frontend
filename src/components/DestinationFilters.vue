<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { getFeatureCategories } from '@/api/meta.api';
import type { FeatureCategory } from '@/types/feature.types';

const props = defineProps<{ total?: number | null; loading?: boolean }>();

const selections = defineModel<Record<string, string[]>>('selections', { default: () => ({}) });

const emit = defineEmits<{ change: [] }>();

const categories = ref<FeatureCategory[]>([]);
const isLoading = ref(true);
const isOpen = ref(false);
const openCategoryId = ref<string | null>(null);

const triggerRef = ref<HTMLButtonElement | null>(null);
const closeRef = ref<HTMLButtonElement | null>(null);

const { t, te } = useI18n();

function getCategoryLabel(key: string) {
  const path = `preferences.categories.${key}`;
  return te(path) ? t(path) : key;
}

function getFeatureLabel(key: string) {
  const path = `preferences.features.${key}`;
  return te(path) ? t(path) : key;
}

function isSelected(categoryId: string, featureId: string) {
  return selections.value[categoryId]?.includes(featureId) ?? false;
}

function countFor(categoryId: string) {
  return selections.value[categoryId]?.length ?? 0;
}

function toggleFeature(categoryId: string, featureId: string) {
  const current = { ...selections.value };
  const selected = current[categoryId] ?? [];
  const updated = selected.includes(featureId)
    ? selected.filter((id) => id !== featureId)
    : [...selected, featureId];

  if (updated.length > 0) current[categoryId] = updated;
  else delete current[categoryId];

  selections.value = current;
  emit('change');
}

function clearAll() {
  selections.value = {};
  emit('change');
}

function toggleCategory(categoryId: string) {
  openCategoryId.value = openCategoryId.value === categoryId ? null : categoryId;
}

const activeCount = computed(() =>
  Object.values(selections.value).reduce((count, ids) => count + ids.length, 0),
);

const activeChips = computed(() =>
  categories.value.flatMap((category) =>
    category.features
      .filter((feature) => isSelected(category.id, feature.id))
      .map((feature) => ({ categoryId: category.id, featureId: feature.id, label: getFeatureLabel(feature.key) })),
  ),
);

function openPanel() {
  isOpen.value = true;
  openCategoryId.value = null;
  nextTick(() => closeRef.value?.focus());
}

function closePanel() {
  isOpen.value = false;
  nextTick(() => triggerRef.value?.focus());
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isOpen.value) closePanel();
}

onMounted(async () => {
  document.addEventListener('keydown', onKeydown);
  try {
    const response = await getFeatureCategories();
    categories.value = response.data;
  } catch {
  } finally {
    isLoading.value = false;
  }
});

onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown));
</script>

<template>
  <section class="mb-10">
    <div class="flex flex-wrap items-end justify-between gap-4 border-b-2 border-line pb-6">
      <div v-if="props.total !== null && props.total !== undefined">
        <p class="tag-mono text-xs uppercase text-ink-faint">{{ t('destinations.available') }}</p>
        <p class="mt-2 font-display text-3xl font-bold text-accent">{{ props.total }}</p>
      </div>
      <div v-else></div>

      <div v-if="isLoading" class="h-10 w-28 animate-pulse rounded-lg bg-line" aria-hidden="true"></div>

      <button
        v-else-if="categories.length > 0"
        ref="triggerRef"
        type="button"
        class="inline-flex items-center gap-2 rounded-lg border border-line bg-paper-dim px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink-faint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        aria-controls="destination-filters"
        :aria-expanded="isOpen"
        @click="isOpen ? closePanel() : openPanel()"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M4 6h16M7 12h10M10 18h4" />
        </svg>
        {{ t('destinations.filters.button') }}
        <span v-if="activeCount > 0" class="grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1.5 text-xs text-white">{{ activeCount }}</span>
      </button>
    </div>

    <ul v-if="activeChips.length > 0" class="m-0 mt-4 flex list-none flex-wrap items-center gap-2 p-0">
      <li v-for="chip in activeChips" :key="`${chip.categoryId}-${chip.featureId}`">
        <span class="inline-flex items-center gap-1 rounded-full border border-line bg-paper-dim py-1 pl-3 pr-1.5 text-[13px] font-semibold text-ink">
          {{ chip.label }}
          <button
            type="button"
            class="grid size-5 place-items-center rounded-full text-ink-faint transition-colors hover:bg-line hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
            :aria-label="t('destinations.filters.remove', { name: chip.label })"
            @click="toggleFeature(chip.categoryId, chip.featureId)"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </span>
      </li>
      <li>
        <button
          type="button"
          class="rounded-sm px-2 text-[13px] font-semibold text-accent transition-colors hover:text-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          @click="clearAll"
        >
          {{ t('destinations.filters.clear') }}
        </button>
      </li>
    </ul>

    <Teleport to="body">
      <Transition
        enter-active-class="transition-transform duration-300 ease-out motion-reduce:transition-none"
        leave-active-class="transition-transform duration-200 ease-in motion-reduce:transition-none"
        enter-from-class="translate-x-full"
        leave-to-class="translate-x-full"
      >
        <aside
          v-if="isOpen"
          id="destination-filters"
          :aria-label="t('destinations.filters.title')"
          class="fixed bottom-0 right-0 top-[65px] z-50 flex w-full flex-col border-l border-line bg-paper-dim shadow-[-12px_0_40px_rgba(0,0,0,0.14)] sm:w-[22rem]"
        >
          <div class="flex items-start justify-between gap-4 px-6 pb-3 pt-5">
            <div>
              <h2 class="font-display text-xl font-bold text-ink">{{ t('destinations.filters.title') }}</h2>
              <p v-if="activeCount > 0" class="tag-mono mt-1 text-xs text-ink-faint">{{ activeCount }}</p>
            </div>
            <button
              ref="closeRef"
              type="button"
              class="grid size-9 shrink-0 place-items-center rounded-lg text-ink-soft transition-colors hover:bg-paper hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
              :aria-label="t('destinations.filters.close')"
              @click="closePanel"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <div class="flex-1 divide-y divide-line overflow-y-auto overscroll-contain border-y border-line">
            <div v-for="category in categories" :key="category.id" role="group" :aria-labelledby="`filter-${category.id}`">
              <h3 :id="`filter-${category.id}`" class="m-0">
                <button
                  type="button"
                  class="flex w-full items-center gap-3 px-6 py-3.5 text-left text-sm text-ink transition-colors hover:bg-paper focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
                  :class="openCategoryId === category.id ? 'font-semibold' : 'font-medium'"
                  :aria-expanded="openCategoryId === category.id"
                  :aria-controls="`filter-options-${category.id}`"
                  @click="toggleCategory(category.id)"
                >
                  <span class="min-w-0 flex-1 truncate">{{ getCategoryLabel(category.key) }}</span>
                  <span v-if="countFor(category.id) > 0" class="grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1.5 text-xs text-white">{{ countFor(category.id) }}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-ink-faint transition-transform motion-reduce:transition-none" :class="openCategoryId === category.id ? 'rotate-180' : ''" aria-hidden="true">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
              </h3>

              <ul v-if="openCategoryId === category.id" :id="`filter-options-${category.id}`" class="m-0 flex list-none flex-wrap gap-2 px-6 pb-4 pt-1">
                <li v-for="feature in category.features" :key="feature.id">
                  <label class="flex cursor-pointer items-center rounded-lg border border-line bg-paper px-3 py-1.5 text-sm text-ink transition-colors hover:border-ink-faint has-checked:border-accent has-checked:bg-accent/10 has-checked:font-semibold has-checked:text-accent has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent">
                    <input
                      type="checkbox"
                      class="sr-only"
                      :checked="isSelected(category.id, feature.id)"
                      @change="toggleFeature(category.id, feature.id)"
                    />
                    {{ getFeatureLabel(feature.key) }}
                  </label>
                </li>
              </ul>
            </div>
          </div>

          <div class="flex items-center justify-between gap-3 px-6 py-3">
            <button
              type="button"
              class="rounded-sm text-[13px] font-semibold text-accent transition-colors hover:text-accent-dark focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent disabled:cursor-not-allowed disabled:text-ink-faint disabled:hover:text-ink-faint"
              :disabled="activeCount === 0"
              @click="clearAll"
            >
              {{ t('destinations.filters.clear') }}
            </button>
            <button
              type="button"
              class="whitespace-nowrap rounded-lg bg-accent px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              :class="props.loading ? 'opacity-70' : ''"
              @click="closePanel"
            >
              {{ t('destinations.filters.show', { count: props.total ?? 0 }) }}
            </button>
          </div>
        </aside>
      </Transition>
    </Teleport>
  </section>
</template>