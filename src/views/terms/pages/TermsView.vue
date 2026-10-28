<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import PageHeader from '@/components/PageHeader.vue';

const { t } = useI18n();

const summary = [
  { key: 'fair', color: 'var(--color-accent)' },
  { key: 'content', color: 'var(--color-secondary)' },
  { key: 'asis', color: 'var(--color-sage)' },
];

interface PolicySection {
  key: string;
  paragraphs?: string[];
  items?: string[];
  outro?: string;
}

const sections: PolicySection[] = [
  { key: 'acceptance', paragraphs: ['p1'] },
  { key: 'service', paragraphs: ['p1', 'p2'] },
  { key: 'accounts', paragraphs: ['intro'], items: ['accurate', 'password', 'responsible'] },
  { key: 'use', paragraphs: ['intro'], items: ['law', 'abuse', 'scrape', 'impersonate'] },
  { key: 'content', paragraphs: ['p1', 'p2'] },
  { key: 'recommendations', paragraphs: ['p1', 'p2'] },
  { key: 'thirdParties', paragraphs: ['p1'] },
  { key: 'availability', paragraphs: ['p1'] },
  { key: 'ip', paragraphs: ['p1'] },
  { key: 'warranty', paragraphs: ['p1'] },
  { key: 'liability', paragraphs: ['p1'] },
  { key: 'termination', paragraphs: ['p1'] },
  { key: 'law', paragraphs: ['p1'] },
  { key: 'changes', paragraphs: ['p1'] },
];
</script>

<template>
  <div class="page-shell">
    <div class="page-container max-w-7xl">
      <PageHeader
        color="var(--color-secondary)"
        :label="t('terms.label')"
        :title="t('terms.title')"
        :description="t('terms.description')"
      />

      <p class="tag-mono -mt-6 mb-10 text-xs font-bold uppercase tracking-widest">{{ t('terms.updated') }}</p>

      <div class="mb-16 grid gap-6 md:grid-cols-3">
        <article v-for="item in summary" :key="item.key" class="card-surface relative overflow-hidden rounded-lg p-7 pt-9">
          <span class="absolute inset-x-0 top-0 h-1" :style="{ backgroundColor: item.color }" aria-hidden="true"></span>
          <h2 class="mb-3 font-display text-xl font-bold text-ink">{{ t(`terms.summary.${item.key}.title`) }}</h2>
          <p class="leading-relaxed text-ink-soft">{{ t(`terms.summary.${item.key}.text`) }}</p>
        </article>
      </div>

      <div class="max-w-3xl">
        <section
          v-for="(section, index) in sections"
          :key="section.key"
          :aria-labelledby="`terms-${section.key}`"
          class="border-t border-line py-8 first:border-t-0 first:pt-0"
        >
          <h2 :id="`terms-${section.key}`" class="mb-4 font-display text-2xl font-bold text-ink">
            <span class="tag-mono mr-3 align-middle text-xs font-bold text-ink-faint">{{ String(index + 1).padStart(2, '0') }}</span>
            {{ t(`terms.sections.${section.key}.title`) }}
          </h2>
          <div class="space-y-4 leading-relaxed text-ink-soft">
            <p v-for="paragraph in section.paragraphs" :key="paragraph">
              {{ t(`terms.sections.${section.key}.${paragraph}`) }}
            </p>
            <ul v-if="section.items" class="space-y-2 pl-5">
              <li v-for="item in section.items" :key="item" class="list-disc marker:text-ink-faint">
                {{ t(`terms.sections.${section.key}.items.${item}`) }}
              </li>
            </ul>
            <p v-if="section.outro">{{ t(`terms.sections.${section.key}.${section.outro}`) }}</p>
          </div>
        </section>

        <section class="border-t border-line py-8" aria-labelledby="terms-contact">
          <h2 id="terms-contact" class="mb-4 font-display text-2xl font-bold text-ink">
            <span class="tag-mono mr-3 align-middle text-xs font-bold text-ink-faint">{{ String(sections.length + 1).padStart(2, '0') }}</span>
            {{ t('terms.contactTitle') }}
          </h2>
          <p class="leading-relaxed text-ink-soft">
            {{ t('terms.contactText') }}
            <router-link
              to="/contact"
              class="rounded font-semibold text-accent underline decoration-accent/40 underline-offset-4 hover:decoration-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >{{ t('terms.contactLink') }}</router-link>
          </p>
        </section>
      </div>
    </div>
  </div>
</template>