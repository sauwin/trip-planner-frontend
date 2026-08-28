<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  budgetTotal: number;
  totalSpent: number;
  peopleCount: number;
}>();

const { t } = useI18n();

const isOverBudget = computed(() => props.totalSpent > props.budgetTotal);
const progressPercent = computed(() => Math.min((props.totalSpent / props.budgetTotal) * 100, 100));
</script>

<template>
  <div class="rounded-lg p-6" style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)">
    <div class="flex justify-between items-center mb-4">
      <div>
        <p class="tag-mono text-xs font-bold tracking-widest uppercase" style="color: var(--color-ink-faint)">{{ t('tripDetail.budget') }}</p>
        <p class="font-display text-3xl font-bold mt-2" :style="{ color: isOverBudget ? 'var(--color-alert)' : 'var(--color-accent)' }">
          €{{ totalSpent.toFixed(2) }} / €{{ budgetTotal.toFixed(2) }}
        </p>
      </div>
      <span class="text-sm font-medium" style="color: var(--color-ink-soft)">{{ peopleCount }} {{ peopleCount === 1 ? t('tripDetail.person') : t('tripDetail.people') }}</span>
    </div>
    <div class="w-full rounded-full h-2.5 overflow-hidden" style="background-color: var(--color-line)">
      <div
        class="h-full rounded-full transition-all"
        :style="{
          backgroundColor: isOverBudget ? 'var(--color-alert)' : 'var(--color-accent)',
          width: progressPercent + '%'
        }"
      ></div>
    </div>
    <p class="text-xs mt-3" :style="{ color: isOverBudget ? 'var(--color-alert)' : 'var(--color-sage)' }">
      {{ isOverBudget ? t('tripDetail.overBudget') : t('tripDetail.withinBudget') }}
    </p>
  </div>
</template>