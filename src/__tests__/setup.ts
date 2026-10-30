import { beforeEach } from 'vitest';

beforeEach(() => {
    localStorage.clear();
});

window.scrollTo = (() => {}) as typeof window.scrollTo;