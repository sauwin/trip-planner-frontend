<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getFeatureCategories } from '@/api/meta.api';
import { savePreferences } from '@/api/preferences.api';
import type { FeatureCategory } from '@/types/feature.types';

const categories = ref<FeatureCategory[]>([]);
const selections = ref<Record<string, string>>({});
const isLoading = ref(true);
const isSaving = ref(false);
const errorMessage = ref('');

const router = useRouter();

onMounted(async () => {
  try {
    const response = await getFeatureCategories();
    categories.value = response.data;
  } catch {
    errorMessage.value = 'Failed to load quiz options';
  } finally {
    isLoading.value = false;
  }
});

function selectFeature(categoryId: string, featureId: string) {
  selections.value[categoryId] = featureId;
}

const allAnswered = () => categories.value.every((c) => selections.value[c.id]);

async function handleSubmit() {
  if (!allAnswered()) {
    errorMessage.value = 'Please answer all categories';
    return;
  }

  errorMessage.value = '';
  isSaving.value = true;

  try {
    const preferences = categories.value.map((c) => ({
      categoryId: c.id,
      featureId: selections.value[c.id]!,
    }));
    await savePreferences(preferences);
    router.push('/recommendations');
  } catch (error: any) {
    errorMessage.value = error.response?.data?.error || 'Failed to save preferences';
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto mt-12 px-4">
    <h1 class="text-2xl font-semibold mb-2">Tell us your preferences</h1>
    <p class="text-gray-600 mb-8">Pick one option per category to get personalized recommendations.</p>

    <p v-if="isLoading" class="text-gray-500">Loading...</p>

    <div v-else class="flex flex-col gap-8">
      <div v-for="category in categories" :key="category.id">
        <h2 class="text-sm font-medium text-gray-700 uppercase mb-3">{{ category.key }}</h2>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="feature in category.features"
            :key="feature.id"
            type="button"
            @click="selectFeature(category.id, feature.id)"
            :class="[
              'px-4 py-2 rounded-full border text-sm transition-colors',
              selections[category.id] === feature.id
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400',
            ]"
          >
            {{ feature.key }}
          </button>
        </div>
      </div>

      <p v-if="errorMessage" class="text-red-600 text-sm">{{ errorMessage }}</p>

      <button
        type="button"
        @click="handleSubmit"
        :disabled="isSaving"
        class="bg-blue-600 text-white rounded-md py-3 font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {{ isSaving ? 'Saving...' : 'Get my recommendations' }}
      </button>
    </div>
  </div>
</template>