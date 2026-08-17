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
  <div class="max-w-3xl mx-auto mt-12 px-4 pb-16">
    <p v-if="isLoading" class="text-gray-500">Loading...</p>

    <div v-else-if="trip" class="space-y-8">
      <h1 class="text-2xl font-semibold text-gray-900">{{ trip.title }}</h1>

      <!-- Budget -->
      <div v-if="trip.budgetTotal" class="bg-gray-50 rounded-lg p-4">
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">
            Budget ({{ trip.peopleCount }} {{ trip.peopleCount === 1 ? 'person' : 'people' }})
          </span>
          <span class="font-medium" :class="totalSpent > trip.budgetTotal ? 'text-red-600' : 'text-gray-900'">
            €{{ totalSpent.toFixed(2) }} / €{{ trip.budgetTotal.toFixed(2) }}
          </span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden">
          <div
            class="h-full rounded-full transition-all"
            :class="totalSpent > trip.budgetTotal ? 'bg-red-500' : 'bg-blue-600'"
            :style="{ width: Math.min((totalSpent / trip.budgetTotal) * 100, 100) + '%' }"
          ></div>
        </div>
      </div>

      <!-- Map -->
      <div v-if="firstDestination" class="h-72 rounded-lg overflow-hidden border border-gray-200">
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

      <!-- Destinations -->
      <div>
        <h2 class="text-lg font-semibold text-gray-900 mb-3">Destinations</h2>

        <div v-if="trip.destinations.length === 0" class="text-sm text-gray-500 mb-4">
          No destinations yet — add one below.
        </div>

        <div v-else class="flex flex-col gap-2 mb-4">
          <div
            v-for="td in trip.destinations"
            :key="td.destinationId"
            class="border border-gray-200 rounded-lg p-3"
          >
            <div class="flex justify-between items-center">
              <span class="text-gray-900">{{ td.position + 1 }}. {{ getName(td.destination) }}</span>
              <button
                type="button"
                @click="startEditingAccommodation(td)"
                class="text-sm text-blue-600 hover:underline"
              >
                {{ td.accommodationName ? 'Edit accommodation' : 'Add accommodation' }}
              </button>
            </div>

            <p v-if="td.accommodationName" class="text-sm text-gray-600 mt-1">
              {{ td.accommodationName }}
              <span v-if="td.accommodationPrice"> — €{{ td.accommodationPrice }}/night</span>
            </p>

            <form
              v-if="editingDestinationId === td.destinationId"
              @submit.prevent="saveAccommodation"
              class="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-3"
            >
              <input
                v-model="accommodationForm.accommodationName"
                type="text"
                placeholder="Accommodation name"
                class="border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <input
                v-model.number="accommodationForm.accommodationPrice"
                type="number"
                placeholder="Price per night"
                class="border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <input
                v-model="accommodationForm.accommodationUrl"
                type="text"
                placeholder="Link (optional)"
                class="border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
              <div class="flex gap-2">
                <button
                  type="submit"
                  :disabled="isSavingAccommodation"
                  class="bg-blue-600 text-white rounded-md px-3 py-1.5 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  type="button"
                  @click="editingDestinationId = null"
                  class="text-sm text-gray-500 hover:underline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>

        <form @submit.prevent="handleAddDestination" class="flex gap-2">
          <select v-model="selectedDestinationId" class="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm">
            <option value="" disabled>Select a destination to add</option>
            <option v-for="d in allDestinations" :key="d.id" :value="d.id">{{ getName(d) }}</option>
          </select>
          <button
            type="submit"
            :disabled="isAdding"
            class="bg-blue-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            Add
          </button>
        </form>
      </div>

      <!-- Expenses -->
      <div>
        <h2 class="text-lg font-semibold text-gray-900 mb-3">Expenses</h2>

        <div v-if="expenses.length === 0" class="text-sm text-gray-500 mb-4">
          No expenses recorded yet.
        </div>

        <div v-else class="flex flex-col gap-2 mb-4">
          <div
            v-for="expense in expenses"
            :key="expense.id"
            class="flex justify-between items-center border border-gray-200 rounded-md px-3 py-2"
          >
            <span class="text-sm text-gray-700">{{ expense.description }}</span>
            <div class="flex items-center gap-3">
              <span class="text-sm font-medium text-gray-900">€{{ expense.amount.toFixed(2) }}</span>
              <button @click="handleDeleteExpense(expense.id)" class="text-xs text-red-600 hover:underline">
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
            class="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
          <input
            v-model.number="newExpenseAmount"
            type="number"
            placeholder="Amount"
            class="w-28 border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
          <button
            type="submit"
            :disabled="isAddingExpense"
            class="bg-blue-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            Add
          </button>
        </form>
      </div>

      <p v-if="errorMessage" class="text-red-600 text-sm">{{ errorMessage }}</p>
    </div>
  </div>
</template>