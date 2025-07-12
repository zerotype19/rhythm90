import { test, expect } from '@playwright/test';

test.describe('Onboarding Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
  });

  test('should show welcome modal for new users', async ({ page }) => {
    // Sign up as new user
    await page.click('text=Sign Up');
    await page.fill('input[name="email"]', `newuser-${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
    await page.click('button[type="submit"]');
    
    // Should show welcome modal
    await expect(page.locator('.welcome-modal')).toBeVisible();
  });

  test('should allow completing onboarding flow', async ({ page }) => {
    // Login as new user (assuming onboarding not complete)
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'newuser@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Complete profile step
    await page.fill('input[name="name"]', 'Test User');
    await page.selectOption('select[name="role"]', 'developer');
    await page.click('button:has-text("Next")');
    
    // Join team step
    await page.fill('input[name="inviteCode"]', 'TEST123');
    await page.click('button:has-text("Join Team")');
    
    // Create first play
    await page.click('button:has-text("Create Play")');
    await page.fill('input[name="title"]', 'My First Play');
    await page.fill('textarea[name="description"]', 'This is my first play');
    await page.click('button:has-text("Save")');
    
    // Log first signal
    await page.click('button:has-text("Log Signal")');
    await page.fill('input[name="signal"]', 'First signal logged');
    await page.click('button:has-text("Log")');
    
    // Should complete onboarding
    await expect(page.locator('.onboarding-complete')).toBeVisible();
  });

  test('should allow skipping onboarding', async ({ page }) => {
    // Login as new user
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'newuser@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Click skip button
    await page.click('button:has-text("Skip")');
    
    // Should access main dashboard
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator('.main-content')).toBeVisible();
  });

  test('should track onboarding progress', async ({ page }) => {
    // Login and start onboarding
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'newuser@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Check progress indicator
    await expect(page.locator('.onboarding-progress')).toBeVisible();
    
    // Complete first step
    await page.fill('input[name="name"]', 'Test User');
    await page.click('button:has-text("Next")');
    
    // Progress should update
    await expect(page.locator('.onboarding-progress')).toContainText('2/4');
  });
}); 