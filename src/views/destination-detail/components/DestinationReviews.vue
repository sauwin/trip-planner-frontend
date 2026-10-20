<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth.store';
import { useEscapeKey } from '@/composables/useEscapeKey';
import { formatNumber } from '@/utils/formatNumber';
import {
  adminDeleteDestinationReview,
  createDestinationReview,
  deleteDestinationReview,
  getDestinationReviews,
  updateDestinationReview,
} from '@/api/reviews.api';
import type { DestinationReview, DestinationReviewInput } from '@/types/review.types';

const props = defineProps<{
  destinationId: string;
}>();

const { t, locale } = useI18n();
const authStore = useAuthStore();
const reviews = ref<DestinationReview[]>([]);
const ownReview = ref<DestinationReview | null>(null);
const averageRating = ref<number | null>(null);
const reviewTotal = ref(0);
const loadedReviewCount = ref(0);
const isLoading = ref(true);
const isLoadingMore = ref(false);
const loadError = ref('');
const loadMoreError = ref('');
const formError = ref('');
const actionError = ref('');
const isSaving = ref(false);
const editingReviewId = ref<string | null>(null);
const pendingDeleteId = ref<string | null>(null);
const isDeleting = ref(false);
const draftRating = ref(0);
const reviewBody = ref('');
const reviewPhotos = ref<string[]>([]);
const isReadingPhotos = ref(false);
const photoInput = ref<HTMLInputElement | null>(null);
const selectedPhoto = ref<{ src: string; alt: string } | null>(null);
let loadRequestId = 0;
const emit = defineEmits<{
  summary: [summary: { averageRating: number | null; total: number }];
}>();

const isAdmin = computed(() => authStore.user?.role === 'ADMIN' || authStore.user?.role === 'SUPER_ADMIN');
const averageLabel = computed(() =>
  averageRating.value === null ? '—' : formatNumber(averageRating.value, locale.value, { maximumFractionDigits: 1 }),
);
const hasMoreReviews = computed(() => loadedReviewCount.value < reviewTotal.value);
useEscapeKey(() => {
  selectedPhoto.value = null;
});

function initials(name: string | null, userId: string) {
  const trimmed = name?.trim();
  if (!trimmed) return userId.slice(0, 1).toUpperCase();
  return trimmed.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

function avatarStyle(userId: string) {
  const colors = ['#4f8fd8', '#6e9d78', '#e99157'];
  let hash = 0;
  for (let index = 0; index < userId.length; index += 1) {
    hash = (hash * 31 + userId.charCodeAt(index)) | 0;
  }
  return { backgroundColor: colors[Math.abs(hash) % colors.length] };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium' }).format(new Date(value));
}

async function loadReviews(append = false) {
  const requestId = ++loadRequestId;
  const destinationId = props.destinationId;
  if (!append) isLoading.value = true;
  else isLoadingMore.value = true;
  loadError.value = '';
  loadMoreError.value = '';
  try {
    const offset = append ? loadedReviewCount.value : 0;
    const response = await getDestinationReviews(destinationId, { offset });
    if (requestId !== loadRequestId || destinationId !== props.destinationId) return;
    ownReview.value = response.data.ownReview;
    const returnedItems = response.data.items;
    loadedReviewCount.value = offset + returnedItems.length;
    if (append) {
      const existingIds = new Set(reviews.value.map((review) => review.id));
      reviews.value = [...reviews.value, ...returnedItems.filter((review) => !existingIds.has(review.id))];
    } else {
      const pageItems = [...returnedItems];
      if (response.data.ownReview && !pageItems.some((review) => review.id === response.data.ownReview?.id)) {
        pageItems.unshift(response.data.ownReview);
      }
      reviews.value = pageItems;
    }
    averageRating.value = response.data.averageRating;
    reviewTotal.value = response.data.total;
    emit('summary', { averageRating: response.data.averageRating, total: response.data.total });
  } catch {
    if (requestId === loadRequestId) {
      if (append) loadMoreError.value = t('destinationDetail.reviewsLoadError');
      else loadError.value = t('destinationDetail.reviewsLoadError');
    }
  } finally {
    if (requestId === loadRequestId) {
      isLoading.value = false;
      isLoadingMore.value = false;
    }
  }
}

watch(() => props.destinationId, () => {
  reviews.value = [];
  ownReview.value = null;
  averageRating.value = null;
  reviewTotal.value = 0;
  loadedReviewCount.value = 0;
  loadMoreError.value = '';
  loadError.value = '';
  actionError.value = '';
  formError.value = '';
  pendingDeleteId.value = null;
  editingReviewId.value = null;
  reviewBody.value = '';
  reviewPhotos.value = [];
  draftRating.value = 0;
  void loadReviews();
}, { immediate: true });

function beginEdit(review: DestinationReview) {
  editingReviewId.value = review.id;
  draftRating.value = review.rating;
  reviewBody.value = review.body;
  reviewPhotos.value = [...review.photos];
  formError.value = '';
  actionError.value = '';
}

function cancelEdit() {
  editingReviewId.value = null;
  draftRating.value = 0;
  reviewBody.value = '';
  reviewPhotos.value = [];
  formError.value = '';
}

function readPhoto(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Could not read selected image'));
    };
    reader.onerror = () => reject(reader.error ?? new Error('Could not read selected image'));
    reader.readAsDataURL(file);
  });
}

