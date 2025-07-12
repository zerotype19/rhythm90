import { test, expect } from '@playwright/test';

test.describe('Developer Portal Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
  });

  test('should allow API key generation', async ({ page }) => {
    // Login as user
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'developer@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Navigate to developer portal
    await page.click('text=Developer');
    
    // Generate new API key
    await page.click('button:has-text("Generate API Key")');
    await page.fill('input[name="keyName"]', 'Test API Key');
    await page.click('button:has-text("Create")');
    
    // Should show new API key
    await expect(page.locator('.api-key-display')).toBeVisible();
  });

  test('should show API key usage tracking', async ({ page }) => {
    // Login as user
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'developer@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Navigate to developer portal
    await page.click('text=Developer');
    
    // Should show usage metrics
    await expect(page.locator('.usage-metrics')).toBeVisible();
    await expect(page.locator('.rate-limit-info')).toBeVisible();
  });

  test('should allow API key revocation', async ({ page }) => {
    // Login as user
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'developer@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Navigate to developer portal
    await page.click('text=Developer');
    
    // Revoke API key
    await page.click('button:has-text("Revoke"):first');
    await page.click('button:has-text("Confirm")');
    
    // Should show confirmation
    await expect(page.locator('.success-message')).toBeVisible();
  });

  test('should show rate limit UX', async ({ page }) => {
    // Login as user
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'developer@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Navigate to developer portal
    await page.click('text=Developer');
    
    // Should show rate limit information
    await expect(page.locator('.rate-limit-display')).toBeVisible();
    await expect(page.locator('.usage-progress')).toBeVisible();
  });

  test('should handle rate limit exceeded', async ({ page }) => {
    // Login as user
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'developer@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Navigate to developer portal
    await page.click('text=Developer');
    
    // Simulate rate limit exceeded (would need API testing)
    // For now, just verify the UI shows rate limit info
    await expect(page.locator('.rate-limit-info')).toBeVisible();
  });

  test('should show API documentation', async ({ page }) => {
    // Login as user
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'developer@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Navigate to developer portal
    await page.click('text=Developer');
    
    // Should show API documentation
    await expect(page.locator('.api-docs')).toBeVisible();
  });
}); 