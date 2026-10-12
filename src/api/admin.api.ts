import http from './http';
import type { User } from '@/types/auth.types';

export interface ManagedUser extends User {}

export function getManagedUsers(query = '') {
  return http.get<{ items: ManagedUser[] }>('/admin/users', {
    params: query.trim() ? { q: query.trim() } : undefined,
  });
}

export function updateManagedUserRole(id: string, role: 'USER' | 'ADMIN') {
  return http.patch<ManagedUser>(`/admin/users/${id}/role`, { role });
}
