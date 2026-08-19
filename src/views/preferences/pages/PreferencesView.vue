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
  <div style="background-color: var(--color-paper); min-height: 100vh">
    <div class="max-w-4xl mx-auto px-6 py-12">
      <!-- Header -->
      <div class="mb-12">
        <div class="inline-flex items-center gap-3 mb-6">
          <div style="width: 4px; height: 24px; background-color: var(--color-sage); border-radius: 2px"></div>
          <span class="tag-mono text-xs font-bold tracking-widest" style="color: var(--color-sage); text-transform: uppercase">Preferences</span>
        </div>
        <h1 class="font-display text-5xl font-bold mb-4" style="color: var(--color-ink)">Tell Us Your Style</h1>
        <p class="text-lg" style="color: var(--color-ink-soft)">Answer a few questions to get personalized destination recommendations tailored to your travel preferences</p>
      </div>

      <!-- Loading state -->
      <p v-if="isLoading" class="text-center py-20" style="color: var(--color-ink-faint); font-size: 16px">Loading quiz options...</p>

      <!-- Quiz content -->
      <div v-else class="space-y-8 mb-12">
        <!-- Category cards -->
        <div v-for="(category, index) in categories" :key="category.id" class="rounded-lg p-8" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
          <!-- Category header -->
          <div class="mb-6">
            <p class="tag-mono text-xs font-bold" style="color: var(--color-ink-faint); text-transform: uppercase; margin-bottom: 4px">Question {{ index + 1 }} of {{ categories.length }}</p>
            <h2 class="font-display text-2xl font-bold" style="color: var(--color-ink)">{{ category.key }}</h2>
          </div>

          <!-- Feature options -->
          <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button
              v-for="feature in category.features"
              :key="feature.id"
              type="button"
              @click="selectFeature(category.id, feature.id)"
              class="px-6 py-4 rounded-lg font-semibold transition-all text-sm focus:outline-none"
              :style="{
                backgroundColor: selections[category.id] === feature.id ? 'var(--color-secondary)' : 'var(--color-paper)',
                color: selections[category.id] === feature.id ? 'white' : 'var(--color-ink)',
                border: selections[category.id] === feature.id ? '2px solid var(--color-secondary)' : '1px solid var(--color-line)',
                boxShadow: selections[category.id] === feature.id ? '0 4px 20px rgba(255, 122, 89, 0.2)' : 'none'
              }"
            >
              {{ feature.key }}
            </button>
          </div>
        </div>

        <!-- Error message -->
        <p v-if="errorMessage" class="text-center py-4 rounded-lg px-6" style="color: var(--color-alert); background-color: rgba(239, 68, 68, 0.1)">{{ errorMessage }}</p>

        <!-- Submit button -->
        <div class="flex gap-4 pt-4">
          <button
            type="button"
            @click="router.back()"
            class="flex-1 rounded-lg py-4 font-semibold transition-all hover:shadow-lg"
            style="background-color: var(--color-paper); color: var(--color-ink); border: 1px solid var(--color-line)"
          >
            Back
          </button>
          <button
            type="button"
            @click="handleSubmit"
            :disabled="isSaving || !allAnswered()"
            class="flex-1 rounded-lg py-4 font-semibold transition-all hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed text-white"
            style="background-color: var(--color-sage)"
          >
            <span v-if="isSaving">Getting Recommendations...</span>
            <span v-else>Get My Recommendations</span>
          </button>
        </div>
      </div>

      <!-- Progress indicator -->
      <div class="rounded-lg p-6" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line)">
        <p class="text-sm font-semibold mb-3" style="color: var(--color-ink)">Progress: {{ Object.keys(selections).length }} / {{ categories.length }}</p>
        <div style="width: 100%; height: 6px; background-color: var(--color-line); border-radius: 3px; overflow: hidden">
          <div
            :style="{
              width: (categories.length > 0 ? (Object.keys(selections).length / categories.length * 100) : 0) + '%',
              height: '100%',
              background: 'linear-gradient(90deg, var(--color-sage) 0%, var(--color-secondary) 100%)',
              transition: 'width 0.3s ease'
            }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>