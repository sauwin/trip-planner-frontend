<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Expense, ExpenseCategory } from '@/types/expense.types';
import { isRequired, isPositiveNumberRequired } from '@/utils/validation';

const props = defineProps<{
  expenses: Expense[];
  isAdding: boolean;
  editingExpenseId: string | null;
  isSavingExpense: boolean;
}>();

const emit = defineEmits<{
  'add-expense': [description: string, amount: number, category: ExpenseCategory];
  'delete-expense': [expenseId: string];
  'start-edit-expense': [expenseId: string];
  'cancel-edit-expense': [];
  'save-expense': [expenseId: string, payload: { description: string; amount: number; category: ExpenseCategory }];
}>();

const { t } = useI18n();

const CATEGORIES: ExpenseCategory[] = ['TRANSPORT', 'FOOD', 'ACTIVITIES', 'OTHER'];

function categoryLabel(category: ExpenseCategory) {
  return t(`tripDetail.expenseCategories.${category}`);
}

const description = ref('');
const amount = ref<number | null>(null);
const category = ref<ExpenseCategory>('OTHER');
const errors = ref({ description: '', amount: '' });

function validate(): boolean {
  errors.value.description = isRequired(description.value) ? '' : t('tripDetail.errors.descriptionRequired');
  errors.value.amount = isPositiveNumberRequired(amount.value) ? '' : t('tripDetail.errors.amountPositive');
  return !errors.value.description && !errors.value.amount;
}

function handleSubmit() {
  if (!validate()) return;
  emit('add-expense', description.value.trim(), amount.value!, category.value);
  description.value = '';
  amount.value = null;
  category.value = 'OTHER';
  errors.value = { description: '', amount: '' };
}

const editDescription = ref('');
const editAmount = ref<number | null>(null);
const editCategory = ref<ExpenseCategory>('OTHER');
const editErrors = ref({ description: '', amount: '' });

function startEdit(expense: Expense) {
  editDescription.value = expense.description;
  editAmount.value = expense.amount;
  editCategory.value = expense.category;
  editErrors.value = { description: '', amount: '' };
  emit('start-edit-expense', expense.id);
}

function validateEdit(): boolean {
  editErrors.value.description = isRequired(editDescription.value) ? '' : t('tripDetail.errors.descriptionRequired');
  editErrors.value.amount = isPositiveNumberRequired(editAmount.value) ? '' : t('tripDetail.errors.amountPositive');
  return !editErrors.value.description && !editErrors.value.amount;
}

function handleSaveEdit(expenseId: string) {
  if (!validateEdit()) return;
  emit('save-expense', expenseId, { description: editDescription.value.trim(), amount: editAmount.value!, category: editCategory.value });
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
        class="rounded-lg px-4 py-3"
        style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line); box-shadow: 0 4px 20px rgba(0,0,0,0.05)"
      >
        <div class="flex justify-between items-center gap-3">
          <div class="flex items-center gap-2 min-w-0">
            <span
              class="tag-mono text-[10px] px-2 py-0.5 rounded-full shrink-0"
              style="background-color: rgba(15, 82, 186, 0.08); color: var(--color-accent)"
            >
              {{ categoryLabel(expense.category) }}
            </span>
            <p style="color: var(--color-ink)" class="truncate">{{ expense.description }}</p>
          </div>
          <div class="flex items-center gap-4 shrink-0">
            <span class="font-display font-semibold" style="color: var(--color-accent)">€{{ expense.amount.toFixed(2) }}</span>
            <button
              @click="startEdit(expense)"
              class="text-sm font-medium"
              style="color: var(--color-secondary)"
            >
              {{ t('tripDetail.edit') }}
            </button>
            <button @click="emit('delete-expense', expense.id)" class="text-sm font-medium" style="color: var(--color-alert)">
              {{ t('tripDetail.remove') }}
            </button>
          </div>
        </div>

        <form
          v-if="editingExpenseId === expense.id"
          @submit.prevent="handleSaveEdit(expense.id)"
          class="mt-3 pt-3 flex flex-col md:flex-row gap-2 items-start"
          style="border-top: 1px solid var(--color-line)"
        >
          <div class="flex-1 w-full">
            <input
              v-model="editDescription"
              type="text"
              :placeholder="t('tripDetail.expenseDescription')"
              class="w-full rounded-lg px-4 py-2.5 text-sm transition-all"
              :style="{ backgroundColor: 'var(--color-paper)', color: 'var(--color-ink)', border: editErrors.description ? '1px solid var(--color-alert)' : '1px solid var(--color-line)' }"
            />
            <p v-if="editErrors.description" class="text-xs mt-1" style="color: var(--color-alert)">{{ editErrors.description }}</p>
          </div>
          <select
            v-model="editCategory"
            class="rounded-lg px-3 py-2.5 text-sm transition-all shrink-0"
            :style="{ backgroundColor: 'var(--color-paper)', color: 'var(--color-ink)', border: '1px solid var(--color-line)' }"
          >
            <option v-for="c in CATEGORIES" :key="c" :value="c">{{ categoryLabel(c) }}</option>
          </select>
          <div class="w-40 shrink-0">
            <input
              v-model.number="editAmount"
              type="number"
              :placeholder="t('tripDetail.amount')"
              class="w-full rounded-lg px-4 py-2.5 text-sm transition-all"
              :style="{ backgroundColor: 'var(--color-paper)', color: 'var(--color-ink)', border: editErrors.amount ? '1px solid var(--color-alert)' : '1px solid var(--color-line)' }"
            />
            <p v-if="editErrors.amount" class="text-xs mt-1" style="color: var(--color-alert)">{{ editErrors.amount }}</p>
          </div>
          <div class="flex gap-2 shrink-0">
            <button
              type="submit"
              :disabled="isSavingExpense"
              class="rounded-lg px-4 py-2.5 text-sm font-medium transition-all text-white disabled:opacity-60"
              style="background-color: var(--color-secondary)"
            >
              {{ isSavingExpense ? t('tripDetail.saving') : t('tripDetail.save') }}
            </button>
            <button
              type="button"
              @click="emit('cancel-edit-expense')"
              class="text-sm px-3 py-2.5 rounded transition-all"
              style="color: var(--color-ink-faint)"
            >
              {{ t('tripDetail.cancel') }}
            </button>
          </div>
        </form>
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
      <select
        v-model="category"
        class="rounded-lg px-3 py-2.5 text-sm transition-all shrink-0"
        :style="{ backgroundColor: 'var(--color-paper-dim)', color: 'var(--color-ink)', border: '1px solid var(--color-line)' }"
      >
        <option v-for="c in CATEGORIES" :key="c" :value="c">{{ categoryLabel(c) }}</option>
      </select>
      <div class="w-40 shrink-0">
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
        class="rounded-lg px-6 py-2.5 text-sm font-semibold transition-all hover:shadow-lg text-white shrink-0 hover:scale-105 disabled:opacity-60"
        style="background-color: var(--color-accent)"
      >
        {{ t('tripDetail.add') }}
      </button>
    </form>
  </div>
</template>