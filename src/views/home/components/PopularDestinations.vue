<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { Destination } from '@/types/destination.types';
import { getDestinationDisplayName } from '@/utils/destinationName';

defineProps<{
  destinations: Destination[];
  loading: boolean;
}>();

const { t, locale } = useI18n();

function getName(destination: Destination) {
  return getDestinationDisplayName(destination, locale.value);
}

function getDescription(destination: Destination) {
  return destination.translations[locale.value]?.description ?? destination.translations.en?.description ?? '';
}
</script>

<template>
  <section class="max-w-7xl mx-auto px-6 py-20">
    <div class="flex flex-wrap items-end justify-between gap-4 mb-8">
      <h2 class="font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink">{{ t('home.popularTitle') }}</h2>
      <router-link
        to="/destinations"
        class="text-sm font-semibold text-accent hover:text-accent-dark transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent rounded"
      >
        {{ t('home.popularAll') }}
      </router-link>
    </div>

    <div v-if="loading" class="border-t border-line">
      <div v-for="n in 5" :key="n" class="h-24 border-b border-line flex items-center">
        <div class="h-6 w-1/3 rounded bg-line animate-pulse"></div>
      </div>
    </div>

    <ol v-else class="border-t border-line">
      <li v-for="(destination, index) in destinations" :key="destination.id" class="border-b border-line">
        <router-link
          :to="`/destinations/${destination.id}`"
          class="group grid grid-cols-[2rem_1fr_auto] md:grid-cols-[3rem_15rem_1fr_auto] items-center gap-x-4 md:gap-x-8 py-6 px-3 -mx-3 rounded-lg transition-colors hover:bg-paper-dim focus-visible:outline-2 focus-visible:outline-accent"
        >
          <span class="font-display text-lg font-medium text-ink-faint">{{ index + 1 }}</span>

          <span class="min-w-0">
            <span class="block font-display text-2xl font-bold text-ink truncate group-hover:text-accent transition-colors">{{ getName(destination) }}</span>
            <span class="tag-mono">{{ destination.country }}</span>
          </span>

          <p class="hidden md:block text-ink-soft leading-relaxed line-clamp-2">{{ getDescription(destination) }}</p>

          <span class="flex items-center gap-1.5 font-display text-lg font-bold text-ink">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="text-warning" aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {{ destination.popularityScore.toFixed(1) }}
          </span>
        </router-link>
      </li>
    </ol>
  </section>
</template>