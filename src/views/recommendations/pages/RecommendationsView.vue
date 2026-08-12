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
  <div class="max-w-4xl mx-auto mt-12 px-4">
    <h1 class="text-2xl font-semibold mb-6">Recommended for you</h1>

    <p v-if="isLoading" class="text-gray-500">Loading...</p>

    <div v-else-if="needsQuiz" class="text-center py-12">
      <p class="text-gray-600 mb-4">Complete the preferences quiz first to see recommendations.</p>
      <button
        @click="router.push('/preferences')"
        class="bg-blue-600 text-white rounded-md px-6 py-2 font-medium hover:bg-blue-700"
      >
        Take the quiz
      </button>
    </div>

    <p v-else-if="errorMessage" class="text-red-600">{{ errorMessage }}</p>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div
        v-for="item in scores"
        :key="item.destination.id"
        class="border border-gray-200 rounded-lg p-4 flex justify-between items-start"
      >
        <div>
          <h2 class="font-medium text-gray-900">{{ getName(item) }}</h2>
          <p class="text-sm text-gray-500">{{ item.destination.country }}</p>
        </div>
        <span class="text-sm font-mono text-blue-600">{{ item.score.toFixed(2) }}</span>
      </div>
    </div>
  </div>
</template>