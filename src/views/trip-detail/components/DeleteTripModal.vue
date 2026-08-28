<script setup lang="ts">
import { useI18n } from 'vue-i18n';

defineProps<{
  isDeleting: boolean;
}>();

const emit = defineEmits<{
  cancel: [];
  confirm: [];
}>();

const { t } = useI18n();
</script>

<template>
  <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
    <div class="max-w-md w-full rounded-lg p-6 shadow-xl space-y-4" style="background-color: var(--color-paper); border: 1px solid var(--color-line)">
      <h3 class="font-display text-xl font-bold" style="color: var(--color-ink)">{{ t('tripDetail.confirmDeleteTitle') || 'Delete Trip?' }}</h3>
      <p class="text-sm" style="color: var(--color-ink-soft)">
        {{ t('tripDetail.confirmDeleteMessage') || 'Are you sure you want to delete this trip? This action cannot be undone.' }}
      </p>
      <div class="flex justify-end gap-3 pt-2">
        <button
          type="button"
          @click="emit('cancel')"
          class="px-5 py-2.5 text-sm font-semibold rounded-lg transition-all"
          style="color: var(--color-ink-soft); background-color: var(--color-paper-dim); border: 1px solid var(--color-line)"
        >
          {{ t('tripDetail.cancel') }}
        </button>
        <button
          type="button"
          @click="emit('confirm')"
          :disabled="isDeleting"
          class="px-5 py-2.5 text-sm font-semibold text-white rounded-lg transition-all hover:shadow-lg disabled:opacity-60"
          style="background-color: var(--color-alert)"
        >
          {{ isDeleting ? t('tripDetail.deleting') || 'Deleting...' : t('tripDetail.confirmDelete') || 'Delete' }}
        </button>
      </div>
    </div>
  </div>
</template>