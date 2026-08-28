<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { TripWithDestinations } from '@/types/trip.types';
import { isRequired, isPositiveNumber, isPositiveInteger, isDateRangeValid } from '@/utils/validation';

const props = defineProps<{
  trip: TripWithDestinations;
  isSaving: boolean;
}>();

const emit = defineEmits<{
  cancel: [];
  save: [payload: { title: string; budgetTotal: number | null; peopleCount: number; startDate: string; endDate: string }];
}>();

const { t } = useI18n();

const form = ref({
  title: props.trip.title,
  budgetTotal: props.trip.budgetTotal ?? null,
  peopleCount: props.trip.peopleCount,
  startDate: props.trip.startDate ? props.trip.startDate.slice(0, 10) : '',
  endDate: props.trip.endDate ? props.trip.endDate.slice(0, 10) : '',
});

const errors = ref({ title: '', budgetTotal: '', peopleCount: '', dateRange: '' });

function validate(): boolean {
  errors.value.title = isRequired(form.value.title) ? '' : t('tripDetail.errors.titleRequired');
  errors.value.budgetTotal = isPositiveNumber(form.value.budgetTotal) ? '' : t('tripDetail.errors.budgetPositive');
  errors.value.peopleCount = isPositiveInteger(form.value.peopleCount) ? '' : t('tripDetail.errors.peopleCountPositive');
  errors.value.dateRange = isDateRangeValid(form.value.startDate, form.value.endDate) ? '' : t('tripDetail.errors.endDateBeforeStart');
  return !errors.value.title && !errors.value.budgetTotal && !errors.value.peopleCount && !errors.value.dateRange;
}

function handleSubmit() {
  if (!validate()) return;
  emit('save', { ...form.value });
}
</script>

<template>
  <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
    <div class="max-w-md w-full rounded-lg p-6 shadow-xl space-y-4" style="background-color: var(--color-paper); border: 1px solid var(--color-line)">
      <h3 class="font-display text-xl font-bold" style="color: var(--color-ink)">{{ t('tripDetail.editTripTitle') || 'Edit Trip' }}</h3>

      <form @submit.prevent="handleSubmit" class="space-y-3">
        <div>
          <input
            v-model="form.title"
            type="text"
            required
            :placeholder="t('tripDetail.tripName') || 'Trip name'"
            class="w-full rounded-lg px-4 py-2.5 text-sm"
            :style="{ backgroundColor: 'var(--color-paper-dim)', color: 'var(--color-ink)', border: errors.title ? '1px solid var(--color-alert)' : '1px solid var(--color-line)' }"
          />
          <p v-if="errors.title" class="text-xs mt-1" style="color: var(--color-alert)">{{ errors.title }}</p>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs" style="color: var(--color-ink-faint)">{{ t('tripDetail.budgetOptional') || 'Budget (optional, €)' }}</label>
            <input
              v-model.number="form.budgetTotal"
              type="number"
              class="w-full rounded-lg px-3 py-2 text-sm"
              :style="{ backgroundColor: 'var(--color-paper-dim)', color: 'var(--color-ink)', border: errors.budgetTotal ? '1px solid var(--color-alert)' : '1px solid var(--color-line)' }"
            />
            <p v-if="errors.budgetTotal" class="text-xs mt-1" style="color: var(--color-alert)">{{ errors.budgetTotal }}</p>
          </div>
          <div>
            <label class="text-xs" style="color: var(--color-ink-faint)">{{ t('tripDetail.peopleCount') || 'People' }}</label>
            <input
              v-model.number="form.peopleCount"
              type="number"
              min="1"
              class="w-full rounded-lg px-3 py-2 text-sm"
              :style="{ backgroundColor: 'var(--color-paper-dim)', color: 'var(--color-ink)', border: errors.peopleCount ? '1px solid var(--color-alert)' : '1px solid var(--color-line)' }"
            />
            <p v-if="errors.peopleCount" class="text-xs mt-1" style="color: var(--color-alert)">{{ errors.peopleCount }}</p>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs" style="color: var(--color-ink-faint)">{{ t('tripDetail.startDate') || 'Start date' }}</label>
            <input
              v-model="form.startDate"
              type="date"
              class="w-full rounded-lg px-3 py-2 text-sm"
              :style="{ backgroundColor: 'var(--color-paper-dim)', color: 'var(--color-ink)', border: errors.dateRange ? '1px solid var(--color-alert)' : '1px solid var(--color-line)' }"
            />
          </div>
          <div>
            <label class="text-xs" style="color: var(--color-ink-faint)">{{ t('tripDetail.endDate') || 'End date' }}</label>
            <input
              v-model="form.endDate"
              type="date"
              class="w-full rounded-lg px-3 py-2 text-sm"
              :style="{ backgroundColor: 'var(--color-paper-dim)', color: 'var(--color-ink)', border: errors.dateRange ? '1px solid var(--color-alert)' : '1px solid var(--color-line)' }"
            />
          </div>
        </div>
        <p v-if="errors.dateRange" class="text-xs" style="color: var(--color-alert)">{{ errors.dateRange }}</p>

        <div class="flex justify-end gap-3 pt-2">
          <button
            type="button"
            @click="emit('cancel')"
            class="px-5 py-2.5 text-sm font-semibold rounded-lg transition-all"
            style="color: var(--color-ink-soft); background-color: var(--color-paper-dim); border: 1px solid var(--color-line)"
          >
            {{ t('tripDetail.cancel') }}
          </button>
          <button
            type="submit"
            :disabled="isSaving"
            class="px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-all hover:shadow-lg disabled:opacity-60"
            style="background-color: var(--color-sage)"
          >
            {{ isSaving ? (t('tripDetail.saving') || 'Saving...') : (t('tripDetail.save') || 'Save') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>