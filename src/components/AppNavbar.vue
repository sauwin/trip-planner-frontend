<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth.store';
import { logout as logoutApi } from '@/api/auth.api';
import LocaleSwitcher from '@/components/LocaleSwitcher.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { t } = useI18n();

const links = computed(() => [
  { to: '/destinations', label: t('nav.destinations') },
  { to: '/recommendations', label: t('nav.recommendations') },
  { to: '/trips', label: t('nav.trips') },
  { to: '/dashboard', label: t('nav.dashboard') },
]);

const isMenuOpen = ref(false);
watch(
  () => route.fullPath,
  () => {
    isMenuOpen.value = false;
  },
);

async function handleLogout() {
  isMenuOpen.value = false;
  if (authStore.refreshToken) {
    try {
      await logoutApi(authStore.refreshToken);
    } catch {
    }
  }
  authStore.logout();
  router.push('/login');
}

const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent';
</script>

<template>
  <header
    class="sticky top-0 border-b border-line bg-paper-dim backdrop-blur-sm"
    style="z-index: 1100"
    @keydown.esc="isMenuOpen = false"
  >
    <nav class="mx-auto flex h-16 max-w-7xl items-center justify-between px-6" aria-label="Main">
      <router-link to="/" class="flex items-center gap-2 rounded" :class="focusRing">
        <img src="/icon.svg" alt="" width="26" height="34" aria-hidden="true" />
        <span class="font-display text-lg font-semibold tracking-tight text-ink">TripPlanner</span>
      </router-link>

      <div class="hidden h-full items-center gap-8 md:flex">
        <template v-if="authStore.isAuthenticated">
          <router-link
            v-for="item in links"
            :key="item.to"
            :to="item.to"
            class="relative flex h-full items-center whitespace-nowrap text-sm text-ink-soft transition-colors hover:text-ink"
            :class="focusRing"
            active-class="!text-ink font-medium after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-accent after:content-['']"
          >
            {{ item.label }}
          </router-link>
          <button
            type="button"
            class="whitespace-nowrap rounded-lg bg-ink px-4 py-2 text-sm text-paper transition-colors hover:bg-accent-dark"
            :class="focusRing"
            @click="handleLogout"
          >
            {{ t('nav.logout') }}
          </button>
        </template>
        <template v-else>
          <router-link to="/login" class="whitespace-nowrap text-sm text-ink-soft transition-colors hover:text-ink" :class="focusRing">
            {{ t('nav.login') }}
          </router-link>
          <router-link
            to="/register"
            class="whitespace-nowrap rounded-lg bg-accent px-4 py-2 text-sm text-paper transition-colors hover:bg-accent-dark"
            :class="focusRing"
          >
            {{ t('nav.register') }}
          </router-link>
        </template>
        <LocaleSwitcher />
      </div>

      <div class="flex items-center gap-3 md:hidden">
        <LocaleSwitcher />
        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-lg border border-line text-ink transition-colors hover:bg-paper-dim"
          :class="focusRing"
          aria-label="Menu"
          aria-controls="mobile-menu"
          :aria-expanded="isMenuOpen"
          @click="isMenuOpen = !isMenuOpen"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <template v-if="isMenuOpen">
              <path d="M6 6l12 12M18 6L6 18" />
            </template>
            <template v-else>
              <path d="M4 7h16M4 12h16M4 17h16" />
            </template>
          </svg>
        </button>
      </div>
    </nav>

    <div v-if="isMenuOpen" id="mobile-menu" class="border-t border-line bg-paper md:hidden">
      <div class="mx-auto flex max-w-7xl flex-col px-6 py-2">
        <template v-if="authStore.isAuthenticated">
          <router-link
            v-for="item in links"
            :key="item.to"
            :to="item.to"
            class="border-b border-line py-3.5 text-base text-ink-soft"
            active-class="!text-ink font-semibold"
          >
            {{ item.label }}
          </router-link>
          <button
            type="button"
            class="my-4 rounded-lg bg-ink px-4 py-3 text-base text-paper transition-colors hover:bg-accent-dark"
            @click="handleLogout"
          >
            {{ t('nav.logout') }}
          </button>
        </template>
        <template v-else>
          <router-link to="/login" class="border-b border-line py-3.5 text-base text-ink-soft">{{ t('nav.login') }}</router-link>
          <router-link
            to="/register"
            class="my-4 rounded-lg bg-accent px-4 py-3 text-center text-base text-paper transition-colors hover:bg-accent-dark"
          >
            {{ t('nav.register') }}
          </router-link>
        </template>
      </div>
    </div>
  </header>
</template>