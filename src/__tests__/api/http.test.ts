import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { setActivePinia, createPinia } from 'pinia';

const push = vi.fn();
vi.mock('@/router', () => ({
    default: { currentRoute: { value: { name: 'trips', fullPath: '/trips' } }, push },
}));

import http from '@/api/http';
import { useAuthStore } from '@/stores/auth.store';

interface Sent {
    url?: string;
    auth?: unknown;
}

function installAdapter(sent: Sent[], validToken: string) {
    http.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
        const auth = config.headers.Authorization;
        sent.push({ url: config.url, auth });

        if (config.url?.includes('/auth/') || auth === `Bearer ${validToken}`) {
            return { data: { ok: true }, status: 200, statusText: 'OK', headers: {}, config };
        }

        throw new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, null, {
            data: {},
            status: 401,
            statusText: 'Unauthorized',
            headers: {},
            config,
        });
    };
}

beforeEach(() => {
    setActivePinia(createPinia());
    push.mockReset();
});

describe('axios klient (http.ts)', () => {
    it('pridá hlavičku Authorization, ak je používateľ prihlásený', async () => {
        const sent: Sent[] = [];
        installAdapter(sent, 'good');
        useAuthStore().setTokens('good', 'r');

        await http.get('/trips');
        expect(sent[0]!.auth).toBe('Bearer good');
    });

    it('bez prihlásenia hlavičku nepridá', async () => {
        const sent: Sent[] = [];
        installAdapter(sent, 'good');

        await http.get('/destinations').catch(() => {});
        expect(sent[0]!.auth).toBeUndefined();
    });

    it('pri 401 obnoví token a zopakuje pôvodný dopyt s novým tokenom', async () => {
        const sent: Sent[] = [];
        installAdapter(sent, 'new-access');
        const store = useAuthStore();
        store.setTokens('expired', 'refresh-1');
        const postSpy = vi.spyOn(axios, 'post').mockResolvedValue({
            data: { accessToken: 'new-access', refreshToken: 'refresh-2' },
        });

        const res = await http.get('/trips');

        expect(res.status).toBe(200);
        expect(postSpy).toHaveBeenCalledTimes(1);
        expect(store.accessToken).toBe('new-access');
        expect(store.refreshToken).toBe('refresh-2');
        expect(sent.map((s) => s.auth)).toEqual(['Bearer expired', 'Bearer new-access']);
    });

    it('súbežné dopyty s 401 spustia iba jedno obnovenie tokenu', async () => {
        const sent: Sent[] = [];
        installAdapter(sent, 'new-access');
        useAuthStore().setTokens('expired', 'refresh-1');
        const postSpy = vi.spyOn(axios, 'post').mockResolvedValue({
            data: { accessToken: 'new-access', refreshToken: 'refresh-2' },
        });

        await Promise.all([http.get('/trips'), http.get('/destinations'), http.get('/preferences')]);
        expect(postSpy).toHaveBeenCalledTimes(1);
    });

    it('ak obnovenie zlyhá, používateľ sa odhlási a presmeruje na login', async () => {
        const sent: Sent[] = [];
        installAdapter(sent, 'never');
        const store = useAuthStore();
        store.setTokens('expired', 'refresh-1');
        vi.spyOn(axios, 'post').mockRejectedValue(new Error('refresh expired'));

        await expect(http.get('/trips')).rejects.toBeDefined();

        expect(store.isAuthenticated).toBe(false);
        expect(push).toHaveBeenCalledWith({ name: 'login', query: { redirect: '/trips' } });
    });

    it('401 z prihlasovacieho endpointu nespúšťa obnovu tokenu', async () => {
        http.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
            throw new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, null, {
                data: { error: 'Invalid email or password' },
                status: 401,
                statusText: 'Unauthorized',
                headers: {},
                config,
            });
        };
        const postSpy = vi.spyOn(axios, 'post');
        useAuthStore().setTokens('a', 'r');

        await expect(http.post('/auth/login', {})).rejects.toBeDefined();
        expect(postSpy).not.toHaveBeenCalled();
    });

    it('ak chýba refresh token, ukončí reláciu bez volania endpointu refresh', async () => {
        const sent: Sent[] = [];
        installAdapter(sent, 'never');
        const store = useAuthStore();
        store.accessToken = 'expired';
        store.refreshToken = null;
        const postSpy = vi.spyOn(axios, 'post');

        await expect(http.get('/trips')).rejects.toBeDefined();

        expect(postSpy).not.toHaveBeenCalled();
        expect(store.isAuthenticated).toBe(false);
        expect(push).toHaveBeenCalledWith({ name: 'login', query: { redirect: '/trips' } });
    });

    it('pri 401 s chýbajúcim URL a headers stále obnoví token a zopakuje požiadavku', async () => {
        const store = useAuthStore();
        store.setTokens('expired', 'refresh-1');

        const postSpy = vi.spyOn(axios, 'post').mockResolvedValue({
            data: { accessToken: 'new-access', refreshToken: 'refresh-2' },
        });

        http.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
            if (config.headers.Authorization === 'Bearer new-access') {
                return { data: { ok: true }, status: 200, statusText: 'OK', headers: {}, config };
            }

            const mutableConfig = config as unknown as { url?: string; headers?: unknown };
            mutableConfig.url = undefined;
            mutableConfig.headers = undefined;

            throw new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, null, {
                data: {},
                status: 401,
                statusText: 'Unauthorized',
                headers: {},
                config,
            });
        };

        const response = await http.get('/trips');

        expect(response.status).toBe(200);
        expect(postSpy).toHaveBeenCalledTimes(1);
        expect(store.accessToken).toBe('new-access');
    });

    it('použije predvolenú BASE_URL, keď VITE_API_URL nie je nastavené', async () => {
        vi.stubEnv('VITE_API_URL', '');
        vi.resetModules();

        const { default: isolatedHttp } = await import('@/api/http');

        expect(isolatedHttp.defaults.baseURL).toBe('http://localhost:3000/api');
        vi.unstubAllEnvs();
    });
});
