<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getTrips, createTrip } from '@/api/trips.api';
import type { Trip } from '@/types/trip.types';
import { useI18n } from 'vue-i18n';
import { formatCalendarDate } from '@/utils/formatDate';
import { isRequired, isPositiveNumber, isPositiveInteger, isDateRangeValid } from '@/utils/validation';
import { getTripStatus, type TripStatus } from '@/utils/tripStatus';
import { getApiErrorMessage } from '@/utils/apiError';
import PageHeader from '@/components/PageHeader.vue';

const STATUS_COLORS: Record<TripStatus, string> = {
  planning: 'var(--color-ink-faint)',
  upcoming: 'var(--color-accent)',
  active: 'var(--color-sage)',
  completed: 'var(--color-ink-faint)',
};

function statusLabel(status: TripStatus) {
  return t(`trips.statuses.${status}`);
}

const trips = ref<Trip[]>([]);
const isLoading = ref(true);
const newTitle = ref('');
const isCreating = ref(false);
const loadErrorMessage = ref('');
const createErrorMessage = ref('');
const newBudget = ref<number | null>(null);
const newPeopleCount = ref(1);
const newStartDate = ref('');
const newEndDate = ref('');
const { t, locale } = useI18n();

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

async function loadTrips() {
  const response = await getTrips();
  trips.value = response.data;
}

async function handleCreate() {
  if (!validateForm()) return;
  isCreating.value = true;
  createErrorMessage.value = '';
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
  } catch (error: unknown) {
    createErrorMessage.value = getApiErrorMessage(error, t('trips.failedCreate'));
  } finally {
    isCreating.value = false;
  }
}

onMounted(async () => {
  try {
    await loadTrips();
  } catch {
    loadErrorMessage.value = t('trips.failedLoad');
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="page-shell">
    <div class="page-container max-w-7xl">
      <PageHeader
        color="var(--color-secondary)"
        :label="t('trips.label')"
        :title="t('trips.title')"
        :description="t('trips.description')"
      />

      <div class="card-surface rounded-lg p-8 mb-12">
        <h2 class="font-display mb-6 text-xl font-bold text-ink">{{ t('trips.planNext') }}</h2>
        <form @submit.prevent="handleCreate" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <input
                v-model="newTitle"
                type="text"
                :placeholder="t('trips.tripName')"
                required
                class="trip-form-input"
                :class="formErrors.title ? 'border-alert' : 'border-line'"
                @blur="validateTitle"
              />
              <p v-if="formErrors.title" class="mt-1 text-xs text-alert">{{ formErrors.title }}</p>
            </div>
            <div>
              <input
                v-model.number="newBudget"
                type="number"
                :placeholder="t('trips.budgetOptional')"
                class="trip-form-input"
                :class="formErrors.budget ? 'border-alert' : 'border-line'"
                @blur="validateBudget"
              />
              <p v-if="formErrors.budget" class="mt-1 text-xs text-alert">{{ formErrors.budget }}</p>
            </div>
            <div>
              <input
                v-model.number="newPeopleCount"
                type="number"
                min="1"
                :placeholder="t('trips.numberOfPeople')"
                class="trip-form-input"
                :class="formErrors.peopleCount ? 'border-alert' : 'border-line'"
                @blur="validatePeopleCount"
              />
              <p v-if="formErrors.peopleCount" class="mt-1 text-xs text-alert">{{ formErrors.peopleCount }}</p>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="tag-mono mb-1.5 block text-xs font-bold uppercase text-ink-faint">{{ t('trips.startDate') }} ({{ t('common.optional') }})</label>
              <input
                v-model="newStartDate"
                type="date"
                class="trip-form-input"
                :class="formErrors.dateRange ? 'border-alert' : 'border-line'"
                @blur="validateDateRange"
              />
            </div>
            <div>
              <label class="tag-mono mb-1.5 block text-xs font-bold uppercase text-ink-faint">{{ t('trips.endDate') }} ({{ t('common.optional') }})</label>
              <input
                v-model="newEndDate"
                type="date"
                :min="newStartDate || undefined"
                class="trip-form-input"
                :class="formErrors.dateRange ? 'border-alert' : 'border-line'"
                @blur="validateDateRange"
              />
            </div>
            <p v-if="formErrors.dateRange" class="text-xs text-alert md:col-span-2">{{ formErrors.dateRange }}</p>
          </div>
          <button
            type="submit"
            :disabled="isCreating"
            class="rounded-lg bg-secondary px-6 py-3 font-semibold text-white transition-all hover:shadow-lg disabled:opacity-60"
          >
            <span v-if="isCreating">{{ t('trips.creating') }}</span>
            <span v-else>{{ t('trips.create') }}</span>
          </button>
          <p v-if="createErrorMessage" class="text-sm text-alert">{{ createErrorMessage }}</p>
        </form>
      </div>

      <p v-if="isLoading" class="py-20 text-center text-base text-ink-faint">{{ t('trips.loading') }}</p>

      <p v-else-if="loadErrorMessage" class="rounded-lg bg-alert/10 px-4 py-12 text-center text-alert">{{ loadErrorMessage }}</p>

      <div v-else-if="trips.length === 0" class="rounded-lg border border-dashed border-line bg-paper-dim py-20 text-center">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto mb-4 block text-ink-faint">
          <path d="M12 2L15.09 8.26H22L17.45 12.74L19.54 19.26L12 15.02L4.46 19.26L6.55 12.74L2 8.26H8.91L12 2Z"/>
        </svg>
        <p class="mb-2 text-lg font-semibold text-ink">{{ t('trips.empty') }}</p>
        <p class="text-ink-soft">{{ t('trips.emptyDescription') }}</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <router-link
          v-for="trip in trips"
          :key="trip.id"
          :to="`/trips/${trip.id}`"
          class="card-surface group rounded-lg p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
        >
          <div class="flex items-start justify-between gap-4 mb-4">
            <div class="flex-1">
              <h3 class="font-display text-2xl font-bold text-ink">{{ trip.title }}</h3>
              <p v-if="trip.startDate" class="mt-1 text-sm text-ink-soft">
                {{ formatCalendarDate(trip.startDate, locale) }}
                <span v-if="trip.endDate"> — {{ formatCalendarDate(trip.endDate, locale) }}</span>
              </p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shrink-0 group-hover:scale-110 transition-transform" :style="{ color: 'var(--color-secondary)' }">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div class="rounded-lg p-3" style="background-color: var(--color-paper); border: 1px solid var(--color-line)">
              <p class="tag-mono text-xs uppercase text-ink-faint">{{ t('trips.people') }}</p>
              <p class="mt-1 font-display text-xl font-bold text-accent">{{ trip.peopleCount }}</p>
            </div>

            <div class="rounded-lg p-3" style="background-color: var(--color-paper); border: 1px solid var(--color-line)">
              <p class="tag-mono text-xs uppercase text-ink-faint">{{ t('trips.budget') }}</p>
              <p class="mt-1 font-display text-lg font-bold text-warning">€{{ (trip.budgetTotal ?? 0).toFixed(0) }}</p>
            </div>

            <div class="rounded-lg p-3" style="background-color: var(--color-paper); border: 1px solid var(--color-line)">
              <p class="tag-mono text-xs uppercase text-ink-faint">{{ t('trips.status') }}</p>
              <p class="font-display text-lg font-bold mt-1" :style="{ color: STATUS_COLORS[getTripStatus(trip.startDate, trip.endDate)] }">
                {{ statusLabel(getTripStatus(trip.startDate, trip.endDate)) }}
              </p>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>