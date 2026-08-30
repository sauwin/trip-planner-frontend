<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { isNonNegativeNumber, isValidUrl } from '@/utils/validation';

const props = defineProps<{
  accommodationName: string | null;
  accommodationPrice: number | null;
  accommodationUrl: string | null;
  isSaving: boolean;
}>();

const emit = defineEmits<{
  save: [payload: { accommodationName: string; accommodationPrice: number | null; accommodationUrl: string }];
  cancel: [];
}>();

const { t } = useI18n();

const form = ref({
  accommodationName: props.accommodationName ?? '',
  accommodationPrice: props.accommodationPrice,
  accommodationUrl: props.accommodationUrl ?? '',
});

const errors = ref({ price: '', url: '' });

function validate(): boolean {
  errors.value.price = isNonNegativeNumber(form.value.accommodationPrice) ? '' : t('tripDetail.errors.priceNonNegative');
  errors.value.url = isValidUrl(form.value.accommodationUrl) ? '' : t('tripDetail.errors.urlInvalid');
  return !errors.value.price && !errors.value.url;
}

function handleSubmit() {
  if (!validate()) return;
  emit('save', {
    accommodationName: form.value.accommodationName,
    accommodationPrice: form.value.accommodationPrice,
    accommodationUrl: form.value.accommodationUrl,
  });
}
</script>

<template>
  <form
    @submit.prevent="handleSubmit"
    class="mt-4 pt-4 flex flex-col gap-2"
    style="border-top: 1px solid var(--color-line)"
  >
    <input
      v-model="form.accommodationName"
      type="text"
      :placeholder="t('tripDetail.accommodationName')"
      class="rounded-lg px-3 py-2 text-sm transition-all"
      :style="{ backgroundColor: 'var(--color-paper)', color: 'var(--color-ink)', border: '1px solid var(--color-line)' }"
    />
    <input
      v-model.number="form.accommodationPrice"
      type="number"
      :placeholder="t('tripDetail.pricePerNight')"
      class="rounded-lg px-3 py-2 text-sm transition-all"
      :style="{ backgroundColor: 'var(--color-paper)', color: 'var(--color-ink)', border: errors.price ? '1px solid var(--color-alert)' : '1px solid var(--color-line)' }"
    />
    <p v-if="errors.price" class="text-xs" style="color: var(--color-alert)">{{ errors.price }}</p>
    <input
      v-model="form.accommodationUrl"
      type="text"
      :placeholder="t('tripDetail.linkOptional')"
      class="rounded-lg px-3 py-2 text-sm transition-all"
      :style="{ backgroundColor: 'var(--color-paper)', color: 'var(--color-ink)', border: errors.url ? '1px solid var(--color-alert)' : '1px solid var(--color-line)' }"
    />
    <p v-if="errors.url" class="text-xs" style="color: var(--color-alert)">{{ errors.url }}</p>
    <div class="flex gap-2">
      <button
        type="submit"
        :disabled="isSaving"
        class="rounded-lg px-3 py-1.5 text-sm font-medium transition-all text-white disabled:opacity-60"
        style="background-color: var(--color-sage)"
      >
        {{ isSaving ? t('tripDetail.saving') : t('tripDetail.save') }}
      </button>
      <button
        type="button"
        @click="emit('cancel')"
        class="text-sm px-3 py-1.5 rounded transition-all"
        style="color: var(--color-ink-faint)"
      >
        {{ t('tripDetail.cancel') }}
      </button>
    </div>
  </form>
</template>