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

export type PoiCategory = 'ATTRACTION' | 'MUSEUM' | 'VIEWPOINT' | 'RESTAURANT' | 'CAFE' | 'PARK' | 'HOTEL' | 'OTHER';

export interface PointOfInterest {
  id: string;
  destinationId: string;
  name: string;
  category: PoiCategory;
  latitude: number;
  longitude: number;
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
  pointsOfInterest?: PointOfInterest[];
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