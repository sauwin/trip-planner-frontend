import type { Destination } from '@/types/destination.types';

export function getDestinationDisplayName(destination: Destination, locale: string): string {
  return destination.translations[locale]?.name ?? destination.translations.en?.name ?? destination.slug;
}