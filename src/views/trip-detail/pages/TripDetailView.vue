<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet';
import 'leaflet/dist/leaflet.css';
import { getTrip, addDestinationToTrip, updateAccommodation } from '@/api/trips.api';
import { getDestinations } from '@/api/destinations.api';
import type { TripWithDestinations } from '@/types/trip.types';
import type { Destination } from '@/types/destination.types';

const route = useRoute();
const tripId = route.params.id as string;
const firstDestination = computed(() => trip.value?.destinations[0] ?? null);

const trip = ref<TripWithDestinations | null>(null);
const allDestinations = ref<Destination[]>([]);
const selectedDestinationId = ref('');
const isLoading = ref(true);
const isAdding = ref(false);
const errorMessage = ref('');

const editingDestinationId = ref<string | null>(null);
const accommodationForm = ref({ accommodationName: '', accommodationPrice: null as number | null, accommodationUrl: '' });
const isSavingAccommodation = ref(false);

function getName(destination: Destination) {
  return destination.translations.en?.name ?? destination.slug;
}

async function loadTrip() {
  const response = await getTrip(tripId);
  trip.value = response.data;
}

function startEditingAccommodation(td: TripWithDestinations['destinations'][number]) {
  editingDestinationId.value = td.destinationId;
  accommodationForm.value = {
    accommodationName: td.accommodationName ?? '',
    accommodationPrice: td.accommodationPrice,
    accommodationUrl: td.accommodationUrl ?? '',
  };
}

async function saveAccommodation() {
  if (!editingDestinationId.value) return;
  isSavingAccommodation.value = true;
  try {
    await updateAccommodation(tripId, editingDestinationId.value, {
      accommodationName: accommodationForm.value.accommodationName || undefined,
      accommodationPrice: accommodationForm.value.accommodationPrice ?? undefined,
      accommodationUrl: accommodationForm.value.accommodationUrl || undefined,
    });
    editingDestinationId.value = null;
    await loadTrip();
  } catch {
    errorMessage.value = 'Failed to save accommodation';
  } finally {
    isSavingAccommodation.value = false;
  }
}

async function handleAddDestination() {
  if (!selectedDestinationId.value) return;
  isAdding.value = true;
  errorMessage.value = '';
  try {
    await addDestinationToTrip(tripId, selectedDestinationId.value);
    selectedDestinationId.value = '';
    await loadTrip();
  } catch (error: any) {
    errorMessage.value = error.response?.data?.error || 'Failed to add destination';
  } finally {
    isAdding.value = false;
  }
}

onMounted(async () => {
  try {
    const [, destResponse] = await Promise.all([loadTrip(), getDestinations()]);
    allDestinations.value = destResponse.data;
  } catch {
    errorMessage.value = 'Failed to load trip';
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="max-w-3xl mx-auto mt-12 px-4">
    <p v-if="isLoading" class="text-gray-500">Loading...</p>

    <div v-else-if="trip">
      <h1 class="text-2xl font-semibold text-gray-900 mb-6">{{ trip.title }}</h1>

      <div v-if="firstDestination" class="h-72 rounded-lg overflow-hidden border border-gray-200 mb-6">
    <l-map
      :zoom="4"
      :center="[firstDestination.destination.latitude, firstDestination.destination.longitude]"
    >
      <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <l-marker
        v-for="td in trip?.destinations"
        :key="td.destinationId"
        :lat-lng="[td.destination.latitude, td.destination.longitude]"
      />
    </l-map>
  </div>

  <div
    v-for="td in trip.destinations"
    :key="td.destinationId"
    class="border border-gray-200 rounded-lg p-3"
  >
  <div class="flex justify-between items-center">
    <span class="text-gray-900">{{ td.position + 1 }}. {{ getName(td.destination) }}</span>
    <button
      type="button"
      @click="startEditingAccommodation(td)"
      class="text-sm text-blue-600 hover:underline"
    >
      {{ td.accommodationName ? 'Edit accommodation' : 'Add accommodation' }}
    </button>
  </div>

  <p v-if="td.accommodationName" class="text-sm text-gray-600 mt-1">
    {{ td.accommodationName }}
    <span v-if="td.accommodationPrice"> — €{{ td.accommodationPrice }}/night</span>
  </p>

        <form
          v-if="editingDestinationId === td.destinationId"
          @submit.prevent="saveAccommodation"
          class="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-3"
        >
          <input
            v-model="accommodationForm.accommodationName"
            type="text"
            placeholder="Accommodation name"
            class="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
          <input
            v-model.number="accommodationForm.accommodationPrice"
            type="number"
            placeholder="Price per night"
            class="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
          <input
            v-model="accommodationForm.accommodationUrl"
            type="text"
            placeholder="Link (optional)"
            class="border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
          <div class="flex gap-2">
            <button
              type="submit"
              :disabled="isSavingAccommodation"
              class="bg-blue-600 text-white rounded-md px-3 py-1.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              Save
            </button>
            <button
              type="button"
              @click="editingDestinationId = null"
              class="text-sm text-gray-500 hover:underline"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>