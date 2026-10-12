<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { createDestination, updateDestination } from '@/api/destinations.api';
import { getFeatureCategories } from '@/api/meta.api';
import type { FeatureCategory } from '@/types/feature.types';
import type { Destination, DestinationInput, DestinationTranslation } from '@/types/destination.types';
import { getApiErrorMessage } from '@/utils/apiError';

const props = defineProps<{
  open: boolean;
  destination?: Destination | null;
}>();
const emit = defineEmits<{
  close: [];
  saved: [];
}>();

const { t, te } = useI18n();
const categories = ref<FeatureCategory[]>([]);
const languages = ['en', 'sk'] as const;
const selectedWeights = reactive<Record<string, number>>({});
const isLoadingFeatures = ref(false);
const isSaving = ref(false);
const errorMessage = ref('');
const form = ref<DestinationInput>(emptyForm());
const isEditing = computed(() => Boolean(props.destination));

function emptyTranslation(): DestinationTranslation {
  return { name: '', description: '' };
}

function emptyForm(): DestinationInput {
  return {
    slug: '',
    country: '',
    latitude: 0,
    longitude: 0,
    translations: { en: emptyTranslation(), sk: emptyTranslation() },
    features: [],
  };
}

function resetForm() {
  errorMessage.value = '';
  form.value = props.destination
    ? {
        slug: props.destination.slug,
        country: props.destination.country,
        latitude: props.destination.latitude,
        longitude: props.destination.longitude,
        translations: {
          ...props.destination.translations,
          en: { ...emptyTranslation(), ...props.destination.translations.en },
          sk: { ...emptyTranslation(), ...props.destination.translations.sk },
        },
        features: props.destination.features?.map(({ featureId, weight }) => ({ featureId, weight })) ?? [],
      }
    : emptyForm();

  for (const featureId of Object.keys(selectedWeights)) delete selectedWeights[featureId];
  for (const feature of form.value.features) selectedWeights[feature.featureId] = feature.weight;
}

watch(
  () => [props.open, props.destination] as const,
  async ([open]) => {
    if (!open) return;
    resetForm();
    if (categories.value.length) return;
    isLoadingFeatures.value = true;
    try {
      const response = await getFeatureCategories();
      categories.value = response.data;
    } catch {
      errorMessage.value = t('admin.failedFeatures');
    } finally {
      isLoadingFeatures.value = false;
    }
  },
  { immediate: true },
);

function labelFor(key: string, group: 'features' | 'categories') {
  const path = `preferences.${group}.${key}`;
  return te(path) ? t(path) : key;
}

function setFeatureSelected(featureId: string, selected: boolean) {
  if (selected) {
    selectedWeights[featureId] = 1;
    return;
  }
  delete selectedWeights[featureId];
}

function isValid() {
  const knownFeatureIds = new Set(categories.value.flatMap((category) => category.features.map(({ id }) => id)));
  const features = Object.entries(selectedWeights);
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.value.slug.trim().toLowerCase())
    && form.value.country.trim().length > 0
    && form.value.country.trim().length <= 100
    && Number.isFinite(form.value.latitude)
    && Number(form.value.latitude) >= -90 && Number(form.value.latitude) <= 90
    && Number.isFinite(form.value.longitude)
    && Number(form.value.longitude) >= -180 && Number(form.value.longitude) <= 180
    && languages.every((locale) => {
      const translation = form.value.translations[locale];
      if (!translation) return false;
      return Boolean(translation.name.trim() && translation.description.trim())
        && translation.name.trim().length <= 120
        && translation.description.trim().length <= 5000;
    })
    && features.every(([featureId, weight]) =>
      knownFeatureIds.has(featureId) && typeof weight === 'number' && Number.isFinite(weight) && weight >= 0 && weight <= 1,
    );
}

