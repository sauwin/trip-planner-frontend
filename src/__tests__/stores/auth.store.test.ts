import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '@/stores/auth.store';

beforeEach(() => {
    setActivePinia(createPinia());
});

describe('auth store', () => {
    it('na začiatku nie je používateľ prihlásený', () => {
        const store = useAuthStore();
        expect(store.isAuthenticated).toBe(false);
        expect(store.user).toBeNull();
    });

    it('setTokens uloží tokeny do stavu aj do localStorage', () => {
        const store = useAuthStore();
        store.setTokens('access', 'refresh');

        expect(store.isAuthenticated).toBe(true);
        expect(localStorage.getItem('accessToken')).toBe('access');
        expect(localStorage.getItem('refreshToken')).toBe('refresh');
    });

    it('setUser uloží profil používateľa', () => {
        const store = useAuthStore();
        store.setUser({ id: '1', email: 'a@b.sk', name: 'Max', role: 'USER' });
        expect(store.user?.email).toBe('a@b.sk');
    });

    it('logout vymaže tokeny, používateľa aj localStorage', () => {
        const store = useAuthStore();
        store.setTokens('access', 'refresh');
        store.setUser({ id: '1', email: 'a@b.sk', name: null, role: 'USER' });

        store.logout();

        expect(store.isAuthenticated).toBe(false);
        expect(store.user).toBeNull();
        expect(localStorage.getItem('accessToken')).toBeNull();
        expect(localStorage.getItem('refreshToken')).toBeNull();
    });

    it('po obnovení stránky načíta tokeny z localStorage', () => {
        localStorage.setItem('accessToken', 'saved-access');
        localStorage.setItem('refreshToken', 'saved-refresh');
        setActivePinia(createPinia());

        const store = useAuthStore();
        expect(store.accessToken).toBe('saved-access');
        expect(store.isAuthenticated).toBe(true);
    });
});