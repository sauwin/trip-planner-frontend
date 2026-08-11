import http from './http';
import type { Interaction, InteractionType } from '@/types/interaction.types';

export function recordInteraction(destinationId: string, type: InteractionType, value?: number) {
  return http.post<Interaction>('/interactions', { destinationId, type, value });
}

export function getInteractions() {
  return http.get<Interaction[]>('/interactions');
}