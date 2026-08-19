<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '@/api/auth.api';
import { useAuthStore } from '@/stores/auth.store';

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

const router = useRouter();
const authStore = useAuthStore();

function handleInputFocus(e: Event) {
  const target = e.target as HTMLInputElement;
  target.style.borderColor = 'var(--color-accent)';
}

function handleInputBlur(e: Event) {
  const target = e.target as HTMLInputElement;
  target.style.borderColor = 'var(--color-line)';
}

async function handleSubmit() {
  errorMessage.value = '';
  isLoading.value = true;

  try {
    const response = await login(email.value, password.value);
    authStore.setTokens(response.data.accessToken, response.data.refreshToken);
    router.push('/');
  } catch (error: any) {
    errorMessage.value = error.response?.data?.error || 'Login failed';
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div style="background-color: var(--color-paper); min-height: 100vh; display: flex; align-items: center; justify-content: center">
    <div class="w-full max-w-md px-6 py-8">
      <!-- Header -->
      <div class="mb-10">
        <div class="inline-flex items-center gap-2 mb-4">
          <div style="width: 4px; height: 20px; background-color: var(--color-accent); border-radius: 2px"></div>
          <span class="tag-mono text-xs font-bold tracking-widest" style="color: var(--color-accent); text-transform: uppercase">Welcome Back</span>
        </div>
        <h1 class="font-display text-4xl font-bold mb-2" style="color: var(--color-ink)">Sign in</h1>
        <p style="color: var(--color-ink-soft)">Access your trips and start exploring</p>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-5 mb-8">
        <!-- Email -->
        <div>
          <label for="email" class="block text-sm font-semibold mb-2" style="color: var(--color-ink)">Email Address</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="you@example.com"
            class="w-full rounded-lg px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2"
            :style="{
              backgroundColor: 'var(--color-paper-dim)',
              color: 'var(--color-ink)',
              border: '1px solid var(--color-line)',
              '--tw-ring-color': 'var(--color-accent)'
            }"
            @focus="handleInputFocus"
            @blur="handleInputBlur"
          />
        </div>

        <!-- Password -->
        <div>
          <label for="password" class="block text-sm font-semibold mb-2" style="color: var(--color-ink)">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="Enter your password"
            class="w-full rounded-lg px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2"
            :style="{
              backgroundColor: 'var(--color-paper-dim)',
              color: 'var(--color-ink)',
              border: '1px solid var(--color-line)',
              '--tw-ring-color': 'var(--color-accent)'
            }"
            @focus="handleInputFocus"
            @blur="handleInputBlur"
          />
        </div>

        <!-- Error message -->
        <p v-if="errorMessage" class="text-sm rounded-lg px-4 py-3" style="color: var(--color-alert); background-color: rgba(239, 68, 68, 0.1)">{{ errorMessage }}</p>

        <!-- Submit button -->
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full rounded-lg py-3 font-semibold transition-all hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed text-white"
          style="background-color: var(--color-accent)"
        >
          <span v-if="isLoading">Signing in...</span>
          <span v-else>Sign in</span>
        </button>
      </form>

      <!-- Divider -->
      <div class="flex items-center gap-4 mb-8" style="color: var(--color-ink-faint)">
        <div style="flex: 1; height: 1px; background-color: var(--color-line)"></div>
        <span class="text-xs font-medium">OR</span>
        <div style="flex: 1; height: 1px; background-color: var(--color-line)"></div>
      </div>

      <!-- Sign up link -->
      <p class="text-center" style="color: var(--color-ink-soft)">
        Don't have an account?
        <router-link to="/register" class="font-semibold" style="color: var(--color-accent)">Create one now</router-link>
      </p>
    </div>
  </div>
</template>