async function addPhotos(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = Array.from(input.files ?? []);
  input.value = '';
  formError.value = '';

  if (reviewPhotos.value.length + files.length > 3) {
    formError.value = t('destinationDetail.reviewsPhotoLimit');
    return;
  }

  const invalidFile = files.find((file) =>
    !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024,
  );
  if (invalidFile) {
    formError.value = t('destinationDetail.reviewsPhotoInvalid');
    return;
  }

  isReadingPhotos.value = true;
  try {
    const loadedPhotos = await Promise.all(files.map(readPhoto));
    reviewPhotos.value = [...reviewPhotos.value, ...loadedPhotos];
  } catch {
    formError.value = t('destinationDetail.reviewsPhotoReadError');
  } finally {
    isReadingPhotos.value = false;
  }
}

function removePhoto(index: number) {
  reviewPhotos.value = reviewPhotos.value.filter((_photo, photoIndex) => photoIndex !== index);
}

async function submitReview() {
  if (isSaving.value) return;
  const destinationId = props.destinationId;
  formError.value = '';
  if (draftRating.value < 1 || draftRating.value > 5) {
    formError.value = t('destinationDetail.reviewsRatingRequired');
    return;
  }
  const input: DestinationReviewInput = {
    rating: draftRating.value,
    body: reviewBody.value.trim(),
    photos: reviewPhotos.value,
  };
  if (!input.body) {
    formError.value = t('destinationDetail.reviewsTextRequired');
    return;
  }

  isSaving.value = true;
  try {
    if (editingReviewId.value) {
      await updateDestinationReview(editingReviewId.value, input);
    } else {
      await createDestinationReview(destinationId, input);
    }
    if (destinationId !== props.destinationId) return;
    editingReviewId.value = null;
    reviewBody.value = '';
    reviewPhotos.value = [];
    await loadReviews();
  } catch {
    formError.value = t('destinationDetail.reviewsSaveError');
  } finally {
    isSaving.value = false;
  }
}

async function confirmDeleteReview() {
  if (!pendingDeleteId.value || isDeleting.value) return;
  const review = reviews.value.find((item) => item.id === pendingDeleteId.value);
  if (!review) {
    pendingDeleteId.value = null;
    actionError.value = t('destinationDetail.reviewsDeleteError');
    return;
  }

  isDeleting.value = true;
  actionError.value = '';
  try {
    if (review.userId === authStore.user?.id) {
      await deleteDestinationReview(review.id);
    } else {
      await adminDeleteDestinationReview(review.id);
    }
    pendingDeleteId.value = null;
    if (editingReviewId.value === review.id) cancelEdit();
    await loadReviews();
  } catch {
    actionError.value = t('destinationDetail.reviewsDeleteError');
  } finally {
    isDeleting.value = false;
  }
}
</script>

