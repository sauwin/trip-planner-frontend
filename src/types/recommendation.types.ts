import type { Destination } from './destination.types';

export interface DestinationScore {
  destination: Destination;
  score: number;
  /** Skóre zhody s odpoveďami v dotazníku (0 až 100). */
  preferenceScore?: number;
  /** Skóre podobnosti s destináciami, s ktorými používateľ interagoval (0 až 100). */
  behaviorScore?: number;
  matchedFeatures: string[];
}

export interface PaginatedRecommendations {
  items: DestinationScore[];
  total: number;
  limit: number;
  offset: number;
  /** Podiel behaviorálnej zložky v celkovom skóre (0 až 0,4). */
  behaviorWeight?: number;
}

export interface ListRecommendationsParams {
  limit?: number;
  offset?: number;
  featureIds?: string[];
}