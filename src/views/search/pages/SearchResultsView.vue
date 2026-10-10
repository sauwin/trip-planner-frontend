<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { searchDestinations, type DestinationSearchResult } from '@/api/destinations.api';

const route = useRoute();
const router = useRouter();
const { locale } = useI18n();
const results = ref<DestinationSearchResult[]>([]);
const isLoading = ref(false);
const errorMessage = ref('');
const query = computed(() => typeof route.query.q === 'string' ? route.query.q.trim() : '');

watch([query, locale], async ([searchTerm], _previous, onCleanup) => {
  results.value = [];
  errorMessage.value = '';
  isLoading.value = false;
  if (searchTerm.length < 2) return;

  const controller = new AbortController();
  onCleanup(() => controller.abort());
  isLoading.value = true;
  try {
    const response = await searchDestinations(searchTerm, locale.value, 50, controller.signal);
    results.value = response.data.items;
  } catch {
    if (!controller.signal.aborted) errorMessage.value = 'Search is unavailable. Please try again.';
  } finally {
    if (!controller.signal.aborted) isLoading.value = false;
  }
});
</script>

<template>
  <main class="page-shell">
    <div class="page-container max-w-7xl">
      <p class="section-caption mb-2">Destination search</p>
      <h1 class="font-display text-3xl font-bold text-ink">Results for “{{ query }}”</h1>

      <div v-if="isLoading" class="mt-8 grid gap-3" aria-label="Loading search results" aria-busy="true">
        <div v-for="item in 5" :key="item" class="h-24 animate-pulse rounded-lg border border-line bg-paper-dim" />
      </div>
      <p v-else-if="errorMessage" class="py-16 text-center text-alert" role="alert">{{ errorMessage }}</p>
      <p v-else-if="query.length < 2" class="py-16 text-center text-ink-soft">Enter at least two characters to search.</p>
      <p v-else-if="results.length === 0" class="py-16 text-center text-ink-soft">No results found.</p>

      <ul v-else class="mt-8 divide-y divide-line border-y border-line">
        <li v-for="destination in results" :key="destination.id">
          <button
            type="button"
            class="flex w-full items-center gap-4 py-4 text-left transition-colors hover:bg-paper-dim focus-visible:outline-2 focus-visible:outline-accent"
            @click="router.push(`/destinations/${destination.id}`)"
          >
            <img
              v-if="destination.image"
              :src="destination.image"
              alt=""
              class="h-16 w-20 shrink-0 rounded-md object-cover"
              loading="lazy"
            />
            <span v-else class="flex h-16 w-20 shrink-0 items-center justify-center rounded-md bg-paper text-accent" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" />
              </svg>
            </span>
            <span class="min-w-0 flex-1">
              <span class="block truncate font-display text-lg font-semibold text-ink">{{ destination.name }}</span>
              <span class="block truncate text-sm text-ink-soft">{{ destination.region ? `${destination.region}, ` : '' }}{{ destination.country }}</span>
            </span>
            <svg class="shrink-0 text-ink-faint" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </li>
      </ul>
    </div>
  </main>
</template>