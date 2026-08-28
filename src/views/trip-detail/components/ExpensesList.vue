<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Expense } from '@/types/expense.types';
import { isRequired, isPositiveNumberRequired } from '@/utils/validation';

const props = defineProps<{
  expenses: Expense[];
  isAdding: boolean;
}>();

const emit = defineEmits<{
  'add-expense': [description: string, amount: number];
  'delete-expense': [expenseId: string];
}>();

const { t } = useI18n();

const description = ref('');
const amount = ref<number | null>(null);
const errors = ref({ description: '', amount: '' });

function validate(): boolean {
  errors.value.description = isRequired(description.value) ? '' : t('tripDetail.errors.descriptionRequired');
  errors.value.amount = isPositiveNumberRequired(amount.value) ? '' : t('tripDetail.errors.amountPositive');
  return !errors.value.description && !errors.value.amount;
}

function handleSubmit() {
  if (!validate()) return;
  emit('add-expense', description.value.trim(), amount.value!);
  description.value = '';
  amount.value = null;
  errors.value = { description: '', amount: '' };
}
</script>

<template>
  <div>
    <h2 class="font-display text-2xl font-bold mb-6" style="color: var(--color-ink)">{{ t('tripDetail.expenses') }} ({{ expenses.length }})</h2>

    <div v-if="expenses.length === 0" class="text-center py-8 rounded-lg mb-6" style="background-color: var(--color-paper-dim); border: 1.5px dashed var(--color-line)">
      <p style="color: var(--color-ink-soft)">{{ t('tripDetail.noExpenses') }}</p>
    </div>

    <div v-else class="flex flex-col gap-2 mb-6">
      <div
        v-for="expense in expenses"
        :key="expense.id"
        class="flex justify-between items-center rounded-lg px-4 py-3"
        style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)"
      >
        <p style="color: var(--color-ink)">{{ expense.description }}</p>
        <div class="flex items-center gap-4">
          <span class="font-display font-semibold" style="color: var(--color-accent)">€{{ expense.amount.toFixed(2) }}</span>
          <button @click="emit('delete-expense', expense.id)" class="text-sm font-medium" style="color: var(--color-alert)">
            {{ t('tripDetail.remove') }}
          </button>
        </div>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="flex flex-col md:flex-row gap-2 items-start">
      <div class="flex-1 w-full">
        <input
          v-model="description"
          type="text"
          :placeholder="t('tripDetail.expenseDescription')"
          class="w-full rounded-lg px-4 py-2.5 text-sm transition-all"
          :style="{ backgroundColor: 'var(--color-paper-dim)', color: 'var(--color-ink)', border: errors.description ? '1px solid var(--color-alert)' : '1px solid var(--color-line)' }"
        />
        <p v-if="errors.description" class="text-xs mt-1" style="color: var(--color-alert)">{{ errors.description }}</p>
      </div>
      <div class="w-28 shrink-0">
        <input
          v-model.number="amount"
          type="number"
          :placeholder="t('tripDetail.amount')"
          class="w-full rounded-lg px-4 py-2.5 text-sm transition-all"
          :style="{ backgroundColor: 'var(--color-paper-dim)', color: 'var(--color-ink)', border: errors.amount ? '1px solid var(--color-alert)' : '1px solid var(--color-line)' }"
        />
        <p v-if="errors.amount" class="text-xs mt-1" style="color: var(--color-alert)">{{ errors.amount }}</p>
      </div>
      <button
        type="submit"
        :disabled="isAdding"
        class="rounded-lg px-6 py-2.5 font-semibold transition-all hover:shadow-lg text-white shrink-0 hover:scale-105 disabled:opacity-60"
        style="background-color: var(--color-accent)"
      >
        {{ t('tripDetail.add') }}
      </button>
    </form>
  </div>
</template>