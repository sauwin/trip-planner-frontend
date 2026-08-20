<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();
</script>

<template>
  <div class="bg-paper min-h-screen">
    <div class="max-w-7xl mx-auto px-6 py-20">
      <div class="mb-24 max-w-4xl">
        <div class="inline-flex items-center gap-3 mb-8">
          <div class="w-1 h-6 rounded-sm bg-accent"></div>
          <span class="tag-mono text-xs font-bold tracking-widest uppercase text-accent">Welcome</span>
        </div>
        <h1 class="font-display text-6xl font-bold tracking-tight mb-6 text-ink">
          <span v-if="authStore.isAuthenticated">Your journey awaits</span>
          <span v-else>Plan your next adventure</span>
        </h1>
        <p class="text-xl max-w-3xl leading-relaxed text-ink-soft">
          <span v-if="authStore.isAuthenticated">Explore destinations, organize trips, manage budgets, and create unforgettable memories all in one place.</span>
          <span v-else>Discover the world, get personalized recommendations, and start planning your perfect trip today.</span>
        </p>
      </div>

      <div v-if="!authStore.isAuthenticated" class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
        <div class="rounded-lg p-12 bg-paper-dim border border-line shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <h2 class="font-display text-2xl font-bold mb-4 text-ink">Already exploring?</h2>
          <p class="mb-8 text-ink-soft">Sign in to access your trips, recommendations, and planning tools.</p>
          <router-link to="/login" class="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-accent transition-all hover:shadow-lg hover:bg-accent-dark">
            Sign In
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14"></path>
              <path d="M12 5l7 7-7 7"></path>
            </svg>
          </router-link>
        </div>

        <div class="rounded-lg p-12 border border-line shadow-[0_4px_20px_rgba(0,0,0,0.05)]" style="background: linear-gradient(135deg, rgba(255, 122, 89, 0.1) 0%, rgba(15, 82, 186, 0.1) 100%)">
          <h2 class="font-display text-2xl font-bold mb-4 text-ink">New here?</h2>
          <p class="mb-8 text-ink-soft">Create an account and join thousands of explorers discovering amazing destinations.</p>
          <router-link to="/register" class="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-secondary transition-all hover:shadow-lg hover:bg-secondary-dark">
            Get Started
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14"></path>
              <path d="M12 5l7 7-7 7"></path>
            </svg>
          </router-link>
        </div>
      </div>

      <div v-else class="flex flex-wrap gap-4 mb-20">
        <router-link to="/recommendations" class="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-accent transition-all hover:shadow-lg hover:bg-accent-dark">
          See recommendations
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14"></path>
            <path d="M12 5l7 7-7 7"></path>
          </svg>
        </router-link>
        <router-link to="/trips" class="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-ink border border-line bg-paper-dim transition-all hover:shadow-lg">
          My trips
        </router-link>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="rounded-lg p-8 bg-paper-dim border border-line shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <div class="w-12 h-12 rounded-lg flex items-center justify-center mb-6" style="background-color: rgba(15, 82, 186, 0.1)">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="text-accent">
              <circle cx="12" cy="12" r="10"/>
            </svg>
          </div>
          <h3 class="font-display text-xl font-bold mb-3 text-ink">Explore</h3>
          <p class="text-ink-soft leading-relaxed">Discover thousands of curated destinations with detailed information and community insights.</p>
        </div>

        <div class="rounded-lg p-8 bg-paper-dim border border-line shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <div class="w-12 h-12 rounded-lg flex items-center justify-center mb-6" style="background-color: rgba(255, 122, 89, 0.1)">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="text-secondary">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
            </svg>
          </div>
          <h3 class="font-display text-xl font-bold mb-3 text-ink">Organize</h3>
          <p class="text-ink-soft leading-relaxed">Create and manage multiple trips with destinations, accommodations, and detailed planning tools.</p>
        </div>

        <div class="rounded-lg p-8 bg-paper-dim border border-line shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <div class="w-12 h-12 rounded-lg flex items-center justify-center mb-6" style="background-color: rgba(16, 185, 129, 0.1)">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="text-sage">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h3 class="font-display text-xl font-bold mb-3 text-ink">Track</h3>
          <p class="text-ink-soft leading-relaxed">Monitor expenses, stay within budget, and get personalized recommendations tailored to your style.</p>
        </div>
      </div>
    </div>
  </div>
</template>