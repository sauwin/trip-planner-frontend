<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getRecommendations } from '@/api/recommendations.api';
import type { DestinationScore } from '@/types/recommendation.types';
import { getDestinationDisplayName } from '@/utils/destinationName';
import { useI18n } from 'vue-i18n';
import PageHeader from '@/components/PageHeader.vue';
import { getApiErrorCode } from '@/utils/apiError';

const PAGE_SIZE = 10;

const scores = ref<DestinationScore[]>([]);
const total = ref(0);
const isLoading = ref(true);
const isLoadingMore = ref(false);
const errorMessage = ref('');
const needsQuiz = ref(false);
const { t, te, locale } = useI18n();

const router = useRouter();
const hasMore = computed(() => scores.value.length < total.value);

function getFeatureLabel(key: string) {
  const path = `preferences.features.${key}`;
  return te(path) ? t(path) : key;
}

function getName(score: DestinationScore) {
  return getDestinationDisplayName(score.destination, locale.value);
}

function getDescription(score: DestinationScore) {
  return score.destination.translations[locale.value]?.description
    || score.destination.translations.en?.description
    || t('recommendations.defaultDescription');
}

function getTierColor(score: number) {
  if (score >= 70) return 'var(--color-sage)';
  if (score >= 50) return 'var(--color-accent)';
  if (score >= 30) return 'var(--color-secondary)';
  return 'var(--color-ink-faint)';
}

function getMatchLabel(score: number) {
  if (score >= 70) return t('recommendations.perfectFit');
  if (score >= 50) return t('recommendations.bestMatch');
  if (score >= 30) return t('recommendations.strongMatch');
  return t('recommendations.greatPick');
}

function matchReasons(score: DestinationScore) {
  return score.matchedFeatures.map(getFeatureLabel);
}

async function loadRecommendations() {
  isLoading.value = true;
  errorMessage.value = '';
  needsQuiz.value = false;
  try {
    const response = await getRecommendations({ limit: PAGE_SIZE, offset: 0 });
    scores.value = response.data.items;
    total.value = response.data.total;
  } catch (error: unknown) {
    if (getApiErrorCode(error) === 'NO_PREFERENCES') {
      needsQuiz.value = true;
    } else {
      errorMessage.value = t('recommendations.failed');
    }
  } finally {
    isLoading.value = false;
  }
}

onMounted(loadRecommendations);

