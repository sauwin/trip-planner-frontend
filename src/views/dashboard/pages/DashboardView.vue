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
        backgroundColor: '#3E6E92',
        borderRadius: 6,
        borderSkipped: false,
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
        backgroundColor: '#6B8F71',
        borderRadius: 6,
        borderSkipped: false,
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
    y: { beginAtZero: true, ticks: { stepSize: 1, color: '#5B6B62', font: { size: 11 } }, grid: { color: '#DCE2DD', drawBorder: false } },
    x: { grid: { display: false }, ticks: { color: '#5B6B62', font: { size: 11 } } },
  },
};
</script>

<template>
  <div class="min-h-screen" style="background-color: var(--color-paper)">
    <div class="max-w-4xl mx-auto mt-14 px-4 pb-20">
      <div class="mb-8">
        <p class="tag-mono uppercase" style="color: var(--color-sage)">Activity</p>
        <h1 class="font-display text-4xl font-semibold tracking-tight mt-1" style="color: var(--color-ink)">Your journey</h1>
        <p class="text-sm mt-2" style="color: var(--color-ink-soft)">A quick look at how you've been exploring destinations.</p>
      </div>

      <p v-if="isLoading" class="text-center py-16" style="color: var(--color-ink-faint)">Loading your stats...</p>
      <p v-else-if="errorMessage" class="text-center py-16" style="color: var(--color-alert)">{{ errorMessage }}</p>
      <p v-else-if="interactions.length === 0" class="text-center py-16" style="color: var(--color-ink-soft)">
        No activity yet — browse destinations and like a few to see your stats here.
      </p>

      <div v-else class="space-y-8">
        <!-- Summary stats -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="rounded-xl p-6 transition-all duration-200 hover:shadow-sm" style="background-color: var(--color-paper-dim); border: 1.5px solid var(--color-line)">
            <p class="tag-mono uppercase" style="color: var(--color-ink-faint)">Total interactions</p>
            <p class="text-4xl font-display font-semibold mt-3" style="color: var(--color-accent)">{{ totalInteractions }}</p>
            <div class="mt-3 h-1 rounded-full" style="background-color: var(--color-accent); width: 24px; opacity: 0.6"></div>
          </div>
          <div class="rounded-xl p-6 transition-all duration-200 hover:shadow-sm" style="background-color: var(--color-paper-dim); border: 1.5px solid var(--color-line)">
            <p class="tag-mono uppercase" style="color: var(--color-ink-faint)">Likes</p>
            <p class="text-4xl font-display font-semibold mt-3" style="color: var(--color-sage)">{{ totalLikes }}</p>
            <div class="mt-3 h-1 rounded-full" style="background-color: var(--color-sage); width: 24px; opacity: 0.6"></div>
          </div>
          <div class="rounded-xl p-6 transition-all duration-200 hover:shadow-sm" style="background-color: var(--color-paper-dim); border: 1.5px solid var(--color-line)">
            <p class="tag-mono uppercase" style="color: var(--color-ink-faint)">Top destination</p>
            <p class="text-lg font-display font-semibold mt-3 truncate" style="color: var(--color-ink)">{{ topDestinationName }}</p>
            <div class="mt-3 h-1 rounded-full" style="background-color: var(--color-ink-faint); width: 24px; opacity: 0.4"></div>
          </div>
        </div>

        <!-- Charts section header -->
        <div class="mt-12 mb-6">
          <p class="tag-mono uppercase" style="color: var(--color-sage)">Analytics</p>
          <h2 class="font-display text-2xl font-semibold tracking-tight mt-1" style="color: var(--color-ink)">Interaction patterns</h2>
        </div>

        <!-- Charts -->
        <div class="rounded-xl p-6" style="background-color: var(--color-paper-dim); border: 1.5px solid var(--color-line)">
          <h3 class="tag-mono uppercase" style="color: var(--color-accent)">by type</h3>
          <div class="h-64 mt-6">
            <Bar :data="byTypeData" :options="chartOptions" />
          </div>
        </div>

        <div class="rounded-xl p-6" style="background-color: var(--color-paper-dim); border: 1.5px solid var(--color-line)">
          <h3 class="tag-mono uppercase" style="color: var(--color-sage)">by destination</h3>
          <div class="h-64 mt-6">
            <Bar :data="byCountryData" :options="chartOptions" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>