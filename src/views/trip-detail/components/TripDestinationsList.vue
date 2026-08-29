<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { TripWithDestinations } from '@/types/trip.types';
import type { Destination } from '@/types/destination.types';
import { isDateRangeValid } from '@/utils/validation';
import TripDestinationCard from './TripDestinationCard.vue';

type TripDestination = TripWithDestinations['destinations'][number];

const props = defineProps<{
  destinations: TripDestination[]; // already sorted by parent
  allDestinations: Destination[];
  tripStartDate?: string | null;
  tripEndDate?: string | null;
  isAdding: boolean;
  editingAccommodationId: string | null;
  editingDatesId: string | null;
  isSavingAccommodation: boolean;
  isSavingDates: boolean;
}>();

const emit = defineEmits<{
  'add-destination': [destinationId: string, plannedDateStart: string, plannedDateEnd: string];
  'remove-destination': [destinationId: string];
  'start-edit-accommodation': [destinationId: string];
  'cancel-edit-accommodation': [];
  'save-accommodation': [destinationId: string, payload: { accommodationName: string; accommodationPrice: number | null; accommodationUrl: string }];
  'start-edit-dates': [destinationId: string];
  'cancel-edit-dates': [];
  'save-dates': [destinationId: string, payload: { plannedDateStart: string | null; plannedDateEnd: string | null }];
}>();

const { t, locale } = useI18n();

const selectedDestinationId = ref('');
const destinationSearch = ref('');
const newDateStart = ref('');
const newDateEnd = ref('');
const dateError = ref('');

function getName(destination: Destination) {
  return destination.translations[locale.value]?.name ?? destination.translations.en?.name ?? destination.slug;
}

const availableDestinations = computed(() => {
  const addedDestinationIds = new Set(props.destinations.map((destination) => destination.destinationId));
  const search = destinationSearch.value.trim().toLocaleLowerCase();

  if (!search) return [];

  return props.allDestinations
    .filter((destination) => !addedDestinationIds.has(destination.id))
    .map((destination) => {
      const name = getName(destination).toLocaleLowerCase();
      const country = destination.country.toLocaleLowerCase();
      const slug = destination.slug.toLocaleLowerCase();
      const startsWithSearch = name.startsWith(search) || country.startsWith(search) || slug.startsWith(search);
      const includesSearch = name.includes(search) || country.includes(search) || slug.includes(search);

      return { destination, matchRank: !search ? 0 : startsWithSearch ? 1 : includesSearch ? 2 : 3 };
    })
    .filter(({ matchRank }) => matchRank < 3)
    .sort((a, b) => a.matchRank - b.matchRank || getName(a.destination).localeCompare(getName(b.destination)));
});

const selectedDestination = computed(() => props.allDestinations.find((destination) => destination.id === selectedDestinationId.value));

const isOutOfDateRange = computed(() => {
  if (!newDateStart.value && !newDateEnd.value) return false;
  if (props.tripStartDate && newDateStart.value && newDateStart.value < props.tripStartDate.slice(0, 10)) return true;
  if (props.tripEndDate && newDateEnd.value && newDateEnd.value > props.tripEndDate.slice(0, 10)) return true;
  return false;
});

function selectDestination(id: string) {
  selectedDestinationId.value = id;
  dateError.value = '';
}

function handleSubmit() {
  if (!selectedDestinationId.value) return;

  if (newDateStart.value || newDateEnd.value) {
    if (!newDateStart.value || !newDateEnd.value) {
      dateError.value = t('tripDetail.errors.bothDatesRequired');
      return;
    }
    if (!isDateRangeValid(newDateStart.value, newDateEnd.value)) {
      dateError.value = t('tripDetail.errors.endDateBeforeStart');
      return;
    }
  }
  dateError.value = '';

  emit('add-destination', selectedDestinationId.value, newDateStart.value, newDateEnd.value);
  selectedDestinationId.value = '';
  destinationSearch.value = '';
  newDateStart.value = '';
  newDateEnd.value = '';
}
</script>

