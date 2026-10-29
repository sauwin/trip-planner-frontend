<script setup lang="ts">
import '@/views/home/style/home.css';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth.store';

const { t } = useI18n();
const authStore = useAuthStore();

const story = [
  { key: 'problem', color: 'var(--color-accent)' },
  { key: 'insight', color: 'var(--color-secondary)' },
  { key: 'idea', color: 'var(--color-sage)' },
];

const tech = [
  { key: 'frontend', items: ['Vue 3', 'TypeScript', 'Tailwind CSS', 'Pinia', 'Leaflet', 'Chart.js'] },
  { key: 'backend', items: ['Node.js', 'Express', 'Prisma', 'PostgreSQL', 'Zod'] },
];

const values = [
  { key: 'personal', color: 'var(--color-accent)' },
  { key: 'transparent', color: 'var(--color-secondary)' },
  { key: 'practical', color: 'var(--color-sage)' },
];

const features = [
  { key: 'destinations', to: '/destinations' },
  { key: 'recommendations', to: '/recommendations' },
  { key: 'trips', to: '/trips' },
  { key: 'dashboard', to: '/dashboard' },
];

const steps = [
  { key: 'step1', color: 'var(--color-accent)' },
  { key: 'step2', color: 'var(--color-secondary)' },
  { key: 'step3', color: 'var(--color-sage)' },
];

</script>

