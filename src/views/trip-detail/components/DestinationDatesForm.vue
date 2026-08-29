<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { isDateRangeValid } from '@/utils/validation';

const props = defineProps<{
  plannedDateStart: string | null;
  plannedDateEnd: string | null;
  isSaving: boolean;
}>();

const emit = defineEmits<{
  save: [payload: { plannedDateStart: string | null; plannedDateEnd: string | null }];
  cancel: [];
}>();

const { t } = useI18n();

const form = ref({
  plannedDateStart: props.plannedDateStart ? props.plannedDateStart.slice(0, 10) : '',
  plannedDateEnd: props.plannedDateEnd ? props.plannedDateEnd.slice(0, 10) : '',
});

const error = ref('');

function validate(): boolean {
  const { plannedDateStart, plannedDateEnd } = form.value;
  if (!plannedDateStart && !plannedDateEnd) {
    error.value = '';
    return true;
  }
  if (!plannedDateStart || !plannedDateEnd) {
    error.value = t('tripDetail.errors.bothDatesRequired');
    return false;
  }
  error.value = isDateRangeValid(plannedDateStart, plannedDateEnd) ? '' : t('tripDetail.errors.endDateBeforeStart');
  return !error.value;
}

function handleSubmit() {
  if (!validate()) return;
  emit('save', {
    plannedDateStart: form.value.plannedDateStart || null,
    plannedDateEnd: form.value.plannedDateEnd || null,
  });
}
</script>

<template>
  <form
    @submit.prevent="handleSubmit"
    class="mt-4 pt-4 flex flex-col gap-2"
    style="border-top: 1px solid var(--color-line)"
  >
    <div class="grid grid-cols-2 gap-2">
      <input
        v-model="form.plannedDateStart"
        type="date"
        :placeholder="t('tripDetail.startDate')"
        class="rounded-lg px-3 py-2 text-sm transition-all"
        :style="{ backgroundColor: 'var(--color-paper)', color: 'var(--color-ink)', border: error ? '1px solid var(--color-alert)' : '1px solid var(--color-line)' }"
      />
      <input
        v-model="form.plannedDateEnd"
        type="date"
        :placeholder="t('tripDetail.endDate')"
        class="rounded-lg px-3 py-2 text-sm transition-all"
        :style="{ backgroundColor: 'var(--color-paper)', color: 'var(--color-ink)', border: error ? '1px solid var(--color-alert)' : '1px solid var(--color-line)' }"
      />
    </div>
    <p v-if="error" class="text-xs" style="color: var(--color-alert)">{{ error }}</p>
    <p v-else class="text-xs" style="color: var(--color-ink-faint)">{{ t('tripDetail.datesOptional') }}</p>
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
