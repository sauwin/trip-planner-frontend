<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import PageHeader from '@/components/PageHeader.vue';
import { getAdminAuditHistory, getManagedUsers, updateManagedUserRole, type AdminAuditEvent, type ManagedUser } from '@/api/admin.api';
import { getApiErrorMessage } from '@/utils/apiError';

const { t, locale } = useI18n();
const query = ref('');
const admins = ref<ManagedUser[]>([]);
const matchingUsers = ref<ManagedUser[]>([]);
const auditEvents = ref<AdminAuditEvent[]>([]);
const auditCursor = ref<string | null>(null);
const isLoadingAdmins = ref(true);
const isSearching = ref(false);
const isLoadingAudit = ref(true);
const isLoadingMoreAudit = ref(false);
const hasMoreAudit = ref(false);
const hasSearched = ref(false);
const updatingUserId = ref('');
const errorMessage = ref('');
const auditErrorMessage = ref('');
const validationMessage = ref('');

function auditActionLabel(action: AdminAuditEvent['action']) {
  const labels: Record<AdminAuditEvent['action'], string> = {
    DESTINATION_CREATED: t('admin.auditDestinationCreated'),
    DESTINATION_UPDATED: t('admin.auditDestinationUpdated'),
    DESTINATION_DELETED: t('admin.auditDestinationDeleted'),
    REVIEW_DELETED: t('admin.auditReviewDeleted'),
    ADMIN_ADDED: t('admin.auditAdminAdded'),
    ADMIN_REMOVED: t('admin.auditAdminRemoved'),
  };
  return labels[action];
}

function formatAuditDate(value: string) {
  return new Date(value).toLocaleString(locale.value === 'sk' ? 'sk-SK' : 'en-GB');
}

async function loadAdmins() {
  isLoadingAdmins.value = true;
  errorMessage.value = '';
  try {
    const response = await getManagedUsers();
    admins.value = response.data.items;
  } catch {
    errorMessage.value = t('admin.usersError');
  } finally {
    isLoadingAdmins.value = false;
  }
}

async function loadAuditHistory(reset = true) {
  if (reset) isLoadingAudit.value = true;
  else isLoadingMoreAudit.value = true;
  auditErrorMessage.value = '';
  try {
    const response = await getAdminAuditHistory(reset ? undefined : auditCursor.value ?? undefined);
    auditEvents.value = reset ? response.data.items : [...auditEvents.value, ...response.data.items];
    auditCursor.value = response.data.nextCursor;
    hasMoreAudit.value = Boolean(response.data.nextCursor);
  } catch {
    auditErrorMessage.value = t('admin.auditError');
  } finally {
    if (reset) isLoadingAudit.value = false;
    else isLoadingMoreAudit.value = false;
  }
}

async function searchUsers(search: string) {
  hasSearched.value = true;
  matchingUsers.value = [];
  isSearching.value = true;
  errorMessage.value = '';
  try {
    const response = await getManagedUsers(search);
    matchingUsers.value = response.data.items.filter((user) => user.role === 'USER');
  } catch {
    errorMessage.value = t('admin.usersError');
  } finally {
    isSearching.value = false;
  }
}

onMounted(() => {
  loadAdmins();
  loadAuditHistory();
});

function submitSearch() {
  validationMessage.value = '';
  const search = query.value.trim();
  if (search.length < 2) {
    validationMessage.value = t('admin.searchTooShort');
    return;
  }
  searchUsers(search);
}

async function changeRole(user: ManagedUser, role: 'USER' | 'ADMIN') {
  updatingUserId.value = user.id;
  errorMessage.value = '';
  try {
    await updateManagedUserRole(user.id, role);
    await loadAdmins();
    await loadAuditHistory();
    if (query.value.trim().length >= 2) {
      await searchUsers(query.value.trim());
    }
  } catch (error: unknown) {
    errorMessage.value = getApiErrorMessage(error, t('admin.roleError'));
  } finally {
    updatingUserId.value = '';
  }
}
</script>

