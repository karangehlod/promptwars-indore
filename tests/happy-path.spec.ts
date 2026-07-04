import { test, expect } from '@playwright/test';

test.describe('TravelYarro Happy Path', () => {
  test('should complete the onboarding and generate itinerary', async ({ page }) => {
    await page.goto('/');

    // 1. Onboarding Hero
    await expect(page.locator('h1')).toContainText('Welcome to TravelYarro');
    await page.getByRole('button', { name: "Let's Start Planning" }).click();

    // 2. Profile Wizard (Step 1)
    await expect(page.locator('h2')).toContainText('What brings you joy');
    await page.getByText('Culture & History').click();
    await page.getByText('Food & Culinary').click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Profile Wizard (Step 2)
    await expect(page.locator('h2')).toContainText('budget');
    await page.getByText('Moderate').click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Profile Wizard (Step 3)
    await expect(page.locator('h2')).toContainText('pace');
    await page.getByText('Balanced').click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // 3. Destination Input
    await expect(page.locator('h2')).toContainText('Where to?');
    await page.getByPlaceholder('e.g., Paris, Kyoto, New York').fill('Indore');
    await page.getByRole('button', { name: 'Start Exploring' }).click();

    // 4. Dashboard Grid (Mock data should load quickly)
    await expect(page.locator('h2')).toContainText('Discover Indore', { timeout: 15000 });
    
    // Select an item to ensure Trip Summary allows generating itinerary
    // Assuming there is at least one recommendation available. We click the first Card.
    // It's a bit tricky to select by text if it's dynamic, so we'll just click the first element that looks like a card.
    await page.waitForSelector('text=Recommended for you');
    
    // Wait for the mock AI loading to finish (toast or loading overlay disappears)
    await expect(page.getByText('Dashboard fully loaded!')).toBeVisible({ timeout: 15000 });
    
    // Click the first recommended card to select it
    await page.locator('section').filter({ hasText: 'Recommended for you' }).locator('.cursor-pointer').first().click();

    // Click Generate Itinerary in Sidebar
    await page.getByRole('button', { name: 'Generate Itinerary' }).click();

    // 5. Itinerary View
    await expect(page.locator('h2').first()).toContainText('Your Itinerary: Indore', { timeout: 15000 });
    await expect(page.getByText('Day 1')).toBeVisible();
  });
});
