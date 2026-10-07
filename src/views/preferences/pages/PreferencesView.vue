<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getFeatureCategories } from '@/api/meta.api';
import { getPreferences, savePreferences } from '@/api/preferences.api';
import type { FeatureCategory } from '@/types/feature.types';
import { useI18n } from 'vue-i18n';
import { getApiErrorMessage } from '@/utils/apiError';

const categories = ref<FeatureCategory[]>([]);
const selections = ref<Record<string, string[]>>({});
const isLoading = ref(true);
const isSaving = ref(false);
const errorMessage = ref('');

const step = ref(0);

const router = useRouter();
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
    errorMessage.value = t('preferences.failedOptions');
    isLoading.value = false;
    return;
  }

  try {
    const saved = await getPreferences();
    const restored: Record<string, string[]> = {};
    for (const pref of saved.data) {
      (restored[pref.categoryId] ??= []).push(pref.featureId);
    }
    selections.value = restored;
    if (hasAnsweredAllCategories.value) step.value = categories.value.length;
  } catch {
  } finally {
    isLoading.value = false;
  }
});

const total = computed(() => categories.value.length);
const isReview = computed(() => total.value > 0 && step.value >= total.value);
const currentCategory = computed(() => categories.value[step.value]);

function countFor(categoryId: string) {
  return selections.value[categoryId]?.length ?? 0;
}

const answeredCount = computed(
  () => categories.value.filter((category) => countFor(category.id) > 0).length,
);
const hasAnsweredAllCategories = computed(
  () => total.value > 0 && answeredCount.value === total.value,
);
const firstUnanswered = computed(() => {
  const index = categories.value.findIndex((category) => countFor(category.id) === 0);
  return index === -1 ? total.value : index;
});
const canGoNext = computed(
  () => !!currentCategory.value && countFor(currentCategory.value.id) > 0,
);
const progressPercent = computed(() =>
  total.value ? Math.round((answeredCount.value / total.value) * 100) : 0,
);

function isSelected(categoryId: string, featureId: string) {
  return selections.value[categoryId]?.includes(featureId) ?? false;
}

function toggleFeature(categoryId: string, featureId: string) {
  const selectedFeatures = selections.value[categoryId] ?? [];
  selections.value[categoryId] = selectedFeatures.includes(featureId)
    ? selectedFeatures.filter((selectedId) => selectedId !== featureId)
    : [...selectedFeatures, featureId];
  errorMessage.value = '';
}

function goTo(index: number) {
  const target = Math.min(index, firstUnanswered.value);
  if (target === step.value) return;
  step.value = target;
  errorMessage.value = '';
}

function next() {
  if (isReview.value) return;
  if (!canGoNext.value) return;
  step.value += 1;
}

function previous() {
  if (step.value === 0) {
    router.back();
    return;
  }
  step.value -= 1;
}

function stopState(index: number, categoryId: string) {
  if (index === step.value) return 'current';
  return countFor(categoryId) > 0 ? 'done' : 'todo';
}

type StopState = 'done' | 'current' | 'todo';

const dotClass: Record<StopState, string> = {
  done: 'border-sage bg-sage text-white',
  current: 'border-sage bg-sage text-white',
  todo: 'border-line bg-paper-dim text-ink-soft',
};
const stopTextClass: Record<StopState, string> = {
  done: 'text-ink-soft',
  current: 'font-bold text-ink',
  todo: 'text-ink-soft',
};
const segClass: Record<StopState, string> = {
  done: 'bg-sage',
  current: 'bg-sage',
  todo: 'bg-line',
};
const routeStopButtonClass =
  'flex w-full items-center gap-3 rounded-sm py-1 text-left text-[13px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage';
const answerTileClass =
  'group relative flex min-h-28 min-w-0 flex-col items-start justify-end gap-3 rounded-lg border border-line bg-paper-dim px-4 py-4 text-left text-ink transition-colors hover:border-ink-faint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage aria-pressed:border-sage aria-pressed:bg-sage aria-pressed:text-white';
const navigationButtonClass =
  'flex min-h-12 flex-1 items-center justify-center rounded-lg px-4 py-3 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage';

