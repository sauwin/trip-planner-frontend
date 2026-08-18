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
  <div class="min-h-screen" style="background-color: var(--color-paper)">
    <div class="max-w-4xl mx-auto mt-14 px-4 pb-20">
      <p v-if="isLoading" class="text-center py-16" style="color: var(--color-ink-faint)">Loading...</p>
      <p v-else-if="errorMessage" class="text-center py-16 rounded-lg px-4" style="color: var(--color-alert)">{{ errorMessage }}</p>

      <div v-else-if="destination">
        <!-- Header -->
        <div class="mb-6">
          <p class="tag-mono uppercase" style="color: var(--color-sage)">{{ destination.country }}</p>
          <div class="flex items-start justify-between gap-4 mt-2">
            <div>
              <h1 class="font-display text-4xl font-semibold tracking-tight" style="color: var(--color-ink)">{{ getTranslation(destination).name }}</h1>
              <p class="text-sm mt-1" style="color: var(--color-ink-faint)">★ {{ destination.popularityScore.toFixed(1) }} popularity</p>
            </div>
            <button
              @click="handleLike"
              :disabled="liked"
              class="rounded-lg px-6 py-2.5 font-medium transition-all hover:shadow-md disabled:opacity-60 text-white shrink-0"
              :style="{
                backgroundColor: liked ? 'var(--color-ink-faint)' : 'var(--color-accent)'
              }"
            >
              {{ liked ? '♥ Liked' : '♡ Like' }}
            </button>
          </div>
        </div>

        <hr class="route-divider mb-8" />

        <!-- Description -->
        <div class="mb-8 rounded-xl p-6" style="background-color: var(--color-paper-dim); border: 1.5px solid var(--color-line)">
          <p class="text-base leading-relaxed" style="color: var(--color-ink-soft)">{{ getTranslation(destination).description }}</p>
        </div>

        <!-- Map -->
        <div class="h-96 rounded-xl overflow-hidden mb-8" style="border: 1.5px solid var(--color-line)">
          <l-map :zoom="6" :center="[destination.latitude, destination.longitude]">
            <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <l-marker :lat-lng="[destination.latitude, destination.longitude]" />
          </l-map>
        </div>

        <!-- Coordinates and info -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="rounded-xl p-4" style="background-color: var(--color-paper-dim); border: 1.5px solid var(--color-line)">
            <p class="tag-mono text-xs" style="color: var(--color-ink-faint)">Latitude</p>
            <p class="font-display font-semibold mt-2" style="color: var(--color-accent)">{{ destination.latitude.toFixed(2) }}°</p>
          </div>
          <div class="rounded-xl p-4" style="background-color: var(--color-paper-dim); border: 1.5px solid var(--color-line)">
            <p class="tag-mono text-xs" style="color: var(--color-ink-faint)">Longitude</p>
            <p class="font-display font-semibold mt-2" style="color: var(--color-accent)">{{ destination.longitude.toFixed(2) }}°</p>
          </div>
          <div class="rounded-xl p-4" style="background-color: var(--color-paper-dim); border: 1.5px solid var(--color-line)">
            <p class="tag-mono text-xs" style="color: var(--color-ink-faint)">Country</p>
            <p class="font-display font-semibold mt-2" style="color: var(--color-sage)">{{ destination.country }}</p>
          </div>
          <div class="rounded-xl p-4" style="background-color: var(--color-paper-dim); border: 1.5px solid var(--color-line)">
            <p class="tag-mono text-xs" style="color: var(--color-ink-faint)">Popularity</p>
            <p class="font-display font-semibold mt-2" style="color: var(--color-sage)">{{ destination.popularityScore.toFixed(2) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>