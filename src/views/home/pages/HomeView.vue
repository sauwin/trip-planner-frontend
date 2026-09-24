<script setup lang="ts">
import '../style/home.css';
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth.store';
import { getDestinations } from '@/api/destinations.api';
import type { Destination } from '@/types/destination.types';
import PopularDestinations from '../components/PopularDestinations.vue';

const authStore = useAuthStore();
const { t } = useI18n();

const popular = ref<Destination[]>([]);
const totalDestinations = ref<number | null>(null);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const response = await getDestinations({ limit: 5 });
    popular.value = response.data.items;
    totalDestinations.value = response.data.total;
  } catch {
  
  } finally {
    isLoading.value = false;
  }
});

function splitFirstWord(text: string) {
  const index = text.indexOf(' ');
  return index === -1 ? { lead: text, rest: '' } : { lead: text.slice(0, index), rest: text.slice(index) };
}

const factDestinations = computed(() =>
  totalDestinations.value === null ? null : splitFirstWord(t('home.factDestinations', { count: totalDestinations.value })),
);
const factPicks = computed(() => splitFirstWord(t('home.factPicks')));
const factBudget = computed(() => splitFirstWord(t('home.factBudget')));

const steps = [
  { title: 'home.exploreTitle', text: 'home.exploreText', color: 'var(--color-accent)' },
  { title: 'home.organizeTitle', text: 'home.organizeText', color: 'var(--color-secondary)' },
  { title: 'home.trackTitle', text: 'home.trackText', color: 'var(--color-sage)' },
];
</script>

<template>
  <div class="bg-paper">
    <section class="hero-banner relative overflow-hidden">
      <div class="relative z-10 w-full max-w-7xl mx-auto px-6">
        <div class="flex flex-col justify-center py-12 sm:py-14 lg:w-1/2 lg:py-16 lg:pr-12">
          <h1 class="max-w-xl font-display text-4xl sm:text-6xl lg:min-h-[6.3rem] lg:text-5xl xl:text-[3.75rem] font-bold tracking-tight leading-[1.05] text-ink break-words">
            <template v-if="authStore.isAuthenticated">{{ t('home.journeyAwaits') }}</template>
            <template v-else>{{ t('home.planAdventure') }}</template>
          </h1>

          <p class="mt-5 max-w-lg text-lg leading-relaxed text-slate-600 lg:min-h-[6rem]">
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

          <ul class="mt-9 flex max-w-md flex-col gap-2.5 border-t border-ink/10 pt-5 text-sm text-slate-600">
            <li class="flex min-h-6 items-center gap-2.5">
              <template v-if="factDestinations">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-secondary-dark" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span><strong class="font-semibold text-secondary-dark">{{ factDestinations.lead }}</strong>{{ factDestinations.rest }}</span>
              </template>
            </li>
            <li class="flex items-center gap-2.5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-accent" aria-hidden="true">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <path d="M22 4L12 14.01l-3-3" />
              </svg>
              <span><strong class="font-semibold text-accent">{{ factPicks.lead }}</strong>{{ factPicks.rest }}</span>
            </li>
            <li class="flex items-center gap-2.5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 text-sage-dark" aria-hidden="true">
                <path d="M20 12V8H6a2 2 0 010-4h12v4" />
                <path d="M4 6v12a2 2 0 002 2h14v-4" />
                <path d="M18 12a2 2 0 000 4h4v-4z" />
              </svg>
              <span><strong class="font-semibold text-sage-dark">{{ factBudget.lead }}</strong>{{ factBudget.rest }}</span>
            </li>
          </ul>
        </div>
      </div>

      <img
        src="/hero-map.svg"
        alt=""
        aria-hidden="true"
        class="hero-map block h-[240px] w-full sm:h-[320px] lg:absolute lg:inset-y-0 lg:right-0 lg:h-full lg:w-1/2"
      />
    </section>

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

    <PopularDestinations v-if="isLoading || popular.length > 0" :destinations="popular" :loading="isLoading" />

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