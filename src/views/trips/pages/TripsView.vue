<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getTrips, createTrip } from '@/api/trips.api';
import type { Trip } from '@/types/trip.types';
import { useI18n } from 'vue-i18n';
import { isRequired, isPositiveNumber, isPositiveInteger, isDateRangeValid } from '@/utils/validation';

const trips = ref<Trip[]>([]);
const isLoading = ref(true);
const newTitle = ref('');
const isCreating = ref(false);
const errorMessage = ref('');
const newBudget = ref<number | null>(null);
const newPeopleCount = ref(1);
const newStartDate = ref('');
const newEndDate = ref('');
const { t } = useI18n();

const formErrors = ref({ title: '', budget: '', peopleCount: '', dateRange: '' });

function validateTitle() {
  formErrors.value.title = isRequired(newTitle.value) ? '' : t('trips.errors.titleRequired');
}

function validateBudget() {
  formErrors.value.budget = isPositiveNumber(newBudget.value) ? '' : t('trips.errors.budgetPositive');
}

function validatePeopleCount() {
  formErrors.value.peopleCount = isPositiveInteger(newPeopleCount.value) ? '' : t('trips.errors.peopleCountPositive');
}

function validateDateRange() {
  formErrors.value.dateRange = isDateRangeValid(newStartDate.value, newEndDate.value) ? '' : t('trips.errors.endDateBeforeStart');
}

function validateForm(): boolean {
  validateTitle();
  validateBudget();
  validatePeopleCount();
  validateDateRange();
  return !formErrors.value.title && !formErrors.value.budget && !formErrors.value.peopleCount && !formErrors.value.dateRange;
}

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
  if (!validateForm()) return;
  isCreating.value = true;
  errorMessage.value = '';
  try {
    await createTrip(
      newTitle.value.trim(),
      newBudget.value ?? undefined,
      newPeopleCount.value,
      newStartDate.value ? new Date(newStartDate.value).toISOString() : undefined,
      newEndDate.value ? new Date(newEndDate.value).toISOString() : undefined,
    );
    newTitle.value = '';
    newBudget.value = null;
    newPeopleCount.value = 1;
    newStartDate.value = '';
    newEndDate.value = '';
    formErrors.value = { title: '', budget: '', peopleCount: '', dateRange: '' };
    await loadTrips();
  } catch (error: any) {
    errorMessage.value = error.response?.data?.error || t('trips.failedCreate');
  } finally {
    isCreating.value = false;
  }
}

