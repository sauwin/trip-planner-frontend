<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet';
import 'leaflet/dist/leaflet.css';
import { getDestination } from '@/api/destinations.api';
import { recordInteraction, removeInteraction, getDestinationInteractionStatus } from '@/api/interactions.api';
import type { Destination } from '@/types/destination.types';
import { getTopFeatureInCategory } from '@/utils/destinationFeatures';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const destination = ref<Destination | null>(null);
const isLoading = ref(true);
const errorMessage = ref('');
const liked = ref(false);
const saved = ref(false);
const myRating = ref<number | null>(null);
const isTogglingLike = ref(false);
const isTogglingSave = ref(false);
const isSavingRating = ref(false);
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

const formattedPopularityScore = computed(() => {
  const score = destination.value?.popularityScore;
  if (score === undefined) return '';
  if (Number.isInteger(score)) return String(score);
  return score.toFixed(1).replace('.', ',');
});

async function handleToggleLike() {
  if (!destination.value || isTogglingLike.value) return;
  const destinationId = destination.value.id;
  isTogglingLike.value = true;
  const next = !liked.value;
  try {
    if (next) {
      await recordInteraction(destinationId, 'LIKE');
    } else {
      await removeInteraction(destinationId, 'LIKE');
    }
    if (destination.value?.id === destinationId) liked.value = next;
  } catch {
    
  } finally {
    isTogglingLike.value = false;
  }
}

async function handleToggleSave() {
  if (!destination.value || isTogglingSave.value) return;
  const destinationId = destination.value.id;
  isTogglingSave.value = true;
  const next = !saved.value;
  try {
    if (next) {
      await recordInteraction(destinationId, 'SAVE');
    } else {
      await removeInteraction(destinationId, 'SAVE');
    }
    if (destination.value?.id === destinationId) saved.value = next;
  } catch {
    
  } finally {
    isTogglingSave.value = false;
  }
}

async function handleSetRating(value: number) {
  if (!destination.value || isSavingRating.value) return;
  const destinationId = destination.value.id;
  isSavingRating.value = true;
  const previous = myRating.value;
  myRating.value = value;
  try {
    await recordInteraction(destinationId, 'RATING', value);
  } catch {
    if (destination.value?.id === destinationId) myRating.value = previous;
  } finally {
    isSavingRating.value = false;
  }
}

watch(() => route.params.id, async (routeId, _previousId, onCleanup) => {
  const id = Array.isArray(routeId) ? routeId[0] : routeId;
  let isStale = false;
  onCleanup(() => {
    isStale = true;
  });

  destination.value = null;
  isLoading.value = true;
  errorMessage.value = '';
  liked.value = false;
  saved.value = false;
  myRating.value = null;
  isTogglingLike.value = false;
  isTogglingSave.value = false;
  isSavingRating.value = false;

  if (typeof id !== 'string') {
    errorMessage.value = t('destinationDetail.failed');
    isLoading.value = false;
    return;
  }

  try {
    const [destResponse] = await Promise.all([
      getDestination(id),
      recordInteraction(id, 'VIEW').catch(() => {}),
    ]);
    if (isStale) return;
    destination.value = destResponse.data;

    try {
      const statusResponse = await getDestinationInteractionStatus(id);
      if (isStale) return;
      liked.value = statusResponse.data.liked;
      saved.value = statusResponse.data.saved;
      myRating.value = statusResponse.data.rating;
    } catch {

    }
  } catch {
    if (!isStale) errorMessage.value = t('destinationDetail.failed');
  } finally {
    if (!isStale) isLoading.value = false;
  }
}, { immediate: true });
</script>

