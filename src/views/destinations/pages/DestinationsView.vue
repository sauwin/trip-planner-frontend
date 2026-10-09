<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { getDestinations } from '@/api/destinations.api';
import type { Destination } from '@/types/destination.types';
import { useI18n } from 'vue-i18n';
import DestinationFilters from '@/components/DestinationFilters.vue';
import PageHeader from '@/components/PageHeader.vue';
import { getTopFeatureInCategory } from '@/utils/destinationFeatures';
import { getDestinationDisplayName } from '@/utils/destinationName';

const PAGE_SIZE = 10;

const destinations = ref<Destination[]>([]);
const total = ref(0);
const isLoading = ref(true);
const hasLoadedOnce = ref(false);
const isRefreshing = ref(false);
const isLoadingMore = ref(false);
const errorMessage = ref('');
const filterSelections = ref<Record<string, string[]>>({});
const { t, te, locale } = useI18n();
const accentPalette = ['var(--color-accent)', 'var(--color-secondary)', 'var(--color-sage)', 'var(--color-warning)', 'var(--color-accent-light)'];

function getFeatureLabel(key: string) {
  const path = `preferences.features.${key}`;
  return te(path) ? t(path) : key;
}

function bestSeasonLabel(destination: Destination) {
  const seasonFeature = getTopFeatureInCategory(destination.features, 'season');
  return seasonFeature ? getFeatureLabel(seasonFeature.key) : null;
}

function getName(destination: Destination) {
  return getDestinationDisplayName(destination, locale.value);
}

function getDescription(destination: Destination) {
  return destination.translations[locale.value]?.description ?? destination.translations.en?.description ?? '';
}

function coords(destination: Destination) {
  const lat = destination.latitude >= 0
    ? `${destination.latitude.toFixed(2)}°N`
    : `${Math.abs(destination.latitude).toFixed(2)}°S`;
  const lng = destination.longitude >= 0
    ? `${destination.longitude.toFixed(2)}°E`
    : `${Math.abs(destination.longitude).toFixed(2)}°W`;
  return `${lat} ${lng}`;
}

function getAccent(index: number) {
  return accentPalette[index % accentPalette.length];
}

function getBlockClass(index: number) {
  const mosaicPattern = [
    'xl:col-span-7', 'xl:col-span-5',
    'xl:col-span-4', 'xl:col-span-8',
    'xl:col-span-3', 'xl:col-span-5', 'xl:col-span-4',
    'xl:col-span-6', 'xl:col-span-3', 'xl:col-span-3',
    'xl:col-span-4', 'xl:col-span-4', 'xl:col-span-4',
  ];
  return mosaicPattern[index % mosaicPattern.length];
}

const hasMore = computed(() => destinations.value.length < total.value);
const activeFeatureIds = computed(() => Object.values(filterSelections.value).flat());
const hasActiveFilters = computed(() => activeFeatureIds.value.length > 0);

function clearFiltersAndReload() {
  filterSelections.value = {};
  clearTimeout(filterTimer);
  loadDestinations();
}

let requestId = 0;
let filterTimer: ReturnType<typeof setTimeout> | undefined;

async function loadDestinations() {
  const currentRequest = ++requestId;
  const isInitialLoad = !hasLoadedOnce.value;
  if (isInitialLoad) {
    isLoading.value = true;
  } else {
    isRefreshing.value = true;
  }
  errorMessage.value = '';
  try {
    const response = await getDestinations({ limit: PAGE_SIZE, offset: 0, featureIds: activeFeatureIds.value });
    if (currentRequest !== requestId) return;
    destinations.value = response.data.items;
    total.value = response.data.total;
  } catch {
    if (currentRequest !== requestId) return;
    errorMessage.value = t('destinations.failed');
  } finally {
    if (currentRequest !== requestId) {
      return;
    } else if (isInitialLoad) {
      isLoading.value = false;
      hasLoadedOnce.value = true;
    } else {
      isRefreshing.value = false;
    }
  }
}

onMounted(loadDestinations);

function handleFiltersChange() {
  clearTimeout(filterTimer);
  filterTimer = setTimeout(loadDestinations, 300);
}

onBeforeUnmount(() => clearTimeout(filterTimer));

async function loadMore() {
  if (isLoadingMore.value || !hasMore.value) return;
  const currentRequest = requestId;
  isLoadingMore.value = true;
  try {
    const response = await getDestinations({ limit: PAGE_SIZE, offset: destinations.value.length, featureIds: activeFeatureIds.value });
    if (currentRequest !== requestId) return;
    destinations.value = [...destinations.value, ...response.data.items];
    total.value = response.data.total;
  } catch {
    if (currentRequest !== requestId) return;
    errorMessage.value = t('destinations.failed');
  } finally {
    isLoadingMore.value = false;
  }
}
</script>

