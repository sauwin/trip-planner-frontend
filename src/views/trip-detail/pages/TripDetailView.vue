<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getTrip, addDestinationToTrip, updateAccommodation, updateTrip, deleteTrip, deleteDestinationFromTrip } from '@/api/trips.api';
import { getDestinations } from '@/api/destinations.api';
import type { TripWithDestinations } from '@/types/trip.types';
import type { Destination } from '@/types/destination.types';
import { createExpense, getExpenses, deleteExpense } from '@/api/expenses.api';
import type { Expense } from '@/types/expense.types';
import { useI18n } from 'vue-i18n';

import TripHeader from '../components/TripHeader.vue';
import TripBudgetSummary from '../components/TripBudgetSummary.vue';
import TripMap from '../components/TripMap.vue';
import TripDestinationsList from '../components/TripDestinationsList.vue';
import ExpensesList from '../components/ExpensesList.vue';
import EditTripModal from '../components/EditTripModal.vue';
import DeleteTripModal from '../components/DeleteTripModal.vue';

const route = useRoute();
const router = useRouter();
const tripId = route.params.id as string;
const { t } = useI18n();

const trip = ref<TripWithDestinations | null>(null);
const allDestinations = ref<Destination[]>([]);
const expenses = ref<Expense[]>([]);

const isLoading = ref(true);
const isAdding = ref(false);
const isDeleting = ref(false);
const isSavingAccommodation = ref(false);
const isSavingTrip = ref(false);
const isAddingExpense = ref(false);

const showDeleteConfirm = ref(false);
const showEditModal = ref(false);
const editingDestinationId = ref<string | null>(null);
const errorMessage = ref('');

const totalSpent = computed(() => expenses.value.reduce((sum, e) => sum + e.amount, 0));

const sortedDestinations = computed(() => {
  if (!trip.value) return [];
  return [...trip.value.destinations].sort((a, b) => {
    if (a.plannedDate && b.plannedDate) return a.plannedDate.localeCompare(b.plannedDate);
    if (a.plannedDate) return -1;
    if (b.plannedDate) return 1;
    return a.position - b.position;
  });
});

async function loadTrip() {
  const response = await getTrip(tripId);
  trip.value = response.data;
}

async function loadExpenses() {
  const response = await getExpenses(tripId);
  expenses.value = response.data;
}

async function handleSaveTrip(payload: { title: string; budgetTotal: number | null; peopleCount: number; startDate: string; endDate: string }) {
  isSavingTrip.value = true;
  errorMessage.value = '';
  try {
    await updateTrip(tripId, {
      title: payload.title.trim(),
      budgetTotal: payload.budgetTotal ?? undefined,
      peopleCount: payload.peopleCount,
      startDate: payload.startDate ? new Date(payload.startDate).toISOString() : undefined,
      endDate: payload.endDate ? new Date(payload.endDate).toISOString() : undefined,
    });
    showEditModal.value = false;
    await loadTrip();
  } catch (error: any) {
    errorMessage.value = error.response?.data?.error || t('tripDetail.failedTripUpdate');
  } finally {
    isSavingTrip.value = false;
  }
}

async function handleAddDestination(destinationId: string, plannedDate: string) {
  isAdding.value = true;
  errorMessage.value = '';
  try {
    await addDestinationToTrip(tripId, destinationId, plannedDate ? new Date(plannedDate).toISOString() : undefined);
    await loadTrip();
  } catch (error: any) {
    errorMessage.value = error.response?.data?.error || t('tripDetail.failedDestination');
  } finally {
    isAdding.value = false;
  }
}

async function handleRemoveDestination(destinationId: string) {
  try {
    await deleteDestinationFromTrip(tripId, destinationId);
    await loadTrip();
  } catch {
    errorMessage.value = t('tripDetail.failedDestinationDelete');
  }
}

