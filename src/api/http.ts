import axios from 'axios';
import { useAuthStore } from '@/stores/auth.store';

const http = axios.create({
  baseURL: 'http://localhost:3000/api',
});

http.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.accessToken) {
    config.headers.Authorization = `Bearer ${authStore.accessToken}`;
  }
  return config;
});

export default http;