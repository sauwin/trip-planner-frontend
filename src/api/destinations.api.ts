import http from './http';
import type { Destination, PaginatedDestinations, ListDestinationsParams } from '@/types/destination.types';

export function getDestinations(params: ListDestinationsParams = {}) {
  const { featureIds, ...rest } = params;
  return http.get<PaginatedDestinations>('/destinations', {
    params: {
      ...rest,
      featureIds: featureIds && featureIds.length > 0 ? featureIds.join(',') : undefined,
    },
  });
}

export function getDestination(id: string) {
  return http.get<Destination>(`/destinations/${id}`);
}