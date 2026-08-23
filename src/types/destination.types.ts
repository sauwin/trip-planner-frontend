export interface DestinationTranslation {
  name: string;
  description: string;
}

export interface Destination {
  id: string;
  slug: string;
  country: string;
  latitude: number;
  longitude: number;
  translations: Record<string, DestinationTranslation>;
  popularityScore: number;
  createdAt: string;
}

export interface PaginatedDestinations {
  items: Destination[];
  total: number;
  limit: number;
  offset: number;
}

export interface ListDestinationsParams {
  limit?: number;
  offset?: number;
  country?: string;
}