import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';

const Stub = { template: '<div />' };

const routeViews = [
    'home/pages/HomeView',
    'login/pages/LoginView',
    'register/pages/RegisterView',
    'forgot-password/pages/ForgotPasswordView',
    'reset-password/pages/ResetPasswordView',
    'search/pages/SearchResultsView',
    'preferences/pages/PreferencesView',
    'recommendations/pages/RecommendationsView',
    'destinations/pages/DestinationsView',
    'destination-detail/pages/DestinationDetailView',
    'trips/pages/TripsView',
    'trip-detail/pages/TripDetailView',
    'dashboard/pages/DashboardView',
    'about/pages/AboutView',
    'privacy/pages/PrivacyView',
    'terms/pages/TermsView',
    'contact/pages/ContactView',
    'admin/pages/AdminUsersView',
];

for (const view of routeViews) {
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

describe('navigačný strážca (router.beforeEach)', () => {
    it('neprihlásený používateľ na chránenej stránke je presmerovaný na /login s parametrom redirect', async () => {
        const router = await freshRouter();
        await router.push('/trips');

        expect(router.currentRoute.value.name).toBe('login');
        expect(router.currentRoute.value.query.redirect).toBe('/trips');
    });

    it('verejná stránka je dostupná bez prihlásenia', async () => {
        const router = await freshRouter();
        await router.push('/');
        expect(router.currentRoute.value.name).toBe('home');
    });

    it('prihlásený používateľ vstúpi na chránenú stránku a profil sa načíta zo servera', async () => {
        const store = useAuthStore();
        store.setTokens('a', 'r');
        vi.mocked(getCurrentUser).mockResolvedValue({
            data: { id: '1', email: 'a@b.sk', name: 'Max', role: 'USER' },
        } as never);

        const router = await freshRouter();
        useAuthStore().setTokens('a', 'r');
        await router.push('/trips');

        expect(router.currentRoute.value.name).toBe('trips');
        expect(getCurrentUser).toHaveBeenCalledTimes(1);
    });

    it('bežný USER nemá prístup na /manage-admins (presmerovanie na home)', async () => {
        vi.mocked(getCurrentUser).mockResolvedValue({
            data: { id: '1', email: 'a@b.sk', name: 'Max', role: 'USER' },
        } as never);
        const router = await freshRouter();
        useAuthStore().setTokens('a', 'r');
        await router.push('/manage-admins');

        expect(router.currentRoute.value.name).toBe('home');
    });

    it('ADMIN nemá prístup na stránku určenú iba pre SUPER_ADMIN', async () => {
        vi.mocked(getCurrentUser).mockResolvedValue({
            data: { id: '1', email: 'a@b.sk', name: 'Max', role: 'ADMIN' },
        } as never);
        const router = await freshRouter();
        useAuthStore().setTokens('a', 'r');
        await router.push('/manage-admins');

        expect(router.currentRoute.value.name).toBe('home');
    });

    it('SUPER_ADMIN vstúpi na /manage-admins', async () => {
        vi.mocked(getCurrentUser).mockResolvedValue({
            data: { id: '1', email: 'a@b.sk', name: 'Max', role: 'SUPER_ADMIN' },
        } as never);
        const router = await freshRouter();
        useAuthStore().setTokens('a', 'r');
        await router.push('/manage-admins');

        expect(router.currentRoute.value.name).toBe('manage-admins');
    });

    it('ak načítanie profilu zlyhá a používateľ je stále prihlásený, navigácia sa zruší', async () => {
        vi.mocked(getCurrentUser).mockRejectedValue(new Error('network'));
        const router = await freshRouter();
        useAuthStore().setTokens('a', 'r');
        await router.push('/trips');

        expect(router.currentRoute.value.name).not.toBe('trips');
    });

    it('ak počas chyby načítania profilu сесію вже втрачено, користувача перенаправляє на login', async () => {
        vi.mocked(getCurrentUser).mockImplementation(async () => {
            useAuthStore().logout();
            throw new Error('session expired');
        });

        const router = await freshRouter();
        useAuthStore().setTokens('a', 'r');
        await router.push('/trips');

        expect(router.currentRoute.value.name).toBe('login');
        expect(router.currentRoute.value.query.redirect).toBe('/trips');
    });

    it('ADMIN має доступ до маршруту з requiresRole ADMIN', async () => {
        const router = await freshRouter();
        const store = useAuthStore();
        store.setTokens('a', 'r');
        store.setUser({ id: '1', email: 'admin@example.com', name: 'Admin', role: 'ADMIN' });

        router.addRoute({
            path: '/admin-role-test',
            name: 'admin-role-test',
            component: Stub,
            meta: { requiresAuth: true, requiresRole: 'ADMIN' },
        });

        await router.push('/admin-role-test');
        expect(router.currentRoute.value.name).toBe('admin-role-test');
    });

    it('SUPER_ADMIN má tiež prístup na trasu s requiresRole ADMIN', async () => {
        const router = await freshRouter();
        const store = useAuthStore();
        store.setTokens('a', 'r');
        store.setUser({ id: '1', email: 'root@example.com', name: 'Root', role: 'SUPER_ADMIN' });

        router.addRoute({
            path: '/admin-role-super-test',
            name: 'admin-role-super-test',
            component: Stub,
            meta: { requiresAuth: true, requiresRole: 'ADMIN' },
        });

        await router.push('/admin-role-super-test');
        expect(router.currentRoute.value.name).toBe('admin-role-super-test');
    });

    it('vykoná lazy loader všetkých zaregistrovaných stránok', async () => {
        const router = await freshRouter();
        const loaders = router.getRoutes()
            .map((route) => route.components?.default)
            .filter((component) => typeof component === 'function') as Array<() => Promise<unknown>>;

        expect(loaders.length).toBe(routeViews.length);
        await Promise.all(loaders.map((load) => load()));
    });
});
