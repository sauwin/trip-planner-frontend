<script setup lang="ts">
import '../style/register.css'
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { register } from '@/api/auth.api';
import { useAuthStore } from '@/stores/auth.store';
import { useI18n } from 'vue-i18n';

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const isLoading = ref(false);

const router = useRouter();
const authStore = useAuthStore();
const { t } = useI18n();

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
    errorMessage.value = error.response?.data?.error || t('auth.failedRegister');
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex" style="background-color: var(--color-paper)">

    <!-- Left: decorative brand / route panel (hidden on small screens) -->
    <div
      class="hidden md:flex md:w-1/2 relative overflow-hidden flex-col justify-between p-12 lg:p-16"
      style="background: linear-gradient(135deg, #34D399 0%, var(--color-sage) 48%, var(--color-sage-dark) 100%)"
    >
      <!-- ambient glow -->
      <div class="route-glow" aria-hidden="true"></div>

      <!-- brand mark -->
      <div class="relative flex items-center gap-2.5">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
        <span class="font-display text-lg font-bold text-white tracking-tight">TripPlanner</span>
      </div>

      <!-- headline -->
      <div class="relative max-w-sm">
        <p class="tag-mono text-xs font-bold tracking-widest uppercase mb-4" style="color: rgba(255,255,255,0.7)">{{ t('auth.getStarted') }}</p>
        <h2 class="font-display text-4xl lg:text-[2.75rem] font-bold text-white leading-tight mb-4">
          {{ t('auth.registerHeadlineLine1') }}<br />{{ t('auth.registerHeadlineLine2') }}
        </h2>
        <p class="text-base" style="color: rgba(255,255,255,0.8); line-height: 1.6">
          {{ t('auth.registerSubtext') }}
        </p>
      </div>

      <!-- signature: route / waypoint graphic -->
      <div class="relative">
        <svg viewBox="0 0 360 130" class="w-full h-auto" aria-hidden="true">
          <path
            d="M10 30 C 90 30, 100 100, 180 90 S 300 40, 350 110"
            fill="none"
            stroke="rgba(255,255,255,0.35)"
            stroke-width="1.5"
            stroke-dasharray="6 7"
            class="route-path"
          />
          <circle cx="10" cy="30" r="4" fill="white" class="route-dot" style="animation-delay: 0s" />
          <circle cx="180" cy="90" r="4" fill="white" class="route-dot" style="animation-delay: 0.6s" />
          <circle cx="350" cy="110" r="4" fill="white" class="route-dot" style="animation-delay: 1.2s" />
        </svg>
        <div class="flex justify-between mt-2 tag-mono text-[0.65rem]" style="color: rgba(255,255,255,0.55)">
          <span>64.13°N, 21.90°W</span>
          <span>−13.16°N, 72.54°W</span>
          <span>36.10°N, 138.08°E</span>
        </div>
      </div>
    </div>

    <!-- Right: form -->
    <div class="w-full md:w-1/2 flex items-center justify-center px-6 py-12">
      <div class="w-full max-w-sm">

        <!-- compact brand row, mobile only -->
        <div class="md:hidden flex items-center gap-2 mb-10">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-sage)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span class="font-display text-base font-bold" style="color: var(--color-ink)">TripPlanner</span>
        </div>

        <div class="mb-10">
          <div class="inline-flex items-center gap-2 mb-4">
            <div style="width: 4px; height: 20px; background-color: var(--color-sage); border-radius: 2px"></div>
            <span class="tag-mono text-xs font-bold tracking-widest" style="color: var(--color-sage); text-transform: uppercase">{{ t('auth.getStarted') }}</span>
          </div>
          <h1 class="font-display text-4xl font-bold mb-2" style="color: var(--color-ink)">{{ t('auth.createAccount') }}</h1>
          <p style="color: var(--color-ink-soft)">{{ t('auth.joinAdventure') }}</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5 mb-8">

          <div>
            <label for="email" class="block text-sm font-semibold mb-2" style="color: var(--color-ink)">{{ t('auth.emailAddress') }}</label>
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

          <div>
            <label for="password" class="block text-sm font-semibold mb-2" style="color: var(--color-ink)">{{ t('auth.password') }}</label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              minlength="8"
              :placeholder="t('auth.minimumPassword')"
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
            <p class="text-xs mt-2" style="color: var(--color-ink-faint)">{{ t('auth.passwordSecurity') }}</p>
          </div>

          <p v-if="errorMessage" class="text-sm rounded-lg px-4 py-3" style="color: var(--color-alert); background-color: rgba(239, 68, 68, 0.1)">{{ errorMessage }}</p>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full rounded-lg py-3 font-semibold transition-all hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed text-white"
            style="background-color: var(--color-sage)"
          >
            <span v-if="isLoading">{{ t('auth.creatingAccount') }}</span>
            <span v-else>{{ t('auth.submitRegister') }}</span>
          </button>
        </form>

        <div class="flex items-center gap-4 mb-8" style="color: var(--color-ink-faint)">
          <div style="flex: 1; height: 1px; background-color: var(--color-line)"></div>
          <span class="text-xs font-medium">{{ t('auth.or') }}</span>
          <div style="flex: 1; height: 1px; background-color: var(--color-line)"></div>
        </div>

        <p class="text-center" style="color: var(--color-ink-soft)">
          {{ t('auth.haveAccount') }}
          <router-link to="/login" class="font-semibold" style="color: var(--color-sage)">{{ t('auth.signInHere') }}</router-link>
        </p>
      </div>
    </div>
  </div>
</template>