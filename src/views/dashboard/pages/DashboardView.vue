<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';
import { getInteractions } from '@/api/interactions.api';
import { getDestinations } from '@/api/destinations.api';
import type { Interaction } from '@/types/interaction.types';
import type { Destination } from '@/types/destination.types';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const interactions = ref<Interaction[]>([]);
const destinations = ref<Destination[]>([]);
const isLoading = ref(true);
const errorMessage = ref('');

onMounted(async () => {
  try {
    const [interactionsResp, destinationsResp] = await Promise.all([
      getInteractions(),
      getDestinations(),
    ]);
    interactions.value = interactionsResp.data;
    destinations.value = destinationsResp.data;
  } catch {
    errorMessage.value = 'Failed to load stats';
  } finally {
    isLoading.value = false;
  }
});

const byTypeData = computed(() => {
  const counts: Record<string, number> = { VIEW: 0, LIKE: 0, RATING: 0, SAVE: 0 };
  for (const i of interactions.value) {
    counts[i.type] = (counts[i.type] ?? 0) + 1;
  }
  return {
    labels: Object.keys(counts),
    datasets: [
      {
        label: 'Interactions',
        backgroundColor: '#2563eb',
        data: Object.values(counts),
      },
    ],
  };
});

const byCountryData = computed(() => {
  const counts: Record<string, number> = {};
  for (const i of interactions.value) {
    if (i.type !== 'LIKE') continue;
    const dest = destinations.value.find((d) => d.id === i.destinationId);
    const country = dest?.slug ?? 'unknown';
    counts[country] = (counts[country] ?? 0) + 1;
  }
  return {
    labels: Object.keys(counts),
    datasets: [
      {
        label: 'Likes',
        backgroundColor: '#16a34a',
        data: Object.values(counts),
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
};
</script>

<template>
  <div class="max-w-3xl mx-auto mt-12 px-4">
    <h1 class="text-2xl font-semibold mb-6">Your activity</h1>

    <p v-if="isLoading" class="text-gray-500">Loading...</p>
    <p v-else-if="errorMessage" class="text-red-600">{{ errorMessage }}</p>
    <p v-else-if="interactions.length === 0" class="text-gray-500">
      No activity yet — browse destinations and like a few to see stats here.
    </p>

    <div v-else class="flex flex-col gap-10">
      <div>
        <h2 class="text-sm font-medium text-gray-700 uppercase mb-3">Interactions by type</h2>
        <Bar :data="byTypeData" :options="chartOptions" />
      </div>

      <div>
        <h2 class="text-sm font-medium text-gray-700 uppercase mb-3">Likes by destination</h2>
        <Bar :data="byCountryData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>