import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from '@/types/auth.types';

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref<string | null>(localStorage.getItem('accessToken'));
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'));
  const user = ref<User | null>(null);

  const isAuthenticated = computed(() => !!accessToken.value);

  function setTokens(newAccessToken: string, newRefreshToken: string) {
    accessToken.value = newAccessToken;
    refreshToken.value = newRefreshToken;
    localStorage.setItem('accessToken', newAccessToken);
    localStorage.setItem('refreshToken', newRefreshToken);
  }

  function setUser(newUser: User) {
    user.value = newUser;
  }

  function logout() {
    accessToken.value = null;
    refreshToken.value = null;
    user.value = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  return { accessToken, refreshToken, user, isAuthenticated, setTokens, setUser, logout };
});