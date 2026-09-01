export type ExpenseCategory = 'TRANSPORT' | 'FOOD' | 'ACTIVITIES' | 'OTHER';

export interface Expense {
  id: string;
  tripId: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  createdAt: string;
}