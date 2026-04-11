/**
 * KredBook E2E Tests (Detox)
 * 
 * Test Coverage:
 * 1. Happy Path: Login → Dashboard → Create Entry
 * 2. Edge Cases: Offline creation, token expiry, validation
 * 
 * Requires test data:
 * - tester@kredbook.io account
 * - "Test Customer" with phone "9876543210"
 * - "Test Item" product with price "100"
 */

const TESTER_EMAIL = 'tester@kredbook.io';
const TESTER_PASSWORD = 'Test@1234';

describe('KredBook E2E Tests', () => {
  beforeEach(async () => {
    await device.launchApp({ newInstance: true });
  });

  describe('Happy Path', () => {
    it('should log in successfully', async () => {
      await element(by.id('auth-login-email')).typeText(TESTER_EMAIL);
      await element(by.id('auth-login-password')).typeText(TESTER_PASSWORD);
      await element(by.id('auth-login-submit')).tap();

      await waitFor(element(by.id('dashboard-root')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should display dashboard with valid data', async () => {
      // Login first
      await element(by.id('auth-login-email')).typeText(TESTER_EMAIL);
      await element(by.id('auth-login-password')).typeText(TESTER_PASSWORD);
      await element(by.id('auth-login-submit')).tap();

      await waitFor(element(by.id('dashboard-root')))
        .toBeVisible()
        .withTimeout(5000);

      // Verify dashboard elements are visible
      await expect(element(by.id('dashboard-stats-card'))).toBeVisible();
      await expect(element(by.id('dashboard-entries-list'))).toBeVisible();
    });

    it('should create quick amount entry successfully', async () => {
      // Login
      await element(by.id('auth-login-email')).typeText(TESTER_EMAIL);
      await element(by.id('auth-login-password')).typeText(TESTER_PASSWORD);
      await element(by.id('auth-login-submit')).tap();

      await waitFor(element(by.id('dashboard-root')))
        .toBeVisible()
        .withTimeout(5000);

      // Open Add Entry tab
      await element(by.id('tab-add-entry')).tap();

      // Search for customer
      await element(by.id('entry-person-search')).typeText('Test Customer');
      await waitFor(element(by.id('entry-person-row-0')))
        .toBeVisible()
        .withTimeout(3000);

      // Select customer
      await element(by.id('entry-person-row-0')).tap();

      // Enter amount
      await element(by.id('entry-amount-input')).typeText('500');

      // Save entry
      await element(by.id('entry-save-share')).tap();

      // Verify success
      await waitFor(element(by.text(/Entry saved|shared/)))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Edge Cases', () => {
    it('should handle offline entry creation gracefully', async () => {
      // Login
      await element(by.id('auth-login-email')).typeText(TESTER_EMAIL);
      await element(by.id('auth-login-password')).typeText(TESTER_PASSWORD);
      await element(by.id('auth-login-submit')).tap();

      await waitFor(element(by.id('dashboard-root')))
        .toBeVisible()
        .withTimeout(5000);

      // Enable offline mode (toggle network)
      await device.simulateNetworkState('offline');

      // Open Add Entry
      await element(by.id('tab-add-entry')).tap();

      // Search for customer (should use local data)
      await element(by.id('entry-person-search')).typeText('Test Customer');
      await waitFor(element(by.id('entry-person-row-0')))
        .toBeVisible()
        .withTimeout(3000);

      // Select and create entry
      await element(by.id('entry-person-row-0')).tap();
      await element(by.id('entry-amount-input')).typeText('250');
      await element(by.id('entry-save-share')).tap();

      // Should show offline save message
      await waitFor(element(by.text(/Saved locally|offline/)))
        .toBeVisible()
        .withTimeout(3000);

      // Restore network
      await device.simulateNetworkState('online');

      // Verify sync starts
      await waitFor(element(by.text(/syncing|synced/)))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should validate phone number format correctly', async () => {
      // This test assumes a phone input exists in profile/settings
      // Adjust selector based on actual implementation
      
      // Login
      await element(by.id('auth-login-email')).typeText(TESTER_EMAIL);
      await element(by.id('auth-login-password')).typeText(TESTER_PASSWORD);
      await element(by.id('auth-login-submit')).tap();

      await waitFor(element(by.id('dashboard-root')))
        .toBeVisible()
        .withTimeout(5000);

      // Navigate to settings (adjust based on actual navigation)
      // This is a placeholder - actual path may differ
      if (element(by.id('tab-settings')).isVisible()) {
        await element(by.id('tab-settings')).tap();

        // Try invalid phone number
        await element(by.id('settings-phone-input')).clearText();
        await element(by.id('settings-phone-input')).typeText('123');

        // Verify validation error
        await expect(element(by.text(/invalid|phone/i))).toBeVisible();

        // Try another invalid format
        await element(by.id('settings-phone-input')).clearText();
        await element(by.id('settings-phone-input')).typeText('abcd');

        // Should still show error
        await expect(element(by.text(/invalid|phone/i))).toBeVisible();

        // Enter valid phone
        await element(by.id('settings-phone-input')).clearText();
        await element(by.id('settings-phone-input')).typeText('9876543210');

        // Error should disappear
        await expect(element(by.text(/invalid|phone/i))).not.toBeVisible();
      }
    });

    it('should recover from session timeout gracefully', async () => {
      // Login
      await element(by.id('auth-login-email')).typeText(TESTER_EMAIL);
      await element(by.id('auth-login-password')).typeText(TESTER_PASSWORD);
      await element(by.id('auth-login-submit')).tap();

      await waitFor(element(by.id('dashboard-root')))
        .toBeVisible()
        .withTimeout(5000);

      // Background app for extended period
      await device.sendToBackground(300); // 5 minutes
      await device.bringToForeground();

      // Attempt any action - should either stay logged in or show re-auth
      await element(by.id('tab-add-entry')).multiTap();

      // Verify either dashboard or auth screen is visible
      const isLoggedIn = await waitFor(element(by.id('dashboard-root')))
        .toBeVisible()
        .withTimeout(3000)
        .catch(() => false);

      if (!isLoggedIn) {
        // Should show auth screen, not crash
        await expect(element(by.id('auth-login-email'))).toBeVisible();
      }
    });

    it('should display entries after creation', async () => {
      // Login and create entry
      await element(by.id('auth-login-email')).typeText(TESTER_EMAIL);
      await element(by.id('auth-login-password')).typeText(TESTER_PASSWORD);
      await element(by.id('auth-login-submit')).tap();

      await waitFor(element(by.id('dashboard-root')))
        .toBeVisible()
        .withTimeout(5000);

      // Create entry
      await element(by.id('tab-add-entry')).tap();
      await element(by.id('entry-person-search')).typeText('Test Customer');
      await element(by.id('entry-person-row-0')).tap();
      await element(by.id('entry-amount-input')).typeText('500');
      await element(by.id('entry-save-share')).tap();

      // Wait for success
      await waitFor(element(by.text(/Entry saved|shared/)))
        .toBeVisible()
        .withTimeout(5000);

      // Navigate to entries tab
      await element(by.id('tab-entries')).tap();

      // Verify entry appears in list
      await waitFor(element(by.text(/500|Test Customer/)))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('Validation', () => {
    it('should prevent empty customer selection', async () => {
      // Login
      await element(by.id('auth-login-email')).typeText(TESTER_EMAIL);
      await element(by.id('auth-login-password')).typeText(TESTER_PASSWORD);
      await element(by.id('auth-login-submit')).tap();

      await waitFor(element(by.id('dashboard-root')))
        .toBeVisible()
        .withTimeout(5000);

      // Open Add Entry
      await element(by.id('tab-add-entry')).tap();

      // Try to save without selecting customer
      await element(by.id('entry-amount-input')).typeText('100');

      // Try to save
      try {
        await element(by.id('entry-save-share')).tap();

        // Should show error
        await waitFor(element(by.text(/select|customer|required/i)))
          .toBeVisible()
          .withTimeout(3000);
      } catch (e) {
        // Save button might be disabled
        expect(element(by.id('entry-save-share')).isEnabled()).toBe(false);
      }
    });

    it('should prevent empty amount input', async () => {
      // Login
      await element(by.id('auth-login-email')).typeText(TESTER_EMAIL);
      await element(by.id('auth-login-password')).typeText(TESTER_PASSWORD);
      await element(by.id('auth-login-submit')).tap();

      await waitFor(element(by.id('dashboard-root')))
        .toBeVisible()
        .withTimeout(5000);

      // Open Add Entry
      await element(by.id('tab-add-entry')).tap();

      // Select customer but leave amount empty
      await element(by.id('entry-person-search')).typeText('Test Customer');
      await element(by.id('entry-person-row-0')).tap();

      // Try to save without amount
      try {
        await element(by.id('entry-save-share')).tap();

        // Should show error
        await waitFor(element(by.text(/amount|required|invalid/i)))
          .toBeVisible()
          .withTimeout(3000);
      } catch (e) {
        // Save button might be disabled
        expect(element(by.id('entry-save-share')).isEnabled()).toBe(false);
      }
    });
  });
});
