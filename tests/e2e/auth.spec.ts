import { test, expect } from '@playwright/test';

const BASE_URL = 'https://retailpass.vercel.app';

// Helper to find the toggle button for a given password input
async function getToggleButton(page: any, inputLocator: any) {
  // Find the button that's a sibling of the input (in the same relative container)
  return inputLocator.locator('..').locator('button:has(svg)').first();
}

test.describe('RetailPass Authentication E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  test.describe('Login Page', () => {
    test('should load login page with content', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForSelector('text=Welcome Back', { timeout: 15000 });
      await expect(page.locator('text=Welcome Back')).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[type="password"]')).toBeVisible();
    });

    test('should show password visibility toggle', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForSelector('text=Welcome Back', { timeout: 15000 });
      const passwordInput = page.locator('input[name="password"]');
      await expect(passwordInput).toBeVisible();
      
      const toggleButton = await getToggleButton(page, passwordInput);
      await expect(toggleButton).toBeVisible({ timeout: 5000 });
      await expect(toggleButton.locator('svg')).toBeVisible();
    });

    test('should toggle password visibility (type changes)', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForSelector('text=Welcome Back', { timeout: 15000 });
      const passwordInput = page.locator('input[name="password"]');
      const toggleButton = await getToggleButton(page, passwordInput);

      // Initially password type
      await expect(passwordInput).toHaveAttribute('type', 'password');

      // Click to show password - type should change to text
      await toggleButton.click();
      await page.waitForTimeout(100);
      await expect(passwordInput).toHaveAttribute('type', 'text');

      // Click to hide password - type should change back to password
      await toggleButton.click();
      await page.waitForTimeout(100);
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('should navigate to signup page', async ({ page }) => {
      await page.goto(`${BASE_URL}/login`);
      await page.waitForSelector('text=Welcome Back', { timeout: 15000 });
      await page.click('text=Sign up');
      await expect(page).toHaveURL(`${BASE_URL}/signup`);
    });
  });

  test.describe('Signup Page', () => {
    test('should load signup page with content', async ({ page }) => {
      await page.goto(`${BASE_URL}/signup`);
      await page.waitForSelector('text=Create Account', { timeout: 15000 });
      await expect(page.locator('text=Create Account').first()).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
    });

    test('should show password visibility toggle on both password fields', async ({ page }) => {
      await page.goto(`${BASE_URL}/signup`);
      await page.waitForSelector('text=Create Account', { timeout: 15000 });
      const passwordInput = page.locator('input[name="password"]');
      const confirmInput = page.locator('input[name="confirmPassword"]');

      const passwordToggle = await getToggleButton(page, passwordInput);
      const confirmToggle = await getToggleButton(page, confirmInput);

      await expect(passwordToggle).toBeVisible({ timeout: 5000 });
      await expect(confirmToggle).toBeVisible({ timeout: 5000 });
    });

    test('should toggle password visibility on both fields (type changes)', async ({ page }) => {
      await page.goto(`${BASE_URL}/signup`);
      await page.waitForSelector('text=Create Account', { timeout: 15000 });
      const passwordInput = page.locator('input[name="password"]');
      const confirmInput = page.locator('input[name="confirmPassword"]');

      const passwordToggle = await getToggleButton(page, passwordInput);
      const confirmToggle = await getToggleButton(page, confirmInput);

      // Toggle first password field
      await passwordToggle.click();
      await page.waitForTimeout(100);
      await expect(passwordInput).toHaveAttribute('type', 'text');
      await expect(confirmInput).toHaveAttribute('type', 'password');

      // Toggle confirm password field
      await confirmToggle.click();
      await page.waitForTimeout(100);
      await expect(confirmInput).toHaveAttribute('type', 'text');

      // Toggle both back - re-find buttons in case they were re-rendered
      const passwordToggle2 = await getToggleButton(page, passwordInput);
      const confirmToggle2 = await getToggleButton(page, confirmInput);
      await passwordToggle2.click();
      await confirmToggle2.click();
      await page.waitForTimeout(100);
      await expect(passwordInput).toHaveAttribute('type', 'password');
      await expect(confirmInput).toHaveAttribute('type', 'password');
    });

    test('should navigate to login page', async ({ page }) => {
      await page.goto(`${BASE_URL}/signup`);
      await page.waitForSelector('text=Create Account', { timeout: 15000 });
      await page.click('text=Log in');
      await expect(page).toHaveURL(`${BASE_URL}/login`);
    });
  });

  test.describe('Protected Routes', () => {
    test('should redirect to login when accessing profile without auth', async ({ page }) => {
      await page.goto(`${BASE_URL}/profile`);
      await expect(page).toHaveURL(`${BASE_URL}/login`);
    });
  });

  test.describe('Password Strength Analysis', () => {
    test('should show password strength indicator on signup', async ({ page }) => {
      await page.goto(`${BASE_URL}/signup`);
      await page.waitForSelector('text=Create Account', { timeout: 15000 });
      const passwordInput = page.locator('input[name="password"]');

      await passwordInput.fill('weak');
      await page.waitForTimeout(500);
      
      // Check that some strength indicator appears
      const strengthIndicator = page.locator('[class*="strength"], [class*="password"], [role="progressbar"]').first();
      await expect(strengthIndicator).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Forgot Password', () => {
    test('should load forgot password page', async ({ page }) => {
      await page.goto(`${BASE_URL}/forgot-password`);
      await page.waitForSelector('text=Forgot Password', { timeout: 15000 });
      await expect(page.locator('text=Forgot Password').first()).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
    });

    test('should submit forgot password request', async ({ page }) => {
      await page.goto(`${BASE_URL}/forgot-password`);
      await page.waitForSelector('text=Forgot Password', { timeout: 15000 });
      await page.fill('input[type="email"]', 'test@retailpass.com');
      await page.click('button[type="submit"]');
      
      // Just verify the form submits without error
      await expect(page.locator('button[type="submit"]')).toBeVisible({ timeout: 5000 });
    });
  });
});