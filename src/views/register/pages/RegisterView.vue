<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { register } from '@/api/auth.api';
import { useAuthStore } from '@/stores/auth.store';

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

const router = useRouter();
const authStore = useAuthStore();

function handleInputFocus(e: Event) {
  const target = e.target as HTMLInputElement;
  target.style.borderColor = 'var(--color-sage)';
}

function handleInputBlur(e: Event) {
  const target = e.target as HTMLInputElement;
  target.style.borderColor = 'var(--color-line)';
}

async function handleSubmit() {
  errorMessage.value = '';
  isLoading.value = true;

  try {
    const response = await register(email.value, password.value);
    authStore.setTokens(response.data.accessToken, response.data.refreshToken);
    router.push('/');
  } catch (error: any) {
    errorMessage.value = error.response?.data?.error || 'Registration failed';
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
          <div style="width: 4px; height: 20px; background-color: var(--color-sage); border-radius: 2px"></div>
          <span class="tag-mono text-xs font-bold tracking-widest" style="color: var(--color-sage); text-transform: uppercase">Get Started</span>
        </div>
        <h1 class="font-display text-4xl font-bold mb-2" style="color: var(--color-ink)">Create Account</h1>
        <p style="color: var(--color-ink-soft)">Join the adventure and start exploring destinations</p>
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
              '--tw-ring-color': 'var(--color-sage)'
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
            minlength="8"
            placeholder="Minimum 8 characters"
            class="w-full rounded-lg px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2"
            :style="{
              backgroundColor: 'var(--color-paper-dim)',
              color: 'var(--color-ink)',
              border: '1px solid var(--color-line)',
              '--tw-ring-color': 'var(--color-sage)'
            }"
            @focus="handleInputFocus"
            @blur="handleInputBlur"
          />
          <p class="text-xs mt-2" style="color: var(--color-ink-faint)">At least 8 characters for security</p>
        </div>

        <!-- Error message -->
        <p v-if="errorMessage" class="text-sm rounded-lg px-4 py-3" style="color: var(--color-alert); background-color: rgba(239, 68, 68, 0.1)">{{ errorMessage }}</p>

        <!-- Submit button -->
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full rounded-lg py-3 font-semibold transition-all hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed text-white"
          style="background-color: var(--color-sage)"
        >
          <span v-if="isLoading">Creating account...</span>
          <span v-else>Create Account</span>
        </button>
      </form>

      <!-- Divider -->
      <div class="flex items-center gap-4 mb-8" style="color: var(--color-ink-faint)">
        <div style="flex: 1; height: 1px; background-color: var(--color-line)"></div>
        <span class="text-xs font-medium">OR</span>
        <div style="flex: 1; height: 1px; background-color: var(--color-line)"></div>
      </div>

      <!-- Sign in link -->
      <p class="text-center" style="color: var(--color-ink-soft)">
        Already have an account?
        <router-link to="/login" class="font-semibold" style="color: var(--color-sage)">Sign in here</router-link>
      </p>
    </div>
  </div>
</template>