async function loadMore() {
  if (isLoadingMore.value || !hasMore.value) return;
  isLoadingMore.value = true;
  errorMessage.value = '';
  try {
    const response = await getRecommendations({ limit: PAGE_SIZE, offset: scores.value.length });
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
  <div class="page-shell">
    <div class="page-container max-w-7xl">
      <PageHeader
        color="var(--color-sage)"
        :label="t('recommendations.label')"
        :title="t('recommendations.title')"
        :description="t('recommendations.description')"
      />

      <div class="mb-6 flex justify-end">
        <button
          type="button"
          class="inline-flex items-center gap-2 rounded-lg border border-sage px-5 py-3 font-semibold text-sage transition-colors hover:bg-sage/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
          @click="router.push('/preferences')"
        >
          {{ t('recommendations.manageQuiz') }}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M5 12h14"></path>
            <path d="M12 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>

      <p v-if="isLoading" class="text-center py-20" style="color: var(--color-ink-faint); font-size: 16px">{{ t('recommendations.loading') }}</p>

      <div v-else-if="needsQuiz" class="card-surface rounded-lg p-12" style="border-top: 4px solid var(--color-sage)">
        <div class="max-w-2xl">
          <h2 class="font-display text-3xl font-bold mb-4" style="color: var(--color-ink)">{{ t('recommendations.quizTitle') }}</h2>
          <p class="text-lg mb-8" style="color: var(--color-ink-soft)">{{ t('recommendations.quizDescription') }}</p>
        </div>
      </div>

      <p v-else-if="errorMessage && scores.length === 0" role="alert" class="text-center py-12 rounded-lg px-4" style="color: var(--color-alert); background-color: rgba(239, 68, 68, 0.1)">{{ errorMessage }}</p>

      <div v-else-if="scores.length > 0" class="space-y-8">
        <p v-if="errorMessage" role="alert" class="rounded-lg px-4 py-3 text-center" style="color: var(--color-alert); background-color: rgba(239, 68, 68, 0.1)">{{ errorMessage }}</p>

        <div class="flex flex-col gap-4">
          <router-link
            v-for="(item, index) in scores"
            :key="item.destination.id"
            :to="`/destinations/${item.destination.id}`"
            class="group block"
          >
            <div
              class="card-surface rounded-lg transition-all duration-300 hover:-translate-y-0.5 flex flex-col sm:flex-row sm:items-center gap-5"
              :class="index === 0 ? 'p-7' : 'p-5'"
              :style="{ borderLeft: '4px solid ' + getTierColor(item.score) }"
            >
              <div
                class="shrink-0 flex items-center justify-center rounded-full font-display font-bold"
                :class="index === 0 ? 'w-14 h-14 text-2xl' : 'w-11 h-11 text-lg'"
                :style="{ backgroundColor: getTierColor(item.score) + '18', color: getTierColor(item.score) }"
              >
                {{ index + 1 }}
              </div>

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap mb-1.5">
                  <span class="tag-mono max-w-full break-words text-[10px] font-bold px-2.5 py-1 rounded-full" style="background-color: rgba(15, 82, 186, 0.08); color: var(--color-accent)">{{ item.destination.country }}</span>
                  <span v-if="index === 0" class="tag-mono text-[10px] font-bold uppercase px-2.5 py-1 rounded-full" style="background-color: rgba(245, 158, 11, 0.14); color: var(--color-warning)">{{ t('recommendations.topPick') }}</span>
                </div>
                <h3 class="font-display font-bold mb-1.5 break-words" :class="index === 0 ? 'text-3xl' : 'text-xl'" style="color: var(--color-ink)">{{ getName(item) }}</h3>
                <p class="text-sm leading-relaxed break-words" style="color: var(--color-ink-soft)">{{ getDescription(item) }}</p>

                <div v-if="matchReasons(item).length > 0" class="flex flex-wrap gap-1.5 mt-2.5">
                  <span
                    v-for="reason in matchReasons(item)"
                    :key="reason"
                    class="tag-mono max-w-full whitespace-normal break-words text-[10px] px-2 py-0.5 rounded-full"
                    style="background-color: var(--color-paper); color: var(--color-ink-faint); border: 1px solid var(--color-line)"
                  >
                    {{ reason }}
                  </span>
                </div>
              </div>

              <div class="sm:w-44 shrink-0">
                <div class="flex items-baseline justify-between sm:justify-end sm:gap-2 mb-1.5">
                  <span class="tag-mono text-[10px] uppercase sm:hidden" style="color: var(--color-ink-faint)">{{ t('recommendations.matchScore') }}</span>
                  <span class="font-display text-2xl font-bold" :style="{ color: getTierColor(item.score) }">{{ item.score.toFixed(0) }}%</span>
                </div>
                <div class="rounded-full overflow-hidden" style="height: 6px; background-color: var(--color-line)">
                  <div class="h-full rounded-full transition-all duration-500" :style="{ width: item.score + '%', backgroundColor: getTierColor(item.score) }"></div>
                </div>
                <p class="tag-mono text-[10px] mt-1.5 text-right hidden sm:block" :style="{ color: getTierColor(item.score) }">{{ getMatchLabel(item.score) }}</p>
              </div>
            </div>
          </router-link>
        </div>

        <div v-if="hasMore" class="flex justify-center pt-4">
          <button
            type="button"
            class="group inline-flex items-center gap-2 rounded-lg px-8 py-3.5 font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 card-surface"
            :disabled="isLoadingMore"
            style="color: var(--color-accent)"
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

      <p v-else class="py-12 text-center text-base" style="color: var(--color-ink-soft)">{{ t('recommendations.noResults') }}</p>
    </div>
  </div>
</template>