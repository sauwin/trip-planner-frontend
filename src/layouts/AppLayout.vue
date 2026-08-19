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
    <nav class="border-b border-line px-6 py-3.5 flex items-center justify-between bg-paper/95 backdrop-blur-sm sticky top-0" style="z-index: 1100">
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

    <footer class="mt-20 border-t border-line" style="background: linear-gradient(180deg, rgba(15, 82, 186, 0.04), rgba(255, 122, 89, 0.02));">
      <div class="max-w-7xl mx-auto px-6 py-16">
        <!-- Main footer grid -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <!-- Brand section -->
          <div class="md:col-span-1">
            <div class="flex items-center gap-2 mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="text-accent">
                <circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.6"/>
                <circle cx="12" cy="12" r="2" fill="currentColor"/>
              </svg>
              <span class="font-display text-lg font-semibold text-ink">TripPlanner</span>
            </div>
            <p class="text-sm text-ink-soft leading-relaxed mb-4">
              Discover, plan, and explore your next adventure with confidence.
            </p>
            <div class="flex gap-3">
              <a href="#" class="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110" style="background-color: rgba(15, 82, 186, 0.1); color: var(--color-accent);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75-2.45 7-7 7-11.6v-1Z"/>
                </svg>
              </a>
              <a href="#" class="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110" style="background-color: rgba(255, 122, 89, 0.1); color: var(--color-secondary);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a6 6 0 00-6 6v3H7v4h2v8h4v-8h3l1-4h-4V8a2 2 0 012-2h3z"/>
                </svg>
              </a>
              <a href="#" class="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110" style="background-color: rgba(16, 185, 129, 0.1); color: var(--color-sage);">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <circle cx="12" cy="12" r="3" fill="white"/>
                  <circle cx="17.5" cy="6.5" r="1.5" fill="white"/>
                </svg>
              </a>
            </div>
          </div>

          <!-- Explore -->
          <div>
            <h4 class="font-semibold text-ink mb-4 text-sm uppercase tracking-wide" style="color: var(--color-accent)">Explore</h4>
            <ul class="space-y-2.5">
              <li><router-link v-if="authStore.isAuthenticated" to="/destinations" class="text-sm text-ink-soft hover:text-ink transition-colors duration-200">Destinations</router-link></li>
              <li><router-link v-if="authStore.isAuthenticated" to="/recommendations" class="text-sm text-ink-soft hover:text-ink transition-colors duration-200">Recommendations</router-link></li>
              <li><router-link v-if="authStore.isAuthenticated" to="/trips" class="text-sm text-ink-soft hover:text-ink transition-colors duration-200">My Trips</router-link></li>
              <li><a href="#" class="text-sm text-ink-soft hover:text-ink transition-colors duration-200">Travel Guide</a></li>
            </ul>
          </div>

          <!-- Features -->
          <div>
            <h4 class="font-semibold text-ink mb-4 text-sm uppercase tracking-wide" style="color: var(--color-accent)">Features</h4>
            <ul class="space-y-2.5">
              <li><a href="#" class="text-sm text-ink-soft hover:text-ink transition-colors duration-200">Smart Planning</a></li>
              <li><a href="#" class="text-sm text-ink-soft hover:text-ink transition-colors duration-200">Budget Tracking</a></li>
              <li><a href="#" class="text-sm text-ink-soft hover:text-ink transition-colors duration-200">Recommendations</a></li>
              <li><a href="#" class="text-sm text-ink-soft hover:text-ink transition-colors duration-200">Itineraries</a></li>
            </ul>
          </div>

          <!-- Company -->
          <div>
            <h4 class="font-semibold text-ink mb-4 text-sm uppercase tracking-wide" style="color: var(--color-accent)">Company</h4>
            <ul class="space-y-2.5">
              <li><a href="#" class="text-sm text-ink-soft hover:text-ink transition-colors duration-200">About Us</a></li>
              <li><a href="#" class="text-sm text-ink-soft hover:text-ink transition-colors duration-200">Privacy Policy</a></li>
              <li><a href="#" class="text-sm text-ink-soft hover:text-ink transition-colors duration-200">Terms of Service</a></li>
              <li><a href="#" class="text-sm text-ink-soft hover:text-ink transition-colors duration-200">Contact</a></li>
            </ul>
          </div>
        </div>

        <!-- Divider -->
        <div class="h-px bg-line my-8"></div>

        <!-- Bottom section -->
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <p class="text-xs text-ink-faint text-center md:text-left">
            © 2026 TripPlanner. All rights reserved. Crafted with passion for wanderers.
          </p>
          <div class="flex gap-6 text-xs text-ink-soft">
            <a href="#" class="hover:text-ink transition-colors">Status</a>
            <a href="#" class="hover:text-ink transition-colors">Changelog</a>
            <a href="#" class="hover:text-ink transition-colors">Help Center</a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>