onMounted(async () => {
  try {
    await loadTrips();
  } catch {
    errorMessage.value = t('trips.failedLoad');
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div style="background-color: var(--color-paper); min-height: 100vh">
    <div class="max-w-5xl mx-auto px-6 py-12">
      <div class="mb-12">
        <div class="inline-flex items-center gap-3 mb-6">
          <div style="width: 4px; height: 24px; background-color: var(--color-secondary); border-radius: 2px"></div>
          <span class="tag-mono text-xs font-bold tracking-widest" style="color: var(--color-secondary); text-transform: uppercase">{{ t('trips.label') }}</span>
        </div>
        <h1 class="font-display text-5xl font-bold mb-4" style="color: var(--color-ink)">{{ t('trips.title') }}</h1>
        <p class="text-lg" style="color: var(--color-ink-soft)">{{ t('trips.description') }}</p>
      </div>

      <div class="rounded-lg p-8 mb-12" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
        <h2 class="font-display text-xl font-bold mb-6" style="color: var(--color-ink)">{{ t('trips.planNext') }}</h2>
        <form @submit.prevent="handleCreate" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <input
                v-model="newTitle"
                type="text"
                :placeholder="t('trips.tripName')"
                required
                class="w-full rounded-lg px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2"
                :style="{
                  backgroundColor: 'var(--color-paper)',
                  color: 'var(--color-ink)',
                  border: formErrors.title ? '1px solid var(--color-alert)' : '1px solid var(--color-line)',
                  '--tw-ring-color': 'var(--color-secondary)'
                }"
                @focus="handleInputFocus"
                @blur="(e) => { handleInputBlur(e); validateTitle(); }"
              />
              <p v-if="formErrors.title" class="text-xs mt-1" style="color: var(--color-alert)">{{ formErrors.title }}</p>
            </div>
            <div>
              <input
                v-model.number="newBudget"
                type="number"
                :placeholder="t('trips.budgetOptional')"
                class="w-full rounded-lg px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2"
                :style="{
                  backgroundColor: 'var(--color-paper)',
                  color: 'var(--color-ink)',
                  border: formErrors.budget ? '1px solid var(--color-alert)' : '1px solid var(--color-line)',
                  '--tw-ring-color': 'var(--color-secondary)'
                }"
                @focus="handleInputFocus"
                @blur="(e) => { handleInputBlur(e); validateBudget(); }"
              />
              <p v-if="formErrors.budget" class="text-xs mt-1" style="color: var(--color-alert)">{{ formErrors.budget }}</p>
            </div>
            <div>
              <input
                v-model.number="newPeopleCount"
                type="number"
                min="1"
                :placeholder="t('trips.numberOfPeople')"
                class="w-full rounded-lg px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2"
                :style="{
                  backgroundColor: 'var(--color-paper)',
                  color: 'var(--color-ink)',
                  border: formErrors.peopleCount ? '1px solid var(--color-alert)' : '1px solid var(--color-line)',
                  '--tw-ring-color': 'var(--color-secondary)'
                }"
                @focus="handleInputFocus"
                @blur="(e) => { handleInputBlur(e); validatePeopleCount(); }"
              />
              <p v-if="formErrors.peopleCount" class="text-xs mt-1" style="color: var(--color-alert)">{{ formErrors.peopleCount }}</p>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="tag-mono text-xs font-bold block mb-1.5" style="color: var(--color-ink-faint); text-transform: uppercase">{{ t('trips.startDate') }} ({{ t('common.optional') }})</label>
              <input
                v-model="newStartDate"
                type="date"
                class="w-full rounded-lg px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2"
                :style="{
                  backgroundColor: 'var(--color-paper)',
                  color: 'var(--color-ink)',
                  border: formErrors.dateRange ? '1px solid var(--color-alert)' : '1px solid var(--color-line)',
                  '--tw-ring-color': 'var(--color-secondary)'
                }"
                @focus="handleInputFocus"
                @blur="(e) => { handleInputBlur(e); validateDateRange(); }"
              />
            </div>
            <div>
              <label class="tag-mono text-xs font-bold block mb-1.5" style="color: var(--color-ink-faint); text-transform: uppercase">{{ t('trips.endDate') }} ({{ t('common.optional') }})</label>
              <input
                v-model="newEndDate"
                type="date"
                :min="newStartDate || undefined"
                class="w-full rounded-lg px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2"
                :style="{
                  backgroundColor: 'var(--color-paper)',
                  color: 'var(--color-ink)',
                  border: formErrors.dateRange ? '1px solid var(--color-alert)' : '1px solid var(--color-line)',
                  '--tw-ring-color': 'var(--color-secondary)'
                }"
                @focus="handleInputFocus"
                @blur="(e) => { handleInputBlur(e); validateDateRange(); }"
              />
            </div>
            <p v-if="formErrors.dateRange" class="text-xs md:col-span-2" style="color: var(--color-alert)">{{ formErrors.dateRange }}</p>
          </div>
          <button
            type="submit"
            :disabled="isCreating"
            class="rounded-lg px-6 py-3 font-semibold text-white transition-all hover:shadow-lg disabled:opacity-60"
            style="background-color: var(--color-secondary)"
          >
            <span v-if="isCreating">{{ t('trips.creating') }}</span>
            <span v-else>{{ t('trips.create') }}</span>
          </button>
        </form>
      </div>

      <p v-if="isLoading" class="text-center py-20" style="color: var(--color-ink-faint); font-size: 16px">{{ t('trips.loading') }}</p>

      <p v-else-if="errorMessage" class="text-center py-12 rounded-lg px-4" style="color: var(--color-alert); background-color: rgba(239, 68, 68, 0.1)">{{ errorMessage }}</p>

      <div v-else-if="trips.length === 0" class="text-center py-20 rounded-lg" style="background-color: var(--color-paper-dim); border: 1px dashed var(--color-line)">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color: var(--color-ink-faint); margin: 0 auto 16px">
          <path d="M12 2L15.09 8.26H22L17.45 12.74L19.54 19.26L12 15.02L4.46 19.26L6.55 12.74L2 8.26H8.91L12 2Z"/>
        </svg>
        <p class="text-lg font-semibold mb-2" style="color: var(--color-ink)">{{ t('trips.empty') }}</p>
        <p style="color: var(--color-ink-soft)">{{ t('trips.emptyDescription') }}</p>
      </div>

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
          <div class="flex items-start justify-between gap-4 mb-4">
            <div class="flex-1">
              <h3 class="font-display text-2xl font-bold" style="color: var(--color-ink)">{{ trip.title }}</h3>
              <p v-if="trip.startDate" class="text-sm mt-1" style="color: var(--color-ink-soft)">
                {{ new Date(trip.startDate).toLocaleDateString() }}
                <span v-if="trip.endDate"> — {{ new Date(trip.endDate).toLocaleDateString() }}</span>
              </p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shrink-0 group-hover:scale-110 transition-transform" :style="{ color: 'var(--color-secondary)' }">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <!-- People -->
            <div class="rounded-lg p-3" style="background-color: var(--color-paper); border: 1px solid var(--color-line)">
              <p class="tag-mono text-xs" style="color: var(--color-ink-faint); text-transform: uppercase">{{ t('trips.people') }}</p>
              <p class="font-display text-xl font-bold mt-1" style="color: var(--color-accent)">{{ trip.peopleCount }}</p>
            </div>

            <div class="rounded-lg p-3" style="background-color: var(--color-paper); border: 1px solid var(--color-line)">
              <p class="tag-mono text-xs" style="color: var(--color-ink-faint); text-transform: uppercase">{{ t('trips.budget') }}</p>
              <p class="font-display text-lg font-bold mt-1" style="color: var(--color-warning)">€{{ (trip.budgetTotal ?? 0).toFixed(0) }}</p>
            </div>

            <div class="rounded-lg p-3" style="background-color: var(--color-paper); border: 1px solid var(--color-line)">
              <p class="tag-mono text-xs" style="color: var(--color-ink-faint); text-transform: uppercase">{{ t('trips.status') }}</p>
              <p class="font-display text-lg font-bold mt-1" style="color: var(--color-sage)">{{ t('trips.active') }}</p>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>