<template>
  <div class="page-shell">
    <div class="page-container max-w-6xl">
      
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
          <div class="flex items-start justify-between gap-6 mb-6">
            <div class="flex-1">
              <h1 class="font-display text-5xl font-bold mb-4" style="color: var(--color-ink)">{{ getTranslation(destination).name }}</h1>
              <p class="text-lg" style="color: var(--color-ink-soft); line-height: 1.6">{{ getTranslation(destination).description }}</p>
            </div>
            <div class="flex items-center gap-3 shrink-0">
              <button
                @click="handleToggleLike"
                :disabled="isTogglingLike"
                :aria-pressed="liked"
                :class="[
                  'inline-flex shrink-0 items-center gap-2 rounded-lg border border-sage px-6 py-3 font-semibold transition-shadow hover:shadow-lg disabled:opacity-60',
                  liked ? 'bg-sage text-white' : 'bg-paper-dim text-sage',
                ]"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" :fill="liked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span>{{ liked ? t('destinationDetail.liked') : t('destinationDetail.like') }}</span>
              </button>
              <button
                @click="handleToggleSave"
                :disabled="isTogglingSave"
                :aria-pressed="saved"
                :class="[
                  'inline-flex shrink-0 items-center gap-2 rounded-lg border border-accent px-6 py-3 font-semibold transition-shadow hover:shadow-lg disabled:opacity-60',
                  saved ? 'bg-accent text-white' : 'bg-paper-dim text-accent',
                ]"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" :fill="saved ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M6 2h12a1 1 0 0 1 1 1v19l-7-4-7 4V3a1 1 0 0 1 1-1z" />
                </svg>
                <span>{{ saved ? t('destinationDetail.saved') : t('destinationDetail.saveAction') }}</span>
              </button>
            </div>
          </div>

          <div class="flex items-center gap-2 mb-8">
            <span class="text-sm font-medium" style="color: var(--color-ink-faint)">{{ t('destinationDetail.yourRating') }}</span>
            <button
              v-for="star in 5"
              :key="star"
              type="button"
              @click="handleSetRating(star)"
              :disabled="isSavingRating"
              class="disabled:opacity-60 transition-transform hover:scale-110"
              :aria-label="t('destinationDetail.rateStars', { count: star })"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                :fill="myRating && star <= myRating ? 'var(--color-warning)' : 'none'"
                stroke="var(--color-warning)"
                stroke-width="1.5"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
            <span v-if="myRating" class="text-sm ml-1" style="color: var(--color-ink-faint)">{{ myRating }} / 5</span>
          </div>
        </div>

        <div class="map-frame">
          <l-map :zoom="13" :center="[destination.latitude, destination.longitude]">
            <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <l-marker :lat-lng="[destination.latitude, destination.longitude]" />
          </l-map>
        </div>

        <div>
          <h2 class="section-heading">{{ t('destinationDetail.statistics') }}</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div class="card-surface rounded-lg p-6">
              <div class="flex items-center justify-between mb-3">
                <p class="tag-mono text-xs font-bold" style="color: var(--color-ink-faint); text-transform: uppercase">{{ t('destinationDetail.popularity') }}</p>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="color: var(--color-warning)">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <p class="font-display text-3xl font-bold" style="color: var(--color-accent)">{{ formattedPopularityScore }}/5</p>
              <p class="text-xs mt-2" style="color: var(--color-ink-faint)">{{ t('destinationDetail.outOfFive') }}</p>
            </div>

            <div class="card-surface rounded-lg p-6">
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

            <div class="card-surface rounded-lg p-6">
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

            <div v-if="bestSeasonLabel" class="card-surface rounded-lg p-6">
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

        <div class="card-surface rounded-lg border-l-4 p-8 sm:p-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between" style="border-left-color: var(--color-accent)">
          <div class="max-w-2xl">
            <h3 class="font-display text-2xl font-bold mb-2" style="color: var(--color-ink)">{{ t('destinationDetail.ready') }}</h3>
            <p style="color: var(--color-ink-soft)">{{ t('destinationDetail.addToTrip') }}</p>
          </div>
          <router-link to="/trips" class="inline-flex shrink-0 items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all hover:shadow-lg hover:-translate-y-0.5" style="background-color: var(--color-secondary)">
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