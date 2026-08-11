import http from './http';
import type { AuthTokens } from '@/types/auth.types';

export function register(email: string, password: string) {
  return http.post<AuthTokens>('/auth/register', { email, password });
}

export function login(email: string, password: string) {
  return http.post<AuthTokens>('/auth/login', { email, password });
}

export function refreshTokens(refreshToken: string) {
  return http.post<AuthTokens>('/auth/refresh', { refreshToken });
}

export function logout(refreshToken: string) {
  return http.post('/auth/logout', { refreshToken });
}