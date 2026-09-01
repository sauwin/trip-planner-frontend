import type { Destination } from './destination.types';
import type { ExpenseCategory } from './expense.types';

export interface Trip {
  id: string;
  userId: string;
  title: string;
  budgetTotal: number | null;
  peopleCount: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

export interface TripDestination {
  tripId: string;
  destinationId: string;
  position: number;
  plannedDateStart: string | null;
  plannedDateEnd: string | null;
  accommodationName: string | null;
  accommodationPrice: number | null;
  accommodationUrl: string | null;
  destination: Destination;
}

export interface TripWithDestinations extends Trip {
  destinations: TripDestination[];
}

export interface AccommodationStay {
  accommodationPrice: number | null;
  plannedDateStart: string | null;
  plannedDateEnd: string | null;
}

export interface ExpenseSummaryEntry {
  amount: number;
  category: ExpenseCategory;
  date: string;
}

export interface TripWithFinancials extends Trip {
  destinations: AccommodationStay[];
  expenses: ExpenseSummaryEntry[];
}

export interface AccommodationInput {
  accommodationName?: string;
  accommodationPrice?: number;
  accommodationUrl?: string;
}