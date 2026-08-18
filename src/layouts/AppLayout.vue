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
  <div class="min-h-screen bg-paper text-ink font-body">
    <nav class="border-b border-line px-6 py-3.5 flex items-center justify-between bg-paper/95 backdrop-blur-sm sticky top-0 z-10">
      <router-link to="/" class="flex items-center gap-2">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="text-accent">
          <circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.6"/>
          <circle cx="12" cy="12" r="2" fill="currentColor"/>
        </svg>
        <span class="font-display text-lg font-semibold tracking-tight text-ink">TripPlanner</span>
      </router-link>

      <div class="flex items-center gap-7">
        <template v-if="authStore.isAuthenticated">
          <router-link
            v-for="item in [
              { to: '/destinations', label: 'Destinations' },
              { to: '/recommendations', label: 'Recommendations' },
              { to: '/trips', label: 'My Trips' },
              { to: '/dashboard', label: 'Dashboard' },
            ]"
            :key="item.to"
            :to="item.to"
            class="text-sm text-ink-soft hover:text-ink transition-colors relative py-1"
            active-class="text-ink font-medium after:content-[''] after:absolute after:left-0 after:right-0 after:-bottom-[15px] after:h-[2px] after:bg-accent"
          >
            {{ item.label }}
          </router-link>
          <button
            @click="handleLogout"
            class="text-sm text-paper bg-ink rounded-lg px-4 py-2 hover:bg-accent-dark transition-colors"
          >
            Log out
          </button>
        </template>
        <template v-else>
          <router-link to="/login" class="text-sm text-ink-soft hover:text-ink transition-colors">Log in</router-link>
          <router-link
            to="/register"
            class="text-sm text-paper bg-accent rounded-lg px-4 py-2 hover:bg-accent-dark transition-colors"
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