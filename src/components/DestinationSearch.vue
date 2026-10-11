<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { searchDestinations, type DestinationSearchResult } from '@/api/destinations.api';

const { locale, t } = useI18n();
const router = useRouter();
const searchId = `destination-search-${useId()}`;
const inputId = `${searchId}-input`;
const listboxId = `${searchId}-listbox`;
const optionIdPrefix = `${searchId}-option`;
const root = ref<HTMLElement | null>(null);
const input = ref<HTMLInputElement | null>(null);
const query = ref('');
const results = ref<DestinationSearchResult[]>([]);
const isOpen = ref(false);
const isLoading = ref(false);
const hasSearched = ref(false);
const errorMessage = ref('');
const activeIndex = ref(-1);
const searchRevision = ref(0);
const mobileExpanded = ref(false);
const hasSelectedDestination = ref(false);
let debounceTimer: ReturnType<typeof setTimeout> | undefined;
let activeRequest: AbortController | undefined;

const activeOptionId = computed(() =>
  activeIndex.value >= 0 ? `${optionIdPrefix}-${activeIndex.value}` : undefined,
);
const shouldShowSuggestions = computed(() =>
  isOpen.value && query.value.trim().length >= 2 && (isLoading.value || hasSearched.value || results.value.length > 0 || Boolean(errorMessage.value)),
);

function cancelPendingSearch() {
  clearTimeout(debounceTimer);
  activeRequest?.abort();
  activeRequest = undefined;
  isLoading.value = false;
}

function closeSearch() {
  isOpen.value = false;
  activeIndex.value = -1;
  mobileExpanded.value = false;
  cancelPendingSearch();
}

function openMobileSearch() {
  mobileExpanded.value = true;
  isOpen.value = true;
  requestAnimationFrame(() => input.value?.focus());
}

function activateSearch() {
  hasSelectedDestination.value = false;
  isOpen.value = true;
  searchRevision.value += 1;
}

function selectResult(destination: DestinationSearchResult) {
  query.value = '';
  hasSelectedDestination.value = true;
  input.value?.blur();
  closeSearch();
  void router.push(`/destinations/${destination.id}`);
}

function submitSearch() {
  const destination = results.value[activeIndex.value];
  if (destination) {
    selectResult(destination);
    return;
  }
  const searchTerm = query.value.trim();
  if (searchTerm.length >= 2) {
    closeSearch();
    void router.push({ path: '/search', query: { q: searchTerm } });
  }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowDown' && results.value.length) {
    event.preventDefault();
    activeIndex.value = (activeIndex.value + 1) % results.value.length;
  } else if (event.key === 'ArrowUp' && results.value.length) {
    event.preventDefault();
    activeIndex.value = activeIndex.value <= 0 ? results.value.length - 1 : activeIndex.value - 1;
  } else if (event.key === 'Enter') {
    event.preventDefault();
    submitSearch();
  } else if (event.key === 'Escape' || event.key === 'Tab') {
    closeSearch();
  }
}

function handleOutsidePointer(event: PointerEvent) {
  if (root.value && !root.value.contains(event.target as Node)) closeSearch();
}

function normalizeSearchText(value: string) {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase(locale.value);
}

function getHighlightParts(name: string) {
  const searchTerm = query.value.trim();
  const normalizedTerm = normalizeSearchText(searchTerm);
  if (!normalizedTerm) return [name, '', ''];

  const sourceOffsets: Array<{ start: number; end: number }> = [];
  let normalizedName = '';
  let sourceOffset = 0;

  for (const character of name) {
    const normalizedCharacter = normalizeSearchText(character);
    normalizedName += normalizedCharacter;
    for (let index = 0; index < normalizedCharacter.length; index += 1) {
      sourceOffsets.push({ start: sourceOffset, end: sourceOffset + character.length });
    }
    sourceOffset += character.length;
  }

  const matchStart = normalizedName.indexOf(normalizedTerm);
  if (matchStart < 0) return [name, '', ''];

  const originalStart = sourceOffsets[matchStart]?.start ?? 0;
  const originalEnd = sourceOffsets[matchStart + normalizedTerm.length - 1]?.end ?? originalStart;
  return [name.slice(0, originalStart), name.slice(originalStart, originalEnd), name.slice(originalEnd)];
}

const highlightedResults = computed(() =>
  results.value.map((destination) => ({
    destination,
    parts: getHighlightParts(destination.name),
  })),
);

