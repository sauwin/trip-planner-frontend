<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import PageHeader from '@/components/PageHeader.vue';
import { getManagedUsers, updateManagedUserRole, type ManagedUser } from '@/api/admin.api';
import { getApiErrorMessage } from '@/utils/apiError';

const { t } = useI18n();
const query = ref('');
const users = ref<ManagedUser[]>([]);
const isLoading = ref(true);
const updatingUserId = ref('');
const errorMessage = ref('');
const validationMessage = ref('');

function roleLabel(role: ManagedUser['role']) {
  if (role === 'SUPER_ADMIN') return t('admin.superAdmin');
  if (role === 'ADMIN') return t('admin.admin');
  return t('admin.regularUser');
}

async function loadUsers(search = '') {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const response = await getManagedUsers(search);
    users.value = response.data.items;
  } catch {
    errorMessage.value = t('admin.usersError');
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => loadUsers());

function searchUsers() {
  validationMessage.value = '';
  const search = query.value.trim();
  if (search && search.length < 2) {
    validationMessage.value = t('admin.searchTooShort');
    return;
  }
  loadUsers(search);
}

async function changeRole(user: ManagedUser) {
  updatingUserId.value = user.id;
  errorMessage.value = '';
  try {
    await updateManagedUserRole(user.id, user.role === 'ADMIN' ? 'USER' : 'ADMIN');
    await loadUsers(query.value.trim());
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
        <router-link to="/destinations" class="mb-12 rounded-lg border border-line bg-paper-dim px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-paper">
          {{ t('nav.destinations') }}
        </router-link>
      </div>

      <form class="card-surface mb-6 flex flex-wrap items-end gap-3 rounded-2xl p-5 sm:p-6" @submit.prevent="searchUsers">
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

      <section class="card-surface overflow-hidden rounded-2xl">
        <p v-if="isLoading" class="px-6 py-12 text-center text-sm text-ink-soft">{{ t('admin.loadingUsers') }}</p>
        <div v-else-if="users.length === 0" class="px-6 py-12 text-center text-sm text-ink-soft">{{ t('admin.noUsers') }}</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full min-w-[600px] text-left text-sm">
            <thead class="border-b border-line bg-paper/70 text-xs font-semibold uppercase tracking-wide text-ink-soft">
              <tr>
                <th class="px-6 py-4">{{ t('admin.user') }}</th>
                <th class="px-6 py-4">{{ t('admin.role') }}</th>
                <th class="px-6 py-4 text-right">{{ t('admin.actions') }}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-line">
              <tr v-for="user in users" :key="user.id" class="hover:bg-paper/50">
                <td class="px-6 py-4">
                  <p class="font-semibold text-ink">{{ user.name || user.email }}</p>
                  <p v-if="user.name" class="mt-1 text-ink-soft">{{ user.email }}</p>
                </td>
                <td class="px-6 py-4 text-ink-soft">{{ roleLabel(user.role) }}</td>
                <td class="px-6 py-4 text-right">
                  <button
                    v-if="user.role !== 'SUPER_ADMIN'"
                    type="button"
                    :disabled="updatingUserId === user.id"
                    class="rounded-lg px-3 py-2 font-semibold transition-colors disabled:opacity-50"
                    :class="user.role === 'ADMIN' ? 'text-alert hover:bg-alert/10' : 'text-accent hover:bg-accent/10'"
                    @click="changeRole(user)"
                  >
                    {{ updatingUserId === user.id ? t('admin.loadingUsers') : user.role === 'ADMIN' ? t('admin.demote') : t('admin.promote') }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>
