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
  } catch (error: any) {
    errorMessage.value = getApiErrorMessage(error, t('auth.failedForgotPassword'));
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-6 py-12" style="background-color: var(--color-paper)">
    <div class="w-full max-w-sm">
      <div class="mb-10">
        <div class="inline-flex items-center gap-2 mb-4">
          <div style="width: 4px; height: 20px; background-color: var(--color-accent); border-radius: 2px"></div>
          <span class="tag-mono text-xs font-bold tracking-widest" style="color: var(--color-accent); text-transform: uppercase">{{ t('auth.forgotPassword') }}</span>
        </div>
        <h1 class="font-display text-4xl font-bold mb-2" style="color: var(--color-ink)">{{ t('auth.forgotPasswordHeadline') }}</h1>
        <p style="color: var(--color-ink-soft)">{{ t('auth.forgotPasswordSubtext') }}</p>
      </div>

      <div v-if="isSubmitted" class="space-y-6">
        <p class="text-sm rounded-lg px-4 py-3" style="color: var(--color-ink); background-color: var(--color-paper-dim); border: 1px solid var(--color-line)">
          {{ t('auth.resetLinkSentMessage') }}
        </p>
        <router-link to="/login" class="font-semibold" style="color: var(--color-accent)">
          {{ t('auth.backToLogin') }}
        </router-link>
      </div>

      <form v-else @submit.prevent="handleSubmit" class="space-y-5">
        <div>
          <label for="email" class="block text-sm font-semibold mb-2" style="color: var(--color-ink)">{{ t('auth.emailAddress') }}</label>
          <input
            id="email"
            v-model="email"
            type="email"
            autocomplete="email"
            required
            placeholder="you@example.com"
            class="w-full rounded-lg px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2"
            :style="{
              backgroundColor: 'var(--color-paper-dim)',
              color: 'var(--color-ink)',
              border: '1px solid var(--color-line)',
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
          <span v-if="isLoading">{{ t('auth.sendingResetLink') }}</span>
          <span v-else>{{ t('auth.sendResetLink') }}</span>
        </button>

        <p class="text-center" style="color: var(--color-ink-soft)">
          <router-link to="/login" class="font-semibold" style="color: var(--color-accent)">{{ t('auth.backToLogin') }}</router-link>
        </p>
      </form>
    </div>
  </div>
</template>