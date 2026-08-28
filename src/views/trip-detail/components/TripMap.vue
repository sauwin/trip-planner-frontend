<script setup lang="ts">
import { computed } from 'vue';
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet';
import 'leaflet/dist/leaflet.css';
import type { TripWithDestinations } from '@/types/trip.types';

const props = defineProps<{
  destinations: TripWithDestinations['destinations'];
}>();

const firstDestination = computed(() => props.destinations[0] ?? null);
</script>

<template>
  <div
    v-if="firstDestination"
    class="rounded-lg overflow-hidden h-96"
    style="border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05); position: relative; z-index: 0; isolation: isolate"
  >
    <l-map
      :zoom="4"
      :center="[firstDestination.destination.latitude, firstDestination.destination.longitude]"
    >
      <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <l-marker
        v-for="td in destinations"
        :key="td.destinationId"
        :lat-lng="[td.destination.latitude, td.destination.longitude]"
      />
    </l-map>
  </div>
</template>