import http from './http';
import type { Trip, TripWithDestinations, TripDestination } from '@/types/trip.types';

interface AccommodationInput {
  accommodationName?: string;
  accommodationPrice?: number;
  accommodationUrl?: string;
}

export function createTrip(title: string, budgetTotal?: number, peopleCount?: number) {
  return http.post<Trip>('/trips', { title, budgetTotal, peopleCount });
}

export function getTrips() {
  return http.get<Trip[]>('/trips');
}

export function getTrip(id: string) {
  return http.get<TripWithDestinations>(`/trips/${id}`);
}


export function addDestinationToTrip(tripId: string, destinationId: string, plannedDate?: string, accommodation?: AccommodationInput) {
  return http.post<TripDestination>(`/trips/${tripId}/destinations`, {
    destinationId,
    plannedDate,
    ...accommodation,
  });
}

export function updateAccommodation(tripId: string, destinationId: string, accommodation: AccommodationInput) {
  return http.patch<TripDestination>(`/trips/${tripId}/destinations/${destinationId}`, accommodation);
}

export function deleteTrip(id: string) {
  return http.delete(`/trips/${id}`);
}