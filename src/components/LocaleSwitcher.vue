<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { setLocale, type SupportedLocale } from '@/locales';

const { locale, t } = useI18n();

function choose(target: SupportedLocale) {
  if (locale.value !== target) setLocale(target);
}
</script>

<template>
  <div
    class="inline-flex items-center gap-1 rounded-full p-1"
    role="group"
    :aria-label="t('language.label')"
    style="background-color: var(--color-paper-dim); border: 1px solid var(--color-line)"
  >
    <button
      type="button"
      :title="t('language.slovak')"
      :aria-label="t('language.slovak')"
      :aria-pressed="locale === 'sk'"
      class="flex items-center justify-center rounded-full transition-all w-8 h-8"
      :style="{
        backgroundColor: locale === 'sk' ? 'var(--color-paper)' : 'transparent',
        boxShadow: locale === 'sk' ? '0 0 0 2px var(--color-accent)' : 'none',
        opacity: locale === 'sk' ? 1 : 0.4,
      }"
      @click="choose('sk')"
    >
      <svg width="18" height="13" viewBox="0 0 3 2" style="border-radius: 2px; overflow: hidden">
        <rect width="3" height="2" fill="#ffffff" />
        <rect y="0.6667" width="3" height="0.6667" fill="#0b4ea2" />
        <rect y="1.3333" width="3" height="0.6667" fill="#ee1c25" />
        <rect x="0.42" y="0.5" width="0.62" height="1" rx="0.04" fill="#ee1c25" stroke="#ffffff" stroke-width="0.05" />
        <rect x="0.66" y="0.62" width="0.14" height="0.76" fill="#ffffff" />
        <rect x="0.48" y="0.86" width="0.5" height="0.14" fill="#ffffff" />
      </svg>
    </button>

    <button
      type="button"
      :title="t('language.english')"
      :aria-label="t('language.english')"
      :aria-pressed="locale === 'en'"
      class="flex items-center justify-center rounded-full transition-all w-8 h-8"
      :style="{
        backgroundColor: locale === 'en' ? 'var(--color-paper)' : 'transparent',
        boxShadow: locale === 'en' ? '0 0 0 2px var(--color-accent)' : 'none',
        opacity: locale === 'en' ? 1 : 0.4,
      }"
      @click="choose('en')"
    >
      <svg width="18" height="13" viewBox="0 0 60 30" style="border-radius: 2px; overflow: hidden">
        <rect width="60" height="30" fill="#00247d" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#ffffff" stroke-width="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#cf142b" stroke-width="2" />
        <path d="M30,0 V30 M0,15 H60" stroke="#ffffff" stroke-width="10" />
        <path d="M30,0 V30 M0,15 H60" stroke="#cf142b" stroke-width="6" />
      </svg>
    </button>
  </div>
</template>