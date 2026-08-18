<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { LMap, LTileLayer, LMarker } from '@vue-leaflet/vue-leaflet';
import 'leaflet/dist/leaflet.css';
import { getTrip, addDestinationToTrip, updateAccommodation } from '@/api/trips.api';
import { getDestinations } from '@/api/destinations.api';
import type { TripWithDestinations } from '@/types/trip.types';
import type { Destination } from '@/types/destination.types';
import { createExpense, getExpenses, deleteExpense } from '@/api/expenses.api';
import type { Expense } from '@/types/expense.types';

const route = useRoute();
const tripId = route.params.id as string;

const trip = ref<TripWithDestinations | null>(null);
const allDestinations = ref<Destination[]>([]);
const selectedDestinationId = ref('');
const isLoading = ref(true);
const isAdding = ref(false);
const errorMessage = ref('');

const editingDestinationId = ref<string | null>(null);
const accommodationForm = ref({ accommodationName: '', accommodationPrice: null as number | null, accommodationUrl: '' });
const isSavingAccommodation = ref(false);

const firstDestination = computed(() => trip.value?.destinations[0] ?? null);

const expenses = ref<Expense[]>([]);
const newExpenseDescription = ref('');
const newExpenseAmount = ref<number | null>(null);
const isAddingExpense = ref(false);

const totalSpent = computed(() => expenses.value.reduce((sum, e) => sum + e.amount, 0));

function getName(destination: Destination) {
  return destination.translations.en?.name ?? destination.slug;
}

async function loadTrip() {
  const response = await getTrip(tripId);
  trip.value = response.data;
}

function startEditingAccommodation(td: TripWithDestinations['destinations'][number]) {
  editingDestinationId.value = td.destinationId;
  accommodationForm.value = {
    accommodationName: td.accommodationName ?? '',
    accommodationPrice: td.accommodationPrice,
    accommodationUrl: td.accommodationUrl ?? '',
  };
}

async function saveAccommodation() {
  if (!editingDestinationId.value) return;
  isSavingAccommodation.value = true;
  try {
    await updateAccommodation(tripId, editingDestinationId.value, {
      accommodationName: accommodationForm.value.accommodationName || undefined,
      accommodationPrice: accommodationForm.value.accommodationPrice ?? undefined,
      accommodationUrl: accommodationForm.value.accommodationUrl || undefined,
    });
    editingDestinationId.value = null;
    await loadTrip();
  } catch {
    errorMessage.value = 'Failed to save accommodation';
  } finally {
    isSavingAccommodation.value = false;
  }
}

async function handleAddDestination() {
  if (!selectedDestinationId.value) return;
  isAdding.value = true;
  errorMessage.value = '';
  try {
    await addDestinationToTrip(tripId, selectedDestinationId.value);
    selectedDestinationId.value = '';
    await loadTrip();
  } catch (error: any) {
    errorMessage.value = error.response?.data?.error || 'Failed to add destination';
  } finally {
    isAdding.value = false;
  }
}

async function loadExpenses() {
  const response = await getExpenses(tripId);
  expenses.value = response.data;
}

async function handleAddExpense() {
  if (!newExpenseDescription.value.trim() || !newExpenseAmount.value) return;
  isAddingExpense.value = true;
  try {
    await createExpense(tripId, newExpenseDescription.value.trim(), newExpenseAmount.value);
    newExpenseDescription.value = '';
    newExpenseAmount.value = null;
    await loadExpenses();
  } catch {
    errorMessage.value = 'Failed to add expense';
  } finally {
    isAddingExpense.value = false;
  }
}

async function handleDeleteExpense(expenseId: string) {
  try {
    await deleteExpense(tripId, expenseId);
    await loadExpenses();
  } catch {
    errorMessage.value = 'Failed to delete expense';
  }
}

