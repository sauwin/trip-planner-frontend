import http from './http';
import type { FeatureCategory } from '@/types/feature.types';

export function getFeatureCategories() {
  return http.get<FeatureCategory[]>('/feature-categories');
}