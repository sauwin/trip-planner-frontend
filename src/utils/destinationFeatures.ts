import type { DestinationFeatureView } from '@/types/destination.types';

export function getTopFeatureInCategory(
  features: DestinationFeatureView[] | undefined,
  categoryKey: string,
): DestinationFeatureView | null {
  if (!features || features.length === 0) return null;

  const inCategory = features.filter((f) => f.categoryKey === categoryKey && f.weight > 0);
  if (inCategory.length === 0) return null;

  return inCategory.reduce((best, current) => (current.weight > best.weight ? current : best));
}

export function getTopFeatureOverall(
  features: DestinationFeatureView[] | undefined,
  excludeCategories: string[] = [],
): DestinationFeatureView | null {
  if (!features || features.length === 0) return null;

  const candidates = features.filter((f) => f.weight > 0 && !excludeCategories.includes(f.categoryKey));
  if (candidates.length === 0) return null;

  return candidates.reduce((best, current) => (current.weight > best.weight ? current : best));
}