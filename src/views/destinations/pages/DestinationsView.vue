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
  <div class="min-h-screen" style="background-color: var(--color-paper)">
    <div class="max-w-5xl mx-auto mt-14 px-4 pb-20">
      <div class="flex items-end justify-between mb-3">
        <div>
          <p class="tag-mono uppercase" style="color: var(--color-accent)">Atlas</p>
          <h1 class="font-display text-4xl font-semibold tracking-tight" style="color: var(--color-ink)" >Destinations</h1>
        </div>
        <p class="tag-mono hidden sm:block" style="color: var(--color-ink-faint)" v-if="!isLoading && !errorMessage">
          {{ destinations.length }} charted
        </p>
      </div>
      <hr class="route-divider mb-8" />

      <div v-if="isLoading" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div v-for="n in 4" :key="n" class="rounded-xl p-5 h-32 animate-pulse" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line)" />
      </div>

      <p v-else-if="errorMessage" class="text-sm" style="color: var(--color-alert)">{{ errorMessage }}</p>

      <p v-else-if="destinations.length === 0" class="text-sm" style="color: var(--color-ink-soft)">
        No destinations charted yet.
      </p>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <router-link
          v-for="destination in destinations"
          :key="destination.id"
          :to="`/destinations/${destination.id}`"
          class="group rounded-xl p-5 transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-1"
          :style="{
            backgroundColor: 'var(--color-paper-dim)',
            border: '1.5px solid var(--color-line)',
          }"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0 flex-1">
              <p class="tag-mono uppercase" style="color: var(--color-sage)">{{ destination.country }}</p>
              <h2 class="font-display text-lg font-semibold truncate mt-0.5" style="color: var(--color-ink)">
                {{ getName(destination) }}
              </h2>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="shrink-0 mt-0.5 transition-all duration-200 group-hover:scale-110" :style="{ color: 'var(--color-accent)', opacity: 0.7 }">
              <circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.6"/>
              <circle cx="12" cy="12" r="2" fill="currentColor"/>
            </svg>
          </div>

          <p v-if="getDescription(destination)" class="text-sm mt-2.5 line-clamp-2" style="color: var(--color-ink-soft)">
            {{ getDescription(destination) }}
          </p>

          <div class="flex items-center justify-between mt-4 pt-3" style="border-top: 1px solid var(--color-line)">
            <span class="tag-mono" style="color: var(--color-ink-faint)">{{ coords(destination) }}</span>
            <div class="flex items-center gap-1">
              <span class="text-sm font-medium group-hover:text-base transition-all" style="color: var(--color-accent)">{{ destination.popularityScore.toFixed(1) }}</span>
              <span style="color: var(--color-accent)">★</span>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>