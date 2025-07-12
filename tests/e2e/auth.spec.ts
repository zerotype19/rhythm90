import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
  });

  test('should allow user to sign up with valid credentials', async ({ page }) => {
    // Click sign up button
    await page.click('text=Sign Up');
    
    // Fill in signup form
    await page.fill('input[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard or onboarding
    await expect(page).toHaveURL(/dashboard|onboarding/);
  });

  test('should show error for invalid login credentials', async ({ page }) => {
    // Click login button
    await page.click('text=Login');
    
    // Fill in invalid credentials
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('.error-message')).toBeVisible();
  });

  test('should allow password reset flow', async ({ page }) => {
    // Navigate to password reset
    await page.click('text=Login');
    await page.click('text=Forgot Password?');
    
    // Fill in email
    await page.fill('input[name="email"]', 'test@example.com');
    await page.click('button[type="submit"]');
    
    // Should show success message
    await expect(page.locator('.success-message')).toBeVisible();
  });

  test('should maintain session across page refresh', async ({ page }) => {
    // Login first (assuming we have a test user)
    await page.click('text=Login');
    await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL || 'test@example.com');
    await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD || 'password');
    await page.click('button[type="submit"]');
    
    // Wait for login to complete
    await expect(page).toHaveURL(/dashboard/);
    
    // Refresh page
    await page.reload();
    
    // Should still be logged in
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator('.user-menu')).toBeVisible();
  });
}); 