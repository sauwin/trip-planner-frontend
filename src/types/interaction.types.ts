export type InteractionType = 'VIEW' | 'LIKE' | 'RATING' | 'SAVE';

export interface InteractionDestination {
  slug: string;
  country: string;
  translations: Record<string, { name: string; description: string }>;
}

export interface Interaction {
  id: string;
  userId: string;
  destinationId: string;
  type: InteractionType;
  value: number | null;
  createdAt: string;
  destination: InteractionDestination;
}

export interface DestinationInteractionStatus {
  liked: boolean;
  saved: boolean;
  rating: number | null;
}