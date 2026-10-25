<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import PageHeader from '@/components/PageHeader.vue';

const { t } = useI18n();
</script>

<template>
  <div class="page-shell">
    <div class="page-container max-w-7xl">
      <PageHeader
        color="var(--color-secondary)"
        :label="t('terms.label')"
        :title="t('terms.title')"
        :description="t('terms.description')"
      />

      <!-- TODO: replace this placeholder with the real content -->
      <div class="rounded-lg border border-dashed border-line bg-paper-dim py-20 text-center">
        <p class="mb-2 text-lg font-semibold text-ink">{{ t('terms.comingSoon') }}</p>
        <p class="text-ink-soft">{{ t('terms.comingSoonDescription') }}</p>
      </div>
    </div>
  </div>
</template>