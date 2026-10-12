export interface DestinationTranslation {
  name: string;
  description: string;
}

export interface DestinationFeatureView {
  featureId: string;
  key: string;
  categoryKey: string;
  weight: number;
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
  features?: DestinationFeatureView[];
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
  featureIds?: string[];
}

export interface DestinationInput {
  slug: string;
  country: string;
  latitude: number;
  longitude: number;
  translations: Record<string, DestinationTranslation> & {
    en: DestinationTranslation;
    sk: DestinationTranslation;
  };
  features: Array<{ featureId: string; weight: number }>;
}