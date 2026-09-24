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
            <input
              id="password"
              v-model="password"
              type="password"
              autocomplete="new-password"
              required
              minlength="8"
              :placeholder="t('auth.enterPassword')"
              class="w-full rounded-lg border bg-paper-dim px-4 py-3 text-sm text-ink transition-colors focus:outline-none focus:ring-1 focus:ring-sage"
              :class="password && !isStrongPassword(password) ? 'border-alert' : 'border-line focus:border-sage'"
            />

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