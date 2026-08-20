<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store';
import { useI18n } from 'vue-i18n';

const authStore = useAuthStore();
const { t } = useI18n();
</script>

<template>
  <div class="bg-paper min-h-screen">
    <div class="max-w-7xl mx-auto px-6 py-20">
      <div class="mb-24 max-w-4xl">
        <div class="inline-flex items-center gap-3 mb-8">
          <div class="w-1 h-6 rounded-sm bg-accent"></div>
          <span class="tag-mono text-xs font-bold tracking-widest uppercase text-accent">{{ t('home.welcome') }}</span>
        </div>
        <h1 class="font-display text-6xl font-bold tracking-tight mb-6 text-ink">
          <span v-if="authStore.isAuthenticated">{{ t('home.journeyAwaits') }}</span>
          <span v-else>{{ t('home.planAdventure') }}</span>
        </h1>
        <p class="text-xl max-w-3xl leading-relaxed text-ink-soft">
          <span v-if="authStore.isAuthenticated">{{ t('home.authenticatedDescription') }}</span>
          <span v-else>{{ t('home.guestDescription') }}</span>
        </p>
      </div>

      <div v-if="!authStore.isAuthenticated" class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
        <div class="rounded-lg p-12 bg-paper-dim border border-line shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <h2 class="font-display text-2xl font-bold mb-4 text-ink">{{ t('home.alreadyExploring') }}</h2>
          <p class="mb-8 text-ink-soft">{{ t('home.signInPrompt') }}</p>
          <router-link to="/login" class="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-accent transition-all hover:shadow-lg hover:bg-accent-dark">
            {{ t('auth.submitLogin') }}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14"></path>
              <path d="M12 5l7 7-7 7"></path>
            </svg>
          </router-link>
        </div>

        <div class="rounded-lg p-12 border border-line shadow-[0_4px_20px_rgba(0,0,0,0.05)]" style="background: linear-gradient(135deg, rgba(255, 122, 89, 0.1) 0%, rgba(15, 82, 186, 0.1) 100%)">
          <h2 class="font-display text-2xl font-bold mb-4 text-ink">{{ t('home.newHere') }}</h2>
          <p class="mb-8 text-ink-soft">{{ t('home.joinExplorers') }}</p>
          <router-link to="/register" class="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-secondary transition-all hover:shadow-lg hover:bg-secondary-dark">
            {{ t('home.getStarted') }}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14"></path>
              <path d="M12 5l7 7-7 7"></path>
            </svg>
          </router-link>
        </div>
      </div>

      <div v-else class="flex flex-wrap gap-4 mb-20">
        <router-link to="/recommendations" class="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-accent transition-all hover:shadow-lg hover:bg-accent-dark">
          {{ t('home.seeRecommendations') }}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14"></path>
            <path d="M12 5l7 7-7 7"></path>
          </svg>
        </router-link>
        <router-link to="/trips" class="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-ink border border-line bg-paper-dim transition-all hover:shadow-lg">
          {{ t('home.myTrips') }}
        </router-link>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div class="rounded-lg p-8 bg-paper-dim border border-line shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <div class="w-12 h-12 rounded-lg flex items-center justify-center mb-6" style="background-color: rgba(15, 82, 186, 0.1)">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="text-accent">
              <circle cx="12" cy="12" r="10"/>
            </svg>
          </div>
          <h3 class="font-display text-xl font-bold mb-3 text-ink">{{ t('home.exploreTitle') }}</h3>
          <p class="text-ink-soft leading-relaxed">{{ t('home.exploreText') }}</p>
        </div>

        <div class="rounded-lg p-8 bg-paper-dim border border-line shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <div class="w-12 h-12 rounded-lg flex items-center justify-center mb-6" style="background-color: rgba(255, 122, 89, 0.1)">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="text-secondary">
              <rect x="3" y="4" width="18" height="18" rx="2"/>
            </svg>
          </div>
          <h3 class="font-display text-xl font-bold mb-3 text-ink">{{ t('home.organizeTitle') }}</h3>
          <p class="text-ink-soft leading-relaxed">{{ t('home.organizeText') }}</p>
        </div>

        <div class="rounded-lg p-8 bg-paper-dim border border-line shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
          <div class="w-12 h-12 rounded-lg flex items-center justify-center mb-6" style="background-color: rgba(16, 185, 129, 0.1)">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="text-sage">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h3 class="font-display text-xl font-bold mb-3 text-ink">{{ t('home.trackTitle') }}</h3>
          <p class="text-ink-soft leading-relaxed">{{ t('home.trackText') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>