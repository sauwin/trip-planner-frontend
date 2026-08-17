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

function getName(destination: Destination) {
  return destination.translations.en?.name ?? destination.slug;
}

const totalInteractions = computed(() => interactions.value.length);
const totalLikes = computed(() => interactions.value.filter((i) => i.type === 'LIKE').length);

const topDestinationName = computed(() => {
  const counts: Record<string, number> = {};
  for (const i of interactions.value) {
    if (i.type !== 'LIKE') continue;
    counts[i.destinationId] = (counts[i.destinationId] ?? 0) + 1;
  }

  const sortedEntries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const topEntry = sortedEntries[0];
  if (!topEntry) return '—';

  const [topId] = topEntry;
  const dest = destinations.value.find((d) => d.id === topId);
  return dest ? getName(dest) : '—';
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
        borderRadius: 6,
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
    const name = dest ? getName(dest) : 'unknown';
    counts[name] = (counts[name] ?? 0) + 1;
  }
  return {
    labels: Object.keys(counts),
    datasets: [
      {
        label: 'Likes',
        backgroundColor: '#16a34a',
        borderRadius: 6,
        data: Object.values(counts),
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: '#f3f4f6' } },
    x: { grid: { display: false } },
  },
};
</script>

<template>
  <div class="max-w-3xl mx-auto mt-12 px-4 pb-16">
    <div class="mb-8">
      <h1 class="text-2xl font-semibold text-gray-900">Your activity</h1>
      <p class="text-sm text-gray-500 mt-1">A quick look at how you've been exploring destinations.</p>
    </div>

    <p v-if="isLoading" class="text-gray-500">Loading...</p>
    <p v-else-if="errorMessage" class="text-red-600">{{ errorMessage }}</p>
    <p v-else-if="interactions.length === 0" class="text-gray-500">
      No activity yet — browse destinations and like a few to see stats here.
    </p>

    <div v-else class="space-y-8">
      <!-- Summary stats -->
      <div class="grid grid-cols-3 gap-4">
        <div class="bg-white border border-gray-200 rounded-xl p-4">
          <p class="text-xs font-medium text-gray-500 uppercase">Total interactions</p>
          <p class="text-2xl font-semibold text-gray-900 mt-1">{{ totalInteractions }}</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-4">
          <p class="text-xs font-medium text-gray-500 uppercase">Likes</p>
          <p class="text-2xl font-semibold text-gray-900 mt-1">{{ totalLikes }}</p>
        </div>
        <div class="bg-white border border-gray-200 rounded-xl p-4">
          <p class="text-xs font-medium text-gray-500 uppercase">Top destination</p>
          <p class="text-2xl font-semibold text-gray-900 mt-1 truncate">{{ topDestinationName }}</p>
        </div>
      </div>

      <!-- Charts -->
      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <h2 class="text-sm font-medium text-gray-700 uppercase mb-4">Interactions by type</h2>
        <div class="h-64">
          <Bar :data="byTypeData" :options="chartOptions" />
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-xl p-6">
        <h2 class="text-sm font-medium text-gray-700 uppercase mb-4">Likes by destination</h2>
        <div class="h-64">
          <Bar :data="byCountryData" :options="chartOptions" />
        </div>
      </div>
    </div>
  </div>
</template>