<template>
  <div>
    <h2 class="font-display text-2xl font-bold mb-6" style="color: var(--color-ink)">{{ t('tripDetail.destinations') }} ({{ destinations.length }})</h2>

    <div v-if="destinations.length === 0" class="text-center py-8 rounded-lg" style="background-color: var(--color-paper-dim); border: 1.5px dashed var(--color-line)">
      <p style="color: var(--color-ink-soft)">{{ t('tripDetail.noDestinations') }}</p>
    </div>

    <div v-else class="flex flex-col gap-3 mb-6">
      <TripDestinationCard
        v-for="(td, idx) in destinations"
        :key="td.destinationId"
        :destination="td"
        :index="idx"
        :display-name="getName(td.destination)"
        :is-editing-accommodation="editingAccommodationId === td.destinationId"
        :is-editing-dates="editingDatesId === td.destinationId"
        :is-saving-accommodation="isSavingAccommodation"
        :is-saving-dates="isSavingDates"
        @remove="(id) => emit('remove-destination', id)"
        @start-edit-accommodation="(id) => emit('start-edit-accommodation', id)"
        @cancel-edit-accommodation="emit('cancel-edit-accommodation')"
        @save-accommodation="(id, payload) => emit('save-accommodation', id, payload)"
        @start-edit-dates="(id) => emit('start-edit-dates', id)"
        @cancel-edit-dates="emit('cancel-edit-dates')"
        @save-dates="(id, payload) => emit('save-dates', id, payload)"
      />
    </div>

    <form @submit.prevent="handleSubmit" class="flex flex-col md:flex-row gap-2">
      <div class="flex-1 flex flex-col gap-2">
        <input
          v-model="destinationSearch"
          type="search"
          :placeholder="t('tripDetail.searchDestination')"
          class="w-full rounded-lg px-4 py-2.5 text-sm"
          :style="{ backgroundColor: 'var(--color-paper-dim)', color: 'var(--color-ink)', border: '1px solid var(--color-line)' }"
        />
        <div class="flex flex-wrap gap-2">
          <button
            v-for="item in availableDestinations"
            :key="item.destination.id"
            type="button"
            @click="selectDestination(item.destination.id)"
            class="rounded-lg px-3 py-2 text-sm text-left transition-all"
            :style="{
              backgroundColor: selectedDestinationId === item.destination.id ? 'var(--color-sage)' : 'var(--color-paper-dim)',
              color: selectedDestinationId === item.destination.id ? 'white' : 'var(--color-ink)',
              border: '1px solid ' + (selectedDestinationId === item.destination.id ? 'var(--color-sage)' : 'var(--color-line)')
            }"
          >
            <span class="font-medium">{{ getName(item.destination) }}</span>
            <span class="block text-xs opacity-70">{{ item.destination.country }}</span>
          </button>
        </div>
        <p v-if="availableDestinations.length === 0" class="text-xs px-1" style="color: var(--color-ink-faint)">{{ t('tripDetail.noMatching') }}</p>

        <div
          v-if="selectedDestination"
          class="rounded-lg p-3 flex flex-col gap-2"
          style="background-color: var(--color-paper-dim); border: 1px dashed var(--color-sage)"
        >
          <p class="text-xs font-medium" style="color: var(--color-sage)">
            {{ t('tripDetail.selected', { name: getName(selectedDestination) }) }}
          </p>
          <div class="grid grid-cols-2 gap-2">
            <input
              v-model="newDateStart"
              type="date"
              :placeholder="t('tripDetail.startDate')"
              class="rounded-lg px-3 py-2 text-sm transition-all"
              :style="{ backgroundColor: 'var(--color-paper)', color: 'var(--color-ink)', border: '1px solid var(--color-line)' }"
            />
            <input
              v-model="newDateEnd"
              type="date"
              :placeholder="t('tripDetail.endDate')"
              class="rounded-lg px-3 py-2 text-sm transition-all"
              :style="{ backgroundColor: 'var(--color-paper)', color: 'var(--color-ink)', border: '1px solid var(--color-line)' }"
            />
          </div>
          <p v-if="dateError" class="text-xs" style="color: var(--color-alert)">{{ dateError }}</p>
          <p v-else-if="isOutOfDateRange" class="text-xs" style="color: var(--color-alert)">
            {{ t('tripDetail.dateOutsideRange') }}
          </p>
          <p v-else class="text-xs" style="color: var(--color-ink-faint)">{{ t('tripDetail.datesOptional') }}</p>
        </div>
      </div>
      <button
        type="submit"
        :disabled="isAdding || !selectedDestinationId"
        class="self-start rounded-lg px-6 py-2.5 text-sm font-semibold transition-all hover:shadow-lg text-white shrink-0 hover:scale-105 disabled:opacity-60"
        style="background-color: var(--color-sage)"
      >
        {{ t('tripDetail.add') }}
      </button>
    </form>
  </div>
</template>
