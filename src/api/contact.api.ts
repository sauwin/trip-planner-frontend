import http from './http';

export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  website?: string;
}

export function sendContactMessage(payload: ContactPayload) {
  return http.post<{ message: string }>('/contact', payload);
}