async function handleSubmit() {
  if (!hasAnsweredAllCategories.value) {
    errorMessage.value = t('preferences.answerAll');
    return;
  }

  errorMessage.value = '';
  isSaving.value = true;

  try {
    const preferences = categories.value.flatMap((category) =>
      (selections.value[category.id] ?? []).map((featureId) => ({
        categoryId: category.id,
        featureId,
      })),
    );
    await savePreferences(preferences);
    router.push('/recommendations');
  } catch (error: unknown) {
    const apiMessage = getApiErrorMessage(error, t('preferences.failedSave'));
    errorMessage.value =
      apiMessage === 'INCOMPLETE_PREFERENCES' ? t('preferences.answerAll') : apiMessage;
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <div class="page-shell">
    <div class="page-container max-w-6xl">
      <div class="mb-10">
        <div class="mb-6 inline-flex items-center gap-3">
          <div class="h-6 w-1 rounded-sm bg-sage"></div>
          <span class="tag-mono text-xs font-bold uppercase tracking-widest text-sage">{{ t('preferences.label') }}</span>
        </div>
        <h1 class="mb-4 break-words font-display text-5xl font-bold text-ink">{{ t('preferences.title') }}</h1>
        <p class="max-w-3xl break-words text-lg text-ink-soft">{{ t('preferences.description') }}</p>
      </div>

      <p v-if="isLoading" class="py-20 text-center text-base text-ink-faint">{{ t('preferences.loading') }}</p>

      <p v-else-if="!categories.length" class="rounded-lg border border-alert bg-paper-dim px-6 py-4 text-center text-alert">{{ errorMessage || t('preferences.failedOptions') }}</p>

      <div v-else class="grid grid-cols-1 items-start gap-8 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside
          class="card-surface hidden rounded-lg px-6 py-7 lg:sticky lg:top-6 lg:block"
          :aria-label="t('preferences.routeTitle')"
        >
          <div>
            <p class="mb-1 font-display text-xl font-bold text-ink">{{ t('preferences.routeTitle') }}</p>
            <p class="tag-mono mb-5 text-ink-soft">{{ t('preferences.progress', { selected: answeredCount, total }) }}</p>

            <ol class="m-0 list-none p-0">
              <li v-for="(category, index) in categories" :key="category.id" class="relative">
                <span
                  class="absolute -bottom-1.5 left-[9px] top-[22px] w-0 border-l-2"
                  :class="countFor(category.id) > 0 ? 'border-solid border-sage' : 'border-dashed border-line'"
                  aria-hidden="true"
                ></span>
                <button
                  type="button"
                  :class="[routeStopButtonClass, stopTextClass[stopState(index, category.id)]]"
                  :disabled="index > firstUnanswered"
                  :aria-current="index === step ? 'step' : undefined"
                  @click="goTo(index)"
                >
                  <span
                    class="relative z-10 grid size-5 shrink-0 place-items-center rounded-full border-2"
                    :class="dotClass[stopState(index, category.id)]"
                  >
                    <svg v-if="stopState(index, category.id) === 'done'" viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8.5l3.2 3L13 4.5" /></svg>
                  </span>
                  <span class="min-w-0 flex-1 truncate">{{ getCategoryLabel(category.key) }}</span>
                  <span v-if="countFor(category.id) > 0" class="tag-mono min-w-5 shrink-0 rounded-full bg-paper px-1.5 text-center leading-5 text-ink-soft">{{ countFor(category.id) }}</span>
                </button>
              </li>

              <li class="relative">
                <button
                  type="button"
                  :class="[routeStopButtonClass, stopTextClass[isReview ? 'current' : hasAnsweredAllCategories ? 'done' : 'todo']]"
                  :disabled="!hasAnsweredAllCategories"
                  :aria-current="isReview ? 'step' : undefined"
                  @click="goTo(total)"
                >
                  <span
                    class="relative z-10 grid size-5 shrink-0 place-items-center rounded-md border-2"
                    :class="dotClass[isReview ? 'current' : hasAnsweredAllCategories ? 'done' : 'todo']"
                    aria-hidden="true"
                  >
                    <svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor"><path d="M4 2v12M4 3h8l-2 2.5L12 8H4" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" /></svg>
                  </span>
                  <span class="min-w-0 flex-1 truncate">{{ t('preferences.reviewStop') }}</span>
                </button>
              </li>
            </ol>
          </div>
        </aside>

        <section class="min-w-0">
          <div class="mb-4 lg:hidden">
            <div class="mb-2 flex items-center justify-between">
              <p class="tag-mono font-bold text-ink-soft">
                <template v-if="!isReview">{{ t('preferences.question', { current: step + 1, total }) }}</template>
                <template v-else>{{ t('preferences.reviewStop') }}</template>
              </p>
              <p class="tag-mono text-ink-faint">{{ progressPercent }}%</p>
            </div>
            <div class="flex gap-1">
              <button
                v-for="(category, index) in categories"
                :key="category.id"
                type="button"
                class="h-1.5 flex-1 rounded-sm transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage"
                :class="segClass[stopState(index, category.id)]"
                :disabled="index > firstUnanswered"
                :aria-label="getCategoryLabel(category.key)"
                @click="goTo(index)"
              ></button>
            </div>
          </div>

          <div class="overflow-x-clip">
            <Transition
              mode="out-in"
              enter-active-class="transition duration-200 ease-out motion-reduce:transition-none"
              leave-active-class="transition duration-200 ease-in motion-reduce:transition-none"
              enter-from-class="opacity-0"
              leave-to-class="opacity-0"
            >
              <div v-if="!isReview && currentCategory" :key="`q-${step}`" class="card-surface rounded-lg p-6 md:p-10">
                <div class="mb-8">
                  <div class="min-w-0">
                    <p class="tag-mono mb-2 text-xs font-bold text-ink-faint">{{ t('preferences.question', { current: step + 1, total }) }}</p>
                    <h2 :id="`q-title-${currentCategory.id}`" class="break-words font-display text-3xl font-bold text-ink md:text-4xl">{{ getCategoryLabel(currentCategory.key) }}</h2>
                    <p class="mt-2 text-sm text-ink-soft">{{ t('preferences.pickHint') }}</p>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-3 md:grid-cols-3" role="group" :aria-labelledby="`q-title-${currentCategory.id}`">
                  <button
                    v-for="feature in currentCategory.features"
                    :key="feature.id"
                    type="button"
                    :class="answerTileClass"
                    :aria-pressed="isSelected(currentCategory.id, feature.id)"
                    @click="toggleFeature(currentCategory.id, feature.id)"
                  >
                    <span class="absolute right-2.5 top-2.5 grid size-5 place-items-center rounded-full border-[1.5px] border-line bg-paper-dim text-transparent group-aria-pressed:border-paper-dim group-aria-pressed:bg-paper-dim group-aria-pressed:text-sage" aria-hidden="true">
                      <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.5l3.2 3L13 4.5" /></svg>
                    </span>
                    <span class="pr-6 font-display text-base font-semibold leading-snug [overflow-wrap:anywhere]">{{ getFeatureLabel(feature.key) }}</span>
                  </button>
                </div>
              </div>

              <div v-else key="review" class="card-surface rounded-lg p-6 md:p-10">
                <h2 class="mb-2 font-display text-3xl font-bold text-ink md:text-4xl">{{ t('preferences.reviewTitle') }}</h2>
                <p class="mb-8 text-sm text-ink-soft">{{ t('preferences.reviewDescription') }}</p>

                <ul>
                  <li v-for="(category, index) in categories" :key="category.id" class="flex items-start gap-4 border-b border-line py-4 first:pt-0">
                    <div class="min-w-0 flex-1">
                      <p class="tag-mono mb-2 font-bold text-ink-faint">{{ getCategoryLabel(category.key) }}</p>
                      <div class="flex flex-wrap gap-2">
                        <span
                          v-for="feature in category.features.filter((f) => isSelected(category.id, f.id))"
                          :key="feature.id"
                          class="inline-flex items-center rounded-full border border-line bg-paper-dim px-3 py-1 text-[13px] font-semibold text-ink"
                        >
                          {{ getFeatureLabel(feature.key) }}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      class="shrink-0 rounded-md px-2 py-1 text-[13px] font-semibold text-sage transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-sage"
                      @click="goTo(index)"
                    >
                      {{ t('preferences.edit') }}
                    </button>
                  </li>
                </ul>
              </div>
            </Transition>
          </div>

          <p v-if="errorMessage" class="mt-6 rounded-lg border border-alert bg-paper-dim px-6 py-4 text-center text-alert">{{ errorMessage }}</p>

          <div class="flex gap-4 pt-6">
            <button
              type="button"
              :class="[navigationButtonClass, 'border border-line bg-paper-dim text-ink hover:border-ink-faint']"
              @click="previous"
            >
              {{ t('preferences.back') }}
            </button>

            <button
              v-if="!isReview"
              type="button"
              :class="[navigationButtonClass, 'bg-sage text-white disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-soft']"
              :disabled="!canGoNext"
              @click="next"
            >
              {{ step === total - 1 ? t('preferences.review') : t('preferences.next') }}
            </button>
            <button
              v-else
              type="button"
              :class="[navigationButtonClass, 'bg-sage text-white disabled:cursor-not-allowed disabled:bg-line disabled:text-ink-soft']"
              :disabled="isSaving || !hasAnsweredAllCategories"
              @click="handleSubmit"
            >
              <span v-if="isSaving">{{ t('preferences.gettingRecommendations') }}</span>
              <span v-else>{{ t('preferences.getRecommendations') }}</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>