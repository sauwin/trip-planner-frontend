<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getTrips, createTrip } from '@/api/trips.api';
import type { Trip } from '@/types/trip.types';

const trips = ref<Trip[]>([]);
const isLoading = ref(true);
const newTitle = ref('');
const isCreating = ref(false);
const errorMessage = ref('');

async function loadTrips() {
  const response = await getTrips();
  trips.value = response.data;
}

async function handleCreate() {
  if (!newTitle.value.trim()) return;
  isCreating.value = true;
  errorMessage.value = '';
  try {
    await createTrip(newTitle.value.trim());
    newTitle.value = '';
    await loadTrips();
  } catch {
    errorMessage.value = 'Failed to create trip';
  } finally {
    isCreating.value = false;
  }
}

onMounted(async () => {
  try {
    await loadTrips();
  } catch {
    errorMessage.value = 'Failed to load trips';
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="max-w-2xl mx-auto mt-12 px-4">
    <h1 class="text-2xl font-semibold mb-6">My Trips</h1>

    <form @submit.prevent="handleCreate" class="flex gap-2 mb-8">
      <input
        v-model="newTitle"
        type="text"
        placeholder="New trip title"
        class="flex-1 border border-gray-300 rounded-md px-3 py-2"
      />
      <button
        type="submit"
        :disabled="isCreating"
        class="bg-blue-600 text-white rounded-md px-4 py-2 font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        Create
      </button>
    </form>

    <p v-if="isLoading" class="text-gray-500">Loading...</p>
    <p v-else-if="errorMessage" class="text-red-600">{{ errorMessage }}</p>
    <p v-else-if="trips.length === 0" class="text-gray-500">No trips yet — create your first one above.</p>

    <div v-else class="flex flex-col gap-3">
      <router-link
        v-for="trip in trips"
        :key="trip.id"
        :to="`/trips/${trip.id}`"
        class="border border-gray-200 rounded-lg p-4 hover:border-gray-400 transition-colors"
      >
        <h2 class="font-medium text-gray-900">{{ trip.title }}</h2>
      </router-link>
    </div>
  </div>
</template>