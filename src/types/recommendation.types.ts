import type { Destination } from './destination.types';

export interface DestinationScore {
  destination: Destination;
  score: number;
}

export interface PaginatedRecommendations {
  items: DestinationScore[];
  total: number;
  limit: number;
  offset: number;
}

export interface ListRecommendationsParams {
  limit?: number;
  offset?: number;
}