async function handleSaveAccommodation(
  destinationId: string,
  payload: { accommodationName: string; accommodationPrice: number | null; accommodationUrl: string },
) {
  isSavingAccommodation.value = true;
  try {
    await updateAccommodation(tripId, destinationId, {
      accommodationName: payload.accommodationName || undefined,
      accommodationPrice: payload.accommodationPrice ?? undefined,
      accommodationUrl: payload.accommodationUrl || undefined,
    });
    editingDestinationId.value = null;
    await loadTrip();
  } catch {
    errorMessage.value = t('tripDetail.failedAccommodation');
  } finally {
    isSavingAccommodation.value = false;
  }
}

async function handleAddExpense(description: string, amount: number) {
  isAddingExpense.value = true;
  try {
    await createExpense(tripId, description, amount);
    await loadExpenses();
  } catch {
    errorMessage.value = t('tripDetail.failedExpenseAdd');
  } finally {
    isAddingExpense.value = false;
  }
}

async function handleDeleteExpense(expenseId: string) {
  try {
    await deleteExpense(tripId, expenseId);
    await loadExpenses();
  } catch {
    errorMessage.value = t('tripDetail.failedExpenseDelete');
  }
}

async function handleDeleteTrip() {
  isDeleting.value = true;
  try {
    await deleteTrip(tripId);
    router.replace('/');
  } catch {
    errorMessage.value = t('tripDetail.failedTripDelete');
    showDeleteConfirm.value = false;
  } finally {
    isDeleting.value = false;
  }
}

onMounted(async () => {
  try {
    const [, destResponse] = await Promise.all([loadTrip(), getDestinations({ limit: 100 }), loadExpenses()]);
    allDestinations.value = destResponse.data.items;
  } catch {
    errorMessage.value = t('tripDetail.failedLoad');
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div style="background-color: var(--color-paper); min-height: 100vh">
    <div class="max-w-6xl mx-auto px-6 py-12">
      <p v-if="isLoading" class="text-center py-20" style="color: var(--color-ink-faint); font-size: 16px">{{ t('tripDetail.loading') }}</p>

      <div v-else-if="trip" class="space-y-12">
        <TripHeader
          :title="trip.title"
          :start-date="trip.startDate"
          :end-date="trip.endDate"
          @edit="showEditModal = true"
          @delete="showDeleteConfirm = true"
        />

        <TripBudgetSummary
          v-if="trip.budgetTotal"
          :budget-total="trip.budgetTotal"
          :total-spent="totalSpent"
          :people-count="trip.peopleCount"
        />

        <TripMap :destinations="trip.destinations" />

        <TripDestinationsList
          :destinations="sortedDestinations"
          :all-destinations="allDestinations"
          :trip-start-date="trip.startDate"
          :trip-end-date="trip.endDate"
          :is-adding="isAdding"
          :editing-destination-id="editingDestinationId"
          :is-saving-accommodation="isSavingAccommodation"
          @add-destination="handleAddDestination"
          @remove-destination="handleRemoveDestination"
          @start-edit="(id) => (editingDestinationId = id)"
          @cancel-edit="editingDestinationId = null"
          @save-accommodation="handleSaveAccommodation"
        />

        <ExpensesList
          :expenses="expenses"
          :is-adding="isAddingExpense"
          @add-expense="handleAddExpense"
          @delete-expense="handleDeleteExpense"
        />

        <p v-if="errorMessage" class="rounded-lg px-4 py-3 text-center" style="color: var(--color-alert); background-color: rgba(179, 65, 58, 0.1)">{{ errorMessage }}</p>
      </div>
    </div>

    <EditTripModal
      v-if="showEditModal && trip"
      :trip="trip"
      :is-saving="isSavingTrip"
      @cancel="showEditModal = false"
      @save="handleSaveTrip"
    />

    <DeleteTripModal
      v-if="showDeleteConfirm"
      :is-deleting="isDeleting"
      @cancel="showDeleteConfirm = false"
      @confirm="handleDeleteTrip"
    />
  </div>
</template>