<script setup lang="ts">
import { ref } from 'vue';
import { forgotPassword } from '@/api/auth.api';
import { useI18n } from 'vue-i18n';
import { getApiErrorMessage } from '@/utils/apiError';

const email = ref('');
const isLoading = ref(false);
const errorMessage = ref('');
const isSubmitted = ref(false);

const { t } = useI18n();

async function handleSubmit() {
  errorMessage.value = '';
  isLoading.value = true;

  try {
    await forgotPassword(email.value);
    isSubmitted.value = true;
  } catch (error: unknown) {
    errorMessage.value = getApiErrorMessage(error, t('auth.failedForgotPassword'));
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-paper px-6 py-12">
    <div class="w-full max-w-sm">
      <div class="mb-10">
        <div class="mb-4 inline-flex items-center gap-2">
          <span class="h-5 w-1 rounded-full bg-accent"></span>
          <span class="tag-mono text-xs font-bold uppercase tracking-widest text-accent">{{ t('auth.forgotPassword') }}</span>
        </div>
        <h1 class="font-display text-4xl font-bold text-ink">{{ t('auth.forgotPasswordHeadline') }}</h1>
        <p class="mt-2 text-ink-soft">{{ t('auth.forgotPasswordSubtext') }}</p>
      </div>

      <div v-if="isSubmitted" class="space-y-6">
        <p class="rounded-lg border border-line bg-paper-dim px-4 py-3 text-sm text-ink">
          {{ t('auth.resetLinkSentMessage') }}
        </p>
        <router-link to="/login" class="font-semibold text-accent hover:text-accent-dark">
          {{ t('auth.backToLogin') }}
        </router-link>
      </div>

      <form v-else class="space-y-5" @submit.prevent="handleSubmit">
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

        <p v-if="errorMessage" class="rounded-lg bg-alert/10 px-4 py-3 text-sm text-alert">{{ errorMessage }}</p>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full rounded-lg bg-accent py-3 font-semibold text-white transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span v-if="isLoading">{{ t('auth.sendingResetLink') }}</span>
          <span v-else>{{ t('auth.sendResetLink') }}</span>
        </button>

        <p class="text-center text-ink-soft">
          <router-link to="/login" class="font-semibold text-accent hover:text-accent-dark">{{ t('auth.backToLogin') }}</router-link>
        </p>
      </form>
    </div>
  </div>
</template>