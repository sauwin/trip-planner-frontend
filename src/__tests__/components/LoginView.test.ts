import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createMemoryHistory } from 'vue-router';

vi.mock('@/api/auth.api', () => ({ login: vi.fn(), getCurrentUser: vi.fn() }));

import LoginView from '@/views/login/pages/LoginView.vue';
import { login, getCurrentUser } from '@/api/auth.api';
import { i18n, setLocale } from '@/locales';
import { useAuthStore } from '@/stores/auth.store';

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div />' } },
      { path: '/login', name: 'login', component: LoginView },
      { path: '/register', component: { template: '<div />' } },
      { path: '/forgot-password', component: { template: '<div />' } },
      { path: '/trips', component: { template: '<div />' } },
    ],
  });
}

async function mountLogin(url = '/login') {
    const pinia = createPinia();
    setActivePinia(pinia);
    const router = makeRouter();
    router.push(url);
    await router.isReady();
    const wrapper = mount(LoginView, { global: { plugins: [pinia, router, i18n] } });
    return { wrapper, router };
}

beforeEach(() => {
    setLocale('en');
    vi.mocked(login).mockReset();
    vi.mocked(getCurrentUser).mockReset();
});

describe('LoginView', () => {
    it('zobrazí formulár s poľami e-mail a heslo', async () => {
        const { wrapper } = await mountLogin();
        expect(wrapper.find('input#email').exists()).toBe(true);
        expect(wrapper.find('input#password').attributes('type')).toBe('password');
        expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
    });

    it('po úspešnom prihlásení uloží tokeny, načíta profil a presmeruje na home', async () => {
        vi.mocked(login).mockResolvedValue({ data: { accessToken: 'a', refreshToken: 'r' } } as never);
        vi.mocked(getCurrentUser).mockResolvedValue({ data: { id: '1', email: 'max@example.com', name: 'Max', role: 'USER' } } as never);
        const { wrapper, router } = await mountLogin();

        await wrapper.find('input#email').setValue('max@example.com');
        await wrapper.find('input#password').setValue('Heslo1234');
        await wrapper.find('form').trigger('submit');
        await flushPromises();

        expect(login).toHaveBeenCalledWith('max@example.com', 'Heslo1234');
        const store = useAuthStore();
        expect(store.accessToken).toBe('a');
        expect(store.user?.name).toBe('Max');
        expect(router.currentRoute.value.name).toBe('home');
    });

    it('po prihlásení presmeruje na adresu z parametra redirect', async () => {
        vi.mocked(login).mockResolvedValue({ data: { accessToken: 'a', refreshToken: 'r' } } as never);
        vi.mocked(getCurrentUser).mockResolvedValue({ data: { id: '1', email: 'a@b.sk', name: null, role: 'USER' } } as never);
        const { wrapper, router } = await mountLogin('/login?redirect=/trips');

        await wrapper.find('form').trigger('submit');
        await flushPromises();

        expect(router.currentRoute.value.path).toBe('/trips');
    });

    it('ignoruje externý redirect (ochrana pred open redirect)', async () => {
        vi.mocked(login).mockResolvedValue({ data: { accessToken: 'a', refreshToken: 'r' } } as never);
        vi.mocked(getCurrentUser).mockResolvedValue({ data: { id: '1', email: 'a@b.sk', name: null, role: 'USER' } } as never);
        const { wrapper, router } = await mountLogin('/login?redirect=https://evil.example');

        await wrapper.find('form').trigger('submit');
        await flushPromises();

        expect(router.currentRoute.value.name).toBe('home');
    });

    it('pri chybe zobrazí správu z backendu a používateľa neprihlási', async () => {
        vi.mocked(login).mockRejectedValue({ response: { data: { error: 'Invalid email or password' } } });
        const { wrapper } = await mountLogin();

        await wrapper.find('form').trigger('submit');
        await flushPromises();

        expect(wrapper.text()).toContain('Invalid email or password');
        expect(useAuthStore().isAuthenticated).toBe(false);
    });

    it('pri chybe bez správy zobrazí predvolený preložený text', async () => {
        vi.mocked(login).mockRejectedValue(new Error('network'));
        const { wrapper } = await mountLogin();

        await wrapper.find('form').trigger('submit');
        await flushPromises();

        expect(wrapper.find('p.text-alert').exists()).toBe(true);
    });

    it('počas odosielania je tlačidlo zablokované', async () => {
        let resolveLogin: (v: unknown) => void = () => {};
        vi.mocked(login).mockReturnValue(new Promise((r) => (resolveLogin = r)) as never);
        const { wrapper } = await mountLogin();

        await wrapper.find('form').trigger('submit');
        expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();

        resolveLogin({ data: { accessToken: 'a', refreshToken: 'r' } });
        vi.mocked(getCurrentUser).mockResolvedValue({ data: { id: '1', email: 'a@b.sk', name: null, role: 'USER' } } as never);
        await flushPromises();
    });
});