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
  <div class="min-h-screen" style="background-color: var(--color-paper)">
    <div class="max-w-4xl mx-auto mt-14 px-4 pb-20">
      <div class="mb-8">
        <p class="tag-mono uppercase" style="color: var(--color-sage)">Expeditions</p>
        <h1 class="font-display text-4xl font-semibold tracking-tight mt-1" style="color: var(--color-ink)">My trips</h1>
        <p class="text-sm mt-2" style="color: var(--color-ink-soft)">Plan and organize your adventures</p>
      </div>

      <hr class="route-divider mb-8" />

      <!-- Create trip form -->
      <form @submit.prevent="handleCreate" class="mb-10 rounded-xl p-6" style="background-color: var(--color-paper-dim); border: 1.5px solid var(--color-line)">
        <h2 class="tag-mono uppercase mb-4" style="color: var(--color-sage)">New expedition</h2>
        <div class="flex flex-col gap-4">
          <input
            v-model="newTitle"
            type="text"
            placeholder="Trip name (e.g., Summer in Italy)"
            class="rounded-lg px-4 py-2.5 text-sm transition-all focus:outline-none"
            :style="{
              backgroundColor: 'var(--color-paper)',
              color: 'var(--color-ink)',
              border: '1.5px solid var(--color-line)'
            }"
            @focus="handleInputFocus"
            @blur="handleInputBlur"
          />
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              v-model.number="newBudget"
              type="number"
              placeholder="Budget (optional, €)"
              class="rounded-lg px-4 py-2.5 text-sm transition-all focus:outline-none"
              :style="{
                backgroundColor: 'var(--color-paper)',
                color: 'var(--color-ink)',
                border: '1.5px solid var(--color-line)'
              }"
              @focus="handleInputFocus"
              @blur="handleInputBlur"
            />
            <input
              v-model.number="newPeopleCount"
              type="number"
              min="1"
              placeholder="Number of people"
              class="rounded-lg px-4 py-2.5 text-sm transition-all focus:outline-none"
              :style="{
                backgroundColor: 'var(--color-paper)',
                color: 'var(--color-ink)',
                border: '1.5px solid var(--color-line)'
              }"
              @focus="handleInputFocus"
              @blur="handleInputBlur"
            />
          </div>
          <button
            type="submit"
            :disabled="isCreating"
            class="rounded-lg px-4 py-2.5 font-medium transition-all hover:shadow-md disabled:opacity-60 text-white"
            style="background-color: var(--color-sage)"
          >
            {{ isCreating ? 'Creating...' : 'Create trip' }}
          </button>
        </div>
      </form>

      <!-- Status messages -->
      <p v-if="isLoading" class="text-center py-16" style="color: var(--color-ink-faint)">Loading your trips...</p>
      <p v-else-if="errorMessage" class="text-center py-16 rounded-lg px-4" style="color: var(--color-alert); background-color: rgba(179, 65, 58, 0.1)">{{ errorMessage }}</p>
      <p v-else-if="trips.length === 0" class="text-center py-16" style="color: var(--color-ink-soft)">
        No trips yet — create your first one above.
      </p>

      <!-- Trips list -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <router-link
          v-for="trip in trips"
          :key="trip.id"
          :to="`/trips/${trip.id}`"
          class="group rounded-xl p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
          :style="{
            backgroundColor: 'var(--color-paper-dim)',
            border: '1.5px solid var(--color-line)',
          }"
        >
          <div class="flex items-start justify-between gap-3 mb-2">
            <h2 class="font-display text-lg font-semibold" style="color: var(--color-ink)">{{ trip.title }}</h2>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="shrink-0 mt-1 group-hover:scale-110 transition-transform" :style="{ color: 'var(--color-sage)' }">
              <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="flex flex-wrap gap-2 mt-3">
            <span v-if="trip.peopleCount" class="tag-mono text-xs" style="color: var(--color-accent)">{{ trip.peopleCount }} people</span>
            <span v-if="trip.budgetTotal" class="tag-mono text-xs" style="color: var(--color-ink-faint)">€{{ trip.budgetTotal.toFixed(0) }} budget</span>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>