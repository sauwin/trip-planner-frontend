import http from './http';
import type { Destination, PaginatedDestinations, ListDestinationsParams } from '@/types/destination.types';

export interface DestinationSearchResult {
  id: string;
  slug: string;
  name: string;
  country: string;
  region: string | null;
  image: string | null;
}

export function searchDestinations(q: string, locale: string, limit = 8, signal?: AbortSignal) {
  return http.get<{ items: DestinationSearchResult[] }>('/destinations/search', {
    params: { q, locale, limit },
    signal,
  });
}

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

export function getSavedDestinations() {
  return http.get<Destination[]>('/destinations/saved');
}