<script setup lang="ts">
import { useI18n } from 'vue-i18n';

defineProps<{
  title: string;
  startDate?: string | null;
  endDate?: string | null;
}>();

const emit = defineEmits<{
  edit: [];
  delete: [];
}>();

const { t } = useI18n();
</script>

<template>
  <div>
    <router-link
      to="/trips"
      class="inline-flex items-center gap-2 text-sm font-semibold transition-all hover:-translate-x-0.5"
      style="color: var(--color-ink-soft)"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <path d="M19 12H5"></path>
        <path d="M12 19l-7-7 7-7"></path>
      </svg>
      <span>{{ t('tripDetail.back') }}</span>
    </router-link>

    <div class="mt-6">
      <div class="inline-flex items-center gap-3 mb-6">
        <div style="width: 4px; height: 24px; background-color: var(--color-sage); border-radius: 2px"></div>
        <span class="tag-mono text-xs font-bold tracking-widest uppercase" style="color: var(--color-sage)">{{ t('tripDetail.expedition') }}</span>
      </div>

      <div class="flex items-start justify-between gap-6 mb-8">
        <div class="flex-1">
          <h1 class="font-display text-5xl font-bold mb-4" style="color: var(--color-ink)">{{ title }}</h1>
          <p v-if="startDate" class="text-lg" style="color: var(--color-ink-soft); line-height: 1.6">
            {{ new Date(startDate).toLocaleDateString() }}
            <span v-if="endDate"> — {{ new Date(endDate).toLocaleDateString() }}</span>
          </p>
        </div>

        <div class="flex items-center gap-3 shrink-0">
          <button
            type="button"
            @click="emit('edit')"
            class="rounded-lg px-6 py-3 font-semibold transition-all hover:shadow-lg hover:scale-105 flex items-center gap-2 text-white"
            style="background-color: var(--color-secondary)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z"></path>
            </svg>
            <span>{{ t('tripDetail.editTrip') || 'Edit' }}</span>
          </button>

          <button
            type="button"
            @click="emit('delete')"
            class="rounded-lg px-6 py-3 font-semibold transition-all hover:shadow-lg text-white hover:scale-105 flex items-center gap-2"
            style="background-color: var(--color-alert)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            <span>{{ t('tripDetail.deleteTrip') || 'Delete' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>