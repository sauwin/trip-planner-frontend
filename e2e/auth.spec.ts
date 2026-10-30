import { test, expect } from '@playwright/test';
import { PASSWORD, register, uniqueEmail, useEnglish } from './helpers';

test.beforeEach(async ({ page }) => useEnglish(page));

test.describe('Autentifikácia', () => {
    test('neprihlásený používateľ je z chránenej stránky presmerovaný na prihlásenie', async ({ page }) => {
        await page.goto('/trips');
        await expect(page).toHaveURL(/\/login\?redirect=(%2F|\/)trips/);
    });

    test('registrácia nového účtu prihlási používateľa a presmeruje na úvod', async ({ page }) => {
        await register(page);
        const tokens = await page.evaluate(() => localStorage.getItem('accessToken'));
        expect(tokens).toBeTruthy();
    });

    test('prihlásenie so zlým heslom zobrazí chybu a neprihlási', async ({ page }) => {
        const email = await register(page);
        await page.evaluate(() => localStorage.clear());

        await page.goto('/login');
        await page.locator('#email').fill(email);
        await page.locator('#password').fill('ZleHeslo1');
        await page.locator('button[type="submit"]').click();

        await expect(page.locator('p.text-alert')).toBeVisible();
        await expect(page).toHaveURL(/\/login/);
    });

    test('po prihlásení sa používateľ vráti na pôvodne požadovanú stránku', async ({ page }) => {
        const email = await register(page);
        await page.evaluate(() => localStorage.clear());

        await page.goto('/trips');
        await expect(page).toHaveURL(/\/login/);
        await page.locator('#email').fill(email);
        await page.locator('#password').fill(PASSWORD);
        await page.locator('button[type="submit"]').click();

        await expect(page).toHaveURL('/trips');
    });

    test('registrácia so slabým heslom sa nedokončí', async ({ page }) => {
        await page.goto('/register');
        await page.locator('#username').fill('Slabe');
        await page.locator('#email').fill(uniqueEmail());
        await page.locator('#password').fill('slabe');
        await page.locator('button[type="submit"]').click();

        await expect(page).toHaveURL(/\/register/);
    });
});