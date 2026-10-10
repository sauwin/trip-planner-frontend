<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { searchDestinations, type DestinationSearchResult } from '@/api/destinations.api';

const { locale } = useI18n();
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
    :class="mobileExpanded ? 'card-surface fixed inset-x-0 top-0 z-[1200] w-full rounded-none p-3 md:relative md:inset-auto md:w-64 md:border-0 md:bg-transparent md:p-0 md:shadow-none' : 'relative w-10 md:w-64'"
  >
    <button
      v-if="!mobileExpanded"
      type="button"
      class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-line text-ink transition-colors hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:hidden"
      aria-label="Search destinations"
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
        <label class="sr-only" :for="inputId">Search destinations</label>
        <input
          :id="inputId"
          ref="input"
          v-model="query"
          type="search"
          role="combobox"
          aria-label="Search destinations"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          :aria-expanded="isOpen"
          :aria-controls="listboxId"
          :aria-activedescendant="activeOptionId"
          autocomplete="off"
          :placeholder="hasSelectedDestination ? '' : 'Where do you want to go?'"
          class="h-10 w-full rounded-lg border border-line bg-paper pl-10 pr-3 text-sm text-ink outline-none transition placeholder:text-ink-faint focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30"
          @focus="activateSearch"
          @keydown="onKeydown"
        />
      </div>
      <button
        v-if="mobileExpanded"
        type="button"
        class="shrink-0 cursor-pointer rounded px-1 py-2 text-sm text-ink-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:hidden"
        @click="closeSearch"
      >
        Close
      </button>
    </div>

    <div
      v-if="shouldShowSuggestions && !mobileExpanded"
      class="card-surface absolute left-0 right-0 top-full z-[1201] mt-2 overflow-hidden rounded-lg"
    >
      <SearchOptions
        :results="results"
        :query="query"
        :active-index="activeIndex"
        :loading="isLoading"
        :searched="hasSearched"
        :error-message="errorMessage"
        :listbox-id="listboxId"
        :option-id-prefix="optionIdPrefix"
        @select="selectResult"
      />
    </div>
    <div
      v-if="shouldShowSuggestions && mobileExpanded"
      class="card-surface absolute left-0 right-0 top-full z-[1201] mt-3 overflow-hidden rounded-lg md:hidden"
    >
      <SearchOptions
        :results="results"
        :query="query"
        :active-index="activeIndex"
        :loading="isLoading"
        :searched="hasSearched"
        :error-message="errorMessage"
        :listbox-id="listboxId"
        :option-id-prefix="optionIdPrefix"
        @select="selectResult"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, h } from 'vue';

const SearchOptions = defineComponent({
  props: {
    results: { type: Array as () => DestinationSearchResult[], required: true },
    query: { type: String, required: true },
    activeIndex: { type: Number, required: true },
    loading: { type: Boolean, required: true },
    searched: { type: Boolean, required: true },
    errorMessage: { type: String, required: true },
    listboxId: { type: String, required: true },
    optionIdPrefix: { type: String, required: true },
  },
  emits: ['select'],
  setup(props, { emit }) {
    return () => h('ul', {
      id: props.listboxId,
      role: 'listbox',
      class: 'max-h-[min(20rem,calc(100dvh-5.5rem))] touch-pan-y overscroll-contain overflow-y-auto py-1',
    }, [
      props.loading ? h('li', { class: 'flex items-center gap-3 px-4 py-4 text-sm text-ink-soft', role: 'presentation' }, [
        h('span', { class: 'h-4 w-4 animate-spin rounded-full border-2 border-line border-t-accent', 'aria-hidden': 'true' }),
        'Searching destinations…',
      ]) : null,
      !props.loading && props.errorMessage ? h('li', { class: 'px-4 py-4 text-sm text-alert', role: 'status' }, props.errorMessage) : null,
      !props.loading && !props.errorMessage && props.searched && props.results.length === 0
        ? h('li', { class: 'px-4 py-4 text-sm text-ink-soft', role: 'status' }, 'No results found')
        : null,
      ...(!props.loading ? props.results.map((destination, index) => {
        const matchIndex = destination.name.toLocaleLowerCase().indexOf(props.query.trim().toLocaleLowerCase());
        const parts = matchIndex < 0 ? [destination.name] : [
          destination.name.slice(0, matchIndex),
          destination.name.slice(matchIndex, matchIndex + props.query.trim().length),
          destination.name.slice(matchIndex + props.query.trim().length),
        ];
        return h('li', {
          id: `${props.optionIdPrefix}-${index}`,
          role: 'option',
          'aria-selected': props.activeIndex === index,
          class: ['flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-colors', props.activeIndex === index ? 'bg-paper' : 'hover:bg-paper'],
          onMousedown: (event: MouseEvent) => event.preventDefault(),
          onClick: () => emit('select', destination),
        }, [
          destination.image
            ? h('img', { src: destination.image, alt: '', class: 'h-11 w-14 shrink-0 rounded-md object-cover', loading: 'lazy' })
            : h('span', { class: 'flex h-11 w-14 shrink-0 items-center justify-center rounded-md bg-paper text-accent', 'aria-hidden': 'true' }, [
                h('svg', { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, [
                  h('path', { d: 'M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z' }), h('circle', { cx: 12, cy: 10, r: 2.5 }),
                ]),
              ]),
          h('span', { class: 'min-w-0 flex-1' }, [
            h('span', { class: 'block truncate text-sm font-medium text-ink' }, [
              parts[0], matchIndex < 0 ? null : h('mark', { class: 'bg-transparent font-bold text-accent' }, parts[1]), parts[2],
            ]),
            h('span', { class: 'block truncate text-xs text-ink-soft' }, [destination.region ? `${destination.region}, ` : '', destination.country]),
          ]),
        ]);
      }) : []),
    ]);
  },
});

export default { components: { SearchOptions } };
</script>