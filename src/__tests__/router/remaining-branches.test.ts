import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

const Stub = { template: '<div />' };

for (const view of [
    'home/pages/HomeView',
    'login/pages/LoginView',
    'trips/pages/TripsView',
]) {
    vi.doMock(`@/views/${view}.vue`, () => ({ default: Stub }));
}

vi.mock('@/api/auth.api', () => ({ getCurrentUser: vi.fn() }));

import { getCurrentUser } from '@/api/auth.api';
import { useAuthStore } from '@/stores/auth.store';

async function freshRouter() {
    vi.resetModules();
    const { default: router } = await import('@/router');
    return router;
}

beforeEach(() => {
    setActivePinia(createPinia());
    vi.mocked(getCurrentUser).mockReset();
});

describe('router – zostávajúce vetvy', () => {
    it('presmeruje na login, ak načítanie profilu zlyhá a relácia už bola stratená', async () => {
        vi.mocked(getCurrentUser).mockImplementation(async () => {
            useAuthStore().logout();
            throw new Error('Session expired');
        });

        const router = await freshRouter();
        useAuthStore().setTokens('access-token', 'refresh-token');

        await router.push('/trips');

        expect(router.currentRoute.value.name).toBe('login');
        expect(router.currentRoute.value.query.redirect).toBe('/trips');
    });

    it('nepustí USER na trasu, ktorá vyžaduje rolu ADMIN', async () => {
        vi.mocked(getCurrentUser).mockResolvedValue({
            data: {
                id: '1',
                email: 'user@example.com',
                name: 'User',
                role: 'USER',
            },
        } as never);

        const router = await freshRouter();

        router.addRoute({
            path: '/admin-role-coverage-test',
            name: 'admin-role-coverage-test',
            component: Stub,
            meta: {
                requiresAuth: true,
                requiresRole: 'ADMIN',
            },
        });

        useAuthStore().setTokens('access-token', 'refresh-token');

        await router.push('/admin-role-coverage-test');

        expect(router.currentRoute.value.name).toBe('home');
    });
});
