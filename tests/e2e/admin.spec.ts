import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
  });

  test('should allow admin to access dashboard', async ({ page }) => {
    // Login as admin
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Navigate to admin dashboard
    await page.click('text=Admin');
    
    // Should show admin dashboard
    await expect(page).toHaveURL(/admin/);
    await expect(page.locator('.admin-dashboard')).toBeVisible();
  });

  test('should show users list with pagination', async ({ page }) => {
    // Login as admin
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Go to admin dashboard
    await page.click('text=Admin');
    await page.click('text=Users');
    
    // Should show users table
    await expect(page.locator('.users-table')).toBeVisible();
    await expect(page.locator('.pagination')).toBeVisible();
  });

  test('should allow bulk user actions', async ({ page }) => {
    // Login as admin
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Go to admin dashboard
    await page.click('text=Admin');
    await page.click('text=Users');
    
    // Select users for bulk action
    await page.click('input[type="checkbox"]:first-child');
    await page.click('button:has-text("Bulk Actions")');
    
    // Should show bulk action options
    await expect(page.locator('.bulk-actions-menu')).toBeVisible();
  });

  test('should show teams management', async ({ page }) => {
    // Login as admin
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Go to admin dashboard
    await page.click('text=Admin');
    await page.click('text=Teams');
    
    // Should show teams table
    await expect(page.locator('.teams-table')).toBeVisible();
  });

  test('should show analytics dashboard', async ({ page }) => {
    // Login as admin
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Go to admin dashboard
    await page.click('text=Admin');
    await page.click('text=Analytics');
    
    // Should show analytics charts
    await expect(page.locator('.analytics-charts')).toBeVisible();
  });

  test('should prevent non-admin access', async ({ page }) => {
    // Login as regular user
    await page.click('text=Login');
    await page.fill('input[name="email"]', 'regular@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    
    // Try to access admin dashboard directly
    await page.goto('/admin');
    
    // Should be denied access
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator('.error-message')).toBeVisible();
  });
}); 