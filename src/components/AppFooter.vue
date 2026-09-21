<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();
const { t } = useI18n();

interface FooterLink {
  label: string;
  to?: string;
}

const columns = computed<{ title: string; links: FooterLink[] }[]>(() => [
  {
    title: t('footer.explore'),
    links: [
      ...(authStore.isAuthenticated
        ? [
            { label: t('nav.destinations'), to: '/destinations' },
            { label: t('nav.recommendations'), to: '/recommendations' },
            { label: t('nav.trips'), to: '/trips' },
          ]
        : [
            { label: t('nav.login'), to: '/login' },
            { label: t('nav.register'), to: '/register' },
          ]),
      { label: t('footer.travelGuide') },
    ],
  },
  {
    title: t('footer.features'),
    links: [
      { label: t('footer.smartPlanning') },
      { label: t('footer.budgetTracking') },
      { label: t('nav.recommendations') },
      { label: t('footer.itineraries') },
    ],
  },
  {
    title: t('footer.company'),
    links: [
      { label: t('footer.about') },
      { label: t('footer.privacy') },
      { label: t('footer.terms') },
      { label: t('footer.contact') },
    ],
  },
]);

const legalLinks = computed<FooterLink[]>(() => [
  { label: t('footer.status') },
  { label: t('footer.changelog') },
  { label: t('footer.help') },
]);

const socials = [
  {
    name: 'Twitter',
    path: 'M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z',
  },
  {
    name: 'Facebook',
    path: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z',
  },
];

const linkClass =
  'rounded-sm text-sm text-ink-soft transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent';
</script>

<template>
  <footer class="relative mt-16 border-t border-line bg-paper-dim">
    <div class="absolute left-0 right-0 top-0 mx-auto max-w-7xl px-6" aria-hidden="true">
      <div class="flex h-[3px] w-24 -translate-y-px">
        <span class="flex-1 bg-accent"></span>
        <span class="flex-1 bg-secondary"></span>
        <span class="flex-1 bg-sage"></span>
      </div>
    </div>

    <div class="mx-auto max-w-7xl px-6 pb-8 pt-14">
      <div class="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-12">
        <div class="sm:col-span-2 md:col-span-1">
          <router-link to="/" class="inline-flex items-center gap-2 rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
            <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 2 C7.58 2 4 5.58 4 10 C4 16 12 22 12 22 C12 22 20 16 20 10 C20 5.58 16.42 2 12 2 Z"
                style="fill: var(--color-accent)"
              />
              <circle cx="12" cy="10" r="3.6" style="fill: var(--color-paper-dim)" />
              <circle cx="12" cy="10" r="1.5" style="fill: var(--color-secondary)" />
            </svg>
            <span class="font-display text-lg font-semibold tracking-tight text-ink">TripPlanner</span>
          </router-link>

          <p class="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">{{ t('footer.description') }}</p>

          <div class="mt-6 flex gap-2">
            <a
              v-for="social in socials"
              :key="social.name"
              href="#"
              :aria-label="social.name"
              class="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink-soft transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              @click.prevent
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path :d="social.path" />
              </svg>
            </a>
            <a
              href="#"
              aria-label="Instagram"
              class="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink-soft transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              @click.prevent
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <path d="M17.5 6.5h.01" />
              </svg>
            </a>
          </div>
        </div>

        <div v-for="column in columns" :key="column.title">
          <h3 class="mb-4 text-xs font-semibold uppercase tracking-[0.1em] text-ink">{{ column.title }}</h3>
          <ul class="space-y-3">
            <li v-for="link in column.links" :key="link.label">
              <router-link v-if="link.to" :to="link.to" :class="linkClass">{{ link.label }}</router-link>
              <a v-else href="#" :class="linkClass" @click.prevent>{{ link.label }}</a>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-12 flex flex-col-reverse gap-4 border-t border-line pt-6 md:flex-row md:items-center md:justify-between">
        <p class="text-xs text-ink-faint">{{ t('footer.copyright') }}</p>
        <ul class="flex flex-wrap gap-x-6 gap-y-2">
          <li v-for="link in legalLinks" :key="link.label">
            <a href="#" class="rounded-sm text-xs text-ink-soft transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent" @click.prevent>{{ link.label }}</a>
          </li>
        </ul>
      </div>
    </div>
  </footer>
</template>