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
  <div class="min-h-screen" style="background-color: var(--color-paper)">
    <div class="max-w-md mx-auto mt-20 px-4 pb-20">
      <div class="mb-8">
        <p class="tag-mono uppercase" style="color: var(--color-sage)">Auth</p>
        <h1 class="font-display text-3xl font-semibold tracking-tight mt-2" style="color: var(--color-ink)">Join us</h1>
        <p class="text-sm mt-2" style="color: var(--color-ink-soft)">Create an account to start exploring destinations.</p>
      </div>

      <form @submit.prevent="handleSubmit" class="flex flex-col gap-5">
        <div class="flex flex-col gap-2">
          <label for="email" class="text-sm font-medium" style="color: var(--color-ink)">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="rounded-lg px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2"
            :style="{
              backgroundColor: 'var(--color-paper-dim)',
              color: 'var(--color-ink)',
              border: '1.5px solid var(--color-line)'
            }"
            @focus="handleInputFocus"
            @blur="handleInputBlur"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label for="password" class="text-sm font-medium" style="color: var(--color-ink)">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            minlength="8"
            class="rounded-lg px-4 py-2.5 text-sm transition-all focus:outline-none focus:ring-2"
            :style="{
              backgroundColor: 'var(--color-paper-dim)',
              color: 'var(--color-ink)',
              border: '1.5px solid var(--color-line)'
            }"
            @focus="handleInputFocus"
            @blur="handleInputBlur"
          />
          <p class="text-xs" style="color: var(--color-ink-faint)">Minimum 8 characters</p>
        </div>
        <p v-if="errorMessage" class="text-sm rounded-lg px-3 py-2" style="color: var(--color-alert); background-color: rgba(179, 65, 58, 0.1)">{{ errorMessage }}</p>
        <button
          type="submit"
          :disabled="isLoading"
          class="rounded-lg py-2.5 font-medium transition-all hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed text-white"
          style="background-color: var(--color-sage)"
        >
          {{ isLoading ? 'Creating account...' : 'Register' }}
        </button>
      </form>

      <p class="text-center text-sm mt-6" style="color: var(--color-ink-soft)">
        Already have an account?
        <router-link to="/login" class="font-medium" style="color: var(--color-sage)">Sign in</router-link>
      </p>
    </div>
  </div>
</template>