<template>
  <div class="bg-paper">
    <section class="hero-banner relative overflow-hidden">
      <div class="relative z-10 mx-auto w-full max-w-7xl px-6">
        <div class="flex flex-col justify-center py-12 sm:py-14 lg:w-1/2 lg:py-16 lg:pr-12">
          <div class="mb-6 inline-flex items-center gap-3">
            <div class="h-6 w-1 rounded-sm bg-accent-dark"></div>
            <span class="tag-mono text-xs font-bold uppercase tracking-widest text-accent-dark">{{ t('about.label') }}</span>
          </div>
          <h1 class="max-w-xl break-words font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-6xl lg:text-5xl xl:text-[3.75rem]">
            {{ t('about.heroTitle') }}
          </h1>
          <p class="mt-5 max-w-lg text-lg leading-relaxed text-slate-600">{{ t('about.heroText') }}</p>
          <div class="mt-8 flex flex-wrap gap-3">
            <router-link
              :to="authStore.isAuthenticated ? '/recommendations' : '/register'"
              class="inline-flex items-center justify-center rounded-lg bg-accent px-7 py-3.5 text-base font-semibold text-white transition-colors hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {{ authStore.isAuthenticated ? t('about.ctaRecommendations') : t('about.ctaRegister') }}
            </router-link>
            <router-link
              to="/contact"
              class="inline-flex items-center justify-center rounded-lg border border-ink/20 px-7 py-3.5 text-base font-semibold text-ink transition-colors hover:border-ink/40 hover:bg-white/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {{ t('about.contactUs') }}
            </router-link>
          </div>
        </div>
      </div>

      <img
        src="/hero-map.svg"
        alt=""
        aria-hidden="true"
        class="hero-map block h-[240px] w-full sm:h-[320px] lg:absolute lg:inset-y-0 lg:right-0 lg:h-full lg:w-1/2"
      />
    </section>

    <section class="mx-auto max-w-7xl px-6 py-20">
      <span class="tag-mono mb-4 block text-xs font-bold uppercase tracking-widest">{{ t('about.storyTitle') }}</span>
      <h2 class="mb-12 max-w-3xl font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
        {{ t('about.storyLead') }}
      </h2>
      <div class="grid gap-10 md:grid-cols-3 md:gap-8">
        <article v-for="(item, index) in story" :key="item.key" class="border-t-2 pt-6" :style="{ borderColor: item.color }">
          <span class="tag-mono mb-3 block text-xs font-bold uppercase tracking-widest" :style="{ color: item.color }">
            {{ String(index + 1).padStart(2, '0') }} · {{ t(`about.story.${item.key}.label`) }}
          </span>
          <h3 class="mb-3 font-display text-2xl font-bold text-ink">{{ t(`about.story.${item.key}.title`) }}</h3>
          <p class="leading-relaxed text-ink-soft">{{ t(`about.story.${item.key}.text`) }}</p>
        </article>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-6 pb-20">
      <h2 class="mb-10 max-w-xl font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{{ t('about.valuesTitle') }}</h2>
      <div class="grid gap-6 md:grid-cols-3">
        <article v-for="value in values" :key="value.key" class="card-surface relative overflow-hidden rounded-lg p-7 pt-9">
          <span class="absolute inset-x-0 top-0 h-1" :style="{ backgroundColor: value.color }" aria-hidden="true"></span>
          <h3 class="mb-3 font-display text-2xl font-bold text-ink">{{ t(`about.values.${value.key}.title`) }}</h3>
          <p class="leading-relaxed text-ink-soft">{{ t(`about.values.${value.key}.text`) }}</p>
        </article>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-6 pb-20">
      <h2 class="mb-8 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{{ t('about.featuresTitle') }}</h2>
      <ol class="border-t border-line">
        <li v-for="(feature, index) in features" :key="feature.key" class="border-b border-line">
          <router-link
            :to="feature.to"
            class="group -mx-3 grid grid-cols-[2rem_1fr_auto] items-center gap-x-4 rounded-lg px-3 py-6 transition-colors hover:bg-paper-dim focus-visible:outline-2 focus-visible:outline-accent md:grid-cols-[3rem_19rem_1fr_auto] md:gap-x-8"
          >
            <span class="font-display text-lg font-medium text-ink-faint">{{ index + 1 }}</span>
            <span class="font-display text-2xl font-bold text-ink transition-colors group-hover:text-accent">
              {{ t(`about.features.${feature.key}.title`) }}
            </span>
            <p class="col-span-2 col-start-2 mt-2 leading-relaxed text-ink-soft md:col-span-1 md:col-start-auto md:mt-0">
              {{ t(`about.features.${feature.key}.text`) }}
            </p>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="col-start-3 row-start-1 text-ink-faint transition-all group-hover:translate-x-1 group-hover:text-accent md:col-start-auto md:row-start-auto" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </router-link>
        </li>
      </ol>
    </section>

    <section class="mx-auto max-w-7xl px-6 pb-20">
      <h2 class="mb-3 max-w-xl font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{{ t('about.howTitle') }}</h2>
      <p class="mb-14 max-w-2xl text-lg text-ink-soft">{{ t('about.howIntro') }}</p>
      <ol class="home-steps grid gap-10 md:grid-cols-3">
        <li v-for="(step, index) in steps" :key="step.key" class="home-step pl-16 md:pl-0">
          <span class="home-step-marker" :style="{ backgroundColor: step.color }">{{ index + 1 }}</span>
          <h3 class="mb-3 pt-2 font-display text-2xl font-bold text-ink md:mt-8 md:pt-0">{{ t(`about.how.${step.key}Title`) }}</h3>
          <p class="max-w-sm leading-relaxed text-ink-soft">{{ t(`about.how.${step.key}Text`) }}</p>
        </li>
      </ol>
    </section>

    <section class="mx-auto max-w-7xl px-6 pb-24">
      <h2 class="mb-3 max-w-xl font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{{ t('about.builtTitle') }}</h2>
      <p class="mb-10 max-w-2xl text-lg text-ink-soft">{{ t('about.builtIntro') }}</p>
      <div class="grid gap-6 md:grid-cols-2">
        <article v-for="group in tech" :key="group.key" class="card-surface rounded-lg p-7">
          <h3 class="mb-2 font-display text-2xl font-bold text-ink">{{ t(`about.tech.${group.key}.title`) }}</h3>
          <p class="mb-6 leading-relaxed text-ink-soft">{{ t(`about.tech.${group.key}.text`) }}</p>
          <ul class="flex flex-wrap gap-2">
            <li v-for="item in group.items" :key="item" class="tag-mono rounded-lg border border-line bg-paper px-3 py-1.5 text-xs font-bold">{{ item }}</li>
          </ul>
        </article>
      </div>
    </section>
  </div>
</template>