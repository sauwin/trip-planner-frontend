<script setup lang="ts">
import '@/main.css';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { register } from '@/api/auth.api';
import { useAuthStore } from '@/stores/auth.store';
import { useI18n } from 'vue-i18n';
import { getApiErrorMessage } from '@/utils/apiError';
import { getPasswordStrength, isStrongPassword } from '@/utils/passwordStrength';

const email = ref('');
const password = ref('');
const isPasswordVisible = ref(false);
const errorMessage = ref('');
const isLoading = ref(false);

const router = useRouter();
const authStore = useAuthStore();
const { t } = useI18n();
const passwordStrength = computed(() => getPasswordStrength(password.value));

const passwordStrengthLabels = computed(() => ({
  empty: t('auth.passwordStrengthLevels.empty'),
  weak: t('auth.passwordStrengthLevels.weak'),
  medium: t('auth.passwordStrengthLevels.medium'),
  strong: t('auth.passwordStrengthLevels.strong'),
}));

async function handleSubmit() {
  errorMessage.value = '';

  if (!isStrongPassword(password.value)) {
    errorMessage.value = t('auth.passwordSecurity');
    return;
  }

  isLoading.value = true;

  try {
    const response = await register(email.value, password.value);
    authStore.setTokens(response.data.accessToken, response.data.refreshToken);
    router.push('/');
  } catch (error: unknown) {
    errorMessage.value = getApiErrorMessage(error, t('auth.failedRegister'));
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-screen bg-paper">
    <div class="relative hidden flex-col justify-between overflow-hidden bg-[linear-gradient(135deg,#34D399,var(--color-sage)_55%,var(--color-sage-dark))] p-12 md:flex md:w-1/2 lg:p-16">
      <div class="route-glow" aria-hidden="true"></div>

      <router-link to="/" class="relative flex items-center gap-2.5">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <span class="font-display text-lg font-bold tracking-tight text-white">TripPlanner</span>
      </router-link>

      <div class="absolute inset-x-12 top-1/2 max-w-sm -translate-y-1/2 lg:inset-x-16">
        <p class="mb-4 text-xs font-bold uppercase tracking-widest text-white/80">{{ t('auth.getStarted') }}</p>
        <h2 class="font-display text-4xl font-bold leading-tight text-white lg:text-[2.75rem]">
          {{ t('auth.registerHeadlineLine1') }}<br />{{ t('auth.registerHeadlineLine2') }}
        </h2>
        <p class="mt-4 text-base leading-relaxed text-white/90">{{ t('auth.registerSubtext') }}</p>
      </div>
    </div>

    <div class="flex w-full items-center justify-center px-6 py-12 md:w-1/2">
      <div class="w-full max-w-sm">
        <router-link to="/" class="mb-10 flex items-center gap-2 text-ink md:hidden">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-sage)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          <span class="font-display text-base font-bold">TripPlanner</span>
        </router-link>

        <div class="mb-10">
          <div class="mb-4 inline-flex items-center gap-2">
            <span class="h-5 w-1 rounded-full bg-sage"></span>
            <span class="tag-mono text-xs font-bold uppercase tracking-widest text-sage-dark">{{ t('auth.getStarted') }}</span>
          </div>
          <h1 class="font-display text-4xl font-bold text-ink">{{ t('auth.createAccount') }}</h1>
          <p class="mt-2 text-ink-soft">{{ t('auth.joinAdventure') }}</p>
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
              class="w-full rounded-lg border border-line bg-paper-dim px-4 py-3 text-sm text-ink transition-colors focus:border-sage focus:outline-none focus:ring-1 focus:ring-sage"
            />
          </div>

          <div>
            <label for="password" class="mb-2 block text-sm font-semibold text-ink">{{ t('auth.password') }}</label>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="isPasswordVisible ? 'text' : 'password'"
                autocomplete="new-password"
                required
                minlength="8"
                :placeholder="t('auth.enterPassword')"
                class="w-full rounded-lg border bg-paper-dim px-4 py-3 pr-12 text-sm text-ink transition-colors focus:outline-none focus:ring-1 focus:ring-sage"
                :class="password && !isStrongPassword(password) ? 'border-alert' : 'border-line focus:border-sage'"
              />
              <button
                type="button"
                class="absolute inset-y-0 right-0 flex items-center px-4 text-ink-soft transition-colors hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-sage"
                :aria-label="isPasswordVisible ? t('auth.hidePassword') : t('auth.showPassword')"
                :aria-pressed="isPasswordVisible"
                @click="isPasswordVisible = !isPasswordVisible"
              >
                <svg v-if="isPasswordVisible" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M3 3l18 18" />
                  <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                  <path d="M9.9 5.2A11.2 11.2 0 0 1 12 5c5 0 8.3 4.5 9 7-.3 1.1-1.2 2.6-2.6 3.9" />
                  <path d="M6.2 6.2C3.9 7.6 2.4 9.8 2 12c.7 2.5 4 7 10 7 1.1 0 2.1-.2 3-.5" />
                </svg>
                <svg v-else class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>

            <div v-if="password" class="mt-3 space-y-2">
              <div class="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
                <span>{{ t('auth.passwordStrength') }}</span>
                <span :style="{ color: passwordStrength.color }">{{ passwordStrengthLabels[passwordStrength.labelKey] }}</span>
              </div>
              <div class="h-2 w-full overflow-hidden rounded-full bg-line">
                <div
                  class="h-full rounded-full transition-all duration-200"
                  :style="{ width: `${(passwordStrength.score / 3) * 100}%`, backgroundColor: passwordStrength.color }"
                />
              </div>
            </div>
          </div>

          <p v-if="errorMessage" class="rounded-lg bg-alert/10 px-4 py-3 text-sm text-alert">{{ errorMessage }}</p>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full rounded-lg bg-sage py-3 font-semibold text-white transition-colors hover:bg-sage-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span v-if="isLoading">{{ t('auth.creatingAccount') }}</span>
            <span v-else>{{ t('auth.submitRegister') }}</span>
          </button>
        </form>

        <div class="mb-8 flex items-center gap-4 text-ink-faint">
          <span class="h-px flex-1 bg-line"></span>
          <span class="text-xs font-medium">{{ t('auth.or') }}</span>
          <span class="h-px flex-1 bg-line"></span>
        </div>

        <p class="text-center text-ink-soft">
          {{ t('auth.haveAccount') }}
          <router-link to="/login" class="font-semibold text-sage-dark hover:text-sage">{{ t('auth.signInHere') }}</router-link>
        </p>
      </div>
    </div>
  </div>
</template>