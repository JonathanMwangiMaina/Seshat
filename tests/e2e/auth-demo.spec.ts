import { expect, test } from '@playwright/test';

const BASE_URL = 'http://localhost:9002';

const DEMO_USERS = {
  admin: { email: 'admin@retailpass.com', password: 'AdminPass123!', name: 'Admin User' },
  vendor: { email: 'vendor@retailpass.com', password: 'VendorPass123!', name: 'Vendor User' },
  customer: { email: 'user@test.com', password: 'UserPass123!', name: 'Customer User' },
};

test.describe('RetailPass Auth E2E with Demo Credentials (Local)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  test.describe('Login with Demo Credentials', () => {
    for (const [role, user] of Object.entries(DEMO_USERS)) {
      test(`should login as ${role}`, async ({ page }) => {
        await page.goto(`${BASE_URL}/login`);
        await page.waitForSelector('text=Welcome Back', { timeout: 15000 });
        await page.fill('input[name="email"]', user.email);
        await page.fill('input[name="password"]', user.password);
        await page.click('button[type="submit"]:has-text("Login")');

        // Wait for redirect to profile and content to load
        await expect(page).toHaveURL(`${BASE_URL}/profile`, { timeout: 10000 });
        await expect(page.locator('text=My Profile')).toBeVisible({ timeout: 10000 });

        // Verify user's name is in the name input field
        await expect(page.locator('input[name="name"]')).toHaveValue(user.name, { timeout: 5000 });
      });
    }

    test('should reject invalid credentials', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForSelector('text=Welcome Back', { timeout: 15000 });
      await page.fill('input[name="email"]', DEMO_USERS.admin.email);
      await page.fill('input[name="password"]', 'WrongPassword123!');
      await page.click('button[type="submit"]:has-text("Login")');

      // Check for error notification (use first to avoid strict mode)
      await expect(page.locator('text=Invalid email or password').first()).toBeVisible({
        timeout: 5000,
      });
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect to login when accessing profile without auth', async ({ page }) => {
      await page.goto(`${BASE_URL}/profile`);
      await expect(page).toHaveURL(`${BASE_URL}/login`);
    });

    test('should allow access to profile after login', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForSelector('text=Welcome Back', { timeout: 15000 });
      await page.fill('input[name="email"]', DEMO_USERS.admin.email);
      await page.fill('input[name="password"]', DEMO_USERS.admin.password);
      await page.click('button[type="submit"]:has-text("Login")');

      await expect(page).toHaveURL(`${BASE_URL}/profile`, { timeout: 10000 });
      await expect(page.locator('text=My Profile')).toBeVisible({ timeout: 10000 });
      await expect(page.locator('input[name="name"]')).toHaveValue(DEMO_USERS.admin.name, {
        timeout: 5000,
      });
    });
  });

  test.describe('Logout', () => {
    test('should logout and redirect to login', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForSelector('text=Welcome Back', { timeout: 15000 });
      await page.fill('input[name="email"]', DEMO_USERS.admin.email);
      await page.fill('input[name="password"]', DEMO_USERS.admin.password);
      await page.click('button[type="submit"]:has-text("Login")');

      await expect(page).toHaveURL(`${BASE_URL}/profile`, { timeout: 10000 });
      await expect(page.locator('text=My Profile')).toBeVisible({ timeout: 10000 });

      // Find and click logout button
      await page.click('button:has-text("Logout")');
      // Logout redirects to login page
      await expect(page).toHaveURL(`${BASE_URL}/login`);
    });
  });

  test.describe('Full User Flow with Demo Credentials', () => {
    for (const [role, user] of Object.entries(DEMO_USERS)) {
      test(`${role}: complete flow - login, profile, logout`, async ({ page }) => {
        // Login
        await page.goto(`${BASE_URL}/login`);
        await page.waitForSelector('text=Welcome Back', { timeout: 15000 });
        await page.fill('input[name="email"]', user.email);
        await page.fill('input[name="password"]', user.password);
        await page.click('button[type="submit"]:has-text("Login")');
        await expect(page).toHaveURL(`${BASE_URL}/profile`, { timeout: 10000 });

        // Verify profile page loads with user data
        await expect(page.locator('text=My Profile')).toBeVisible({ timeout: 10000 });
        await expect(page.locator('input[name="name"]')).toHaveValue(user.name, { timeout: 5000 });
        await expect(page.locator('input[name="email"]')).toHaveValue(user.email, {
          timeout: 5000,
        });

        // Logout - redirects to login
        await page.click('button:has-text("Logout")');
        await expect(page).toHaveURL(`${BASE_URL}/login`);
      });
    }
  });
});
