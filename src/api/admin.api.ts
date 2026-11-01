import http from './http';
import type { User } from '@/types/auth.types';

export interface ManagedUser extends User {}

export interface AdminAuditEvent {
  id: string;
  actorId: string;
  actorName: string;
  actorEmail: string;
  action:
    | 'DESTINATION_CREATED'
    | 'DESTINATION_UPDATED'
    | 'DESTINATION_DELETED'
    | 'REVIEW_DELETED'
    | 'ADMIN_ADDED'
    | 'ADMIN_REMOVED';
  entityId: string;
  entityLabel: string;
  targetLabel: string | null;
  createdAt: string;
}

export function getManagedUsers(query = '') {
  return http.get<{ items: ManagedUser[] }>('/admin/users', {
    params: query.trim() ? { q: query.trim() } : undefined,
  });
}

export function getAdminAuditHistory(cursor?: string) {
  return http.get<{ items: AdminAuditEvent[]; nextCursor: string | null }>('/admin/audit-log', {
    params: cursor ? { cursor } : undefined,
  });
}

export function updateManagedUserRole(id: string, role: 'USER' | 'ADMIN') {
  return http.patch<ManagedUser>(`/admin/users/${id}/role`, { role });
}