<template>
  <section class="review-panel card-surface rounded-2xl p-6 sm:p-8" aria-labelledby="destination-reviews-title">
    <div class="flex flex-wrap items-start justify-between gap-5 border-b border-line pb-6">
      <div>
        <p class="tag-mono text-xs font-bold uppercase tracking-widest text-accent">{{ t('destinationDetail.reviewsEyebrow') }}</p>
        <h2 id="destination-reviews-title" class="mt-2 font-display text-3xl font-bold text-ink">
          {{ t('destinationDetail.reviewsTitle') }}
        </h2>
        <p class="mt-2 text-sm text-ink-soft">{{ t('destinationDetail.reviewsDescription') }}</p>
      </div>
      <div class="rounded-2xl bg-paper-dim px-5 py-3 text-center">
        <div class="flex items-center justify-center gap-2">
          <svg class="h-5 w-5 text-warning" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <span class="font-display text-2xl font-bold text-ink">{{ averageLabel }}</span>
        </div>
        <p class="mt-1 text-xs text-ink-faint">{{ t('destinationDetail.reviewsCount', { count: reviewTotal }) }}</p>
      </div>
    </div>

    <div v-if="authStore.isAuthenticated && (!ownReview || editingReviewId)" class="review-composer mt-6 rounded-2xl border border-line bg-paper-dim p-5 sm:p-6">
      <h3 class="font-display text-xl font-bold text-ink">
        {{ editingReviewId ? t('destinationDetail.reviewsEditTitle') : t('destinationDetail.reviewsWriteTitle') }}
      </h3>
      <p class="mt-1 text-sm text-ink-soft">{{ t('destinationDetail.reviewsWriteHint') }}</p>

      <div class="mt-5">
        <p class="mb-2 text-sm font-semibold text-ink">{{ t('destinationDetail.reviewsYourRating') }}</p>
        <div class="flex items-center gap-1">
          <button
            v-for="star in 5"
            :key="star"
            type="button"
            class="rounded-md p-1 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-60"
            :disabled="isSaving"
            :aria-label="t('destinationDetail.rateStars', { count: star })"
            :aria-pressed="draftRating === star"
            @click="draftRating = star"
          >
            <svg class="h-7 w-7" viewBox="0 0 24 24" :fill="star <= draftRating ? 'var(--color-warning)' : 'none'" stroke="var(--color-warning)" stroke-width="1.6" aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        </div>
      </div>

      <label class="mt-5 block text-sm font-semibold text-ink" for="destination-review-body">{{ t('destinationDetail.reviewsTextLabel') }}</label>
      <textarea
        id="destination-review-body"
        v-model="reviewBody"
        rows="4"
        maxlength="2000"
        class="mt-2 w-full resize-y rounded-xl border border-line bg-paper px-4 py-3 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        :placeholder="t('destinationDetail.reviewsTextPlaceholder')"
      />
      <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-3">
          <input
            ref="photoInput"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            class="sr-only"
            @change="addPhotos"
          >
          <button
            type="button"
            class="action-button action-button--secondary"
            :disabled="isReadingPhotos || reviewPhotos.length >= 3"
            @click="photoInput?.click()"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
            {{ isReadingPhotos ? t('destinationDetail.reviewsPhotoReading') : t('destinationDetail.reviewsAddPhotos') }}
          </button>
          <span class="text-xs text-ink-faint">{{ t('destinationDetail.reviewsPhotoHint') }}</span>
        </div>
        <div class="flex flex-wrap justify-end gap-3">
          <button type="button" class="action-button action-button--accent" :disabled="isSaving || isReadingPhotos" @click="submitReview">
            {{ isSaving ? t('destinationDetail.reviewsSaving') : editingReviewId ? t('destinationDetail.reviewsSaveChanges') : t('destinationDetail.reviewsSubmit') }}
          </button>
          <button v-if="editingReviewId" type="button" class="action-button action-button--secondary" :disabled="isSaving" @click="cancelEdit">
            {{ t('destinationDetail.reviewsCancel') }}
          </button>
        </div>
      </div>
      <div v-if="reviewPhotos.length" class="mt-4 flex flex-wrap gap-3">
        <div v-for="(photo, index) in reviewPhotos" :key="`${index}-${photo.slice(0, 32)}`" class="relative">
          <img :src="photo" :alt="t('destinationDetail.reviewsPhotoAlt', { number: index + 1 })" class="h-20 w-20 rounded-xl object-cover">
          <button
            type="button"
            class="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-ink text-white shadow"
            :aria-label="t('destinationDetail.reviewsRemovePhoto')"
            @click="removePhoto(index)"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      </div>
      <p v-if="formError" class="mt-4 rounded-xl bg-alert/10 px-4 py-3 text-sm text-alert" role="alert">{{ formError }}</p>
    </div>
    <div v-else-if="authStore.isAuthenticated && ownReview" class="mt-6 rounded-xl border border-sage/30 bg-sage/10 px-4 py-3 text-sm text-ink-soft">
      {{ t('destinationDetail.reviewsAlreadyWritten') }}
    </div>
    <div v-else class="mt-6 rounded-xl border border-line bg-paper-dim px-4 py-4 text-sm text-ink-soft">
      {{ t('destinationDetail.reviewsSignIn') }}
      <router-link :to="{ name: 'login' }" class="ml-1 font-semibold text-accent underline underline-offset-2">
        {{ t('destinationDetail.reviewsSignInLink') }}
      </router-link>
    </div>

    <p v-if="actionError" class="mt-5 rounded-xl bg-alert/10 px-4 py-3 text-sm text-alert" role="alert">{{ actionError }}</p>
    <p v-if="loadError" class="mt-6 rounded-xl bg-alert/10 px-4 py-3 text-sm text-alert" role="alert">{{ loadError }}</p>
    <p v-else-if="isLoading" class="py-8 text-center text-sm text-ink-faint">{{ t('destinationDetail.reviewsLoading') }}</p>
    <div v-else-if="reviews.length" class="mt-6 divide-y divide-line">
      <article v-for="review in reviews" :key="review.id" class="py-6 first:pt-0 last:pb-0">
        <div class="flex items-start gap-3">
          <div class="review-avatar flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" :style="avatarStyle(review.userId)">
            {{ initials(review.user.name, review.userId) }}
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h3 class="font-semibold text-ink">{{ review.user.name || t('destinationDetail.reviewsTraveler') }}</h3>
              <span class="text-xs text-ink-faint">{{ formatDate(review.createdAt) }}</span>
            </div>
            <div class="mt-1 flex items-center gap-0.5" :aria-label="t('destinationDetail.rateStars', { count: review.rating })">
              <svg v-for="star in 5" :key="star" class="h-4 w-4" viewBox="0 0 24 24" :fill="star <= review.rating ? 'var(--color-warning)' : 'none'" stroke="var(--color-warning)" stroke-width="1.5" aria-hidden="true">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <p class="mt-3 whitespace-pre-line text-sm leading-6 text-ink-soft">{{ review.body }}</p>
            <div v-if="review.photos.length" class="mt-4 flex flex-wrap gap-3">
              <button
                v-for="(photo, index) in review.photos"
                :key="index"
                type="button"
                class="block overflow-hidden rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                :aria-label="t('destinationDetail.reviewsOpenPhoto', { number: index + 1 })"
                @click="selectedPhoto = { src: photo, alt: t('destinationDetail.reviewsPhotoAlt', { number: index + 1 }) }"
              >
                <img :src="photo" :alt="t('destinationDetail.reviewsPhotoAlt', { number: index + 1 })" class="h-24 w-24 object-cover transition-transform hover:scale-105 sm:h-28 sm:w-28">
              </button>
            </div>
          </div>
          <div v-if="review.userId === authStore.user?.id || isAdmin" class="flex shrink-0 gap-1">
            <button
              v-if="review.userId === authStore.user?.id"
              type="button"
              class="rounded-lg p-2 text-ink-faint transition hover:bg-paper-dim hover:text-accent"
              :aria-label="t('destinationDetail.reviewsEdit')"
              @click="beginEdit(review)"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
              </svg>
            </button>
            <button
              type="button"
              class="rounded-lg p-2 text-ink-faint transition hover:bg-alert/10 hover:text-alert"
              :aria-label="t('destinationDetail.reviewsDelete')"
              @click="pendingDeleteId = review.id"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="m19 6-1 14H6L5 6" /><path d="M10 11v5m4-5v5" />
              </svg>
            </button>
          </div>
        </div>
      </article>
    </div>
    <p v-else class="py-8 text-center text-sm text-ink-faint">{{ t('destinationDetail.reviewsEmpty') }}</p>
    <button
      v-if="!isLoading && !loadError && hasMoreReviews"
      type="button"
      class="action-button action-button--secondary mt-6 w-full justify-center"
      :disabled="isLoadingMore"
      @click="loadReviews(true)"
    >
      {{ isLoadingMore ? t('destinationDetail.reviewsLoading') : t('destinationDetail.reviewsLoadMore') }}
    </button>
    <p v-if="loadMoreError" class="mt-3 rounded-xl bg-alert/10 px-4 py-3 text-sm text-alert" role="alert">{{ loadMoreError }}</p>

    <div
      v-if="selectedPhoto"
      class="fixed inset-0 z-[1400] flex items-center justify-center bg-ink/90 p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      :aria-label="t('destinationDetail.reviewsPhotoViewer')"
      @click.self="selectedPhoto = null"
    >
      <button
        type="button"
        class="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-3xl text-white transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-white"
        :aria-label="t('destinationDetail.reviewsClosePhoto')"
        @click="selectedPhoto = null"
      >
        <span aria-hidden="true">×</span>
      </button>
      <img
        :src="selectedPhoto.src"
        :alt="selectedPhoto.alt"
        class="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
        @click.stop
      >
    </div>

    <div v-if="pendingDeleteId" class="fixed inset-0 z-[1300] flex items-center justify-center bg-ink/50 p-4" @click.self="pendingDeleteId = null">
      <section role="alertdialog" aria-modal="true" aria-labelledby="delete-review-title" class="w-full max-w-md rounded-2xl bg-paper-dim p-6 shadow-xl">
        <h2 id="delete-review-title" class="font-display text-xl font-bold text-ink">{{ t('destinationDetail.reviewsDeleteTitle') }}</h2>
        <p class="mt-3 leading-relaxed text-ink-soft">{{ t('destinationDetail.reviewsDeletePrompt') }}</p>
        <div class="mt-6 flex justify-end gap-3">
          <button type="button" class="action-button action-button--secondary" :disabled="isDeleting" @click="pendingDeleteId = null">
            {{ t('destinationDetail.reviewsCancel') }}
          </button>
          <button type="button" class="action-button action-button--danger" :disabled="isDeleting" @click="confirmDeleteReview">
            {{ isDeleting ? t('destinationDetail.reviewsDeleting') : t('destinationDetail.reviewsDelete') }}
          </button>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.review-panel {
  border-top: 4px solid var(--color-accent);
}

.review-avatar {
  box-shadow: 0 0 0 3px var(--color-paper-dim);
}
</style>
