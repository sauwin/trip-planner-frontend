import http from './http';
import type { Expense } from '@/types/expense.types';

export function createExpense(tripId: string, description: string, amount: number, date?: string) {
  return http.post<Expense>(`/trips/${tripId}/expenses`, { description, amount, date });
}

export function getExpenses(tripId: string) {
  return http.get<Expense[]>(`/trips/${tripId}/expenses`);
}

export function deleteExpense(tripId: string, expenseId: string) {
  return http.delete(`/trips/${tripId}/expenses/${expenseId}`);
}