import http from './http';
import type { Destination, PaginatedDestinations, ListDestinationsParams } from '@/types/destination.types';

export function getDestinations(params: ListDestinationsParams = {}) {
  return http.get<PaginatedDestinations>('/destinations', { params });
}

export function getDestination(id: string) {
  return http.get<Destination>(`/destinations/${id}`);
}