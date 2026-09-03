<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getRecommendations } from '@/api/recommendations.api';
import type { DestinationScore } from '@/types/recommendation.types';
import { getTopFeatureInCategory, getTopFeatureOverall } from '@/utils/destinationFeatures';
import { useI18n } from 'vue-i18n';

const PAGE_SIZE = 10;

const scores = ref<DestinationScore[]>([]);
const total = ref(0);
const isLoading = ref(true);
const isLoadingMore = ref(false);
const errorMessage = ref('');
const needsQuiz = ref(false);
const filterSelections = ref<Record<string, string>>({});
const { t, te, locale } = useI18n();

const router = useRouter();
const firstRecommendation = computed(() => scores.value[0] ?? null);
const hasMore = computed(() => scores.value.length < total.value);
const activeFeatureIds = computed(() => Object.values(filterSelections.value));
const hasActiveFilters = computed(() => activeFeatureIds.value.length > 0);

function getFeatureLabel(key: string) {
  const path = `preferences.features.${key}`;
  return te(path) ? t(path) : key;
}

const heroBadges = computed(() => {
  const features = firstRecommendation.value?.destination.features;
  if (!features || features.length === 0) return [];

  const badges: { key: string; label: string }[] = [];

  const topOverall = getTopFeatureOverall(features, ['season', 'budget']);
  if (topOverall) {
    badges.push({ key: topOverall.key, label: t('recommendations.bestFor', { feature: getFeatureLabel(topOverall.key) }) });
  }

  const budget = getTopFeatureInCategory(features, 'budget');
  if (budget) {
    badges.push({ key: budget.key, label: getFeatureLabel(budget.key) });
  }

  const season = getTopFeatureInCategory(features, 'season');
  if (season) {
    badges.push({ key: season.key, label: t('recommendations.idealSeason', { season: getFeatureLabel(season.key) }) });
  }

  return badges;
});

function clearFiltersAndReload() {
  filterSelections.value = {};
  loadRecommendations();
}

function getName(score: DestinationScore | null | undefined) {
  if (!score) return 'Destination';
  return score.destination.translations[locale.value]?.name ?? score.destination.translations.en?.name ?? score.destination.slug;
}

function getMatchLabel(score: number | null | undefined) {
  if (!score) return t('recommendations.greatPick');
  if (score >= 90) return t('recommendations.perfectFit');
  if (score >= 75) return t('recommendations.bestMatch');
  if (score >= 60) return t('recommendations.strongMatch');
  return t('recommendations.greatPick');
}

async function loadRecommendations() {
  isLoading.value = true;
  errorMessage.value = '';
  needsQuiz.value = false;
  try {
    const response = await getRecommendations({ limit: PAGE_SIZE, offset: 0, featureIds: activeFeatureIds.value });
    scores.value = response.data.items;
    total.value = response.data.total;
  } catch (error: any) {
    if (error.response?.status === 400) {
      needsQuiz.value = true;
    } else {
      errorMessage.value = t('recommendations.failed');
    }
  } finally {
    isLoading.value = false;
  }
}

onMounted(loadRecommendations);

function handleFiltersChange() {
  loadRecommendations();
}

async function loadMore() {
  if (isLoadingMore.value || !hasMore.value) return;
  isLoadingMore.value = true;
  try {
    const response = await getRecommendations({ limit: PAGE_SIZE, offset: scores.value.length, featureIds: activeFeatureIds.value });
    scores.value = [...scores.value, ...response.data.items];
    total.value = response.data.total;
  } catch {
    errorMessage.value = t('recommendations.failed');
  } finally {
    isLoadingMore.value = false;
  }
}
</script>

