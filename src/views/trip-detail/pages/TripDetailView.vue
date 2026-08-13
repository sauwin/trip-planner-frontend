<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet';
import 'leaflet/dist/leaflet.css';
import { getTrip, addDestinationToTrip } from '@/api/trips.api';
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

function getName(destination: Destination) {
  return destination.translations.en?.name ?? destination.slug;
}

async function loadTrip() {
  const response = await getTrip(tripId);
  trip.value = response.data;
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

      <div class="flex flex-col gap-2 mb-6">
        <div
          v-for="td in trip.destinations"
          :key="td.destinationId"
          class="border border-gray-200 rounded-lg p-3 flex justify-between items-center"
        >
          <span class="text-gray-900">{{ td.position + 1 }}. {{ getName(td.destination) }}</span>
          <span class="text-sm text-gray-500">{{ td.destination.country }}</span>
        </div>
      </div>

      <form @submit.prevent="handleAddDestination" class="flex gap-2">
        <select v-model="selectedDestinationId" class="flex-1 border border-gray-300 rounded-md px-3 py-2">
          <option value="" disabled>Select a destination to add</option>
          <option v-for="d in allDestinations" :key="d.id" :value="d.id">{{ getName(d) }}</option>
        </select>
        <button
          type="submit"
          :disabled="isAdding"
          class="bg-blue-600 text-white rounded-md px-4 py-2 font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          Add
        </button>
      </form>

      <p v-if="errorMessage" class="text-red-600 text-sm mt-2">{{ errorMessage }}</p>
    </div>
  </div>
</template>