watch([query, locale, searchRevision], ([value], _previous, onCleanup) => {
  cancelPendingSearch();
  results.value = [];
  activeIndex.value = -1;
  hasSearched.value = false;
  errorMessage.value = '';

  const searchTerm = value.trim();
  if (searchTerm.length < 2 || !isOpen.value) return;

  debounceTimer = setTimeout(async () => {
    const controller = new AbortController();
    activeRequest = controller;
    isLoading.value = true;
    hasSearched.value = true;
    try {
      const response = await searchDestinations(searchTerm, locale.value, 8, controller.signal);
      results.value = response.data.items;
    } catch {
      if (!controller.signal.aborted) errorMessage.value = 'Search is unavailable. Please try again.';
    } finally {
      if (!controller.signal.aborted) isLoading.value = false;
    }
  }, 300);

  onCleanup(cancelPendingSearch);
});

onMounted(() => document.addEventListener('pointerdown', handleOutsidePointer));
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', handleOutsidePointer);
  cancelPendingSearch();
});
</script>

<template>
  <div
    ref="root"
    class="shrink-0"
    :class="mobileExpanded ? 'card-surface fixed inset-x-0 top-0 z-[1200] w-full rounded-none p-3' : 'relative w-10 md:w-64'"
  >
    <button
      v-if="!mobileExpanded"
      type="button"
      class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-line text-ink transition-colors hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:hidden"
      :aria-label="t('destinationSearch.label')"
      @click="openMobileSearch"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" />
      </svg>
    </button>

    <div :class="mobileExpanded ? 'flex items-center gap-3' : 'hidden md:block'">
      <div class="relative min-w-0 flex-1">
        <svg class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" />
        </svg>
        <label class="sr-only" :for="inputId">{{ t('destinationSearch.label') }}</label>
        <input
          :id="inputId"
          ref="input"
          v-model="query"
          type="search"
          role="combobox"
          :aria-label="t('destinationSearch.label')"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          :aria-expanded="isOpen"
          :aria-controls="listboxId"
          :aria-activedescendant="activeOptionId"
          autocomplete="off"
          :placeholder="hasSelectedDestination ? '' : t('destinationSearch.placeholder')"
          class="h-10 w-full rounded-lg border border-line bg-paper pl-10 pr-3 text-sm text-ink outline-none transition placeholder:text-ink-faint focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30"
          @focus="activateSearch"
          @keydown="onKeydown"
        />
      </div>
      <button
        v-if="mobileExpanded"
        type="button"
        class="shrink-0 cursor-pointer rounded px-1 py-2 text-sm text-ink-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        @click="closeSearch"
      >
        {{ t('destinationSearch.close') }}
      </button>
    </div>

    <div
      v-if="shouldShowSuggestions"
      class="card-surface absolute left-0 right-0 top-full z-[1201] mt-2 overflow-hidden rounded-lg"
    >
      <ul
        :id="listboxId"
        role="listbox"
        class="max-h-[min(20rem,calc(100dvh-5.5rem))] touch-pan-y overscroll-contain overflow-y-auto py-1"
      >
        <li v-if="isLoading" class="flex items-center gap-3 px-4 py-4 text-sm text-ink-soft" role="presentation">
          <span class="h-4 w-4 animate-spin rounded-full border-2 border-line border-t-accent" aria-hidden="true" />
          {{ t('destinationSearch.loading') }}
        </li>
        <li v-else-if="errorMessage" class="px-4 py-4 text-sm text-alert" role="status">
          {{ t('destinationSearch.error') }}
        </li>
        <li v-else-if="hasSearched && results.length === 0" class="px-4 py-4 text-sm text-ink-soft" role="status">
          {{ t('destinationSearch.noResults') }}
        </li>
        <li
          v-for="(result, index) in highlightedResults"
          :id="`${optionIdPrefix}-${index}`"
          :key="result.destination.id"
          role="option"
          :aria-selected="activeIndex === index"
          :class="['flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors', activeIndex === index ? 'bg-paper' : 'hover:bg-paper']"
          @mousedown.prevent
          @click="selectResult(result.destination)"
        >
          <img
            v-if="result.destination.image"
            :src="result.destination.image"
            alt=""
            class="h-11 w-14 shrink-0 rounded-md object-cover"
            loading="lazy"
          />
          <span v-else class="flex h-11 w-14 shrink-0 items-center justify-center rounded-md bg-paper text-accent" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
          </span>
          <span class="min-w-0 flex-1">
            <span class="block truncate text-sm font-medium text-ink">
              {{ result.parts[0] }}<mark v-if="result.parts[1]" class="bg-transparent font-bold text-accent">{{ result.parts[1] }}</mark>{{ result.parts[2] }}
            </span>
            <span class="block truncate text-xs text-ink-soft">{{ result.destination.region ? `${result.destination.region}, ` : '' }}{{ result.destination.country }}</span>
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>
