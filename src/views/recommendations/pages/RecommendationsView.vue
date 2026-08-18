<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getRecommendations } from '@/api/recommendations.api';
import type { DestinationScore } from '@/types/recommendation.types';

const scores = ref<DestinationScore[]>([]);
const isLoading = ref(true);
const errorMessage = ref('');
const needsQuiz = ref(false);

const router = useRouter();
const firstRecommendation = computed(() => scores.value[0] ?? null);

function getName(score: DestinationScore | null | undefined) {
  if (!score) return 'Destination';
  return score.destination.translations.en?.name ?? score.destination.slug;
}

function getMatchLabel(score: number | null | undefined) {
  if (!score) return 'Great pick';
  if (score >= 90) return 'Perfect fit';
  if (score >= 75) return 'Best match';
  if (score >= 60) return 'Strong match';
  return 'Great pick';
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
  <div style="background-color: var(--color-paper); min-height: 100vh">
    <div class="max-w-7xl mx-auto px-6 py-12">
      <div class="mb-12">
        <div class="inline-flex items-center gap-3 mb-6">
          <div style="width: 4px; height: 24px; background-color: var(--color-accent); border-radius: 2px"></div>
          <span class="tag-mono text-xs font-bold tracking-widest" style="color: var(--color-accent); text-transform: uppercase">Curated For You</span>
        </div>
        <h1 class="font-display text-5xl font-bold mb-4" style="color: var(--color-ink)">Your Recommendations</h1>
        <p class="text-lg" style="color: var(--color-ink-soft)">Destinations selected around what fits your rhythm, budget, and vibe.</p>
      </div>

      <p v-if="isLoading" class="text-center py-20" style="color: var(--color-ink-faint); font-size: 16px">Loading your recommendations...</p>

      <div v-else-if="needsQuiz" class="rounded-lg p-12" style="background: linear-gradient(135deg, rgba(15, 82, 186, 0.1) 0%, rgba(255, 122, 89, 0.1) 100%); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
        <div class="max-w-2xl">
          <h2 class="font-display text-3xl font-bold mb-4" style="color: var(--color-ink)">Take the quiz first</h2>
          <p class="text-lg mb-8" style="color: var(--color-ink-soft)">Tell us about your travel preferences and we’ll build a shortlist that actually fits you.</p>
          <button @click="router.push('/preferences')" class="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-white transition-all hover:shadow-lg" style="background-color: var(--color-accent)">
            <span>Complete Your Profile</span>
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
                {{ firstRecommendation.destination.translations.en?.description || 'A destination perfectly aligned with your travel style and priorities.' }}
              </p>

              <div class="flex flex-wrap gap-2 mt-6">
                <span class="tag-mono text-[10px] px-2.5 py-1 rounded-full" style="background-color: rgba(15, 82, 186, 0.08); color: var(--color-accent)">Best for: culture</span>
                <span class="tag-mono text-[10px] px-2.5 py-1 rounded-full" style="background-color: rgba(255, 122, 89, 0.1); color: var(--color-secondary)">Budget friendly</span>
                <span class="tag-mono text-[10px] px-2.5 py-1 rounded-full" style="background-color: rgba(16, 185, 129, 0.08); color: var(--color-sage)">Ideal season: spring</span>
              </div>
            </div>

            <div class="p-8 lg:p-10 flex items-center justify-center" style="background: rgba(255,255,255,0.32)">
              <div class="w-full max-w-[220px] rounded-lg p-6 text-center" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 12px 26px rgba(15, 82, 186, 0.08)">
                <p class="tag-mono text-[10px] uppercase" style="color: var(--color-ink-faint)">Match score</p>
                <p class="font-display text-5xl font-bold mt-3" style="color: var(--color-accent)">{{ firstRecommendation.score.toFixed(0) }}%</p>
                <p class="text-sm mt-3" style="color: var(--color-ink-soft)">Your strongest fit</p>
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
                {{ item.destination.popularityScore.toFixed(1) }} popularity • {{ getMatchLabel(item.score) }}
              </p>

              <div class="flex items-center justify-between pt-4" style="border-top: 1px solid var(--color-line)">
                <span class="tag-mono text-[10px] uppercase" style="color: var(--color-ink-faint)">View trip</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="group-hover:translate-x-1 transition-transform" style="color: var(--color-secondary)">
                  <path d="M5 12h14"></path>
                  <path d="M12 5l7 7-7 7"></path>
                </svg>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>