<template>
  <div class="page-shell">
    <div class="page-container max-w-7xl">
      <div class="mb-10 flex flex-wrap items-end justify-between gap-4">
        <PageHeader
          color="var(--color-secondary)"
          :label="t('admin.usersEyebrow')"
          :title="t('admin.usersTitle')"
          :description="t('admin.usersDescription')"
        />
      </div>

      <form class="card-surface mb-6 flex flex-wrap items-end gap-3 rounded-2xl p-5 sm:p-6" @submit.prevent="submitSearch">
        <div class="min-w-[220px] flex-1">
          <label for="admin-user-search" class="mb-2 block text-sm font-semibold text-ink">{{ t('admin.searchUsers') }}</label>
          <input
            id="admin-user-search"
            v-model="query"
            type="search"
            maxlength="100"
            class="w-full rounded-lg border border-line bg-paper px-4 py-3 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <button type="submit" class="rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-dark">
          {{ t('admin.search') }}
        </button>
        <p class="w-full text-sm text-ink-soft">{{ t('admin.searchHint') }}</p>
        <p v-if="validationMessage" class="w-full text-sm text-alert" role="alert">{{ validationMessage }}</p>
      </form>

      <p v-if="errorMessage" class="mb-5 rounded-lg bg-alert/10 px-4 py-3 text-sm text-alert" role="alert">{{ errorMessage }}</p>

      <section class="card-surface mb-6 overflow-hidden rounded-2xl">
        <h2 class="border-b border-line px-6 py-4 text-lg font-semibold text-ink">{{ t('admin.adminsOnly') }}</h2>
        <p v-if="isLoadingAdmins" class="px-6 py-12 text-center text-sm text-ink-soft">{{ t('admin.loadingUsers') }}</p>
        <div v-else-if="admins.length === 0" class="px-6 py-12 text-center text-sm text-ink-soft">{{ t('admin.noAdmins') }}</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[600px] text-left text-sm">
            <thead class="border-b border-line bg-paper/70 text-xs font-semibold uppercase tracking-wide text-ink-soft">
              <tr>
                <th class="px-6 py-4">{{ t('admin.user') }}</th>
                <th class="px-6 py-4 text-right">{{ t('admin.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line">
              <tr v-for="user in admins" :key="user.id" class="hover:bg-paper/50">
                <td class="px-6 py-4">
                  <p class="font-semibold text-ink">{{ user.name || user.email }}</p>
                  <p v-if="user.name" class="mt-1 text-ink-soft">{{ user.email }}</p>
                </td>
                <td class="px-6 py-4 text-right">
                  <button
                    type="button"
                    :disabled="updatingUserId === user.id"
                    class="rounded-lg px-3 py-2 font-semibold text-alert transition-colors hover:bg-alert/10 disabled:opacity-50"
                    @click="changeRole(user, 'USER')"
                  >
                    {{ updatingUserId === user.id ? t('admin.loadingUsers') : t('admin.demote') }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section v-if="hasSearched" class="card-surface overflow-hidden rounded-2xl">
        <h2 class="border-b border-line px-6 py-4 text-lg font-semibold text-ink">{{ t('admin.usersToPromote') }}</h2>
        <p v-if="isSearching" class="px-6 py-12 text-center text-sm text-ink-soft">{{ t('admin.loadingUsers') }}</p>
        <div v-else-if="matchingUsers.length === 0" class="px-6 py-12 text-center text-sm text-ink-soft">{{ t('admin.noUsers') }}</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[600px] text-left text-sm">
            <thead class="border-b border-line bg-paper/70 text-xs font-semibold uppercase tracking-wide text-ink-soft">
              <tr>
                <th class="px-6 py-4">{{ t('admin.user') }}</th>
                <th class="px-6 py-4 text-right">{{ t('admin.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line">
              <tr v-for="user in matchingUsers" :key="user.id" class="hover:bg-paper/50">
                <td class="px-6 py-4">
                  <p class="font-semibold text-ink">{{ user.name || user.email }}</p>
                  <p v-if="user.name" class="mt-1 text-ink-soft">{{ user.email }}</p>
                </td>
                <td class="px-6 py-4 text-right">
                  <button
                    type="button"
                    :disabled="updatingUserId === user.id"
                    class="rounded-lg px-3 py-2 font-semibold text-accent transition-colors hover:bg-accent/10 disabled:opacity-50"
                    @click="changeRole(user, 'ADMIN')"
                  >
                    {{ updatingUserId === user.id ? t('admin.loadingUsers') : t('admin.promote') }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="card-surface mt-6 overflow-hidden rounded-2xl">
        <div class="border-b border-line px-6 py-4">
          <h2 class="text-lg font-semibold text-ink">{{ t('admin.auditHistory') }}</h2>
          <p class="mt-1 text-sm text-ink-soft">{{ t('admin.auditHistoryHint') }}</p>
        </div>
        <p v-if="isLoadingAudit" class="px-6 py-12 text-center text-sm text-ink-soft">{{ t('admin.loadingAudit') }}</p>
        <p v-else-if="auditErrorMessage && auditEvents.length === 0" class="px-6 py-8 text-sm text-alert" role="alert">{{ auditErrorMessage }}</p>
        <div v-else-if="auditEvents.length === 0" class="px-6 py-12 text-center text-sm text-ink-soft">{{ t('admin.noAuditEvents') }}</div>
        <div v-else>
          <p v-if="auditErrorMessage" class="px-6 py-4 text-sm text-alert" role="alert">{{ auditErrorMessage }}</p>
          <ul class="divide-y divide-line">
            <li v-for="event in auditEvents" :key="event.id" class="flex flex-wrap items-start justify-between gap-3 px-6 py-4">
              <div class="min-w-0">
                <p class="font-semibold text-ink">
                  {{ auditActionLabel(event.action) }}:
                  <span class="font-normal">{{ event.entityLabel }}</span>
                </p>
                <p v-if="event.targetLabel" class="mt-1 text-sm text-ink-soft">
                  {{ t('admin.auditReviewAuthor', { name: event.targetLabel }) }}
                </p>
                <p class="mt-1 text-sm text-ink-soft">
                  {{ t('admin.auditPerformedBy', { name: event.actorName, email: event.actorEmail }) }}
                </p>
              </div>
              <time class="shrink-0 text-sm text-ink-soft" :datetime="event.createdAt">{{ formatAuditDate(event.createdAt) }}</time>
            </li>
          </ul>
          <div v-if="hasMoreAudit" class="border-t border-line px-6 py-4 text-center">
            <button
              type="button"
              :disabled="isLoadingMoreAudit"
              class="rounded-lg px-4 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent/10 disabled:opacity-50"
              @click="loadAuditHistory(false)"
            >
              {{ isLoadingMoreAudit ? t('admin.loadingAudit') : t('admin.loadOlderAudit') }}
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
