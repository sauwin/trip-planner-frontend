<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import { logout as logoutApi } from '@/api/auth.api';

const router = useRouter();
const authStore = useAuthStore();

async function handleLogout() {
  if (authStore.refreshToken) {
    try {
      await logoutApi(authStore.refreshToken);
    } catch {
        
    }
  }
  authStore.logout();
  router.push('/login');
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <router-link to="/" class="text-lg font-semibold text-gray-900">TripPlanner</router-link>

      <div class="flex items-center gap-6">
        <template v-if="authStore.isAuthenticated">
          <router-link to="/destinations" class="text-sm text-gray-600 hover:text-gray-900">Destinations</router-link>
          <router-link to="/recommendations" class="text-sm text-gray-600 hover:text-gray-900">Recommendations</router-link>
          <router-link to="/trips" class="text-sm text-gray-600 hover:text-gray-900">My Trips</router-link>
          <router-link to="/dashboard" class="text-sm text-gray-600 hover:text-gray-900">Dashboard</router-link>
          <button
            @click="handleLogout"
            class="text-sm text-white bg-gray-800 rounded-md px-4 py-2 hover:bg-gray-900"
          >
            Logout
          </button>
        </template>
        <template v-else>
          <router-link to="/login" class="text-sm text-gray-600 hover:text-gray-900">Login</router-link>
          <router-link
            to="/register"
            class="text-sm text-white bg-blue-600 rounded-md px-4 py-2 hover:bg-blue-700"
          >
            Register
          </router-link>
        </template>
      </div>
    </nav>

    <main>
      <slot />
    </main>
  </div>
</template>