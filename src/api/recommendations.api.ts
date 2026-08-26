import http from './http';
import type { PaginatedRecommendations, ListRecommendationsParams } from '@/types/recommendation.types';

export function getRecommendations(params: ListRecommendationsParams = {}) {
  const { featureIds, ...rest } = params;
  return http.get<PaginatedRecommendations>('/recommendations', {
    params: {
      ...rest,
      featureIds: featureIds && featureIds.length > 0 ? featureIds.join(',') : undefined,
    },
  });
}