<template>
  <div class="page-shell">
    <div class="page-container max-w-7xl">
      <PageHeader
        color="var(--color-accent)"
        :label="t('destinations.explore')"
        :title="t('destinations.title')"
        :description="t('destinations.description')"
      />

      <DestinationFilters
        v-model:selections="filterSelections"
        :total="hasLoadedOnce ? total : null"
        :loading="isRefreshing"
        @change="handleFiltersChange"
      />

      <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6">
        <div v-for="n in 6" :key="n" class="h-80 rounded-lg animate-pulse bg-linear-to-br from-line to-paper shadow-[0_4px_20px_rgba(0,0,0,0.05)] xl:col-span-4" />
      </div>

      <p v-else-if="errorMessage" class="py-20 text-center text-base text-alert">{{ errorMessage }}</p>
      <div v-else-if="destinations.length === 0 && hasActiveFilters" class="text-center py-20">
        <p class="text-base text-ink-soft">{{ t('destinations.emptyFiltered') }}</p>
        <button type="button" @click="clearFiltersAndReload" class="tag-mono mt-4 text-xs font-semibold text-accent">
          {{ t('destinations.filters.clear') }}
        </button>
      </div>
      <p v-else-if="destinations.length === 0" class="py-20 text-center text-base text-ink-soft">{{ t('destinations.empty') }}</p>

      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6 transition-opacity duration-200"
        :class="{ 'opacity-60 pointer-events-none': isRefreshing }"
        :aria-busy="isRefreshing"
      >
        <router-link
          v-for="(destination, index) in destinations"
          :key="destination.id"
          :to="`/destinations/${destination.id}`"
          :class="['group block transition-all duration-500 hover:-translate-y-1', getBlockClass(index)]"
        >
          <div
            class="card-surface flex h-full flex-col overflow-hidden rounded-lg"
            :style="{ borderTop: '4px solid ' + getAccent(index) }"
          >
            <div class="p-6 flex-1">
              <div class="flex items-start justify-between gap-4 mb-5">
                <span class="tag-mono text-xs font-bold px-3 py-1.5 rounded-full inline-block" :style="{ backgroundColor: getAccent(index) + '22', color: getAccent(index) }">
                  {{ destination.country }}
                </span>
                <div class="flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" class="text-warning">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span class="text-sm font-bold text-ink">{{ destination.popularityScore.toFixed(1) }}/5</span>
                </div>
              </div>

              <div class="mb-4">
                <h2 class="font-display text-3xl font-bold leading-tight text-ink">{{ getName(destination) }}</h2>
              </div>

              <p v-if="getDescription(destination)" class="line-clamp-4 text-sm leading-[1.7] text-ink-soft">
                {{ getDescription(destination) }}
              </p>
            </div>

            <div class="px-6 pb-6">
              <div class="flex flex-wrap gap-2 mb-5">
                <span class="tag-mono rounded-full bg-accent/10 px-2.5 py-1 text-[10px] text-accent">{{ coords(destination) }}</span>
                <span v-if="bestSeasonLabel(destination)" class="tag-mono rounded-full bg-sage/10 px-2.5 py-1 text-[10px] text-sage">{{ t('destinations.bestSeason', { season: bestSeasonLabel(destination) }) }}</span>
              </div>

              <div class="flex items-center justify-between border-t border-line pt-4">
                <span class="tag-mono text-xs text-ink-faint">{{ t('destinations.exploreAction') }}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="group-hover:translate-x-1 transition-transform" :style="{ color: getAccent(index) }">
                  <path d="M5 12h14"></path>
                  <path d="M12 5l7 7-7 7"></path>
                </svg>
              </div>
            </div>
          </div>
        </router-link>
      </div>

      <div v-if="hasMore" class="flex justify-center mt-14">
        <button
          type="button"
          class="card-surface group inline-flex items-center gap-2 rounded-lg px-8 py-3.5 font-semibold text-accent transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-60 disabled:hover:translate-y-0"
          :disabled="isLoadingMore"
          @click="loadMore"
        >
          <span>{{ isLoadingMore ? t('destinations.loading') : t('destinations.loadMore') }}</span>
          <svg
            v-if="!isLoadingMore"
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
            class="group-hover:translate-y-0.5 transition-transform"
          >
            <path d="M12 5v14"></path>
            <path d="M5 12l7 7 7-7"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>