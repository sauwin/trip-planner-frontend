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
      <div style="width: 4px; height: 24px; border-radius: 2px" :style="{ backgroundColor: color }"></div>
      <span class="tag-mono text-xs font-bold tracking-widest" :style="{ color, textTransform: 'uppercase' }">{{ label }}</span>
    </div>
    <h1 class="font-display text-5xl font-bold mb-4" style="color: var(--color-ink)">{{ title }}</h1>
    <p class="text-lg" style="color: var(--color-ink-soft)">{{ description }}</p>
  </div>
</template>