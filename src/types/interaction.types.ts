export type InteractionType = 'VIEW' | 'LIKE' | 'RATING' | 'SAVE';

export interface Interaction {
  id: string;
  userId: string;
  destinationId: string;
  type: InteractionType;
  value: number | null;
  createdAt: string;
}

export interface DestinationInteractionStatus {
  liked: boolean;
  saved: boolean;
  rating: number | null;
}