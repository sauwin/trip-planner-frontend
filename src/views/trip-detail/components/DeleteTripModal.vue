<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useEscapeKey } from '@/composables/useEscapeKey';

defineProps<{
  isDeleting: boolean;
}>();

const emit = defineEmits<{
  cancel: [];
  confirm: [];
}>();

const { t } = useI18n();

useEscapeKey(() => emit('cancel'));
</script>

<template>
  <div class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" @click.self="emit('cancel')">
    <div class="max-w-md w-full rounded-lg p-6 shadow-xl space-y-4" style="background-color: var(--color-paper); border: 1px solid var(--color-line)">
      <h3 class="font-display text-xl font-bold" style="color: var(--color-ink)">{{ t('tripDetail.confirmDeleteTitle') }}</h3>
      <p class="text-sm" style="color: var(--color-ink-soft)">
        {{ t('tripDetail.confirmDeleteMessage') }}
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
          {{ isDeleting ? t('tripDetail.deleting') : t('tripDetail.confirmDelete') }}
        </button>
      </div>
    </div>
  </div>
</template>