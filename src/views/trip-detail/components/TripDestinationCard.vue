<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { TripWithDestinations } from '@/types/trip.types';
import AccommodationForm from './AccommodationForm.vue';

type TripDestination = TripWithDestinations['destinations'][number];

const props = defineProps<{
  destination: TripDestination;
  index: number;
  displayName: string;
  isEditing: boolean;
  isSavingAccommodation: boolean;
}>();

const emit = defineEmits<{
  remove: [destinationId: string];
  'start-edit': [destinationId: string];
  'cancel-edit': [];
  'save-accommodation': [destinationId: string, payload: { accommodationName: string; accommodationPrice: number | null; accommodationUrl: string }];
}>();

const { t } = useI18n();
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
        <p v-if="destination.plannedDate" class="text-xs mt-1 font-medium" style="color: var(--color-sage)">
          {{ new Date(destination.plannedDate).toLocaleDateString() }}
        </p>
      </div>
      <button
        type="button"
        @click="emit('start-edit', destination.destinationId)"
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

    <AccommodationForm
      v-if="isEditing"
      :accommodation-name="destination.accommodationName"
      :accommodation-price="destination.accommodationPrice"
      :accommodation-url="destination.accommodationUrl"
      :is-saving="isSavingAccommodation"
      @save="(payload) => emit('save-accommodation', destination.destinationId, payload)"
      @cancel="emit('cancel-edit')"
    />
  </div>
</template>