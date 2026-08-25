<script setup lang="ts">
import LocaleSwitcher from '@/components/LocaleSwitcher.vue';
</script>

<template>
  <div class="min-h-screen relative bg-paper text-ink font-body">
    <div class="absolute top-5 right-5 md:top-6 md:right-6 z-20">
      <LocaleSwitcher />
    </div>

    <main>
      <slot />
    </main>
  </div>
</template>