import { test, expect } from '@playwright/test';
import { register, useEnglish } from './helpers';

test.beforeEach(async ({ page }) => useEnglish(page));

test.describe('Plánovanie cesty a výdavky', () => {
    test('používateľ vytvorí cestu, otvorí jej detail a pridá výdavok', async ({ page }) => {
        await register(page);

        await page.goto('/trips');
        await page.getByPlaceholder('Trip name (e.g., Summer in Italy)').fill('Leto v Taliansku');
        await page.getByPlaceholder('Budget (optional, €)').fill('1000');
        await page.getByPlaceholder('Number of people').fill('2');
        await page.getByRole('button', { name: 'Create Trip' }).click();

        const card = page.getByRole('link', { name: /Leto v Taliansku/ });
        await expect(card).toBeVisible();

        await card.click();
        await expect(page).toHaveURL(/\/trips\/[0-9a-f-]+$/);
        await expect(page.getByText('Leto v Taliansku').first()).toBeVisible();

        await page.getByPlaceholder('Expense description').last().fill('Obed v Ríme');
        await page.getByPlaceholder('Amount (€)').fill('45');
        await page.getByRole('button', { name: 'Add', exact: true }).last().click();

        await expect(page.getByText('Obed v Ríme')).toBeVisible();
    });

    test('formulár odmietne prázdny názov cesty', async ({ page }) => {
        await register(page);
        await page.goto('/trips');

        await page.getByPlaceholder('Trip name (e.g., Summer in Italy)').focus();
        await page.getByPlaceholder('Budget (optional, €)').focus();

        await expect(page.getByText('Trip name is required')).toBeVisible();
    });

    test('cesta jedného používateľa nie je viditeľná druhému', async ({ page, browser }) => {
        await register(page);
        await page.goto('/trips');
        await page.getByPlaceholder('Trip name (e.g., Summer in Italy)').fill('Súkromná cesta');
        await page.getByRole('button', { name: 'Create Trip' }).click();
        await expect(page.getByRole('link', { name: /Súkromná cesta/ })).toBeVisible();
        const tripUrl = await page.getByRole('link', { name: /Súkromná cesta/ }).getAttribute('href');

        const other = await browser.newPage();
        await useEnglish(other);
        await register(other);
        await other.goto('/trips');
        await expect(other.getByText('Súkromná cesta')).toHaveCount(0);

        await other.goto(tripUrl!);
        await expect(other.getByText('Súkromná cesta')).toHaveCount(0);
        await other.close();
    });
});

test.describe('Odporúčania', () => {
    test('bez vyplneného kvízu aplikácia ponúkne jeho vyplnenie', async ({ page }) => {
        await register(page);
        await page.goto('/recommendations');

        await expect(page).toHaveURL(/\/recommendations/);
        await expect(page.getByRole('heading', { name: 'Take the quiz first' })).toBeVisible();
        await expect(page.getByRole('button', { name: /quiz/i })).toBeVisible();

        await page.getByRole('button', { name: /quiz/i }).click();
        await expect(page).toHaveURL(/\/(preferences|quiz)/);
    });
});