<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet';
import 'leaflet/dist/leaflet.css';
import { deleteDestination, getDestination } from '@/api/destinations.api';
import { recordInteraction, removeInteraction, getDestinationInteractionStatus } from '@/api/interactions.api';
import type { Destination, DestinationFeatureView, DestinationTranslation } from '@/types/destination.types';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth.store';
import DestinationEditorModal from '@/views/destinations/components/DestinationEditorModal.vue';
import DestinationReviews from '@/views/destination-detail/components/DestinationReviews.vue';
import { formatNumber } from '@/utils/formatNumber';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const destination = ref<Destination | null>(null);
const isLoading = ref(true);
const errorMessage = ref('');
const liked = ref(false);
const saved = ref(false);
const interactionError = ref('');
const isTogglingLike = ref(false);
const isTogglingSave = ref(false);
const isEditorOpen = ref(false);
const isDeleteDialogOpen = ref(false);
const isDeleting = ref(false);
const adminError = ref('');
const { t, te, locale } = useI18n();
const canManageDestinations = computed(() =>
  authStore.user?.role === 'ADMIN' || authStore.user?.role === 'SUPER_ADMIN',
);

function getTranslation(dest: Destination | null | undefined): DestinationTranslation {
  if (!dest) {
    return { name: '', description: '' };
  }

  const currentLocaleTranslation = dest.translations[locale.value];
  if (currentLocaleTranslation) {
    return currentLocaleTranslation;
  }

  const enTranslation = dest.translations['en'];
  if (enTranslation) {
    return enTranslation;
  }

  return { name: dest.slug, description: '' };
}

function getFeatureLabel(key: string): string {
  const path = `preferences.features.${key}`;
  return te(path) ? t(path) : key;
}

/**
 * Переводить вагу (наприклад, 0.8) у число відсотків (80).
 * Підтримує як дробові значення (0..1), так і вже помножені (1..100).
 */
function getWeightPercentValue(weight: number): number {
  const rawPercent = weight <= 1 ? weight * 100 : weight;
  return Math.min(100, Math.max(0, rawPercent));
}

function getFormattedWeightPercent(weight: number): string {
  const percent = getWeightPercentValue(weight);
  return `${formatNumber(percent, locale.value, { maximumFractionDigits: 0 })}%`;
}

const profileChartGroups = computed(() => {
  const currentDestination = destination.value;
  if (!currentDestination) return [];

  const featuresByCategory = new Map<string, DestinationFeatureView[]>();
  for (const feature of currentDestination.features ?? []) {
    if (feature.weight <= 0) continue;
    const categoryFeatures = featuresByCategory.get(feature.categoryKey) ?? [];
    categoryFeatures.push(feature);
    featuresByCategory.set(feature.categoryKey, categoryFeatures);
  }

  return [...featuresByCategory.entries()].map(([categoryKey, features]) => {
    const sortedFeatures = features.sort((left, right) => right.weight - left.weight);
    return {
      categoryKey,
      features: sortedFeatures,
    };
  });
});

async function handleDestinationSaved() {
  isEditorOpen.value = false;
  const currentDestination = destination.value;
  if (!currentDestination) return;

  try {
    const response = await getDestination(currentDestination.id);
    destination.value = response.data;
  } catch {
    adminError.value = t('admin.loadError');
  }
}

async function confirmDeleteDestination() {
  const currentDestination = destination.value;
  if (!currentDestination || isDeleting.value) return;

  isDeleting.value = true;
  adminError.value = '';
  try {
    await deleteDestination(currentDestination.id);
    await router.push('/destinations');
  } catch {
    adminError.value = t('admin.deleteError');
  } finally {
    isDeleting.value = false;
    isDeleteDialogOpen.value = false;
  }
}

