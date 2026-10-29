<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth.store';
import { sendContactMessage } from '@/api/contact.api';
import { getApiErrorMessage } from '@/utils/apiError';
import PageHeader from '@/components/PageHeader.vue';

const { t } = useI18n();
const authStore = useAuthStore();

const name = ref(authStore.user?.name ?? '');
const email = ref(authStore.user?.email ?? '');
const subject = ref('');
const message = ref('');
const website = ref('');

const isSending = ref(false);
const isSent = ref(false);
const errorMessage = ref('');

const topics = [
  {
    key: 'question',
    color: 'var(--color-accent)',
    icon: ['M12 2a10 10 0 100 20 10 10 0 000-20z', 'M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3', 'M12 17h.01'],
  },
  {
    key: 'feedback',
    color: 'var(--color-secondary)',
    icon: ['M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z'],
  },
  {
    key: 'bug',
    color: 'var(--color-sage)',
    icon: ['M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z', 'M12 9v4', 'M12 17h.01'],
  },
];

const inputClass =
  'w-full rounded-lg border border-line bg-paper px-4 py-3 text-sm text-ink transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent';

async function handleSubmit() {
  errorMessage.value = '';
  isSending.value = true;

  try {
    await sendContactMessage({
      name: name.value,
      email: email.value,
      subject: subject.value,
      message: message.value,
      website: website.value,
    });
    isSent.value = true;
  } catch (error: unknown) {
    errorMessage.value = getApiErrorMessage(error, t('contact.failed'));
  } finally {
    isSending.value = false;
  }
}

function writeAnother() {
  subject.value = '';
  message.value = '';
  isSent.value = false;
}
</script>

<template>
  <div class="page-shell">
    <div class="page-container max-w-7xl">
      <PageHeader
        color="var(--color-accent-dark)"
        :label="t('contact.label')"
        :title="t('contact.title')"
        :description="t('contact.description')"
      />

      <div class="grid gap-12 lg:grid-cols-2 lg:gap-16">
        <section>
          <div class="card-surface rounded-lg p-8">
            <div v-if="isSent" class="py-6 text-center">
              <span class="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-sage text-white">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </span>
              <h2 class="mb-2 font-display text-2xl font-bold text-ink">{{ t('contact.sentTitle') }}</h2>
              <p class="mb-6 text-ink-soft">{{ t('contact.sentText') }}</p>
              <button
                type="button"
                class="rounded-lg border border-line px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-paper"
                @click="writeAnother"
              >
                {{ t('contact.writeAnother') }}
              </button>
            </div>

            <form v-else class="space-y-5" @submit.prevent="handleSubmit">
              <h2 class="font-display text-2xl font-bold text-ink">{{ t('contact.formTitle') }}</h2>

              <div class="grid gap-5 sm:grid-cols-2">
                <div>
                  <label for="contact-name" class="mb-2 block text-sm font-semibold text-ink">{{ t('contact.name') }}</label>
                  <input id="contact-name" v-model="name" type="text" autocomplete="name" required minlength="2" maxlength="80" :class="inputClass" />
                </div>
                <div>
                  <label for="contact-email" class="mb-2 block text-sm font-semibold text-ink">{{ t('contact.email') }}</label>
                  <input id="contact-email" v-model="email" type="email" autocomplete="email" required placeholder="you@example.com" :class="inputClass" />
                </div>
              </div>

              <div>
                <label for="contact-subject" class="mb-2 block text-sm font-semibold text-ink">{{ t('contact.subject') }}</label>
                <input id="contact-subject" v-model="subject" type="text" required minlength="3" maxlength="120" :class="inputClass" />
              </div>

              <div>
                <label for="contact-message" class="mb-2 block text-sm font-semibold text-ink">{{ t('contact.message') }}</label>
                <textarea id="contact-message" v-model="message" rows="6" required minlength="10" maxlength="2000" :class="inputClass"></textarea>
              </div>

              <div class="absolute -left-[9999px]" aria-hidden="true">
                <label for="contact-website">Website</label>
                <input id="contact-website" v-model="website" type="text" tabindex="-1" autocomplete="off" />
              </div>

              <p v-if="errorMessage" class="rounded-lg bg-alert/10 px-4 py-3 text-sm text-alert" role="alert">{{ errorMessage }}</p>

              <button
                type="submit"
                :disabled="isSending"
                class="w-full rounded-lg bg-accent py-3 font-semibold text-white transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {{ isSending ? t('contact.sending') : t('contact.send') }}
              </button>
            </form>
          </div>
        </section>

        <section>
          <h2 class="mb-2 font-display text-3xl font-bold tracking-tight text-ink">{{ t('contact.helpTitle') }}</h2>
          <p class="mb-8 text-lg text-ink-soft">{{ t('contact.helpText') }}</p>

          <ul class="space-y-6">
            <li v-for="topic in topics" :key="topic.key" class="flex gap-4">
              <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-white" :style="{ backgroundColor: topic.color }">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path v-for="d in topic.icon" :key="d" :d="d" />
                </svg>
              </span>
              <div>
                <h3 class="mb-1 font-display text-xl font-bold text-ink">{{ t(`contact.topics.${topic.key}.title`) }}</h3>
                <p class="leading-relaxed text-ink-soft">{{ t(`contact.topics.${topic.key}.text`) }}</p>
              </div>
            </li>
          </ul>

          <p class="mt-10 border-t border-line pt-6 text-ink-soft">
            {{ t('contact.aboutHint') }}
            <router-link
              to="/about"
              class="rounded font-semibold text-accent underline underline-offset-4 decoration-accent/40 hover:decoration-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >{{ t('contact.aboutLink') }}</router-link>
          </p>
        </section>
      </div>
    </div>
  </div>
</template>