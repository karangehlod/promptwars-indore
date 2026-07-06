import { test, expect } from '@playwright/test';

test.describe('TravelYarro Happy Path', () => {
  test('should complete the onboarding and generate itinerary', async ({ page }) => {
    await page.goto('/');

    // 1. Onboarding Hero
    await expect(page.getByRole('heading', { name: 'Welcome to TravelYarro' })).toBeVisible();
    await page.getByRole('button', { name: "Let's Start Planning" }).click();

    // 2. Profile Wizard (Step 1: Interests)
    await expect(page.getByRole('heading', { name: 'What are your interests?' })).toBeVisible();
    await page.getByRole('button', { name: 'Culture', exact: true }).click();
    await page.getByRole('button', { name: 'Food', exact: true }).click();
    await page.getByRole('button', { name: 'Next' }).click();

    // Profile Wizard (Step 2: Budget & Style)
    await expect(page.getByRole('heading', { name: 'Budget & Style' })).toBeVisible();
    await page.getByPlaceholder('e.g. 50000').fill('30000');
    await page.getByRole('button', { name: 'Solo', exact: true }).click();
    await page.getByRole('button', { name: 'Next' }).click();

    // Profile Wizard (Step 3: When & How - Dates & Pace)
    await expect(page.getByRole('heading', { name: 'When & How' })).toBeVisible();
    
    // Fill Dates (today is 2026-07-06, let's select future dates)
    const today = new Date();
    const startDate = new Date(today.getTime() + 24 * 60 * 60 * 1000 * 5); // 5 days from now
    const endDate = new Date(today.getTime() + 24 * 60 * 60 * 1000 * 10); // 10 days from now
    
    const formatDate = (d: Date) => d.toISOString().split('T')[0];
    
    await page.locator('input[type="date"]').first().fill(formatDate(startDate));
    await page.locator('input[type="date"]').last().fill(formatDate(endDate));
    
    // Select moderate pace radio
    await page.locator('input[type="radio"][value="moderate"]').click();
    await page.getByRole('button', { name: 'Next' }).click();

    // Profile Wizard (Step 4: Dietary & Accessibility)
    await expect(page.getByRole('heading', { name: 'Preferences & Needs' })).toBeVisible();
    await page.getByRole('button', { name: 'Complete Profile' }).click();

    // 3. Destination Input
    await expect(page.getByRole('heading', { name: 'Where in India to next?' })).toBeVisible();
    
    // Select state and enter city
    await page.locator('select').selectOption('Madhya Pradesh');
    await page.getByPlaceholder('e.g. city in Madhya Pradesh').fill('Indore');
    
    // Click validation button
    await page.getByRole('button', { name: 'Verify Location' }).click();
    
    // Wait for the "Location confirmed" text to appear
    await expect(page.getByText('Location confirmed')).toBeVisible({ timeout: 15000 });
    
    // Click Proceed button
    await page.getByRole('button', { name: 'Explore Destination' }).click();

    // 4. Dashboard Grid
    await expect(page.getByRole('heading', { name: 'Discover Indore' })).toBeVisible({ timeout: 15000 });
    
    // Wait for the recommendations to be visible in the DOM
    await page.waitForSelector('text=Recommended for you');
    
    // Click the first recommended card to select it
    const firstCard = page.locator('section').filter({ hasText: 'Recommended for you' }).locator('.cursor-pointer').first();
    await expect(firstCard).toBeVisible();
    await firstCard.click();

    // Click Generate Itinerary in Sidebar
    await page.getByRole('button', { name: 'Generate Itinerary' }).click();

    // Click Generate Magic Plan on the selection tray review step
    await page.getByRole('button', { name: 'Generate Magic Plan' }).click();

    // 5. Itinerary View
    await expect(page.getByRole('heading', { name: 'Your Itinerary: Indore' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('heading', { name: 'Day 1', exact: true })).toBeVisible();
  });
});
