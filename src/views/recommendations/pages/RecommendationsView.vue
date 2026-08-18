<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getRecommendations } from '@/api/recommendations.api';
import type { DestinationScore } from '@/types/recommendation.types';

const scores = ref<DestinationScore[]>([]);
const isLoading = ref(true);
const errorMessage = ref('');
const needsQuiz = ref(false);

const router = useRouter();

function getName(score: DestinationScore) {
  return score.destination.translations.en?.name ?? score.destination.slug;
}

onMounted(async () => {
  try {
    const response = await getRecommendations();
    scores.value = response.data;
  } catch (error: any) {
    if (error.response?.status === 400) {
      needsQuiz.value = true;
    } else {
      errorMessage.value = 'Failed to load recommendations';
    }
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen" style="background-color: var(--color-paper)">
    <div class="max-w-5xl mx-auto mt-14 px-4 pb-20">
      <div class="mb-8">
        <p class="tag-mono uppercase" style="color: var(--color-accent)">Personalized</p>
        <h1 class="font-display text-4xl font-semibold tracking-tight mt-1" style="color: var(--color-ink)">Your recommendations</h1>
        <p class="text-sm mt-2" style="color: var(--color-ink-soft)">Destinations carefully curated just for you</p>
      </div>

      <hr class="route-divider mb-8" />

      <p v-if="isLoading" class="text-center py-16" style="color: var(--color-ink-faint)">Loading your recommendations...</p>

      <div v-else-if="needsQuiz" class="text-center py-16 rounded-xl p-8" style="background-color: var(--color-paper-dim); border: 2px solid var(--color-line)">
        <p class="font-display text-2xl font-semibold mb-4" style="color: var(--color-ink)">Complete your preferences</p>
        <p class="mb-8" style="color: var(--color-ink-soft)">Take a quick quiz to get personalized destination recommendations.</p>
        <button
          @click="router.push('/preferences')"
          class="rounded-lg px-8 py-3 font-medium transition-all hover:shadow-md text-white"
          style="background-color: var(--color-sage)"
        >
          Take the quiz
        </button>
      </div>

      <p v-else-if="errorMessage" class="text-center py-16 rounded-lg px-4" style="color: var(--color-alert)">{{ errorMessage }}</p>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <router-link
          v-for="item in scores"
          :key="item.destination.id"
          :to="`/destinations/${item.destination.id}`"
          class="group rounded-xl p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
          :style="{
            backgroundColor: 'var(--color-paper-dim)',
            border: '1.5px solid var(--color-line)',
          }"
        >
          <div class="flex items-start justify-between gap-2 mb-2">
            <div>
              <p class="tag-mono uppercase" style="color: var(--color-sage)">{{ item.destination.country }}</p>
              <h2 class="font-display font-semibold mt-1" style="color: var(--color-ink)">{{ getName(item) }}</h2>
            </div>
            <div class="rounded-lg px-3 py-1.5 shrink-0 text-center" style="background-color: var(--color-accent); color: white">
              <span class="font-display font-bold text-lg">{{ item.score.toFixed(0) }}</span>
              <p class="tag-mono text-xs" style="color: rgba(255,255,255,0.8)">match</p>
            </div>
          </div>
          <div class="mt-4 pt-4" style="border-top: 1px solid var(--color-line)">
            <p class="text-sm" style="color: var(--color-ink-soft)">★ {{ item.destination.popularityScore.toFixed(1) }}</p>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>