import http from './http';
import type { PaginatedRecommendations, ListRecommendationsParams } from '@/types/recommendation.types';

export function getRecommendations(params: ListRecommendationsParams = {}) {
  return http.get<PaginatedRecommendations>('/recommendations', { params });
}