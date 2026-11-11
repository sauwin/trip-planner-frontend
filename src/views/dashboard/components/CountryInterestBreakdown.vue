<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Interaction } from '@/types/interaction.types';
import { getDestinationDisplayName } from '@/utils/destinationName';

const props = defineProps<{
  interactions: Interaction[];
}>();

const { t, locale } = useI18n();

const countryInterests = computed(() => {
  const countries = new Map<string, Map<string, {
    id: string;
    name: string;
    liked: boolean;
    saved: boolean;
    rating: number | null;
    ratingUpdatedAt: string;
  }>>();

  for (const interaction of props.interactions) {
    if (interaction.type === 'VIEW') continue;

    const country = interaction.destination.country;
    let destinations = countries.get(country);
    if (!destinations) {
      destinations = new Map();
      countries.set(country, destinations);
    }

    let destination = destinations.get(interaction.destinationId);
    if (!destination) {
      destination = {
        id: interaction.destinationId,
        name: getDestinationDisplayName(interaction.destination, locale.value),
        liked: false,
        saved: false,
        rating: null,
        ratingUpdatedAt: '',
      };
      destinations.set(interaction.destinationId, destination);
    }

    if (interaction.type === 'LIKE') destination.liked = true;
    if (interaction.type === 'SAVE') destination.saved = true;
    if (interaction.type === 'RATING' && interaction.createdAt >= destination.ratingUpdatedAt) {
      destination.rating = interaction.value;
      destination.ratingUpdatedAt = interaction.createdAt;
    }
  }

  return [...countries.entries()]
    .map(([country, destinations]) => ({
      country,
      destinations: [...destinations.values()].sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => b.destinations.length - a.destinations.length || a.country.localeCompare(b.country))
    .slice(0, 6);
});
</script>

<template>
  <div>
    <h2 class="section-heading">{{ t('dashboard.destinationInterests') }}</h2>

    <div class="card-surface relative rounded-lg p-8">
      <div class="absolute left-0 right-0 top-0 mx-auto" aria-hidden="true">
        <div class="h-[3px] w-full -translate-y-px bg-sage"></div>
      </div>
      <h3 class="section-caption">{{ t('dashboard.interestsByCountry') }}</h3>
      <p class="mb-5 text-xs text-ink-faint">{{ t('dashboard.interestsByCountryDescription') }}</p>
      <div v-if="countryInterests.length > 0" class="grid gap-4 md:grid-cols-2">
        <article
          v-for="country in countryInterests"
          :key="country.country"
          class="rounded-lg border border-line bg-paper-dim p-4"
        >
          <div class="mb-3 flex items-center justify-between gap-3">
            <h4 class="font-semibold text-ink">{{ country.country || t('dashboard.unknown') }}</h4>
            <span
              class="rounded-full bg-accent/10 px-2.5 py-1 text-xs font-bold text-accent"
              :aria-label="t('dashboard.interestedDestinations')"
            >
              {{ country.destinations.length }}
            </span>
          </div>
          <ul class="space-y-3">
            <li
              v-for="destination in country.destinations"
              :key="destination.id"
              class="border-t border-line/70 pt-3 first:border-0 first:pt-0"
            >
              <p class="mb-2 text-sm font-medium text-ink">{{ destination.name }}</p>
              <div class="flex flex-wrap gap-1.5">
                <span v-if="destination.liked" class="rounded bg-sage/15 px-2 py-1 text-xs text-ink-soft">
                  {{ t('dashboard.liked') }}
                </span>
                <span v-if="destination.saved" class="rounded bg-accent/10 px-2 py-1 text-xs text-accent">
                  {{ t('dashboard.savedAction') }}
                </span>
                <span v-if="destination.rating !== null" class="rounded bg-secondary/15 px-2 py-1 text-xs text-ink-soft">
                  {{ t('dashboard.ratedValue', { value: destination.rating }) }}
                </span>
                <span v-else-if="destination.ratingUpdatedAt" class="rounded bg-secondary/15 px-2 py-1 text-xs text-ink-soft">
                  {{ t('dashboard.ratings') }}
                </span>
              </div>
            </li>
          </ul>
        </article>
      </div>
      <p v-else class="chart-empty-state">{{ t('dashboard.noInterestData') }}</p>
    </div>
  </div>
</template>
