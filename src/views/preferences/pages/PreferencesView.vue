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
  <div class="min-h-screen" style="background-color: var(--color-paper)">
    <div class="max-w-3xl mx-auto mt-14 px-4 pb-20">
      <div class="mb-8">
        <p class="tag-mono uppercase" style="color: var(--color-sage)">Preferences</p>
        <h1 class="font-display text-4xl font-semibold tracking-tight mt-1" style="color: var(--color-ink)">Tell us your style</h1>
        <p class="text-sm mt-2" style="color: var(--color-ink-soft)">Pick one preference per category to personalize your recommendations</p>
      </div>

      <hr class="route-divider mb-8" />

      <p v-if="isLoading" class="text-center py-16" style="color: var(--color-ink-faint)">Loading quiz options...</p>

      <div v-else class="flex flex-col gap-10">
        <div v-for="category in categories" :key="category.id" class="rounded-xl p-6" style="background-color: var(--color-paper-dim); border: 1.5px solid var(--color-line)">
          <p class="tag-mono uppercase mb-5" style="color: var(--color-sage)">{{ category.key }}</p>
          <div class="flex flex-wrap gap-3">
            <button
              v-for="feature in category.features"
              :key="feature.id"
              type="button"
              @click="selectFeature(category.id, feature.id)"
              class="px-5 py-2.5 rounded-lg font-medium transition-all text-sm"
              :style="{
                backgroundColor: selections[category.id] === feature.id ? 'var(--color-accent)' : 'var(--color-paper)',
                color: selections[category.id] === feature.id ? 'white' : 'var(--color-ink)',
                border: selections[category.id] === feature.id ? '1.5px solid var(--color-accent)' : '1.5px solid var(--color-line)',
              }"
            >
              {{ feature.key }}
            </button>
          </div>
        </div>

        <p v-if="errorMessage" class="text-center rounded-lg px-4 py-3" style="color: var(--color-alert); background-color: rgba(179, 65, 58, 0.1)">{{ errorMessage }}</p>

        <button
          type="button"
          @click="handleSubmit"
          :disabled="isSaving || !allAnswered()"
          class="rounded-lg py-3 font-medium transition-all hover:shadow-md disabled:opacity-60 text-white"
          style="background-color: var(--color-sage)"
        >
          {{ isSaving ? 'Saving...' : 'Get my recommendations' }}
        </button>
      </div>
    </div>
  </div>
</template>