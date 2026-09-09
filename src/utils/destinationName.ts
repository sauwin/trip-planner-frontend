interface TranslatedNameSource {
  slug: string;
  translations: Record<string, { name: string }>;
}

export function getDestinationDisplayName(destination: TranslatedNameSource, locale: string): string {
  return destination.translations[locale]?.name ?? destination.translations.en?.name ?? destination.slug;
}