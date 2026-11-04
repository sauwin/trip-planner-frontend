import type { Destination } from './destination.types';

export interface DestinationScore {
  destination: Destination;
  score: number;
  preferenceScore?: number;
  behaviorScore?: number;
  matchedFeatures: string[];
}

export interface PaginatedRecommendations {
  items: DestinationScore[];
  total: number;
  limit: number;
  offset: number;
  behaviorWeight?: number;
}

export interface ListRecommendationsParams {
  limit?: number;
  offset?: number;
  featureIds?: string[];
}