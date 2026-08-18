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
  <div class="min-h-screen" style="background-color: var(--color-paper)">
    <div class="max-w-4xl mx-auto mt-14 px-4 pb-20">
      <p v-if="isLoading" class="text-center py-16" style="color: var(--color-ink-faint)">Loading trip details...</p>

      <div v-else-if="trip" class="space-y-8">
        <!-- Header -->
        <div>
          <p class="tag-mono uppercase" style="color: var(--color-sage)">Expedition</p>
          <h1 class="font-display text-4xl font-semibold tracking-tight mt-2" style="color: var(--color-ink)">{{ trip.title }}</h1>
        </div>

        <hr class="route-divider" />

        <!-- Budget Section -->
        <div v-if="trip.budgetTotal" class="rounded-xl p-6" style="background-color: var(--color-paper-dim); border: 1.5px solid var(--color-line)">
          <div class="flex justify-between items-center mb-4">
            <div>
              <p class="tag-mono uppercase" style="color: var(--color-ink-faint)">Budget</p>
              <p class="font-display text-2xl font-semibold mt-2" :style="{ color: totalSpent > trip.budgetTotal ? 'var(--color-alert)' : 'var(--color-accent)' }">
                €{{ totalSpent.toFixed(2) }} / €{{ trip.budgetTotal.toFixed(2) }}
              </p>
            </div>
            <span class="text-sm font-medium" style="color: var(--color-ink-soft)">{{ trip.peopleCount }} {{ trip.peopleCount === 1 ? 'person' : 'people' }}</span>
          </div>
          <div class="w-full rounded-full h-2.5 overflow-hidden" style="background-color: var(--color-line)">
            <div
              class="h-full rounded-full transition-all"
              :style="{
                backgroundColor: totalSpent > trip.budgetTotal ? 'var(--color-alert)' : 'var(--color-accent)',
                width: Math.min((totalSpent / trip.budgetTotal) * 100, 100) + '%'
              }"
            ></div>
          </div>
          <p class="text-xs mt-3" :style="{ color: totalSpent > trip.budgetTotal ? 'var(--color-alert)' : 'var(--color-sage)' }">
            {{ totalSpent > trip.budgetTotal ? '⚠ Over budget' : '✓ Within budget' }}
          </p>
        </div>

        <!-- Map -->
        <div v-if="firstDestination" class="h-96 rounded-xl overflow-hidden" style="border: 1.5px solid var(--color-line)">
          <l-map
            :zoom="4"
            :center="[firstDestination.destination.latitude, firstDestination.destination.longitude]"
          >
            <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <l-marker
              v-for="td in trip?.destinations"
              :key="td.destinationId"
              :lat-lng="[td.destination.latitude, td.destination.longitude]"
            />
          </l-map>
        </div>

        <!-- Destinations Section -->
        <div>
          <p class="tag-mono uppercase mb-4" style="color: var(--color-sage)">Destinations ({{ trip.destinations.length }})</p>

          <div v-if="trip.destinations.length === 0" class="text-center py-8 rounded-xl" style="background-color: var(--color-paper-dim); border: 1.5px dashed var(--color-line)">
            <p style="color: var(--color-ink-soft)">No destinations yet — add one below</p>
          </div>

          <div v-else class="flex flex-col gap-3 mb-6">
            <div
              v-for="td in trip.destinations"
              :key="td.destinationId"
              class="rounded-lg p-4 transition-all"
              style="background-color: var(--color-paper-dim); border: 1.5px solid var(--color-line)"
            >
              <div class="flex justify-between items-start gap-3 mb-2">
                <div>
                  <p class="font-display font-semibold" style="color: var(--color-accent)">{{ td.position + 1 }}. {{ getName(td.destination) }}</p>
                  <p class="text-sm mt-1" style="color: var(--color-ink-faint)">{{ td.destination.country }}</p>
                </div>
                <button
                  type="button"
                  @click="startEditingAccommodation(td)"
                  class="text-sm px-3 py-1 rounded transition-all font-medium"
                  :style="{
                    backgroundColor: td.accommodationName ? 'var(--color-sage)' : 'var(--color-paper)',
                    color: td.accommodationName ? 'white' : 'var(--color-sage)',
                    border: '1px solid var(--color-sage)'
                  }"
                >
                  {{ td.accommodationName ? 'Edit' : 'Add accommodation' }}
                </button>
              </div>

              <p v-if="td.accommodationName" class="text-sm mt-2" style="color: var(--color-ink-soft)">
                {{ td.accommodationName }}
                <span v-if="td.accommodationPrice" class="font-medium" style="color: var(--color-accent)">
                  — €{{ td.accommodationPrice }}/night
                </span>
              </p>

              <form
                v-if="editingDestinationId === td.destinationId"
                @submit.prevent="saveAccommodation"
                class="mt-4 pt-4 flex flex-col gap-2"
                style="border-top: 1px solid var(--color-line)"
              >
                <input
                  v-model="accommodationForm.accommodationName"
                  type="text"
                  placeholder="Accommodation name"
                  class="rounded-lg px-3 py-2 text-sm transition-all"
                  :style="{
                    backgroundColor: 'var(--color-paper)',
                    color: 'var(--color-ink)',
                    border: '1.5px solid var(--color-line)'
                  }"
                />
                <input
                  v-model.number="accommodationForm.accommodationPrice"
                  type="number"
                  placeholder="Price per night"
                  class="rounded-lg px-3 py-2 text-sm transition-all"
                  :style="{
                    backgroundColor: 'var(--color-paper)',
                    color: 'var(--color-ink)',
                    border: '1.5px solid var(--color-line)'
                  }"
                />
                <input
                  v-model="accommodationForm.accommodationUrl"
                  type="text"
                  placeholder="Link (optional)"
                  class="rounded-lg px-3 py-2 text-sm transition-all"
                  :style="{
                    backgroundColor: 'var(--color-paper)',
                    color: 'var(--color-ink)',
                    border: '1.5px solid var(--color-line)'
                  }"
                />
                <div class="flex gap-2">
                  <button
                    type="submit"
                    :disabled="isSavingAccommodation"
                    class="rounded-lg px-3 py-1.5 text-sm font-medium transition-all text-white disabled:opacity-60"
                    style="background-color: var(--color-sage)"
                  >
                    {{ isSavingAccommodation ? 'Saving...' : 'Save' }}
                  </button>
                  <button
                    type="button"
                    @click="editingDestinationId = null"
                    class="text-sm px-3 py-1.5 rounded transition-all"
                    style="color: var(--color-ink-faint)"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>

          <form @submit.prevent="handleAddDestination" class="flex gap-2">
            <select v-model="selectedDestinationId" class="flex-1 rounded-lg px-4 py-2.5 text-sm" :style="{ backgroundColor: 'var(--color-paper-dim)', color: 'var(--color-ink)', border: '1.5px solid var(--color-line)' }">
              <option value="" disabled>Select a destination to add</option>
              <option v-for="d in allDestinations" :key="d.id" :value="d.id">{{ getName(d) }}</option>
            </select>
            <button
              type="submit"
              :disabled="isAdding"
              class="rounded-lg px-4 py-2.5 font-medium transition-all text-white disabled:opacity-60"
              style="background-color: var(--color-sage)"
            >
              Add
            </button>
          </form>
        </div>

        <!-- Expenses Section -->
        <div>
          <p class="tag-mono uppercase mb-4" style="color: var(--color-accent)">Expenses ({{ expenses.length }})</p>

          <div v-if="expenses.length === 0" class="text-center py-8 rounded-xl mb-6" style="background-color: var(--color-paper-dim); border: 1.5px dashed var(--color-line)">
            <p style="color: var(--color-ink-soft)">No expenses recorded yet</p>
          </div>

          <div v-else class="flex flex-col gap-2 mb-6">
            <div
              v-for="expense in expenses"
              :key="expense.id"
              class="flex justify-between items-center rounded-lg px-4 py-3"
              style="background-color: var(--color-paper-dim); border: 1.5px solid var(--color-line)"
            >
              <p style="color: var(--color-ink)">{{ expense.description }}</p>
              <div class="flex items-center gap-4">
                <span class="font-display font-semibold" style="color: var(--color-accent)">€{{ expense.amount.toFixed(2) }}</span>
                <button @click="handleDeleteExpense(expense.id)" class="text-sm font-medium" style="color: var(--color-alert)">
                  Remove
                </button>
              </div>
            </div>
          </div>

          <form @submit.prevent="handleAddExpense" class="flex gap-2">
            <input
              v-model="newExpenseDescription"
              type="text"
              placeholder="Expense description"
              class="flex-1 rounded-lg px-4 py-2.5 text-sm transition-all"
              :style="{
                backgroundColor: 'var(--color-paper-dim)',
                color: 'var(--color-ink)',
                border: '1.5px solid var(--color-line)'
              }"
            />
            <input
              v-model.number="newExpenseAmount"
              type="number"
              placeholder="Amount (€)"
              class="w-28 rounded-lg px-4 py-2.5 text-sm transition-all"
              :style="{
                backgroundColor: 'var(--color-paper-dim)',
                color: 'var(--color-ink)',
                border: '1.5px solid var(--color-line)'
              }"
            />
            <button
              type="submit"
              :disabled="isAddingExpense"
              class="rounded-lg px-4 py-2.5 font-medium transition-all text-white disabled:opacity-60"
              style="background-color: var(--color-accent)"
            >
              Add
            </button>
          </form>
        </div>

        <p v-if="errorMessage" class="rounded-lg px-4 py-3" style="color: var(--color-alert); background-color: rgba(179, 65, 58, 0.1)">{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>