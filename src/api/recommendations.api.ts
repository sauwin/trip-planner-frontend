import http from './http';
import type { DestinationScore } from '@/types/recommendation.types';

export function getRecommendations() {
  return http.get<DestinationScore[]>('/recommendations');
}