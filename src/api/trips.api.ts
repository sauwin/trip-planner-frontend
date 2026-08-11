import http from './http';
import type { Trip, TripWithDestinations, TripDestination } from '@/types/trip.types';

export function createTrip(title: string) {
  return http.post<Trip>('/trips', { title });
}

export function getTrips() {
  return http.get<Trip[]>('/trips');
}

export function getTrip(id: string) {
  return http.get<TripWithDestinations>(`/trips/${id}`);
}

export function addDestinationToTrip(tripId: string, destinationId: string, plannedDate?: string) {
  return http.post<TripDestination>(`/trips/${tripId}/destinations`, { destinationId, plannedDate });
}

export function deleteTrip(id: string) {
  return http.delete(`/trips/${id}`);
}