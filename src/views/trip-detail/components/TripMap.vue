<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue';
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet';
import 'leaflet/dist/leaflet.css';
import type { TripWithDestinations } from '@/types/trip.types';

const props = defineProps<{
  destinations: TripWithDestinations['destinations'];
}>();

const firstDestination = computed(() => props.destinations[0] ?? null);

const destinationBounds = computed(() => props.destinations.map((tripDestination) => [
  tripDestination.destination.latitude,
  tripDestination.destination.longitude,
] as [number, number]));

type LeafletMap = {
  setView: (center: [number, number], zoom: number) => void;
  fitBounds: (
    bounds: [number, number][],
    options: { padding: [number, number]; maxZoom: number },
  ) => void;
};

const map = shallowRef<LeafletMap | null>(null);

function fitMapToDestinations() {
  const bounds = destinationBounds.value;
  if (!map.value || bounds.length === 0) return;

  if (bounds.length === 1) {
    map.value.setView(bounds[0]!, 12);
    return;
  }

  map.value.fitBounds(bounds, {
    padding: [32, 32],
    maxZoom: 12,
  });
}

function handleMapReady(readyMap: LeafletMap) {
  map.value = readyMap;
  fitMapToDestinations();
}

watch(destinationBounds, fitMapToDestinations, { deep: true });
</script>

<template>
  <div
    v-if="firstDestination"
    class="map-frame"
  >
    <l-map
      :zoom="4"
      :center="[firstDestination.destination.latitude, firstDestination.destination.longitude]"
      @ready="handleMapReady"
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