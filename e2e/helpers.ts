import { expect, type Page } from '@playwright/test';

export const PASSWORD = 'Heslo1234';

export function uniqueEmail(prefix = 'e2e') {
    return `${prefix}+${Date.now()}${Math.floor(Math.random() * 1000)}@example.com`;
}

export async function useEnglish(page: Page) {
    await page.addInitScript(() => localStorage.setItem('locale', 'en'));
}

export async function register(page: Page, email = uniqueEmail()) {
    await page.goto('/register');
    await page.locator('#username').fill('E2E User');
    await page.locator('#email').fill(email);
    await page.locator('#password').fill(PASSWORD);
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL('/');
    return email;
}