async function submit() {
  errorMessage.value = '';
  if (!categories.value.length) {
    errorMessage.value = t('admin.failedFeatures');
    return;
  }
  if (!isValid()) {
    errorMessage.value = t('admin.invalidForm');
    return;
  }

  const payload: DestinationInput = {
    ...form.value,
    slug: form.value.slug.trim().toLowerCase(),
    country: form.value.country.trim(),
    latitude: Number(form.value.latitude),
    longitude: Number(form.value.longitude),
    translations: {
      ...form.value.translations,
      en: {
        ...form.value.translations.en,
        name: form.value.translations.en.name.trim(),
        description: form.value.translations.en.description.trim(),
      },
      sk: {
        ...form.value.translations.sk,
        name: form.value.translations.sk.name.trim(),
        description: form.value.translations.sk.description.trim(),
      },
    },
    features: Object.entries(selectedWeights).map(([featureId, weight]) => ({ featureId, weight })),
  };

  isSaving.value = true;
  try {
    if (props.destination) {
      await updateDestination(props.destination.id, payload);
    } else {
      await createDestination(payload);
    }
    emit('saved');
  } catch (error: unknown) {
    errorMessage.value = getApiErrorMessage(error, t('admin.saveError'));
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-[1200] flex items-start justify-center overflow-y-auto bg-ink/50 p-4 sm:p-8" @click.self="emit('close')">
    <section
      role="dialog"
      aria-modal="true"
      aria-labelledby="destination-editor-title"
      class="my-auto w-full max-w-4xl rounded-2xl bg-paper-dim p-6 shadow-xl sm:p-8"
    >
      <div class="mb-6 flex items-start justify-between gap-4">
        <div>
          <p class="tag-mono mb-2 text-xs font-bold uppercase tracking-widest text-accent">{{ t('admin.destinationsEyebrow') }}</p>
          <h2 id="destination-editor-title" class="font-display text-2xl font-bold text-ink">
            {{ isEditing ? t('admin.editDestination') : t('admin.addDestination') }}
          </h2>
        </div>
        <button type="button" class="rounded-lg px-3 py-2 text-2xl leading-none text-ink-soft hover:bg-paper" :aria-label="t('admin.cancel')" @click="emit('close')">
          &times;
        </button>
      </div>

      <form class="space-y-7" @submit.prevent="submit">
        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label for="editor-slug" class="mb-2 block text-sm font-semibold text-ink">{{ t('admin.slug') }}</label>
            <input id="editor-slug" v-model="form.slug" required maxlength="120" pattern="[a-z0-9]+(-[a-z0-9]+)*" class="w-full rounded-lg border border-line bg-paper px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div>
            <label for="editor-country" class="mb-2 block text-sm font-semibold text-ink">{{ t('admin.country') }}</label>
            <input id="editor-country" v-model="form.country" required maxlength="100" class="w-full rounded-lg border border-line bg-paper px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div>
            <label for="editor-latitude" class="mb-2 block text-sm font-semibold text-ink">{{ t('admin.latitude') }}</label>
            <input id="editor-latitude" v-model.number="form.latitude" type="number" min="-90" max="90" step="any" required class="w-full rounded-lg border border-line bg-paper px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
          </div>
          <div>
            <label for="editor-longitude" class="mb-2 block text-sm font-semibold text-ink">{{ t('admin.longitude') }}</label>
            <input id="editor-longitude" v-model.number="form.longitude" type="number" min="-180" max="180" step="any" required class="w-full rounded-lg border border-line bg-paper px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
          </div>
        </div>

        <div class="grid gap-5 lg:grid-cols-2">
          <fieldset v-for="language in languages" :key="language" class="rounded-xl border border-line p-5">
            <legend class="px-2 font-display text-lg font-semibold">{{ language === 'en' ? t('admin.english') : t('admin.slovak') }}</legend>
            <label :for="`editor-${language}-name`" class="mb-2 block text-sm font-semibold text-ink">{{ t('admin.name') }}</label>
            <input :id="`editor-${language}-name`" v-model="form.translations[language].name" required maxlength="120" class="mb-4 w-full rounded-lg border border-line bg-paper px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
            <label :for="`editor-${language}-description`" class="mb-2 block text-sm font-semibold text-ink">{{ t('admin.description') }}</label>
            <textarea :id="`editor-${language}-description`" v-model="form.translations[language].description" required maxlength="5000" rows="4" class="w-full rounded-lg border border-line bg-paper px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"></textarea>
          </fieldset>
        </div>

        <fieldset class="space-y-5">
          <legend class="mb-3 font-display text-xl font-bold text-ink">{{ t('admin.destinationFeatures') }}</legend>
          <p v-if="isLoadingFeatures" class="text-sm text-ink-soft">{{ t('admin.loadingFeatures') }}</p>
          <p v-else-if="categories.length === 0" class="text-sm text-alert">{{ t('admin.failedFeatures') }}</p>
          <div v-else class="grid gap-4 md:grid-cols-2">
            <section v-for="category in categories" :key="category.id" class="rounded-xl border border-line p-4">
              <h3 class="mb-3 font-semibold text-ink">{{ labelFor(category.key, 'categories') }}</h3>
              <div class="space-y-3">
                <label v-for="feature in category.features" :key="feature.id" class="flex items-center gap-3 text-sm text-ink-soft">
                  <input
                    type="checkbox"
                    :checked="feature.id in selectedWeights"
                    class="h-4 w-4 accent-accent"
                    @change="setFeatureSelected(feature.id, ($event.target as HTMLInputElement).checked)"
                  />
                  <span class="min-w-0 flex-1">{{ labelFor(feature.key, 'features') }}</span>
                  <input
                    v-if="feature.id in selectedWeights"
                    v-model.number="selectedWeights[feature.id]"
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    required
                    :aria-label="t('admin.featureWeight', { feature: labelFor(feature.key, 'features') })"
                    class="w-20 rounded-lg border border-line bg-paper px-2 py-1.5 text-sm text-ink focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </label>
              </div>
            </section>
          </div>
        </fieldset>

        <p v-if="errorMessage" class="rounded-lg bg-alert/10 px-4 py-3 text-sm text-alert" role="alert">{{ errorMessage }}</p>
        <div class="flex justify-end gap-3 border-t border-line pt-5">
          <button type="button" class="rounded-lg border border-line px-4 py-2.5 text-sm font-semibold text-ink hover:bg-paper" @click="emit('close')">
            {{ t('admin.cancel') }}
          </button>
          <button type="submit" :disabled="isSaving || isLoadingFeatures || categories.length === 0" class="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-dark disabled:opacity-50">
            {{ isSaving ? t('admin.saving') : isEditing ? t('admin.saveDestination') : t('admin.createDestination') }}
          </button>
        </div>
      </form>
    </section>
  </div>
</template>
