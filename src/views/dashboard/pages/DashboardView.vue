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
        backgroundColor: '#0F52BA',
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
        backgroundColor: '#FF7A59',
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
    y: { beginAtZero: true, ticks: { stepSize: 1, color: '#64748B', font: { size: 11 } }, grid: { color: '#E2E8F0', drawBorder: false } },
    x: { grid: { display: false }, ticks: { color: '#64748B', font: { size: 11 } } },
  },
};
</script>

<template>
  <div style="background-color: var(--color-paper); min-height: 100vh">
    <div class="max-w-6xl mx-auto px-6 py-12">
      <!-- Header -->
      <div class="mb-12">
        <div class="inline-flex items-center gap-3 mb-6">
          <div style="width: 4px; height: 24px; background-color: var(--color-accent); border-radius: 2px"></div>
          <span class="tag-mono text-xs font-bold tracking-widest" style="color: var(--color-accent); text-transform: uppercase">Analytics</span>
        </div>
        <h1 class="font-display text-5xl font-bold mb-4" style="color: var(--color-ink)">Your Journey</h1>
        <p class="text-lg" style="color: var(--color-ink-soft)">Track your exploration activity and see where your wanderlust leads</p>
      </div>

      <!-- Loading state -->
      <p v-if="isLoading" class="text-center py-20" style="color: var(--color-ink-faint); font-size: 16px">Loading your stats...</p>

      <!-- Error message -->
      <p v-else-if="errorMessage" class="text-center py-16" style="color: var(--color-alert)">{{ errorMessage }}</p>

      <!-- Empty state -->
      <div v-else-if="interactions.length === 0" class="text-center py-20 rounded-lg" style="background-color: var(--color-paper-dim); border: 1px dashed var(--color-line)">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--color-ink-faint); margin: 0 auto 16px">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <p class="text-lg font-semibold mb-2" style="color: var(--color-ink)">No activity yet</p>
        <p style="color: var(--color-ink-soft)">Visit destinations and like some to see your activity here</p>
      </div>

      <!-- Content -->
      <div v-else class="space-y-12">
        <!-- Summary stats -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Total interactions -->
          <div class="rounded-lg p-8" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
            <div class="flex items-center justify-between mb-4">
              <p class="tag-mono text-xs font-bold" style="color: var(--color-ink-faint); text-transform: uppercase">Total Activity</p>
              <div style="width: 40px; height: 40px; background-color: rgba(15, 82, 186, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="color: var(--color-accent)">
                  <rect x="3" y="4" width="4" height="16"/>
                  <rect x="10" y="6" width="4" height="14"/>
                  <rect x="17" y="2" width="4" height="18"/>
                </svg>
              </div>
            </div>
            <p class="font-display text-4xl font-bold" style="color: var(--color-accent)">{{ totalInteractions }}</p>
            <p class="text-xs mt-3" style="color: var(--color-ink-faint)">Interactions tracked</p>
          </div>

          <!-- Total likes -->
          <div class="rounded-lg p-8" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
            <div class="flex items-center justify-between mb-4">
              <p class="tag-mono text-xs font-bold" style="color: var(--color-ink-faint); text-transform: uppercase">Favorites</p>
              <div style="width: 40px; height: 40px; background-color: rgba(255, 122, 89, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="color: var(--color-secondary)">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
            </div>
            <p class="font-display text-4xl font-bold" style="color: var(--color-secondary)">{{ totalLikes }}</p>
            <p class="text-xs mt-3" style="color: var(--color-ink-faint)">Destinations liked</p>
          </div>

          <!-- Top destination -->
          <div class="rounded-lg p-8" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
            <div class="flex items-center justify-between mb-4">
              <p class="tag-mono text-xs font-bold" style="color: var(--color-ink-faint); text-transform: uppercase">Top Pick</p>
              <div style="width: 40px; height: 40px; background-color: rgba(16, 185, 129, 0.1); border-radius: 8px; display: flex; align-items: center; justify-content: center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="color: var(--color-sage)">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
            </div>
            <p class="font-display text-xl font-bold truncate" style="color: var(--color-ink)">{{ topDestinationName }}</p>
            <p class="text-xs mt-3" style="color: var(--color-ink-faint)">Most liked</p>
          </div>
        </div>

        <!-- Charts section -->
        <div>
          <h2 class="font-display text-2xl font-bold mb-6" style="color: var(--color-ink)">Interaction Breakdown</h2>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- By type -->
            <div class="rounded-lg p-8" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
              <h3 class="tag-mono text-xs font-bold mb-6" style="color: var(--color-ink-faint); text-transform: uppercase">By Type</h3>
              <div style="height: 300px">
                <Bar :data="byTypeData" :options="chartOptions" />
              </div>
            </div>

            <!-- By destination -->
            <div class="rounded-lg p-8" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
              <h3 class="tag-mono text-xs font-bold mb-6" style="color: var(--color-ink-faint); text-transform: uppercase">Top Destinations</h3>
              <div style="height: 300px">
                <Bar :data="byCountryData" :options="chartOptions" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>