<script setup lang="ts">
defineProps<{
  color: string;
  label: string;
  title: string;
  description: string;
}>();
</script>

<template>
  <div class="mb-12">
    <div class="inline-flex items-center gap-3 mb-6">
      <div class="h-6 w-1 rounded-sm" :style="{ backgroundColor: color }"></div>
      <span class="tag-mono text-xs font-bold tracking-widest uppercase" :style="{ color }">{{ label }}</span>
    </div>
    <h1 class="font-display mb-4 text-5xl font-bold text-ink">{{ title }}</h1>
    <p class="text-lg text-ink-soft">{{ description }}</p>
  </div>
</template>