<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getInteractions } from '@/api/interactions.api';
import { getTrips } from '@/api/trips.api';
import type { Interaction } from '@/types/interaction.types';
import type { TripWithFinancials } from '@/types/trip.types';
import { useI18n } from 'vue-i18n';
import PageHeader from '@/components/PageHeader.vue';
import DashboardStats from '../components/DashboardStats.vue';
import TripCostPerDayChart from '../components/TripCostPerDayChart.vue';
import CumulativeRecordedExpensesChart from '../components/CumulativeRecordedExpensesChart.vue';
import BudgetVsActualSection from '../components/BudgetVsActualSection.vue';
import SpendingBreakdownSection from '../components/SpendingBreakdownSection.vue';
import CountryInterestBreakdown from '../components/CountryInterestBreakdown.vue';
import RecentActivityList from '../components/RecentActivityList.vue';
import { createDashboardExportSheets } from '@/utils/dashboardExport';
import type { PdfReportSection } from '@/utils/exportReports';

const interactions = ref<Interaction[]>([]);
const trips = ref<TripWithFinancials[]>([]);
const isLoading = ref(true);
const errorMessage = ref('');
const exportError = ref('');
const { t, locale } = useI18n();
const exportFormats = ['pdf', 'csv', 'xlsx'] as const;

function createExportSheets() {
  return createDashboardExportSheets(interactions.value, trips.value, locale.value, {
    overview: t('dashboard.exportOverview'),
    metric: t('dashboard.exportMetric'),
    value: t('dashboard.exportValue'),
    totalInteractions: t('dashboard.totalActivity'),
    likes: t('dashboard.favorites'),
    saved: t('dashboard.saved'),
    averageRating: t('dashboard.avgRating'),
    countries: t('dashboard.countriesOfInterest'),
    tripsCount: t('dashboard.tripsTracked'),
    tripSummary: t('dashboard.exportTrips'),
    trip: t('dashboard.exportTrip'),
    startDate: t('dashboard.exportStartDate'),
    endDate: t('dashboard.exportEndDate'),
    budget: t('dashboard.exportBudget'),
    trackedCost: t('charts.trackedCost'),
    people: t('dashboard.exportPeople'),
    category: t('dashboard.exportCategory'),
    accommodation: t('charts.estimatedAccommodation'),
    transport: t('tripDetail.expenseCategories.TRANSPORT'),
    food: t('tripDetail.expenseCategories.FOOD'),
    activities: t('tripDetail.expenseCategories.ACTIVITIES'),
    other: t('tripDetail.expenseCategories.OTHER'),
    total: t('dashboard.exportTotal'),
    activity: t('dashboard.exportActivity'),
    destination: t('dashboard.exportDestination'),
    country: t('dashboard.exportCountry'),
    type: t('dashboard.exportType'),
    valueColumn: t('dashboard.exportValue'),
    date: t('dashboard.exportDate'),
    noData: t('dashboard.exportNoData'),
    cumulativeExpenses: t('charts.cumulativeExpenseTrend'),
    monthlyAmount: t('charts.recordedExpenses'),
    cumulativeAmount: t('charts.cumulativeExpenses'),
    dailyTripCosts: t('charts.tripCostPerDay'),
    dailyCostPerPerson: t('charts.dailyCostPerPerson'),
    tripDays: t('charts.tripDays'),
    interestedDestinations: t('dashboard.interestedDestinations'),
    interactionBreakdown: t('dashboard.exportInteractionBreakdown'),
    countryBreakdown: t('dashboard.exportCountries'),
    rating: t('dashboard.ratings'),
    tripExpenses: t('dashboard.exportExpenseDetails'),
    expenseDate: t('dashboard.exportDate'),
    expenseAmount: t('dashboard.exportExpenseAmount'),
    byCategory: t('dashboard.exportTripCategoryTotals'),
    tripCategory: t('dashboard.exportTripCategory'),
  });
}

