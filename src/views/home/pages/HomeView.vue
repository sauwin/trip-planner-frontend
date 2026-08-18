<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();
</script>

<template>
  <div class="min-h-screen" style="background-color: var(--color-paper)">
    <div class="max-w-5xl mx-auto mt-20 px-4 pb-20">
      <!-- Hero section -->
      <div class="text-center mb-20">
        <p class="tag-mono uppercase" style="color: var(--color-accent)">Welcome</p>
        <h1 class="font-display text-5xl font-bold tracking-tight mt-3 mb-6" style="color: var(--color-ink)">
          Plan your journey
        </h1>
        <p class="text-xl max-w-2xl mx-auto" style="color: var(--color-ink-soft)">
          Discover personalized destination recommendations, organize your trips, track expenses, and book accommodations—all in one place.
        </p>
      </div>

      <!-- CTA Section -->
      <div v-if="!authStore.isAuthenticated" class="bg-gradient-to-br rounded-2xl p-12 text-center mb-16" style="background: linear-gradient(135deg, var(--color-paper-dim) 0%, var(--color-paper) 100%); border: 2px solid var(--color-line)">
        <h2 class="font-display text-2xl font-semibold mb-4" style="color: var(--color-ink)">Get started today</h2>
        <p class="mb-8" style="color: var(--color-ink-soft)">Create an account to unlock personalized recommendations and plan your perfect trip.</p>
        <div class="flex gap-4 justify-center">
          <router-link
            to="/login"
            class="px-8 py-3 font-medium rounded-lg transition-all hover:shadow-md"
            style="background-color: var(--color-paper); color: var(--color-accent); border: 2px solid var(--color-accent)"
          >
            Log in
          </router-link>
          <router-link
            to="/register"
            class="px-8 py-3 font-medium rounded-lg transition-all hover:shadow-md text-white"
            style="background-color: var(--color-accent)"
          >
            Register
          </router-link>
        </div>
      </div>

      <!-- Features section for authenticated users -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div class="rounded-xl p-8 text-center" style="background-color: var(--color-paper-dim); border: 1.5px solid var(--color-line)">
          <div class="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4" style="background-color: var(--color-accent); color: white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.6"/>
              <circle cx="12" cy="12" r="2" fill="currentColor"/>
            </svg>
          </div>
          <h3 class="font-display text-lg font-semibold mb-2" style="color: var(--color-ink)">Explore</h3>
          <p style="color: var(--color-ink-soft)" class="text-sm">Browse thousands of destinations and discover your next adventure.</p>
        </div>

        <div class="rounded-xl p-8 text-center" style="background-color: var(--color-paper-dim); border: 1.5px solid var(--color-line)">
          <div class="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4" style="background-color: var(--color-sage); color: white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L15.09 8.26H22L17.45 12.74L19.54 19.26L12 15.02L4.46 19.26L6.55 12.74L2 8.26H8.91L12 2Z" fill="currentColor"/>
            </svg>
          </div>
          <h3 class="font-display text-lg font-semibold mb-2" style="color: var(--color-ink)">Organize</h3>
          <p style="color: var(--color-ink-soft)" class="text-sm">Plan your trips with destinations, accommodations, and budgets.</p>
        </div>

        <div class="rounded-xl p-8 text-center" style="background-color: var(--color-paper-dim); border: 1.5px solid var(--color-line)">
          <div class="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4" style="background-color: var(--color-alert); color: white">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
            </svg>
          </div>
          <h3 class="font-display text-lg font-semibold mb-2" style="color: var(--color-ink)">Track</h3>
          <p style="color: var(--color-ink-soft)" class="text-sm">Manage expenses and stay within budget while traveling.</p>
        </div>
      </div>
    </div>
  </div>
</template>