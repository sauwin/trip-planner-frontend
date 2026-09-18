<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { resetPassword } from '@/api/auth.api';
import { useI18n } from 'vue-i18n';
import { getApiErrorMessage } from '@/utils/apiError';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const token = (route.query.token as string) || '';

const newPassword = ref('');
const confirmPassword = ref('');
const errorMessage = ref('');
const isLoading = ref(false);
const isSuccess = ref(false);

const passwordsMatch = computed(
  () => !confirmPassword.value || newPassword.value === confirmPassword.value,
);

async function handleSubmit() {
  errorMessage.value = '';

  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = t('auth.passwordsDontMatch');
    return;
  }

  isLoading.value = true;
  try {
    await resetPassword(token, newPassword.value);
    isSuccess.value = true;
    setTimeout(() => router.push('/login'), 2000);
  } catch (error: any) {
    errorMessage.value = getApiErrorMessage(error, t('auth.failedResetPassword'));
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-6 py-12" style="background-color: var(--color-paper)">
    <div class="w-full max-w-sm">
      <div v-if="!token" class="space-y-6">
        <p class="text-sm rounded-lg px-4 py-3" style="color: var(--color-alert); background-color: rgba(239, 68, 68, 0.1)">
          {{ t('auth.invalidResetLink') }}
        </p>
        <router-link to="/forgot-password" class="font-semibold" style="color: var(--color-accent)">
          {{ t('auth.forgotPassword') }}
        </router-link>
      </div>

      <div v-else-if="isSuccess" class="space-y-6">
        <div class="mb-10">
          <h1 class="font-display text-4xl font-bold mb-2" style="color: var(--color-ink)">{{ t('auth.resetPassword') }}</h1>
        </div>
        <p class="text-sm rounded-lg px-4 py-3" style="color: var(--color-ink); background-color: var(--color-paper-dim); border: 1px solid var(--color-line)">
          {{ t('auth.resetSuccessMessage') }}
        </p>
      </div>

      <template v-else>
        <div class="mb-10">
          <div class="inline-flex items-center gap-2 mb-4">
            <div style="width: 4px; height: 20px; background-color: var(--color-accent); border-radius: 2px"></div>
            <span class="tag-mono text-xs font-bold tracking-widest" style="color: var(--color-accent); text-transform: uppercase">{{ t('auth.resetPassword') }}</span>
          </div>
          <h1 class="font-display text-4xl font-bold mb-2" style="color: var(--color-ink)">{{ t('auth.resetPassword') }}</h1>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label for="newPassword" class="block text-sm font-semibold mb-2" style="color: var(--color-ink)">{{ t('auth.newPassword') }}</label>
            <input
              id="newPassword"
              v-model="newPassword"
              type="password"
              autocomplete="new-password"
              required
              minlength="8"
              :placeholder="t('auth.enterPassword')"
              class="w-full rounded-lg px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2"
              :style="{
                backgroundColor: 'var(--color-paper-dim)',
                color: 'var(--color-ink)',
                border: '1px solid var(--color-line)',
                '--tw-ring-color': 'var(--color-accent)'
              }"
            />
            <p class="text-xs mt-1.5" style="color: var(--color-ink-faint)">{{ t('auth.minimumPassword') }}</p>
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-semibold mb-2" style="color: var(--color-ink)">{{ t('auth.confirmNewPassword') }}</label>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              autocomplete="new-password"
              required
              :placeholder="t('auth.enterPassword')"
              class="w-full rounded-lg px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2"
              :style="{
                backgroundColor: 'var(--color-paper-dim)',
                color: passwordsMatch ? 'var(--color-ink)' : 'var(--color-alert)',
                border: passwordsMatch ? '1px solid var(--color-line)' : '1px solid var(--color-alert)',
                '--tw-ring-color': 'var(--color-accent)'
              }"
            />
          </div>

          <p v-if="errorMessage" class="text-sm rounded-lg px-4 py-3" style="color: var(--color-alert); background-color: rgba(239, 68, 68, 0.1)">{{ errorMessage }}</p>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full rounded-lg py-3 font-semibold transition-all hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed text-white"
            style="background-color: var(--color-accent)"
          >
            <span v-if="isLoading">{{ t('auth.resettingPassword') }}</span>
            <span v-else>{{ t('auth.submitResetPassword') }}</span>
          </button>
        </form>
      </template>
    </div>
  </div>
</template>