<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const links = computed(() => [
  { label: t('footer.about'), to: '/about' },
  { label: t('footer.privacy'), to: '/privacy' },
  { label: t('footer.terms'), to: '/terms' },
  { label: t('footer.contact'), to: '/contact' },
]);
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

    <div class="mx-auto max-w-7xl px-6 py-8">
      <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-5">
          <router-link to="/" class="inline-flex items-center gap-2 rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent">
            <img src="/icon.svg" alt="" width="24" height="31" aria-hidden="true" />
            <span class="font-display text-lg font-semibold tracking-tight text-ink">TripPlanner</span>
          </router-link>
          <p class="text-sm text-ink-soft">{{ t('footer.description') }}</p>
        </div>

        <nav :aria-label="t('footer.navLabel')">
          <ul class="flex flex-wrap gap-x-6 gap-y-2">
            <li v-for="link in links" :key="link.to">
              <router-link
                :to="link.to"
                class="rounded-sm text-sm text-ink-soft transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >{{ link.label }}</router-link>
            </li>
          </ul>
        </nav>
      </div>

      <p class="mt-6 border-t border-line pt-5 text-xs text-ink-faint">{{ t('footer.copyright') }}</p>
    </div>
  </footer>
</template>