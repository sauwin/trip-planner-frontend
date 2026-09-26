<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { resetPassword } from '@/api/auth.api';
import { useI18n } from 'vue-i18n';
import { getApiErrorMessage } from '@/utils/apiError';
import { getPasswordStrength, isStrongPassword } from '@/utils/passwordStrength';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const token = (route.query.token as string) || '';

const newPassword = ref('');
const confirmPassword = ref('');
const errorMessage = ref('');
const isLoading = ref(false);
const isSuccess = ref(false);

const passwordsMatch = computed(() => !confirmPassword.value || newPassword.value === confirmPassword.value);
const passwordStrength = computed(() => getPasswordStrength(newPassword.value));
const passwordStrengthLabels = computed(() => ({
  empty: t('auth.passwordStrengthLevels.empty'),
  weak: t('auth.passwordStrengthLevels.weak'),
  medium: t('auth.passwordStrengthLevels.medium'),
  strong: t('auth.passwordStrengthLevels.strong'),
}));

async function handleSubmit() {
  errorMessage.value = '';

  if (!isStrongPassword(newPassword.value)) {
    errorMessage.value = t('auth.passwordSecurity');
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = t('auth.passwordsDontMatch');
    return;
  }

  isLoading.value = true;
  try {
    await resetPassword(token, newPassword.value);
    isSuccess.value = true;
    setTimeout(() => router.push('/login'), 2000);
  } catch (error: unknown) {
    errorMessage.value = getApiErrorMessage(error, t('auth.failedResetPassword'));
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-paper px-6 py-12">
    <div class="w-full max-w-sm">
      <div v-if="!token" class="space-y-6">
        <p class="rounded-lg bg-alert/10 px-4 py-3 text-sm text-alert">{{ t('auth.invalidResetLink') }}</p>
        <router-link to="/forgot-password" class="font-semibold text-accent hover:text-accent-dark">
          {{ t('auth.forgotPassword') }}
        </router-link>
      </div>

      <div v-else-if="isSuccess" class="space-y-6">
        <h1 class="font-display text-4xl font-bold text-ink">{{ t('auth.resetPassword') }}</h1>
        <p class="rounded-lg border border-line bg-paper-dim px-4 py-3 text-sm text-ink">{{ t('auth.resetSuccessMessage') }}</p>
      </div>

      <template v-else>
        <div class="mb-10">
          <div class="mb-4 inline-flex items-center gap-2">
            <span class="h-5 w-1 rounded-full bg-accent"></span>
            <span class="tag-mono text-xs font-bold uppercase tracking-widest text-accent">{{ t('auth.resetPassword') }}</span>
          </div>
          <h1 class="font-display text-4xl font-bold text-ink">{{ t('auth.resetPassword') }}</h1>
        </div>

        <form class="space-y-5" @submit.prevent="handleSubmit">
          <div>
            <label for="newPassword" class="mb-2 block text-sm font-semibold text-ink">{{ t('auth.newPassword') }}</label>
            <input
              id="newPassword"
              v-model="newPassword"
              type="password"
              autocomplete="new-password"
              required
              minlength="8"
              :placeholder="t('auth.enterPassword')"
              class="w-full rounded-lg border bg-paper-dim px-4 py-3 text-sm text-ink transition-colors focus:outline-none focus:ring-1 focus:ring-accent"
              :class="newPassword && !isStrongPassword(newPassword) ? 'border-alert' : 'border-line focus:border-accent'"
            />

            <div v-if="newPassword" class="mt-3 space-y-2">
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

          <div>
            <label for="confirmPassword" class="mb-2 block text-sm font-semibold text-ink">{{ t('auth.confirmNewPassword') }}</label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              autocomplete="new-password"
              required
              :placeholder="t('auth.enterPassword')"
              class="w-full rounded-lg border bg-paper-dim px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-1 focus:ring-accent"
              :class="passwordsMatch ? 'border-line text-ink focus:border-accent' : 'border-alert text-alert'"
            />
          </div>

          <p v-if="errorMessage" class="rounded-lg bg-alert/10 px-4 py-3 text-sm text-alert">{{ errorMessage }}</p>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full rounded-lg bg-accent py-3 font-semibold text-white transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span v-if="isLoading">{{ t('auth.resettingPassword') }}</span>
            <span v-else>{{ t('auth.submitResetPassword') }}</span>
          </button>
        </form>
      </template>
    </div>
  </div>
</template>