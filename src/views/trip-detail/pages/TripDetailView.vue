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
import { useI18n } from 'vue-i18n';

const route = useRoute();
const tripId = route.params.id as string;
const { t, locale } = useI18n();

const trip = ref<TripWithDestinations | null>(null);
const allDestinations = ref<Destination[]>([]);
const selectedDestinationId = ref('');
const destinationSearch = ref('');
const newPlannedDate = ref('');
const isLoading = ref(true);
const isAdding = ref(false);
const errorMessage = ref('');

const editingDestinationId = ref<string | null>(null);
const accommodationForm = ref({ accommodationName: '', accommodationPrice: null as number | null, accommodationUrl: '' });
const isSavingAccommodation = ref(false);

const firstDestination = computed(() => trip.value?.destinations[0] ?? null);

const sortedDestinations = computed(() => {
  if (!trip.value) return [];
  return [...trip.value.destinations].sort((a, b) => {
    if (a.plannedDate && b.plannedDate) return a.plannedDate.localeCompare(b.plannedDate);
    if (a.plannedDate) return -1;
    if (b.plannedDate) return 1;
    return a.position - b.position;
  });
});

const availableDestinations = computed(() => {
  const addedDestinationIds = new Set(trip.value?.destinations.map((destination) => destination.destinationId));
  const search = destinationSearch.value.trim().toLocaleLowerCase();

  if (!search) return [];

  return allDestinations.value
    .filter((destination) => !addedDestinationIds.has(destination.id))
    .map((destination) => {
      const name = getName(destination).toLocaleLowerCase();
      const country = destination.country.toLocaleLowerCase();
      const slug = destination.slug.toLocaleLowerCase();
      const startsWithSearch = name.startsWith(search) || country.startsWith(search) || slug.startsWith(search);
      const includesSearch = name.includes(search) || country.includes(search) || slug.includes(search);

      return { destination, matchRank: !search ? 0 : startsWithSearch ? 1 : includesSearch ? 2 : 3 };
    })
    .filter(({ matchRank }) => matchRank < 3)
    .sort((a, b) => a.matchRank - b.matchRank || getName(a.destination).localeCompare(getName(b.destination)));
});

  const selectedDestination = computed(() => allDestinations.value.find((destination) => destination.id === selectedDestinationId.value));

const isOutOfDateRange = computed(() => {
  if (!newPlannedDate.value || !trip.value) return false;
  const date = newPlannedDate.value;
  if (trip.value.startDate && date < trip.value.startDate.slice(0, 10)) return true;
  if (trip.value.endDate && date > trip.value.endDate.slice(0, 10)) return true;
  return false;
});

const expenses = ref<Expense[]>([]);
const newExpenseDescription = ref('');
const newExpenseAmount = ref<number | null>(null);
const isAddingExpense = ref(false);

const totalSpent = computed(() => expenses.value.reduce((sum, e) => sum + e.amount, 0));

function getName(destination: Destination) {
  return destination.translations[locale.value]?.name ?? destination.translations.en?.name ?? destination.slug;
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
    errorMessage.value = t('tripDetail.failedAccommodation');
  } finally {
    isSavingAccommodation.value = false;
  }
}

