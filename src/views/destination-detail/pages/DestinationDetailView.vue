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
  <div style="background-color: var(--color-paper); min-height: 100vh">
    <div class="max-w-6xl mx-auto px-6 py-12">
      <!-- Loading -->
      <p v-if="isLoading" class="text-center py-20" style="color: var(--color-ink-faint); font-size: 16px">Loading destination...</p>
      
      <!-- Error -->
      <p v-else-if="errorMessage" class="text-center py-20" style="color: var(--color-alert); font-size: 16px">{{ errorMessage }}</p>

      <!-- Content -->
      <div v-else-if="destination" class="space-y-12">
        <!-- Hero section -->
        <div>
          <div class="inline-flex items-center gap-3 mb-6">
            <div style="width: 4px; height: 24px; background-color: var(--color-accent); border-radius: 2px"></div>
            <span class="tag-mono text-xs font-bold tracking-widest" style="color: var(--color-accent); text-transform: uppercase">{{ destination.country }}</span>
          </div>
          <div class="flex items-start justify-between gap-6 mb-8">
            <div class="flex-1">
              <h1 class="font-display text-5xl font-bold mb-4" style="color: var(--color-ink)">{{ getTranslation(destination).name }}</h1>
              <p class="text-lg" style="color: var(--color-ink-soft); line-height: 1.6">{{ getTranslation(destination).description }}</p>
            </div>
            <button
              @click="handleLike"
              :disabled="liked"
              class="rounded-lg px-6 py-3 font-semibold transition-all hover:shadow-lg disabled:opacity-60 text-white shrink-0 hover:scale-105"
              :style="{
                backgroundColor: liked ? 'var(--color-sage)' : 'var(--color-secondary)'
              }"
            >
              <span v-if="liked">♥ Liked</span>
              <span v-else>♡ Like this</span>
            </button>
          </div>
        </div>

        <!-- Map -->
        <div class="rounded-lg overflow-hidden h-96" style="border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
          <l-map :zoom="6" :center="[destination.latitude, destination.longitude]">
            <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <l-marker :lat-lng="[destination.latitude, destination.longitude]" />
          </l-map>
        </div>

        <!-- Statistics Grid -->
        <div>
          <h2 class="font-display text-2xl font-bold mb-6" style="color: var(--color-ink)">Destination Statistics</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <!-- Popularity -->
            <div class="rounded-lg p-6" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
              <div class="flex items-center justify-between mb-3">
                <p class="tag-mono text-xs font-bold" style="color: var(--color-ink-faint); text-transform: uppercase">Popularity Score</p>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="color: var(--color-warning)">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <p class="font-display text-3xl font-bold" style="color: var(--color-accent)">{{ destination.popularityScore.toFixed(1) }}</p>
              <p class="text-xs mt-2" style="color: var(--color-ink-faint)">Out of 10</p>
            </div>

            <!-- Latitude -->
            <div class="rounded-lg p-6" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
              <div class="flex items-center justify-between mb-3">
                <p class="tag-mono text-xs font-bold" style="color: var(--color-ink-faint); text-transform: uppercase">Latitude</p>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--color-accent)">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <p class="font-display text-3xl font-bold" style="color: var(--color-ink)">{{ destination.latitude.toFixed(2) }}°</p>
              <p class="text-xs mt-2" style="color: var(--color-ink-faint)">{{ destination.latitude >= 0 ? 'North' : 'South' }}</p>
            </div>

            <!-- Longitude -->
            <div class="rounded-lg p-6" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
              <div class="flex items-center justify-between mb-3">
                <p class="tag-mono text-xs font-bold" style="color: var(--color-ink-faint); text-transform: uppercase">Longitude</p>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--color-accent)">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <polyline points="19 12 12 19 5 12"></polyline>
                </svg>
              </div>
              <p class="font-display text-3xl font-bold" style="color: var(--color-ink)">{{ destination.longitude.toFixed(2) }}°</p>
              <p class="text-xs mt-2" style="color: var(--color-ink-faint)">{{ destination.longitude >= 0 ? 'East' : 'West' }}</p>
            </div>

            <!-- Climate info -->
            <div class="rounded-lg p-6" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
              <div class="flex items-center justify-between mb-3">
                <p class="tag-mono text-xs font-bold" style="color: var(--color-ink-faint); text-transform: uppercase">Best Season</p>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="color: var(--color-warning)">
                  <circle cx="12" cy="12" r="10"></circle>
                </svg>
              </div>
              <p class="font-display text-2xl font-bold" style="color: var(--color-sage)">Spring</p>
              <p class="text-xs mt-2" style="color: var(--color-ink-faint)">Ideal time</p>
            </div>
          </div>
        </div>

        <!-- Call to action -->
        <div class="rounded-lg p-12" style="background: linear-gradient(135deg, rgba(15, 82, 186, 0.1) 0%, rgba(255, 122, 89, 0.1) 100%); border: 1px solid var(--color-line)">
          <h3 class="font-display text-2xl font-bold mb-3" style="color: var(--color-ink)">Ready to explore?</h3>
          <p class="mb-6" style="color: var(--color-ink-soft)">Add this destination to your trip and start planning your adventure.</p>
          <router-link to="/trips" class="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all hover:shadow-lg" style="background-color: var(--color-secondary)">
            <span>Plan Your Trip</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14"></path>
              <path d="M12 5l7 7-7 7"></path>
            </svg>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>