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

function getDescription(destination: Destination) {
  return destination.translations.en?.description ?? '';
}

function coords(destination: Destination) {
  const lat = destination.latitude >= 0
    ? `${destination.latitude.toFixed(2)}°N`
    : `${Math.abs(destination.latitude).toFixed(2)}°S`;
  const lng = destination.longitude >= 0
    ? `${destination.longitude.toFixed(2)}°E`
    : `${Math.abs(destination.longitude).toFixed(2)}°W`;
  return `${lat} ${lng}`;
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
  <div class="max-w-5xl mx-auto mt-14 px-4 pb-20">
    <div class="flex items-end justify-between mb-3">
      <div>
        <p class="tag-mono uppercase text-accent">Atlas</p>
        <h1 class="font-display text-3xl font-semibold tracking-tight text-ink mt-1">Destinations</h1>
      </div>
      <p class="tag-mono text-ink-faint hidden sm:block" v-if="!isLoading && !errorMessage">
        {{ destinations.length }} charted
      </p>
    </div>
    <hr class="route-divider mb-8" />

    <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div v-for="n in 4" :key="n" class="border border-line rounded-xl p-5 h-32 animate-pulse bg-paper-dim" />
    </div>

    <p v-else-if="errorMessage" class="error-text text-sm">{{ errorMessage }}</p>

    <p v-else-if="destinations.length === 0" class="text-ink-soft text-sm">
      No destinations charted yet.
    </p>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <router-link
        v-for="destination in destinations"
        :key="destination.id"
        :to="`/destinations/${destination.id}`"
        class="group border border-line rounded-xl p-5 bg-white hover:border-accent hover:-translate-y-0.5 transition-all duration-150"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="tag-mono text-accent uppercase truncate">{{ destination.country }}</p>
            <h2 class="font-display text-lg font-semibold text-ink mt-0.5 truncate">
              {{ getName(destination) }}
            </h2>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="text-ink-faint group-hover:text-accent transition-colors shrink-0 mt-1.5">
            <circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.6"/>
            <circle cx="12" cy="12" r="2" fill="currentColor"/>
          </svg>
        </div>

        <p v-if="getDescription(destination)" class="text-sm text-ink-soft mt-2 line-clamp-2">
          {{ getDescription(destination) }}
        </p>

        <div class="flex items-center justify-between mt-4 pt-3 border-t border-line">
          <span class="tag-mono text-ink-faint">{{ coords(destination) }}</span>
          <span class="tag-mono text-ink-faint">★ {{ destination.popularityScore.toFixed(1) }}</span>
        </div>
      </router-link>
    </div>
  </div>
</template>