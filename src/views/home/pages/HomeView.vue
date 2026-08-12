<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();
</script>

<template>
  <div class="max-w-2xl mx-auto mt-16 px-4 text-center">
    <h1 class="text-3xl font-semibold text-gray-900">Welcome to TripPlanner</h1>
    <p class="mt-2 text-gray-600" v-if="!authStore.isAuthenticated">
      Register or log in to get personalized destination recommendations.
    </p>
    <p class="mt-2 text-gray-600" v-else>
      You're logged in. Navigation to Destinations/Recommendations/Trips is coming soon.
    </p>
  </div>
</template>