<template>
  <div style="background-color: var(--color-paper); min-height: 100vh">
    <div class="max-w-7xl mx-auto px-6 py-12">
      <div class="mb-12">
        <div class="inline-flex items-center gap-3 mb-6">
          <div style="width: 4px; height: 24px; background-color: var(--color-accent); border-radius: 2px"></div>
          <span class="tag-mono text-xs font-bold tracking-widest" style="color: var(--color-accent); text-transform: uppercase">{{ t('recommendations.label') }}</span>
        </div>
        <h1 class="font-display text-5xl font-bold mb-4" style="color: var(--color-ink)">{{ t('recommendations.title') }}</h1>
        <p class="text-lg" style="color: var(--color-ink-soft)">{{ t('recommendations.description') }}</p>
      </div>

      <p v-if="isLoading" class="text-center py-20" style="color: var(--color-ink-faint); font-size: 16px">{{ t('recommendations.loading') }}</p>

      <div v-else-if="needsQuiz" class="rounded-lg p-12" style="background: linear-gradient(135deg, rgba(15, 82, 186, 0.1) 0%, rgba(255, 122, 89, 0.1) 100%); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
        <div class="max-w-2xl">
          <h2 class="font-display text-3xl font-bold mb-4" style="color: var(--color-ink)">{{ t('recommendations.quizTitle') }}</h2>
          <p class="text-lg mb-8" style="color: var(--color-ink-soft)">{{ t('recommendations.quizDescription') }}</p>
          <button @click="router.push('/preferences')" class="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-white transition-all hover:shadow-lg" style="background-color: var(--color-accent)">
            <span>{{ t('recommendations.completeProfile') }}</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14"></path>
              <path d="M12 5l7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>

      <p v-else-if="errorMessage" class="text-center py-12 rounded-lg px-4" style="color: var(--color-alert); background-color: rgba(239, 68, 68, 0.1)">{{ errorMessage }}</p>

      <div v-else-if="firstRecommendation" class="space-y-6">
        <router-link
          :to="`/destinations/${firstRecommendation.destination.id}`"
          class="group block rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-1"
          style="background: linear-gradient(135deg, rgba(15, 82, 186, 0.06), rgba(255, 122, 89, 0.08)); border: 1px solid var(--color-line); box-shadow: 0 10px 28px rgba(15, 82, 186, 0.08)"
        >
          <div class="grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr]">
            <div class="p-8 lg:p-10">
              <div class="flex items-center justify-between gap-4 mb-6">
                <span class="tag-mono text-xs font-bold px-3 py-1.5 rounded-full" style="background-color: rgba(15, 82, 186, 0.12); color: var(--color-accent)">{{ firstRecommendation.destination.country }}</span>
                <span class="tag-mono text-[10px] uppercase px-2.5 py-1 rounded-full" style="background-color: rgba(16, 185, 129, 0.12); color: var(--color-sage)">{{ getMatchLabel(firstRecommendation.score) }}</span>
              </div>

              <h2 class="font-display text-4xl font-bold mb-4" style="color: var(--color-ink)">{{ getName(firstRecommendation) }}</h2>
              <p class="max-w-xl text-base leading-relaxed" style="color: var(--color-ink-soft)">
                {{ firstRecommendation.destination.translations[locale]?.description || firstRecommendation.destination.translations.en?.description || t('recommendations.defaultDescription') }}
              </p>

              <div v-if="heroBadges.length > 0" class="flex flex-wrap gap-2 mt-6">
                <span
                  v-for="(badge, i) in heroBadges"
                  :key="badge.key"
                  class="tag-mono text-[10px] px-2.5 py-1 rounded-full"
                  :style="{
                    backgroundColor: ['rgba(15, 82, 186, 0.08)', 'rgba(255, 122, 89, 0.1)', 'rgba(16, 185, 129, 0.08)'][i % 3],
                    color: ['var(--color-accent)', 'var(--color-secondary)', 'var(--color-sage)'][i % 3]
                  }"
                >
                  {{ badge.label }}
                </span>
              </div>
            </div>

            <div class="p-8 lg:p-10 flex items-center justify-center" style="background: rgba(255,255,255,0.32)">
              <div class="w-full max-w-[220px] rounded-lg p-6 text-center" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 12px 26px rgba(15, 82, 186, 0.08)">
                <p class="tag-mono text-[10px] uppercase" style="color: var(--color-ink-faint)">{{ t('recommendations.matchScore') }}</p>
                <p class="font-display text-5xl font-bold mt-3" style="color: var(--color-accent)">{{ firstRecommendation.score.toFixed(0) }}%</p>
                <p class="text-sm mt-3" style="color: var(--color-ink-soft)">{{ t('recommendations.strongestFit') }}</p>
              </div>
            </div>
          </div>
        </router-link>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <router-link
            v-for="(item, index) in scores.slice(1)"
            :key="item.destination.id"
            :to="`/destinations/${item.destination.id}`"
            class="group block rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-1"
            :style="{
              backgroundColor: 'var(--color-paper-dim)',
              border: '1px solid var(--color-line)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)'
            }"
          >
            <div class="p-6">
              <div class="flex items-center justify-between gap-3 mb-4">
                <span class="tag-mono text-[10px] font-bold px-2 py-1 rounded-full" style="background-color: rgba(15, 82, 186, 0.08); color: var(--color-accent)">{{ item.destination.country }}</span>
                <span class="font-display text-xl font-bold" :style="{ color: index % 2 === 0 ? 'var(--color-secondary)' : 'var(--color-accent)' }">{{ item.score.toFixed(0) }}%</span>
              </div>

              <h3 class="font-display text-2xl font-bold mb-3" style="color: var(--color-ink)">{{ getName(item) }}</h3>

              <p class="text-sm leading-relaxed mb-5" style="color: var(--color-ink-soft)">
                {{ (item.destination.popularityScore * 10).toFixed(1) }}/10 {{ t('recommendations.popularity') }} • {{ getMatchLabel(item.score) }}
              </p>

              <div class="flex items-center justify-between pt-4" style="border-top: 1px solid var(--color-line)">
                <span class="tag-mono text-[10px] uppercase" style="color: var(--color-ink-faint)">{{ t('recommendations.viewDestination') }}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="group-hover:translate-x-1 transition-transform" style="color: var(--color-secondary)">
                  <path d="M5 12h14"></path>
                  <path d="M12 5l7 7-7 7"></path>
                </svg>
              </div>
            </div>
          </router-link>
        </div>

        <div v-if="hasMore" class="flex justify-center pt-4">
          <button
            type="button"
            class="group inline-flex items-center gap-2 rounded-lg px-8 py-3.5 font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
            :disabled="isLoadingMore"
            :style="{
              backgroundColor: 'var(--color-paper-dim)',
              color: 'var(--color-accent)',
              border: '1px solid var(--color-line)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
            }"
            @click="loadMore"
          >
            <span>{{ isLoadingMore ? t('recommendations.loading') : t('recommendations.loadMore') }}</span>
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
  </div>
</template>