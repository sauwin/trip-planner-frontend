<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getDestinations } from '@/api/destinations.api';
import type { Destination } from '@/types/destination.types';

const destinations = ref<Destination[]>([]);
const isLoading = ref(true);
const errorMessage = ref('');

function getName(destination: Destination) {
  return destination.translations.en?.name ?? destination.slug;
}

onMounted(async () => {
  try {
    const response = await getDestinations();
    destinations.value = response.data;
  } catch {
    errorMessage.value = 'Failed to load destinations';
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="max-w-4xl mx-auto mt-12 px-4">
    <h1 class="text-2xl font-semibold mb-6">Destinations</h1>

    <p v-if="isLoading" class="text-gray-500">Loading...</p>
    <p v-else-if="errorMessage" class="text-red-600">{{ errorMessage }}</p>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <router-link
        v-for="destination in destinations"
        :key="destination.id"
        :to="`/destinations/${destination.id}`"
        class="border border-gray-200 rounded-lg p-4 hover:border-gray-400 transition-colors"
      >
        <h2 class="font-medium text-gray-900">{{ getName(destination) }}</h2>
        <p class="text-sm text-gray-500">{{ destination.country }}</p>
      </router-link>
    </div>
  </div>
</template>