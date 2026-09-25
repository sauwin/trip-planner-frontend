import http from './http';
import type { PaginatedRecommendations, ListRecommendationsParams } from '@/types/recommendation.types';

export function getRecommendations({featureIds, ...rest}: ListRecommendationsParams = {}) {
  return http.get<PaginatedRecommendations>('/recommendations', {
    params: {
      ...rest,
      ...(featureIds?.length ? { featureIds: featureIds.join(',') } : {}),
    },
  });
}