async function handleAddDestination() {
  if (!selectedDestinationId.value) return;
  isAdding.value = true;
  errorMessage.value = '';
  try {
    await addDestinationToTrip(
      tripId,
      selectedDestinationId.value,
      newPlannedDate.value ? new Date(newPlannedDate.value).toISOString() : undefined,
    );
    selectedDestinationId.value = '';
    destinationSearch.value = '';
    newPlannedDate.value = '';
    await loadTrip();
  } catch (error: any) {
    errorMessage.value = error.response?.data?.error || t('tripDetail.failedDestination');
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

onMounted(async () => {
  try {
    const [, destResponse] = await Promise.all([loadTrip(), getDestinations(), loadExpenses()]);
    allDestinations.value = destResponse.data;
  } catch {
    errorMessage.value = t('tripDetail.failedLoad');
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen" style="background-color: var(--color-paper)">
    <div class="max-w-4xl mx-auto mt-14 px-4 pb-20">
      <p v-if="isLoading" class="text-center py-16" style="color: var(--color-ink-faint)">{{ t('tripDetail.loading') }}</p>

      <div v-else-if="trip" class="space-y-8">
        <div>
          <p class="tag-mono uppercase" style="color: var(--color-sage)">{{ t('tripDetail.expedition') }}</p>
          <h1 class="font-display text-4xl font-semibold tracking-tight mt-2" style="color: var(--color-ink)">{{ trip.title }}</h1>
          <p v-if="trip.startDate" class="text-sm mt-2" style="color: var(--color-ink-soft)">
            {{ new Date(trip.startDate).toLocaleDateString() }}
            <span v-if="trip.endDate"> — {{ new Date(trip.endDate).toLocaleDateString() }}</span>
          </p>
        </div>

        <hr class="route-divider" />

        <div v-if="trip.budgetTotal" class="rounded-xl p-6" style="background-color: var(--color-paper-dim); border: 1.5px solid var(--color-line)">
          <div class="flex justify-between items-center mb-4">
            <div>
              <p class="tag-mono uppercase" style="color: var(--color-ink-faint)">{{ t('tripDetail.budget') }}</p>
              <p class="font-display text-2xl font-semibold mt-2" :style="{ color: totalSpent > trip.budgetTotal ? 'var(--color-alert)' : 'var(--color-accent)' }">
                €{{ totalSpent.toFixed(2) }} / €{{ trip.budgetTotal.toFixed(2) }}
              </p>
            </div>
            <span class="text-sm font-medium" style="color: var(--color-ink-soft)">{{ trip.peopleCount }} {{ trip.peopleCount === 1 ? t('tripDetail.person') : t('tripDetail.people') }}</span>
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
            {{ totalSpent > trip.budgetTotal ? t('tripDetail.overBudget') : t('tripDetail.withinBudget') }}
          </p>
        </div>

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

        <div>
          <p class="tag-mono uppercase mb-4" style="color: var(--color-sage)">{{ t('tripDetail.destinations') }} ({{ trip.destinations.length }})</p>

          <div v-if="trip.destinations.length === 0" class="text-center py-8 rounded-xl" style="background-color: var(--color-paper-dim); border: 1.5px dashed var(--color-line)">
            <p style="color: var(--color-ink-soft)">{{ t('tripDetail.noDestinations') }}</p>
          </div>

          <div v-else class="flex flex-col gap-3 mb-6">
            <div
              v-for="(td, idx) in sortedDestinations"
              :key="td.destinationId"
              class="rounded-lg p-4 transition-all"
              style="background-color: var(--color-paper-dim); border: 1.5px solid var(--color-line)"
            >
              <div class="flex justify-between items-start gap-3 mb-2">
                <div>
                  <p class="font-display font-semibold" style="color: var(--color-accent)">{{ idx + 1 }}. {{ getName(td.destination) }}</p>
                  <p class="text-sm mt-1" style="color: var(--color-ink-faint)">{{ td.destination.country }}</p>
                  <p v-if="td.plannedDate" class="text-xs mt-1 font-medium" style="color: var(--color-sage)">
                    {{ new Date(td.plannedDate).toLocaleDateString() }}
                  </p>
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
                  {{ td.accommodationName ? t('tripDetail.edit') : t('tripDetail.addAccommodation') }}
                </button>
              </div>

              <p v-if="td.accommodationName" class="text-sm mt-2" style="color: var(--color-ink-soft)">
                {{ td.accommodationName }}
                <span v-if="td.accommodationPrice" class="font-medium" style="color: var(--color-accent)">
                  — €{{ td.accommodationPrice }}{{ t('tripDetail.night') }}
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
                  :placeholder="t('tripDetail.accommodationName')"
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
                  :placeholder="t('tripDetail.pricePerNight')"
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
                  :placeholder="t('tripDetail.linkOptional')"
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
                    {{ isSavingAccommodation ? t('tripDetail.saving') : t('tripDetail.save') }}
                  </button>
                  <button
                    type="button"
                    @click="editingDestinationId = null"
                    class="text-sm px-3 py-1.5 rounded transition-all"
                    style="color: var(--color-ink-faint)"
                  >
                    {{ t('tripDetail.cancel') }}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <form @submit.prevent="handleAddDestination" class="flex flex-col md:flex-row gap-2">
            <div class="flex-1 flex flex-col gap-2">
              <input
                v-model="destinationSearch"
                type="search"
                :placeholder="t('tripDetail.searchDestination')"
                class="w-full rounded-lg px-4 py-2.5 text-sm"
                :style="{ backgroundColor: 'var(--color-paper-dim)', color: 'var(--color-ink)', border: '1.5px solid var(--color-line)' }"
              />
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="item in availableDestinations"
                  :key="item.destination.id"
                  type="button"
                  @click="selectedDestinationId = item.destination.id"
                  class="rounded-lg px-3 py-2 text-sm text-left transition-all"
                  :style="{
                    backgroundColor: selectedDestinationId === item.destination.id ? 'var(--color-sage)' : 'var(--color-paper-dim)',
                    color: selectedDestinationId === item.destination.id ? 'white' : 'var(--color-ink)',
                    border: '1.5px solid ' + (selectedDestinationId === item.destination.id ? 'var(--color-sage)' : 'var(--color-line)')
                  }"
                >
                  <span class="font-medium">{{ getName(item.destination) }}</span>
                  <span class="block text-xs opacity-70">{{ item.destination.country }}</span>
                </button>
              </div>
              <p v-if="availableDestinations.length === 0" class="text-xs px-1" style="color: var(--color-ink-faint)">{{ t('tripDetail.noMatching') }}</p>
              <p v-else-if="selectedDestination" class="text-xs px-1" style="color: var(--color-sage)">
                {{ t('tripDetail.selected', { name: getName(selectedDestination) }) }}
              </p>
              <div>
                <input
                  v-model="newPlannedDate"
                  type="date"
                  class="rounded-lg px-3 py-2 text-sm transition-all"
                  :style="{
                    backgroundColor: 'var(--color-paper-dim)',
                    color: 'var(--color-ink)',
                    border: '1.5px solid var(--color-line)'
                  }"
                />
                <p v-if="isOutOfDateRange" class="text-xs mt-1" style="color: var(--color-alert)">
                  {{ t('tripDetail.dateOutsideRange') }}
                </p>
              </div>
            </div>
            <button
              type="submit"
              :disabled="isAdding || !selectedDestinationId"
              class="rounded-lg px-4 py-2.5 font-medium transition-all text-white disabled:opacity-60"
              style="background-color: var(--color-sage)"
            >
              {{ t('tripDetail.add') }}
            </button>
          </form>
        </div>

        <div>
          <p class="tag-mono uppercase mb-4" style="color: var(--color-accent)">{{ t('tripDetail.expenses') }} ({{ expenses.length }})</p>

          <div v-if="expenses.length === 0" class="text-center py-8 rounded-xl mb-6" style="background-color: var(--color-paper-dim); border: 1.5px dashed var(--color-line)">
            <p style="color: var(--color-ink-soft)">{{ t('tripDetail.noExpenses') }}</p>
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
                  {{ t('tripDetail.remove') }}
                </button>
              </div>
            </div>
          </div>

          <form @submit.prevent="handleAddExpense" class="flex gap-2">
            <input
              v-model="newExpenseDescription"
              type="text"
              :placeholder="t('tripDetail.expenseDescription')"
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
              :placeholder="t('tripDetail.amount')"
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
              {{ t('tripDetail.add') }}
            </button>
          </form>
        </div>

        <p v-if="errorMessage" class="rounded-lg px-4 py-3" style="color: var(--color-alert); background-color: rgba(179, 65, 58, 0.1)">{{ errorMessage }}</p>
      </div>
    </div>
  </div>
</template>