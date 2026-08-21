<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getDestinations } from '@/api/destinations.api';
import type { Destination } from '@/types/destination.types';
import { useI18n } from 'vue-i18n';

const destinations = ref<Destination[]>([]);
const isLoading = ref(true);
const errorMessage = ref('');
const { t, locale } = useI18n();
const accentPalette = ['var(--color-accent)', 'var(--color-secondary)', 'var(--color-sage)', 'var(--color-warning)', 'var(--color-accent-light)'];

function getName(destination: Destination) {
  return destination.translations[locale.value]?.name ?? destination.translations.en?.name ?? destination.slug;
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

onMounted(async () => {
  try {
    const response = await getDestinations();
    destinations.value = response.data;
  } catch {
    errorMessage.value = t('destinations.failed');
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div style="background-color: var(--color-paper); min-height: 100vh">
    <div class="max-w-7xl mx-auto px-6 py-20">
      <div class="mb-20">
        <div class="inline-flex items-center gap-3 mb-6">
          <div style="width: 4px; height: 24px; background-color: var(--color-accent); border-radius: 2px"></div>
          <span class="tag-mono text-xs font-bold tracking-widest" style="color: var(--color-accent)">{{ t('destinations.explore') }}</span>
        </div>
        <h1 class="font-display text-6xl font-bold tracking-tight mb-6" style="color: var(--color-ink)">{{ t('destinations.title') }}</h1>
        <p class="text-xl max-w-3xl" style="color: var(--color-ink-soft); line-height: 1.6">
          {{ t('destinations.description') }}
        </p>
      </div>

      <div v-if="!isLoading && destinations.length > 0" class="mb-14 pb-6 flex items-center justify-between flex-wrap gap-4" style="border-bottom: 2px solid var(--color-line)">
        <div>
          <p class="tag-mono text-xs" style="color: var(--color-ink-faint); text-transform: uppercase">{{ t('destinations.available') }}</p>
          <p class="font-display text-3xl font-bold mt-2" style="color: var(--color-accent)">{{ destinations.length }}</p>
        </div>
      </div>

      <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6">
        <div v-for="n in 6" :key="n" class="h-80 rounded-lg animate-pulse xl:col-span-4" style="background: linear-gradient(135deg, var(--color-line) 0%, var(--color-paper) 100%); box-shadow: 0 4px 20px rgba(0,0,0,0.05)" />
      </div>

      <p v-else-if="errorMessage" class="text-center py-20" style="color: var(--color-alert); font-size: 16px">{{ errorMessage }}</p>
      <p v-else-if="destinations.length === 0" class="text-center py-20" style="color: var(--color-ink-soft); font-size: 16px">{{ t('destinations.empty') }}</p>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6">
        <router-link
          v-for="(destination, index) in destinations"
          :key="destination.id"
          :to="`/destinations/${destination.id}`"
          :class="['group block transition-all duration-500 hover:-translate-y-1', getBlockClass(index)]"
        >
          <div
            class="h-full flex flex-col rounded-lg overflow-hidden"
            :style="{
              backgroundColor: 'var(--color-paper-dim)',
              border: '1px solid var(--color-line)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              borderTop: '4px solid ' + getAccent(index)
            }"
          >
            <div class="p-6 flex-1">
              <div class="flex items-start justify-between gap-4 mb-5">
                <span class="tag-mono text-xs font-bold px-3 py-1.5 rounded-full inline-block" :style="{ backgroundColor: getAccent(index) + '22', color: getAccent(index) }">
                  {{ destination.country }}
                </span>
                <div class="flex items-center gap-1 rounded-full px-2.5 py-1.5" :style="{ backgroundColor: 'rgba(245, 158, 11, 0.12)' }">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style="color: var(--color-warning)">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span class="text-sm font-bold" style="color: var(--color-ink)">{{ (destination.popularityScore * 10).toFixed(1) }}/10</span>
                </div>
              </div>

              <div class="mb-4">
                <h2 class="font-display text-3xl font-bold leading-tight" style="color: var(--color-ink)">{{ getName(destination) }}</h2>
              </div>

              <p v-if="getDescription(destination)" class="text-sm leading-relaxed" style="color: var(--color-ink-soft); line-height: 1.7; display: -webkit-box; line-clamp: 4; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;">
                {{ getDescription(destination) }}
              </p>
            </div>

            <div class="px-6 pb-6">
              <div class="flex flex-wrap gap-2 mb-5">
                <span class="tag-mono text-[10px] px-2.5 py-1 rounded-full" style="background-color: rgba(15, 82, 186, 0.08); color: var(--color-accent)">{{ coords(destination) }}</span>
                <span class="tag-mono text-[10px] px-2.5 py-1 rounded-full" style="background-color: rgba(16, 185, 129, 0.08); color: var(--color-sage)">{{ t('destinations.bestSeason') }}</span>
              </div>

              <div class="flex items-center justify-between pt-4" style="border-top: 1px solid var(--color-line)">
                <span class="tag-mono text-xs" style="color: var(--color-ink-faint)">{{ t('destinations.exploreAction') }}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="group-hover:translate-x-1 transition-transform" :style="{ color: getAccent(index) }">
                  <path d="M5 12h14"></path>
                  <path d="M12 5l7 7-7 7"></path>
                </svg>
              </div>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>