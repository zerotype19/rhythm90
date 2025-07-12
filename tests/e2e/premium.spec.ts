import { test, expect } from '@playwright/test';

test.describe('Premium Upgrade Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
  });

  test('should show premium guard for restricted features', async ({ page }) => {
    // Login as regular user
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'regular@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Navigate to premium feature
    await page.click('text=AI Assistant');
    
    // Should show premium upgrade modal
    await expect(page.locator('.premium-upgrade-modal')).toBeVisible();
  });

  test('should redirect to Stripe checkout', async ({ page }) => {
    // Login as regular user
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'regular@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Click upgrade button
    await page.click('button:has-text("Upgrade to Premium")');
    
    // Should redirect to Stripe
    await expect(page).toHaveURL(/stripe\.com/);
  });

  test('should handle successful payment', async ({ page }) => {
    // Mock successful Stripe payment (in real test, would use Stripe test mode)
    // This is a simplified test - in practice would need Stripe test integration
    
    // Login as user who just completed payment
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'premium@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Should have premium access
    await page.click('text=AI Assistant');
    await expect(page.locator('.ai-assistant-panel')).toBeVisible();
  });

  test('should show premium features for premium users', async ({ page }) => {
    // Login as premium user
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'premium@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Check premium features are accessible
    await page.click('text=AI Assistant');
    await expect(page.locator('.ai-assistant-panel')).toBeVisible();
    
    await page.click('text=Analytics');
    await expect(page.locator('.premium-analytics')).toBeVisible();
  });

  test('should handle payment cancellation', async ({ page }) => {
    // Login as regular user
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'regular@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Start upgrade process
    await page.click('button:has-text("Upgrade to Premium")');
    
    // Simulate cancellation (would need Stripe test integration)
    // For now, just verify the flow starts correctly
    await expect(page).toHaveURL(/stripe\.com/);
  });
}); 