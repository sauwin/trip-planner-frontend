import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth.store';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const http = axios.create({ baseURL: BASE_URL });

const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout'];

function isAuthEndpoint(url?: string): boolean {
  if (!url) return false;
  return AUTH_ENDPOINTS.some((path) => url.includes(path));
}

http.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.accessToken) {
    config.headers.Authorization = `Bearer ${authStore.accessToken}`;
  }
  return config;
});

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const authStore = useAuthStore();

  if (!authStore.refreshToken) {
    throw new Error('NO_REFRESH_TOKEN');
  }
  const response = await axios.post<{ accessToken: string; refreshToken: string }>(
    `${BASE_URL}/auth/refresh`,
    { refreshToken: authStore.refreshToken },
  );

  authStore.setTokens(response.data.accessToken, response.data.refreshToken);
  return response.data.accessToken;
}

async function handleSessionExpired() {
  const authStore = useAuthStore();
  authStore.logout();

  const { default: router } = await import('@/router');
  const current = router.currentRoute.value;

  if (current.name !== 'login') {
    router.push({ name: 'login', query: { redirect: current.fullPath } });
  }
}

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableConfig | undefined;

    const isUnauthorized = error.response?.status === 401;
    const shouldAttemptRefresh =
      isUnauthorized && originalRequest && !originalRequest._retry && !isAuthEndpoint(originalRequest.url);

    if (!shouldAttemptRefresh) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }
      const newAccessToken = await refreshPromise;

      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return http(originalRequest);
    } catch (refreshError) {
      await handleSessionExpired();
      return Promise.reject(refreshError);
    }
  },
);

export default http;