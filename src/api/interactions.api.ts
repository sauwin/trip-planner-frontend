import http from './http';
import type { Interaction, InteractionType, DestinationInteractionStatus } from '@/types/interaction.types';

export function recordInteraction(destinationId: string, type: InteractionType, value?: number) {
  return http.post<Interaction>('/interactions', { destinationId, type, value });
}

export function removeInteraction(destinationId: string, type: InteractionType) {
  return http.delete(`/interactions/${destinationId}/${type}`);
}

export function getInteractions() {
  return http.get<Interaction[]>('/interactions');
}

export function getDestinationInteractionStatus(destinationId: string) {
  return http.get<DestinationInteractionStatus>(`/interactions/status/${destinationId}`);
}