<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getTrips, createTrip } from '@/api/trips.api';
import type { Trip } from '@/types/trip.types';

const trips = ref<Trip[]>([]);
const isLoading = ref(true);
const newTitle = ref('');
const isCreating = ref(false);
const errorMessage = ref('');
const newBudget = ref<number | null>(null);
const newPeopleCount = ref(1);

function handleInputFocus(e: Event) {
  const target = e.target as HTMLInputElement;
  target.style.borderColor = 'var(--color-sage)';
}

function handleInputBlur(e: Event) {
  const target = e.target as HTMLInputElement;
  target.style.borderColor = 'var(--color-line)';
}

async function loadTrips() {
  const response = await getTrips();
  trips.value = response.data;
}

async function handleCreate() {
  if (!newTitle.value.trim()) return;
  isCreating.value = true;
  errorMessage.value = '';
  try {
    await createTrip(
      newTitle.value.trim(),
      newBudget.value ?? undefined,
      newPeopleCount.value,
    );
    newTitle.value = '';
    newBudget.value = null;
    newPeopleCount.value = 1;
    await loadTrips();
  } catch {
    errorMessage.value = 'Failed to create trip';
  } finally {
    isCreating.value = false;
  }
}

onMounted(async () => {
  try {
    await loadTrips();
  } catch {
    errorMessage.value = 'Failed to load trips';
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div style="background-color: var(--color-paper); min-height: 100vh">
    <div class="max-w-5xl mx-auto px-6 py-12">
      <!-- Header -->
      <div class="mb-12">
        <div class="inline-flex items-center gap-3 mb-6">
          <div style="width: 4px; height: 24px; background-color: var(--color-secondary); border-radius: 2px"></div>
          <span class="tag-mono text-xs font-bold tracking-widest" style="color: var(--color-secondary); text-transform: uppercase">Planning</span>
        </div>
        <h1 class="font-display text-5xl font-bold mb-4" style="color: var(--color-ink)">My Trips</h1>
        <p class="text-lg" style="color: var(--color-ink-soft)">Organize and manage all your adventures in one place</p>
      </div>

      <!-- Create trip form -->
      <div class="rounded-lg p-8 mb-12" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
        <h2 class="font-display text-xl font-bold mb-6" style="color: var(--color-ink)">Plan your next trip</h2>
        <form @submit.prevent="handleCreate" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              v-model="newTitle"
              type="text"
              placeholder="Trip name (e.g., Summer in Italy)"
              required
              class="rounded-lg px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2"
              :style="{
                backgroundColor: 'var(--color-paper)',
                color: 'var(--color-ink)',
                border: '1px solid var(--color-line)',
                '--tw-ring-color': 'var(--color-secondary)'
              }"
              @focus="handleInputFocus"
              @blur="handleInputBlur"
            />
            <input
              v-model.number="newBudget"
              type="number"
              placeholder="Budget (optional, €)"
              class="rounded-lg px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2"
              :style="{
                backgroundColor: 'var(--color-paper)',
                color: 'var(--color-ink)',
                border: '1px solid var(--color-line)',
                '--tw-ring-color': 'var(--color-secondary)'
              }"
              @focus="handleInputFocus"
              @blur="handleInputBlur"
            />
            <input
              v-model.number="newPeopleCount"
              type="number"
              min="1"
              placeholder="Number of people"
              class="rounded-lg px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2"
              :style="{
                backgroundColor: 'var(--color-paper)',
                color: 'var(--color-ink)',
                border: '1px solid var(--color-line)',
                '--tw-ring-color': 'var(--color-secondary)'
              }"
              @focus="handleInputFocus"
              @blur="handleInputBlur"
            />
          </div>
          <button
            type="submit"
            :disabled="isCreating"
            class="rounded-lg px-6 py-3 font-semibold text-white transition-all hover:shadow-lg disabled:opacity-60"
            style="background-color: var(--color-secondary)"
          >
            <span v-if="isCreating">Creating...</span>
            <span v-else>Create Trip</span>
          </button>
        </form>
      </div>

      <!-- Loading state -->
      <p v-if="isLoading" class="text-center py-20" style="color: var(--color-ink-faint); font-size: 16px">Loading your trips...</p>

      <!-- Error message -->
      <p v-else-if="errorMessage" class="text-center py-12 rounded-lg px-4" style="color: var(--color-alert); background-color: rgba(239, 68, 68, 0.1)">{{ errorMessage }}</p>

      <!-- Empty state -->
      <div v-else-if="trips.length === 0" class="text-center py-20 rounded-lg" style="background-color: var(--color-paper-dim); border: 1px dashed var(--color-line)">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--color-ink-faint); margin: 0 auto 16px">
          <path d="M12 2L15.09 8.26H22L17.45 12.74L19.54 19.26L12 15.02L4.46 19.26L6.55 12.74L2 8.26H8.91L12 2Z"/>
        </svg>
        <p class="text-lg font-semibold mb-2" style="color: var(--color-ink)">No trips yet</p>
        <p style="color: var(--color-ink-soft)">Create your first trip above to get started</p>
      </div>

      <!-- Trips grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <router-link
          v-for="trip in trips"
          :key="trip.id"
          :to="`/trips/${trip.id}`"
          class="group rounded-lg p-6 transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
          :style="{
            backgroundColor: 'var(--color-paper-dim)',
            border: '1px solid var(--color-line)'
          }"
        >
          <!-- Header -->
          <div class="flex items-start justify-between gap-4 mb-4">
            <div class="flex-1">
              <h3 class="font-display text-2xl font-bold group-hover:text-" style="color: var(--color-ink)">{{ trip.title }}</h3>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shrink-0 group-hover:scale-110 transition-transform" :style="{ color: 'var(--color-secondary)' }">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-3 gap-3">
            <!-- People -->
            <div class="rounded-lg p-3" style="background-color: var(--color-paper); border: 1px solid var(--color-line)">
              <p class="tag-mono text-xs" style="color: var(--color-ink-faint); text-transform: uppercase">People</p>
              <p class="font-display text-xl font-bold mt-1" style="color: var(--color-accent)">{{ trip.peopleCount }}</p>
            </div>

            <!-- Budget -->
            <div class="rounded-lg p-3" style="background-color: var(--color-paper); border: 1px solid var(--color-line)">
              <p class="tag-mono text-xs" style="color: var(--color-ink-faint); text-transform: uppercase">Budget</p>
              <p class="font-display text-lg font-bold mt-1" style="color: var(--color-warning)">€{{ (trip.budgetTotal ?? 0).toFixed(0) }}</p>
            </div>

            <!-- Status -->
            <div class="rounded-lg p-3" style="background-color: var(--color-paper); border: 1px solid var(--color-line)">
              <p class="tag-mono text-xs" style="color: var(--color-ink-faint); text-transform: uppercase">Status</p>
              <p class="font-display text-lg font-bold mt-1" style="color: var(--color-sage)">Active</p>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>