<script setup lang="ts">
import '@/main.css';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { login } from '@/api/auth.api';
import { useAuthStore } from '@/stores/auth.store';
import { useI18n } from 'vue-i18n';
import { getApiErrorMessage } from '@/utils/apiError';

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { t } = useI18n();

async function handleSubmit() {
  errorMessage.value = '';
  isLoading.value = true;

  try {
    const response = await login(email.value, password.value);
    authStore.setTokens(response.data.accessToken, response.data.refreshToken);
    const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/') ? route.query.redirect : '/';
    router.push(redirect);
  } catch (error: unknown) {
    errorMessage.value = getApiErrorMessage(error, t('auth.failedLogin'));
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-screen bg-paper">
    <div class="relative hidden flex-col justify-between overflow-hidden bg-[linear-gradient(135deg,var(--color-accent-light),var(--color-accent)_55%,var(--color-accent-dark))] p-12 md:flex md:w-1/2 lg:p-16">
      <div class="route-glow" aria-hidden="true"></div>

      <router-link to="/" class="relative flex items-center gap-2.5">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <span class="font-display text-lg font-bold tracking-tight text-white">TripPlanner</span>
      </router-link>

      <div class="absolute inset-x-12 top-1/2 max-w-sm -translate-y-1/2 lg:inset-x-16">
        <p class="mb-4 text-xs font-bold uppercase tracking-widest text-white/80">{{ t('auth.welcomeBack') }}</p>
        <h2 class="font-display text-4xl font-bold leading-tight text-white lg:text-[2.75rem]">
          {{ t('auth.loginHeadlineLine1') }}<br />{{ t('auth.loginHeadlineLine2') }}
        </h2>
        <p class="mt-4 text-base leading-relaxed text-white/90">{{ t('auth.loginSubtext') }}</p>
      </div>
    </div>

    <div class="flex w-full items-center justify-center px-6 py-12 md:w-1/2">
      <div class="w-full max-w-sm">
        <router-link to="/" class="mb-10 flex items-center gap-2 text-ink md:hidden">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span class="font-display text-base font-bold">TripPlanner</span>
        </router-link>

        <div class="mb-10">
          <div class="mb-4 inline-flex items-center gap-2">
            <span class="h-5 w-1 rounded-full bg-accent"></span>
            <span class="tag-mono text-xs font-bold uppercase tracking-widest text-accent">{{ t('auth.welcomeBack') }}</span>
          </div>
          <h1 class="font-display text-4xl font-bold text-ink">{{ t('auth.login') }}</h1>
          <p class="mt-2 text-ink-soft">{{ t('auth.accessTrips') }}</p>
        </div>

        <form class="mb-8 space-y-5" @submit.prevent="handleSubmit">
          <div>
            <label for="email" class="mb-2 block text-sm font-semibold text-ink">{{ t('auth.emailAddress') }}</label>
            <input
              id="email"
              v-model="email"
              type="email"
              autocomplete="email"
              required
              placeholder="you@example.com"
              class="w-full rounded-lg border border-line bg-paper-dim px-4 py-3 text-sm text-ink transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div>
            <label for="password" class="mb-2 block text-sm font-semibold text-ink">{{ t('auth.password') }}</label>
            <input
              id="password"
              v-model="password"
              type="password"
              autocomplete="current-password"
              required
              :placeholder="t('auth.enterPassword')"
              class="w-full rounded-lg border border-line bg-paper-dim px-4 py-3 text-sm text-ink transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          <div class="-mt-2 text-right">
            <router-link to="/forgot-password" class="text-sm font-semibold text-accent hover:text-accent-dark">{{ t('auth.forgotPassword') }}</router-link>
          </div>

          <p v-if="errorMessage" class="rounded-lg bg-alert/10 px-4 py-3 text-sm text-alert">{{ errorMessage }}</p>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full rounded-lg bg-accent py-3 font-semibold text-white transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span v-if="isLoading">{{ t('auth.signingIn') }}</span>
            <span v-else>{{ t('auth.submitLogin') }}</span>
          </button>
        </form>

        <div class="mb-8 flex items-center gap-4 text-ink-faint">
          <span class="h-px flex-1 bg-line"></span>
          <span class="text-xs font-medium">{{ t('auth.or') }}</span>
          <span class="h-px flex-1 bg-line"></span>
        </div>

        <p class="text-center text-ink-soft">
          {{ t('auth.noAccount') }}
          <router-link to="/register" class="font-semibold text-accent hover:text-accent-dark">{{ t('auth.createOneNow') }}</router-link>
        </p>
      </div>
    </div>
  </div>
</template>