async function exportDashboard(format: 'pdf' | 'csv' | 'xlsx') {
  exportError.value = '';
  const sheets = createExportSheets();
  const filename = `tripplanner-dashboard-${new Date().toISOString().slice(0, 10)}`;

  try {
    const { downloadFormattedPdf, exportSheetsToCsv, exportSheetsToXlsx } = await import('@/utils/exportReports');
    if (format === 'csv') {
      exportSheetsToCsv(sheets, `${filename}.csv`);
    } else if (format === 'xlsx') {
      exportSheetsToXlsx(sheets, `${filename}.xlsx`);
    } else {
      const sections: PdfReportSection[] = sheets.map((sheet) => ({
        title: sheet.name,
        columns: sheet.rows[0]?.map(String) ?? [],
        rows: sheet.rows.slice(1),
      }));
      await downloadFormattedPdf(
        t('dashboard.exportTitle'),
        t('dashboard.exportedOn', { date: new Date().toLocaleDateString(locale.value) }),
        sections,
        `${filename}.pdf`,
      );
    }
  } catch {
    exportError.value = t('dashboard.exportFailed');
  }
}

onMounted(async () => {
  try {
    const [interactionsResp, tripsResp] = await Promise.all([
      getInteractions(),
      getTrips(),
    ]);
    interactions.value = interactionsResp.data.filter(({ type }) => type !== 'VIEW');
    trips.value = tripsResp.data;
  } catch {
    errorMessage.value = t('dashboard.failed');
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="page-shell">
    <div class="page-container max-w-7xl">

      <PageHeader
        color="var(--color-accent-dark)"
        :label="t('dashboard.label')"
        :title="t('dashboard.title')"
        :description="t('dashboard.description')"
      />

      <div data-export-ignore class="-mt-6 mb-8 flex flex-col items-end gap-3">
        <span class="tag-mono text-xs font-bold uppercase tracking-widest text-ink-faint">{{ t('dashboard.exportLabel') }}</span>
        <div class="flex flex-wrap items-center gap-3">
        <button
          v-for="format in exportFormats"
          :key="format"
          type="button"
          :disabled="isLoading || Boolean(errorMessage)"
          class="inline-flex items-center gap-2 rounded-lg border border-accent bg-paper-dim px-5 py-3 font-semibold text-accent transition-colors hover:bg-accent/10 disabled:cursor-not-allowed disabled:opacity-60"
          @click="exportDashboard(format)"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <path d="M14 2v6h6M8 13h8M8 17h5" />
          </svg>
          {{ t(`dashboard.export${format.toUpperCase()}`) }}
        </button>
        </div>
      </div>
      <p v-if="exportError" data-export-ignore class="mb-5 rounded-lg bg-alert/10 px-4 py-3 text-sm text-alert" role="alert">{{ exportError }}</p>

      <p v-if="isLoading" class="py-20 text-center text-base text-ink-faint">{{ t('dashboard.loading') }}</p>

      <p v-else-if="errorMessage" class="py-16 text-center text-alert">{{ errorMessage }}</p>

      <div v-else-if="interactions.length === 0 && trips.length === 0" class="rounded-lg border border-dashed border-line bg-paper-dim py-20 text-center">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="mx-auto mb-4 block text-ink-faint">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <p class="mb-2 text-lg font-semibold text-ink">{{ t('dashboard.noActivity') }}</p>
        <p class="text-ink-soft">{{ t('dashboard.noActivityDescription') }}</p>
      </div>

      <div v-else class="space-y-12">
        <DashboardStats :interactions="interactions" :trips="trips" />
        <CumulativeRecordedExpensesChart :trips="trips" />
        <TripCostPerDayChart :trips="trips" />
        <BudgetVsActualSection :trips="trips" />
        <SpendingBreakdownSection :trips="trips" />
        <CountryInterestBreakdown :interactions="interactions" />
        <RecentActivityList :interactions="interactions" />
      </div>
    </div>
  </div>
</template>