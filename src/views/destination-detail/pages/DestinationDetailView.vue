<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet';
import 'leaflet/dist/leaflet.css';
import { getDestination } from '@/api/destinations.api';
import { recordInteraction } from '@/api/interactions.api';
import type { Destination } from '@/types/destination.types';

const route = useRoute();
const destination = ref<Destination | null>(null);
const isLoading = ref(true);
const errorMessage = ref('');
const liked = ref(false);

function getTranslation(dest: Destination) {
  return dest.translations.en ?? { name: dest.slug, description: '' };
}

async function handleLike() {
  if (!destination.value || liked.value) return;
  try {
    await recordInteraction(destination.value.id, 'LIKE');
    liked.value = true;
  } catch {

  }
}

onMounted(async () => {
  const id = route.params.id as string;
  try {
    const [destResponse] = await Promise.all([
      getDestination(id),
      recordInteraction(id, 'VIEW').catch(() => {}),
    ]);
    destination.value = destResponse.data;
  } catch {
    errorMessage.value = 'Failed to load destination';
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="max-w-3xl mx-auto mt-12 px-4">
    <p v-if="isLoading" class="text-gray-500">Loading...</p>
    <p v-else-if="errorMessage" class="text-red-600">{{ errorMessage }}</p>

    <div v-else-if="destination">
      <div class="flex justify-between items-start mb-2">
        <h1 class="text-2xl font-semibold text-gray-900">{{ getTranslation(destination).name }}</h1>
        <button
          @click="handleLike"
          :disabled="liked"
          class="text-sm rounded-md px-4 py-2 font-medium"
          :class="liked ? 'bg-gray-200 text-gray-500' : 'bg-blue-600 text-white hover:bg-blue-700'"
        >
          {{ liked ? 'Liked' : 'Like' }}
        </button>
      </div>
      <p class="text-gray-500 mb-4">{{ destination.country }}</p>
      <p class="text-gray-700 mb-6">{{ getTranslation(destination).description }}</p>

      <div class="h-80 rounded-lg overflow-hidden border border-gray-200">
        <l-map :zoom="6" :center="[destination.latitude, destination.longitude]">
          <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <l-marker :lat-lng="[destination.latitude, destination.longitude]" />
        </l-map>
      </div>
    </div>
  </div>
</template>