async function handleToggleLike() {
  const currentDestination = destination.value;
  if (!currentDestination || isTogglingLike.value) return;

  const destinationId = currentDestination.id;
  interactionError.value = '';
  isTogglingLike.value = true;
  const next = !liked.value;

  try {
    if (next) {
      await recordInteraction(destinationId, 'LIKE');
    } else {
      await removeInteraction(destinationId, 'LIKE');
    }
    if (destination.value?.id === destinationId) {
      liked.value = next;
    }
  } catch {
    if (destination.value?.id === destinationId) {
      interactionError.value = t('destinationDetail.actionFailed');
    }
  } finally {
    isTogglingLike.value = false;
  }
}

async function handleToggleSave() {
  const currentDestination = destination.value;
  if (!currentDestination || isTogglingSave.value) return;

  const destinationId = currentDestination.id;
  interactionError.value = '';
  isTogglingSave.value = true;
  const next = !saved.value;

  try {
    if (next) {
      await recordInteraction(destinationId, 'SAVE');
    } else {
      await removeInteraction(destinationId, 'SAVE');
    }
    if (destination.value?.id === destinationId) {
      saved.value = next;
    }
  } catch {
    if (destination.value?.id === destinationId) {
      interactionError.value = t('destinationDetail.actionFailed');
    }
  } finally {
    isTogglingSave.value = false;
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
  interactionError.value = '';
  isTogglingLike.value = false;
  isTogglingSave.value = false;

  if (typeof id !== 'string') {
    errorMessage.value = t('destinationDetail.failed');
    isLoading.value = false;
    return;
  }

  try {
    const [destResponse] = await Promise.all([
      getDestination(id),
      recordInteraction(id, 'VIEW').catch((error) => {
        console.error('Failed to record destination view', error);
      }),
    ]);
    if (isStale) return;
    destination.value = destResponse.data;

    try {
      const statusResponse = await getDestinationInteractionStatus(id);
      if (isStale) return;
      liked.value = statusResponse.data.liked;
      saved.value = statusResponse.data.saved;
    } catch {
      if (!isStale) interactionError.value = t('destinationDetail.actionFailed');
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
            <div class="flex flex-wrap items-center justify-end gap-3 shrink-0">
              <template v-if="canManageDestinations">
                <button
                  type="button"
                  class="action-button action-button--secondary"
                  @click="isEditorOpen = true"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z" />
                  </svg>
                  {{ t('admin.editDestination') }}
                </button>
                <button
                  type="button"
                  class="action-button action-button--danger"
                  @click="isDeleteDialogOpen = true"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  {{ t('admin.delete') }}
                </button>
              </template>
              <button
                type="button"
                @click="handleToggleLike"
                :disabled="isTogglingLike"
                :aria-pressed="liked"
                class="action-button action-button--success w-32 shrink-0 whitespace-nowrap"
              >
                <svg class="shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                <span>{{ liked ? t('destinationDetail.liked') : t('destinationDetail.like') }}</span>
              </button>
              <button
                type="button"
                @click="handleToggleSave"
                :disabled="isTogglingSave"
                :aria-pressed="saved"
                class="action-button action-button--accent w-32 shrink-0 whitespace-nowrap"
              >
                <svg class="shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M6 2h12a1 1 0 0 1 1 1v19l-7-4-7 4V3a1 1 0 0 1 1-1z" />
                </svg>
                <span>{{ saved ? t('destinationDetail.saved') : t('destinationDetail.saveAction') }}</span>
              </button>
            </div>
            <p v-if="adminError" class="mb-5 rounded-lg bg-alert/10 px-4 py-3 text-sm text-alert" role="alert">{{ adminError }}</p>
          </div>

          <p v-if="interactionError" class="mb-5 rounded-lg bg-alert/10 px-4 py-3 text-sm text-alert" role="alert">
            {{ interactionError }}
          </p>
        </div>

        <div class="map-frame">
          <l-map :zoom="13" :center="[destination!.latitude, destination!.longitude]">
            <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <l-marker :lat-lng="[destination!.latitude, destination!.longitude]" />
          </l-map>
        </div>

        <section v-if="profileChartGroups.length > 0" aria-labelledby="destination-profile-title">
          <div class="mb-5">
            <p class="tag-mono mb-2 text-xs font-bold uppercase tracking-widest text-accent">{{ t('destinationDetail.profileEyebrow') }}</p>
            <h2 id="destination-profile-title" class="section-heading mb-2">{{ t('destinationDetail.profileTitle') }}</h2>
            <p class="max-w-2xl text-sm leading-relaxed text-ink-soft">{{ t('destinationDetail.profileDescription') }}</p>
          </div>

          <div class="card-surface grid gap-x-10 rounded-lg p-6 sm:grid-cols-2 sm:p-8">
            <div v-for="group in profileChartGroups" :key="group.categoryKey" class="border-b border-line py-4 last:border-b-0">
              <h3 class="mb-3 text-sm font-semibold text-ink">{{ te(`preferences.categories.${group.categoryKey}`) ? t(`preferences.categories.${group.categoryKey}`) : group.categoryKey }}</h3>
              <div class="space-y-3">
                <div
                  v-for="feature in group.features"
                  :key="feature.featureId"
                  class="grid grid-cols-[minmax(0,8rem)_minmax(0,1fr)_3rem] items-center gap-3"
                >
                  <span class="truncate text-xs text-ink-soft">{{ getFeatureLabel(feature.key) }}</span>
                  <div
                    class="h-2 overflow-hidden rounded-full bg-paper-dim"
                    role="img"
                    :aria-label="t('destinationDetail.profileStrength', {
                      feature: getFeatureLabel(feature.key),
                      value: formatNumber(getWeightPercentValue(feature.weight), locale, { maximumFractionDigits: 0 }),
                    })"
                  >
                    <div
                      class="h-full rounded-full bg-sage transition-[width]"
                      :style="{ width: `${getWeightPercentValue(feature.weight)}%` }"
                    ></div>
                  </div>
                  <span class="text-right text-xs font-semibold tabular-nums text-ink-faint">
                    {{ getFormattedWeightPercent(feature.weight) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <DestinationReviews
          id="destination-reviews"
          :destination-id="destination!.id"
        />

        <div class="card-surface rounded-lg border-l-4 p-8 sm:p-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between" style="border-left-color: var(--color-accent)">
          <div class="max-w-2xl">
            <h3 class="font-display text-2xl font-bold mb-2" style="color: var(--color-ink)">{{ t('destinationDetail.ready') }}</h3>
            <p style="color: var(--color-ink-soft)">{{ t('destinationDetail.addToTrip') }}</p>
          </div>
          <router-link to="/trips" class="action-button action-button--secondary shrink-0">
            <span>{{ t('destinationDetail.planTrip') }}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14"></path>
              <path d="M12 5l7 7-7 7"></path>
            </svg>
          </router-link>
        </div>
      </div>
    </div>

    <DestinationEditorModal
      v-if="destination"
      :open="isEditorOpen"
      :destination="destination"
      @close="isEditorOpen = false"
      @saved="handleDestinationSaved"
    />

    <div v-if="isDeleteDialogOpen && destination" class="fixed inset-0 z-[1200] flex items-center justify-center bg-ink/50 p-4" @click.self="isDeleteDialogOpen = false">
      <section role="alertdialog" aria-modal="true" aria-labelledby="delete-destination-title" class="w-full max-w-md rounded-2xl bg-paper-dim p-6 shadow-xl">
        <h2 id="delete-destination-title" class="font-display text-xl font-bold text-ink">{{ t('admin.confirmDeleteTitle') }}</h2>
        <p class="mt-3 leading-relaxed text-ink-soft">{{ t('admin.confirmDeleteText', { name: getTranslation(destination!).name }) }}</p>
        <div class="mt-6 flex justify-end gap-3">
          <button type="button" class="rounded-lg border border-line px-4 py-2.5 text-sm font-semibold hover:bg-paper" @click="isDeleteDialogOpen = false">
            {{ t('admin.cancel') }}
          </button>
          <button type="button" :disabled="isDeleting" class="rounded-lg bg-alert px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60" @click="confirmDeleteDestination">
            {{ isDeleting ? t('admin.deleting') : t('admin.confirmDelete') }}
          </button>
        </div>
      </section>
    </div>
  </div>
</template>