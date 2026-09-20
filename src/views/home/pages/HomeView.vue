<script setup lang="ts">
import '../style/home.css';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth.store';
import { getDestinations } from '@/api/destinations.api';
import type { Destination } from '@/types/destination.types';
import { getDestinationDisplayName } from '@/utils/destinationName';
import HeroScene from '../components/HeroScene.vue';
import PopularDestinations from '../components/PopularDestinations.vue';

const authStore = useAuthStore();
const { t, locale } = useI18n();

// Destinations endpoint is public, so the homepage can show real data even for guests.
// The backend returns the list sorted by popularity, so limit=5 gives us the top 5.
const popular = ref<Destination[]>([]);
const totalDestinations = ref<number | null>(null);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const response = await getDestinations({ limit: 5 });
    popular.value = response.data.items;
    totalDestinations.value = response.data.total;
  } catch {
    // The homepage works without this data, so no error message is shown.
  } finally {
    isLoading.value = false;
  }
});

function formatCoords(destination: Destination) {
  const lat = `${Math.abs(destination.latitude).toFixed(2)}°${destination.latitude >= 0 ? 'N' : 'S'}`;
  const lng = `${Math.abs(destination.longitude).toFixed(2)}°${destination.longitude >= 0 ? 'E' : 'W'}`;
  return `${lat} ${lng}`;
}

// The top 3 destinations (name + real coordinates) are written on the route in the hero animation.
const pinLabels = computed(() =>
  popular.value.slice(0, 3).map((d) => ({
    name: getDestinationDisplayName(d, locale.value),
    coords: formatCoords(d),
  })),
);

const steps = [
  { title: 'home.exploreTitle', text: 'home.exploreText', color: 'var(--color-accent)' },
  { title: 'home.organizeTitle', text: 'home.organizeText', color: 'var(--color-secondary)' },
  { title: 'home.trackTitle', text: 'home.trackText', color: 'var(--color-sage)' },
];
</script>

<template>
  <div class="bg-paper">
    <!-- 1. Hero banner: full width, text on the left, animated route on the right -->
    <section class="hero-banner relative overflow-hidden">
      <div class="relative z-10 w-full max-w-7xl mx-auto px-6">
        <div class="flex flex-col justify-center py-12 sm:py-14 lg:w-1/2 lg:py-16">
          <h1 class="font-display text-4xl sm:text-6xl lg:text-5xl xl:text-[3.75rem] font-bold tracking-tight leading-[1.05] text-ink break-words">
            <template v-if="authStore.isAuthenticated">{{ t('home.journeyAwaits') }}</template>
            <template v-else>{{ t('home.planAdventure') }}</template>
          </h1>

          <p class="mt-5 max-w-lg text-lg leading-relaxed text-slate-600">
            <template v-if="authStore.isAuthenticated">{{ t('home.authenticatedDescription') }}</template>
            <template v-else>{{ t('home.guestDescription') }}</template>
          </p>

          <div class="mt-8 flex flex-wrap gap-3">
            <template v-if="authStore.isAuthenticated">
              <router-link
                to="/recommendations"
                class="inline-flex items-center justify-center rounded-lg bg-accent px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {{ t('home.seeRecommendations') }}
              </router-link>
              <router-link
                to="/trips"
                class="inline-flex items-center justify-center rounded-lg border border-ink/20 px-7 py-3.5 text-base font-semibold text-ink transition-colors hover:border-ink/40 hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {{ t('home.myTrips') }}
              </router-link>
            </template>
            <template v-else>
              <router-link
                to="/register"
                class="inline-flex items-center justify-center rounded-lg bg-accent px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {{ t('home.getStarted') }}
              </router-link>
              <router-link
                to="/login"
                class="inline-flex items-center justify-center rounded-lg border border-ink/20 px-7 py-3.5 text-base font-semibold text-ink transition-colors hover:border-ink/40 hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {{ t('auth.submitLogin') }}
              </router-link>
            </template>
          </div>

          <ul class="mt-9 flex max-w-md flex-col gap-1.5 border-t border-ink/10 pt-5 text-sm text-slate-600">
            <li v-if="totalDestinations !== null">{{ t('home.factDestinations', { count: totalDestinations }) }}</li>
            <li>{{ t('home.factPicks') }}</li>
            <li>{{ t('home.factBudget') }}</li>
          </ul>
        </div>
      </div>

      <HeroScene
        :labels="pinLabels"
        class="relative z-10 block w-full h-[220px] sm:h-[300px] lg:absolute lg:inset-y-0 lg:right-0 lg:h-full lg:w-[56%]"
      />
    </section>

    <!-- 2. How it works: a real sequence, so the steps are numbered and connected by a route line -->
    <section class="max-w-7xl mx-auto px-6 pt-24 pb-4">
      <h2 class="font-display text-3xl sm:text-4xl font-bold tracking-tight text-ink max-w-xl mb-14">
        {{ t('home.stepsTitle') }}
      </h2>

      <ol class="home-steps grid gap-10 md:grid-cols-3">
        <li v-for="(step, index) in steps" :key="step.title" class="home-step pl-16 md:pl-0">
          <span class="home-step-marker" :style="{ backgroundColor: step.color }">{{ index + 1 }}</span>
          <h3 class="font-display text-2xl font-bold text-ink md:mt-8 mb-3 pt-2 md:pt-0">{{ t(step.title) }}</h3>
          <p class="max-w-sm leading-relaxed text-ink-soft">{{ t(step.text) }}</p>
        </li>
      </ol>
    </section>

    <!-- 3. Popular destinations (live data) -->
    <PopularDestinations v-if="isLoading || popular.length > 0" :destinations="popular" :loading="isLoading" />

    <!-- 4. Final call to action, only for guests -->
    <section v-if="!authStore.isAuthenticated" class="max-w-7xl mx-auto px-4 sm:px-6 pb-4">
      <div class="relative overflow-hidden rounded-[2rem] bg-accent px-8 py-14 sm:px-14 sm:py-16 text-white">
        <svg class="absolute right-0 top-0 h-full w-1/2 hidden md:block" viewBox="0 0 400 300" preserveAspectRatio="xMaxYMid slice" aria-hidden="true" focusable="false">
          <path class="home-cta-route" d="M20 270 C120 270 140 90 240 90 C320 90 330 200 390 170" />
          <circle cx="240" cy="90" r="7" fill="#FFFFFF" />
          <circle cx="390" cy="170" r="7" fill="var(--color-secondary)" />
        </svg>

        <div class="relative max-w-xl">
          <h2 class="font-display text-3xl sm:text-4xl font-bold tracking-tight">{{ t('home.ctaTitle') }}</h2>
          <p class="mt-4 text-lg leading-relaxed text-white/85">{{ t('home.ctaText') }}</p>
          <div class="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <router-link
              to="/register"
              class="inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 text-base font-semibold text-accent transition-all hover:-translate-y-0.5 hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {{ t('home.getStarted') }}
            </router-link>
            <p class="text-base text-white/85">
              {{ t('auth.haveAccount') }}
              <router-link
                to="/login"
                class="font-semibold text-white underline underline-offset-4 decoration-white/40 hover:decoration-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white rounded"
              >
                {{ t('auth.submitLogin') }}
              </router-link>
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>