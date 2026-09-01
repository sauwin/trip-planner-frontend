import http from './http';
import type { Expense, ExpenseCategory } from '@/types/expense.types';

export function createExpense(tripId: string, description: string, amount: number, category: ExpenseCategory, date?: string) {
  return http.post<Expense>(`/trips/${tripId}/expenses`, { description, amount, category, date });
}

export function getExpenses(tripId: string) {
  return http.get<Expense[]>(`/trips/${tripId}/expenses`);
}

export function deleteExpense(tripId: string, expenseId: string) {
  return http.delete(`/trips/${tripId}/expenses/${expenseId}`);
}

export function updateExpense(tripId: string, expenseId: string, data: { description?: string; amount?: number; category?: ExpenseCategory }) {
  return http.patch<Expense>(`/trips/${tripId}/expenses/${expenseId}`, data);
}