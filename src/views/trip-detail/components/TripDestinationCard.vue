<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { TripWithDestinations } from '@/types/trip.types';
import AccommodationForm from './AccommodationForm.vue';
import DestinationDatesForm from './DestinationDatesForm.vue';

type TripDestination = TripWithDestinations['destinations'][number];

const props = defineProps<{
  destination: TripDestination;
  index: number;
  displayName: string;
  isEditingAccommodation: boolean;
  isEditingDates: boolean;
  isSavingAccommodation: boolean;
  isSavingDates: boolean;
}>();

const emit = defineEmits<{
  remove: [destinationId: string];
  'start-edit-accommodation': [destinationId: string];
  'cancel-edit-accommodation': [];
  'save-accommodation': [destinationId: string, payload: { accommodationName: string; accommodationPrice: number | null; accommodationUrl: string }];
  'start-edit-dates': [destinationId: string];
  'cancel-edit-dates': [];
  'save-dates': [destinationId: string, payload: { plannedDateStart: string | null; plannedDateEnd: string | null }];
}>();

const { t } = useI18n();

const dateRangeLabel = computed(() => {
  if (!props.destination.plannedDateStart) return null;
  const start = new Date(props.destination.plannedDateStart).toLocaleDateString();
  if (!props.destination.plannedDateEnd || props.destination.plannedDateEnd === props.destination.plannedDateStart) return start;
  const end = new Date(props.destination.plannedDateEnd).toLocaleDateString();
  return `${start} — ${end}`;
});
</script>

<template>
  <div
    class="rounded-lg p-4 transition-all"
    style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)"
  >
    <div class="flex justify-between items-start gap-3 mb-2">
      <div>
        <p class="font-display font-semibold" style="color: var(--color-accent)">{{ index + 1 }}. {{ displayName }}</p>
        <p class="text-sm mt-1" style="color: var(--color-ink-faint)">{{ destination.destination.country }}</p>
        <button
          type="button"
          @click="emit('start-edit-dates', destination.destinationId)"
          class="text-xs mt-1 font-medium underline decoration-dotted underline-offset-2"
          :style="{ color: dateRangeLabel ? 'var(--color-sage)' : 'var(--color-ink-faint)' }"
        >
          {{ dateRangeLabel ?? t('tripDetail.setDates') }}
        </button>
      </div>
      <div class="flex items-center gap-2 shrink-0">
        <button
          type="button"
          @click="emit('start-edit-accommodation', destination.destinationId)"
          class="text-sm px-3 py-1 rounded transition-all font-medium cursor-pointer hover:shadow-sm hover:scale-[1.02]"
          :style="{
            backgroundColor: destination.accommodationName ? 'var(--color-sage)' : 'var(--color-paper)',
            color: destination.accommodationName ? 'white' : 'var(--color-sage)',
            border: '1px solid var(--color-sage)'
          }"
        >
          {{ destination.accommodationName ? t('tripDetail.edit') : t('tripDetail.addAccommodation') }}
        </button>
      </div>
    </div>

    <p v-if="destination.accommodationName" class="text-sm mt-2" style="color: var(--color-ink-soft)">
      {{ destination.accommodationName }}
      <span v-if="destination.accommodationPrice" class="font-medium" style="color: var(--color-accent)">
        — €{{ destination.accommodationPrice }}{{ t('tripDetail.night') }}
      </span>
    </p>

    <div class="flex justify-start mt-3">
      <button
        type="button"
        @click="emit('remove', destination.destinationId)"
        class="text-sm px-3 py-1 rounded transition-all font-medium cursor-pointer hover:shadow-sm hover:scale-[1.02]"
        style="color: var(--color-alert); border: 1px solid var(--color-alert); background-color: var(--color-paper)"
      >
        {{ t('tripDetail.remove') }}
      </button>
    </div>

    <DestinationDatesForm
      v-if="isEditingDates"
      :planned-date-start="destination.plannedDateStart"
      :planned-date-end="destination.plannedDateEnd"
      :is-saving="isSavingDates"
      @save="(payload) => emit('save-dates', destination.destinationId, payload)"
      @cancel="emit('cancel-edit-dates')"
    />

    <AccommodationForm
      v-if="isEditingAccommodation"
      :accommodation-name="destination.accommodationName"
      :accommodation-price="destination.accommodationPrice"
      :accommodation-url="destination.accommodationUrl"
      :is-saving="isSavingAccommodation"
      @save="(payload) => emit('save-accommodation', destination.destinationId, payload)"
      @cancel="emit('cancel-edit-accommodation')"
    />
  </div>
</template>
