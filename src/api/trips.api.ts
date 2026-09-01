import http from './http';
import type { Trip, TripWithDestinations, TripWithFinancials, TripDestination, AccommodationInput } from '@/types/trip.types';

export interface TripDestinationDetailsInput extends AccommodationInput {
  plannedDateStart?: string | null;
  plannedDateEnd?: string | null;
}

export function createTrip(
  title: string,
  budgetTotal?: number,
  peopleCount?: number,
  startDate?: string,
  endDate?: string,
) {
  return http.post<Trip>('/trips', { title, budgetTotal, peopleCount, startDate, endDate });
}

export function getTrips() {
  return http.get<TripWithFinancials[]>('/trips');
}

export function getTrip(id: string) {
  return http.get<TripWithDestinations>(`/trips/${id}`);
}

export function addDestinationToTrip(tripId: string, destinationId: string, details?: TripDestinationDetailsInput) {
  return http.post<TripDestination>(`/trips/${tripId}/destinations`, {
    destinationId,
    ...details,
  });
}

export function updateAccommodation(tripId: string, destinationId: string, accommodation: AccommodationInput) {
  return http.patch<TripDestination>(`/trips/${tripId}/destinations/${destinationId}`, accommodation);
}

export function updateDestinationDates(tripId: string, destinationId: string, dates: { plannedDateStart: string | null; plannedDateEnd: string | null }) {
  return http.patch<TripDestination>(`/trips/${tripId}/destinations/${destinationId}`, dates);
}

export function deleteTrip(tripId: string) {
  return http.delete(`/trips/${tripId}`)
}

export function deleteDestinationFromTrip(tripId: string, destinationId: string) {
  return http.delete(`/trips/${tripId}/destinations/${destinationId}`);
}

export function updateTrip(id: string, data: Partial<{ title: string; budgetTotal: number; peopleCount: number; startDate: string; endDate: string }>) {
  return http.patch(`/trips/${id}`, data);
}