import http from './http';
import type { Destination } from '@/types/destination.types';

export function getDestinations() {
  return http.get<Destination[]>('/destinations');
}

export function getDestination(id: string) {
  return http.get<Destination>(`/destinations/${id}`);
}