export interface Feature {
  id: string;
  key: string;
}

export interface FeatureCategory {
  id: string;
  key: string;
  defaultWeight: number;
  features: Feature[];
}

export interface UserPreference {
  id: string;
  userId: string;
  categoryId: string;
  featureId: string;
  createdAt: string;
  updatedAt: string;
}