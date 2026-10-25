<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();
const { t } = useI18n();

interface FooterLink {
  label: string;
  to: string;
}

const columns = computed<{ title: string; links: FooterLink[] }[]>(() => [
  {
    title: t('footer.explore'),
    links: authStore.isAuthenticated
      ? [
          { label: t('nav.destinations'), to: '/destinations' },
          { label: t('nav.recommendations'), to: '/recommendations' },
          { label: t('nav.trips'), to: '/trips' },
          { label: t('nav.dashboard'), to: '/dashboard' },
        ]
      : [
          { label: t('nav.login'), to: '/login' },
          { label: t('nav.register'), to: '/register' },
        ],
  },
  {
    title: t('footer.company'),
    links: [
      { label: t('footer.about'), to: '/about' },
      { label: t('footer.privacy'), to: '/privacy' },
      { label: t('footer.terms'), to: '/terms' },
      { label: t('footer.contact'), to: '/contact' },
    ],
  },
]);

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

    <div class="mx-auto max-w-7xl px-6 pb-6 pt-10">
      <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-[1.6fr_1fr_1fr] md:gap-12">
        <div class="sm:col-span-2 md:col-span-1">
          <router-link to="/" class="inline-flex items-center gap-2 rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
            <img src="/icon.svg" alt="" width="28" height="36" aria-hidden="true" />
            <span class="font-display text-lg font-semibold tracking-tight text-ink">TripPlanner</span>
          </router-link>

          <p class="mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">{{ t('footer.description') }}</p>
        </div>

        <div v-for="column in columns" :key="column.title">
          <h3 class="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-ink">{{ column.title }}</h3>
          <ul class="space-y-2">
            <li v-for="link in column.links" :key="link.to">
              <router-link :to="link.to" :class="linkClass">{{ link.label }}</router-link>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-8 border-t border-line pt-5">
        <p class="text-xs text-ink-faint">{{ t('footer.copyright') }}</p>
      </div>
    </div>
  </footer>
</template>