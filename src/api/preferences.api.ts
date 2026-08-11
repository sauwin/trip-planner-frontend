import http from './http';
import type { UserPreference } from '@/types/feature.types';

interface PreferenceInput {
  categoryId: string;
  featureId: string;
}

export function savePreferences(preferences: PreferenceInput[]) {
  return http.post<UserPreference[]>('/preferences', { preferences });
}

export function getPreferences() {
  return http.get<UserPreference[]>('/preferences');
}