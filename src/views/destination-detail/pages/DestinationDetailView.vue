<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet';
import 'leaflet/dist/leaflet.css';
import { getDestination } from '@/api/destinations.api';
import { recordInteraction } from '@/api/interactions.api';
import type { Destination } from '@/types/destination.types';
import { getTopFeatureInCategory } from '@/utils/destinationFeatures';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const destination = ref<Destination | null>(null);
const isLoading = ref(true);
const errorMessage = ref('');
const liked = ref(false);
const { t, te, locale } = useI18n();

function getTranslation(dest: Destination) {
  return dest.translations[locale.value] ?? dest.translations.en ?? { name: dest.slug, description: '' };
}

function getFeatureLabel(key: string) {
  const path = `preferences.features.${key}`;
  return te(path) ? t(path) : key;
}

const bestSeasonLabel = computed(() => {
  const seasonFeature = getTopFeatureInCategory(destination.value?.features, 'season');
  return seasonFeature ? getFeatureLabel(seasonFeature.key) : null;
});

async function handleLike() {
  if (!destination.value || liked.value) return;
  try {
    await recordInteraction(destination.value.id, 'LIKE');
    liked.value = true;
  } catch {

  }
}

onMounted(async () => {
  const id = route.params.id as string;
  try {
    const [destResponse] = await Promise.all([
      getDestination(id),
      recordInteraction(id, 'VIEW').catch(() => {}),
    ]);
    destination.value = destResponse.data;
  } catch {
    errorMessage.value = t('destinationDetail.failed');
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div style="background-color: var(--color-paper); min-height: 100vh">
    <div class="max-w-6xl mx-auto px-6 py-12">
      
      <p v-if="isLoading" class="text-center py-20" style="color: var(--color-ink-faint); font-size: 16px">{{ t('destinationDetail.loading') }}</p>

      <p v-else-if="errorMessage" class="text-center py-20" style="color: var(--color-alert); font-size: 16px">{{ errorMessage }}</p>

      <div v-else-if="destination" class="space-y-12">
        <router-link
          to="/destinations"
          class="inline-flex items-center gap-2 text-sm font-semibold transition-all hover:-translate-x-0.5"
          style="color: var(--color-ink-soft)"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M19 12H5"></path>
            <path d="M12 19l-7-7 7-7"></path>
          </svg>
          <span>{{ t('destinationDetail.back') }}</span>
        </router-link>

        <div>
          <div class="inline-flex items-center gap-3 mb-6">
            <div style="width: 4px; height: 24px; background-color: var(--color-accent); border-radius: 2px"></div>
            <span class="tag-mono text-xs font-bold tracking-widest" style="color: var(--color-accent); text-transform: uppercase">{{ destination.country }}</span>
          </div>
          <div class="flex items-start justify-between gap-6 mb-8">
            <div class="flex-1">
              <h1 class="font-display text-5xl font-bold mb-4" style="color: var(--color-ink)">{{ getTranslation(destination).name }}</h1>
              <p class="text-lg" style="color: var(--color-ink-soft); line-height: 1.6">{{ getTranslation(destination).description }}</p>
            </div>
            <button
              @click="handleLike"
              :disabled="liked"
              class="rounded-lg px-6 py-3 font-semibold transition-all hover:shadow-lg disabled:opacity-60 text-white shrink-0 hover:scale-105"
              :style="{
                backgroundColor: liked ? 'var(--color-sage)' : 'var(--color-secondary)'
              }"
            >
              <span v-if="liked">{{ t('destinationDetail.liked') }}</span>
              <span v-else>{{ t('destinationDetail.like') }}</span>
            </button>
          </div>
        </div>

        <div class="rounded-lg overflow-hidden h-96" style="border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
          <l-map :zoom="6" :center="[destination.latitude, destination.longitude]">
            <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <l-marker :lat-lng="[destination.latitude, destination.longitude]" />
          </l-map>
        </div>

        <div>
          <h2 class="font-display text-2xl font-bold mb-6" style="color: var(--color-ink)">{{ t('destinationDetail.statistics') }}</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div class="rounded-lg p-6" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
              <div class="flex items-center justify-between mb-3">
                <p class="tag-mono text-xs font-bold" style="color: var(--color-ink-faint); text-transform: uppercase">{{ t('destinationDetail.popularity') }}</p>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="color: var(--color-warning)">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <p class="font-display text-3xl font-bold" style="color: var(--color-accent)">{{ (destination.popularityScore * 10).toFixed(1) }}/10</p>
              <p class="text-xs mt-2" style="color: var(--color-ink-faint)">{{ t('destinationDetail.outOfTen') }}</p>
            </div>

            <div class="rounded-lg p-6" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
              <div class="flex items-center justify-between mb-3">
                <p class="tag-mono text-xs font-bold" style="color: var(--color-ink-faint); text-transform: uppercase">{{ t('destinationDetail.latitude') }}</p>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--color-accent)">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <p class="font-display text-3xl font-bold" style="color: var(--color-ink)">{{ destination.latitude.toFixed(2) }}°</p>
              <p class="text-xs mt-2" style="color: var(--color-ink-faint)">{{ destination.latitude >= 0 ? t('destinationDetail.north') : t('destinationDetail.south') }}</p>
            </div>

            <div class="rounded-lg p-6" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
              <div class="flex items-center justify-between mb-3">
                <p class="tag-mono text-xs font-bold" style="color: var(--color-ink-faint); text-transform: uppercase">{{ t('destinationDetail.longitude') }}</p>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--color-accent)">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <polyline points="19 12 12 19 5 12"></polyline>
                </svg>
              </div>
              <p class="font-display text-3xl font-bold" style="color: var(--color-ink)">{{ destination.longitude.toFixed(2) }}°</p>
              <p class="text-xs mt-2" style="color: var(--color-ink-faint)">{{ destination.longitude >= 0 ? t('destinationDetail.east') : t('destinationDetail.west') }}</p>
            </div>

            <div v-if="bestSeasonLabel" class="rounded-lg p-6" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
              <div class="flex items-center justify-between mb-3">
                <p class="tag-mono text-xs font-bold" style="color: var(--color-ink-faint); text-transform: uppercase">{{ t('destinationDetail.bestSeason') }}</p>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="color: var(--color-warning)">
                  <circle cx="12" cy="12" r="10"></circle>
                </svg>
              </div>
              <p class="font-display text-2xl font-bold" style="color: var(--color-sage)">{{ bestSeasonLabel }}</p>
              <p class="text-xs mt-2" style="color: var(--color-ink-faint)">{{ t('destinationDetail.idealTime') }}</p>
            </div>
          </div>
        </div>

        <div class="rounded-lg p-12" style="background: linear-gradient(135deg, rgba(15, 82, 186, 0.1) 0%, rgba(255, 122, 89, 0.1) 100%); border: 1px solid var(--color-line)">
          <h3 class="font-display text-2xl font-bold mb-3" style="color: var(--color-ink)">{{ t('destinationDetail.ready') }}</h3>
          <p class="mb-6" style="color: var(--color-ink-soft)">{{ t('destinationDetail.addToTrip') }}</p>
          <router-link to="/trips" class="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all hover:shadow-lg" style="background-color: var(--color-secondary)">
            <span>{{ t('destinationDetail.planTrip') }}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14"></path>
              <path d="M12 5l7 7-7 7"></path>
            </svg>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>