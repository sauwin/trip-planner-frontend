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
  <div class="max-w-md mx-auto mt-16 px-4">
    <h1 class="text-2xl font-semibold mb-6">Login</h1>
    <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
      <div class="flex flex-col gap-1">
        <label for="email" class="text-sm font-medium text-gray-700">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          class="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label for="password" class="text-sm font-medium text-gray-700">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          class="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <p v-if="errorMessage" class="text-red-600 text-sm">{{ errorMessage }}</p>
      <button
        type="submit"
        :disabled="isLoading"
        class="bg-blue-600 text-white rounded-md py-2 font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isLoading ? 'Logging in...' : 'Login' }}
      </button>
    </form>
  </div>
</template>