onMounted(async () => {
  try {
    const [, destResponse] = await Promise.all([loadTrip(), getDestinations(), loadExpenses()]);
    allDestinations.value = destResponse.data;
  } catch {
    errorMessage.value = 'Failed to load trip';
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div style="background-color: var(--color-paper); min-height: 100vh">
    <div class="max-w-6xl mx-auto px-6 py-12">
      <p v-if="isLoading" class="text-center py-20" style="color: var(--color-ink-faint); font-size: 16px">Loading trip details...</p>

      <div v-else-if="trip" class="space-y-12">
        <!-- Header -->
        <div>
          <div class="inline-flex items-center gap-3 mb-6">
            <div style="width: 4px; height: 24px; background-color: var(--color-secondary); border-radius: 2px"></div>
            <span class="tag-mono text-xs font-bold tracking-widest" style="color: var(--color-secondary); text-transform: uppercase">Planning</span>
          </div>
          <h1 class="font-display text-5xl font-bold mb-2" style="color: var(--color-ink)">{{ trip.title }}</h1>
          <p class="text-lg" style="color: var(--color-ink-soft)">{{ trip.peopleCount }} {{ trip.peopleCount === 1 ? 'traveler' : 'travelers' }} • {{ trip.destinations.length }} {{ trip.destinations.length === 1 ? 'destination' : 'destinations' }}</p>
        </div>

        <!-- Budget Section -->
        <div v-if="trip.budgetTotal" class="rounded-lg p-8" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
          <div class="flex items-start justify-between gap-8 mb-6">
            <div>
              <p class="tag-mono text-xs font-bold" style="color: var(--color-ink-faint); text-transform: uppercase">Budget Tracker</p>
              <p class="font-display text-4xl font-bold mt-3" :style="{ color: totalSpent > trip.budgetTotal ? 'var(--color-alert)' : 'var(--color-secondary)' }">
                €{{ totalSpent.toFixed(2) }}
              </p>
              <p class="text-sm mt-2" style="color: var(--color-ink-soft)">of €{{ trip.budgetTotal.toFixed(2) }}</p>
            </div>
            <div class="text-right">
              <div class="rounded-lg px-4 py-2" style="background-color: rgba(15, 82, 186, 0.1)">
                <p class="tag-mono text-xs font-bold" style="color: var(--color-accent); text-transform: uppercase">Remaining</p>
                <p class="font-display text-2xl font-bold mt-1" style="color: var(--color-accent)">€{{ Math.max(0, trip.budgetTotal - totalSpent).toFixed(2) }}</p>
              </div>
            </div>
          </div>
          <div class="w-full rounded-full h-3 overflow-hidden" style="background-color: var(--color-line)">
            <div
              class="h-full rounded-full transition-all"
              :style="{
                backgroundColor: totalSpent > trip.budgetTotal ? 'var(--color-alert)' : 'var(--color-secondary)',
                width: Math.min((totalSpent / trip.budgetTotal) * 100, 100) + '%'
              }"
            ></div>
          </div>
          <p class="text-xs mt-4 font-medium" :style="{ color: totalSpent > trip.budgetTotal ? 'var(--color-alert)' : 'var(--color-sage)' }">
            <span v-if="totalSpent > trip.budgetTotal">⚠ Over budget by €{{ (totalSpent - trip.budgetTotal).toFixed(2) }}</span>
            <span v-else>✓ {{ ((totalSpent / trip.budgetTotal) * 100).toFixed(0) }}% spent</span>
          </p>
        </div>

        <!-- Map -->
        <div v-if="firstDestination" class="h-96 rounded-lg overflow-hidden" style="border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
          <l-map :zoom="4" :center="[firstDestination.destination.latitude, firstDestination.destination.longitude]">
            <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <l-marker v-for="td in trip?.destinations" :key="td.destinationId" :lat-lng="[td.destination.latitude, td.destination.longitude]" />
          </l-map>
        </div>

        <!-- Destinations Section -->
        <div>
          <h2 class="font-display text-2xl font-bold mb-6" style="color: var(--color-ink)">Destinations ({{ trip.destinations.length }})</h2>

          <div v-if="trip.destinations.length === 0" class="text-center py-12 rounded-lg" style="background-color: var(--color-paper-dim); border: 1px dashed var(--color-line)">
            <p style="color: var(--color-ink-soft)">No destinations yet — add one below</p>
          </div>

          <div v-else class="space-y-4 mb-6">
            <div v-for="td in trip.destinations" :key="td.destinationId" class="rounded-lg p-6" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
              <div class="flex justify-between items-start gap-4 mb-4">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <div class="w-8 h-8 rounded-full flex items-center justify-center" style="background-color: var(--color-secondary)">
                      <p class="font-display font-bold text-sm" style="color: white">{{ td.position + 1 }}</p>
                    </div>
                    <h3 class="font-display text-xl font-bold" style="color: var(--color-ink)">{{ getName(td.destination) }}</h3>
                  </div>
                  <p class="text-sm" style="color: var(--color-ink-faint)">{{ td.destination.country }} • ★ {{ td.destination.popularityScore.toFixed(1) }}</p>
                </div>
                <button
                  type="button"
                  @click="startEditingAccommodation(td)"
                  class="px-4 py-2 rounded-lg transition-all font-medium text-sm"
                  :style="{
                    backgroundColor: td.accommodationName ? 'var(--color-secondary)' : 'var(--color-paper)',
                    color: td.accommodationName ? 'white' : 'var(--color-secondary)',
                    border: '1px solid var(--color-secondary)'
                  }"
                >
                  {{ td.accommodationName ? 'Edit' : 'Add accommodation' }}
                </button>
              </div>

              <p v-if="td.accommodationName" class="text-sm mb-4" style="color: var(--color-ink-soft)">
                📍 {{ td.accommodationName }}
                <span v-if="td.accommodationPrice" class="font-medium" style="color: var(--color-secondary)">— €{{ td.accommodationPrice }}/night</span>
              </p>

              <form v-if="editingDestinationId === td.destinationId" @submit.prevent="saveAccommodation" class="pt-4" style="border-top: 1px solid var(--color-line)">
                <div class="space-y-3 mb-4">
                  <input v-model="accommodationForm.accommodationName" type="text" placeholder="Accommodation name" class="w-full rounded-lg px-4 py-3 text-sm transition-all" :style="{ backgroundColor: 'var(--color-paper)', color: 'var(--color-ink)', border: '1px solid var(--color-line)' }" />
                  <input v-model.number="accommodationForm.accommodationPrice" type="number" placeholder="Price per night" class="w-full rounded-lg px-4 py-3 text-sm transition-all" :style="{ backgroundColor: 'var(--color-paper)', color: 'var(--color-ink)', border: '1px solid var(--color-line)' }" />
                  <input v-model="accommodationForm.accommodationUrl" type="text" placeholder="Link (optional)" class="w-full rounded-lg px-4 py-3 text-sm transition-all" :style="{ backgroundColor: 'var(--color-paper)', color: 'var(--color-ink)', border: '1px solid var(--color-line)' }" />
                </div>
                <div class="flex gap-2">
                  <button type="submit" :disabled="isSavingAccommodation" class="rounded-lg px-4 py-2 text-sm font-medium transition-all text-white disabled:opacity-60" style="background-color: var(--color-secondary)">
                    {{ isSavingAccommodation ? 'Saving...' : 'Save' }}
                  </button>
                  <button type="button" @click="editingDestinationId = null" class="text-sm px-4 py-2 rounded-lg transition-all" style="color: var(--color-ink-faint)">Cancel</button>
                </div>
              </form>
            </div>
          </div>

          <form @submit.prevent="handleAddDestination" class="flex gap-3">
            <select v-model="selectedDestinationId" class="flex-1 rounded-lg px-4 py-3 text-sm" :style="{ backgroundColor: 'var(--color-paper-dim)', color: 'var(--color-ink)', border: '1px solid var(--color-line)' }">
              <option value="" disabled>Select a destination to add</option>
              <option v-for="d in allDestinations" :key="d.id" :value="d.id">{{ getName(d) }}</option>
            </select>
            <button type="submit" :disabled="isAdding" class="rounded-lg px-6 py-3 font-semibold transition-all text-white disabled:opacity-60" style="background-color: var(--color-secondary)">
              Add
            </button>
          </form>
        </div>

        <!-- Expenses Section -->
        <div>
          <h2 class="font-display text-2xl font-bold mb-6" style="color: var(--color-ink)">Expenses ({{ expenses.length }})</h2>

          <div v-if="expenses.length === 0" class="text-center py-12 rounded-lg mb-6" style="background-color: var(--color-paper-dim); border: 1px dashed var(--color-line)">
            <p style="color: var(--color-ink-soft)">No expenses recorded yet</p>
          </div>

          <div v-else class="space-y-2 mb-6">
            <div v-for="expense in expenses" :key="expense.id" class="flex justify-between items-center rounded-lg px-6 py-4" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line)">
              <p style="color: var(--color-ink)">{{ expense.description }}</p>
              <div class="flex items-center gap-6">
                <span class="font-display font-semibold text-lg" style="color: var(--color-secondary)">€{{ expense.amount.toFixed(2) }}</span>
                <button @click="handleDeleteExpense(expense.id)" class="text-sm font-medium transition-all hover:opacity-70" style="color: var(--color-alert)">Remove</button>
              </div>
            </div>
          </div>

          <form @submit.prevent="handleAddExpense" class="flex gap-3">
            <input v-model="newExpenseDescription" type="text" placeholder="Expense description" class="flex-1 rounded-lg px-4 py-3 text-sm transition-all" :style="{ backgroundColor: 'var(--color-paper-dim)', color: 'var(--color-ink)', border: '1px solid var(--color-line)' }" />
            <input v-model.number="newExpenseAmount" type="number" placeholder="Amount (€)" class="w-32 rounded-lg px-4 py-3 text-sm transition-all" :style="{ backgroundColor: 'var(--color-paper-dim)', color: 'var(--color-ink)', border: '1px solid var(--color-line)' }" />
            <button type="submit" :disabled="isAddingExpense" class="rounded-lg px-6 py-3 font-semibold transition-all text-white disabled:opacity-60" style="background-color: var(--color-accent)">
              Add
            </button>
          </form>
        </div>

        <p v-if="errorMessage" class="rounded-lg px-6 py-4" style="color: var(--color-alert); background-color: rgba(239, 68, 68, 0.1)">{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>
