/**
 * KredBook Auth E2E Tests (Detox)
 * 
 * Test Coverage:
 * 1. Signup flow: Create account → Onboarding → Dashboard
 * 2. Login flow: Existing account login
 * 3. Auth validation: Email, password, confirmation errors
 * 
 * Note: Uses unique test emails to avoid conflicts
 */

const generateTestEmail = () => `test-${Date.now()}@kredbook-qa.io`;
const TEST_PASSWORD = 'Test@1234';
const TEST_FULLNAME = 'Test User';
const EXISTING_EMAIL = 'tester@kredbook.io';

describe('KredBook Authentication E2E Tests', () => {
  beforeEach(async () => {
    await device.launchApp({ newInstance: true });
  });

  describe('Signup Flow', () => {
    it('should complete full signup flow with new account', async () => {
      const testEmail = generateTestEmail();

      // Navigate to signup screen
      await element(by.text(/Sign Up|Create Account|Don't have/)).tap();

      // Wait for signup form to load
      await waitFor(element(by.id('auth-signup-fullname')))
        .toBeVisible()
        .withTimeout(3000);

      // Fill in full name
      await element(by.id('auth-signup-fullname')).typeText(TEST_FULLNAME);

      // Fill in email
      await element(by.id('auth-signup-email')).typeText(testEmail);

      // Fill in password
      await element(by.id('auth-signup-password')).typeText(TEST_PASSWORD);

      // Fill in confirm password
      await element(by.id('auth-signup-confirm-password')).typeText(TEST_PASSWORD);

      // Submit signup
      await element(by.id('auth-signup-submit')).tap();

      // Should navigate to onboarding or dashboard after successful signup
      await waitFor(
        element(
          by.text(/Business Name|onboarding|dashboard|Welcome/i)
        )
      )
        .toBeVisible()
        .withTimeout(8000);
    });

    it('should show validation error for invalid email', async () => {
      // Navigate to signup
      await element(by.text(/Sign Up|Create Account|Don't have/)).tap();

      await waitFor(element(by.id('auth-signup-fullname')))
        .toBeVisible()
        .withTimeout(3000);

      // Fill in fields
      await element(by.id('auth-signup-fullname')).typeText(TEST_FULLNAME);

      // Enter invalid email
      await element(by.id('auth-signup-email')).typeText('not-an-email');

      await element(by.id('auth-signup-password')).typeText(TEST_PASSWORD);
      await element(by.id('auth-signup-confirm-password')).typeText(TEST_PASSWORD);

      // Try to submit
      await element(by.id('auth-signup-submit')).tap();

      // Should show email validation error
      await waitFor(element(by.text(/invalid|email|valid email/i)))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should show validation error for password mismatch', async () => {
      // Navigate to signup
      await element(by.text(/Sign Up|Create Account|Don't have/)).tap();

      await waitFor(element(by.id('auth-signup-fullname')))
        .toBeVisible()
        .withTimeout(3000);

      // Fill in fields
      await element(by.id('auth-signup-fullname')).typeText(TEST_FULLNAME);
      await element(by.id('auth-signup-email')).typeText(generateTestEmail());

      // Enter passwords that don't match
      await element(by.id('auth-signup-password')).typeText(TEST_PASSWORD);
      await element(by.id('auth-signup-confirm-password')).typeText('Different@1234');

      // Try to submit
      await element(by.id('auth-signup-submit')).tap();

      // Should show password mismatch error
      await waitFor(element(by.text(/match|password|confirm/i)))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should show validation error for weak password', async () => {
      // Navigate to signup
      await element(by.text(/Sign Up|Create Account|Don't have/)).tap();

      await waitFor(element(by.id('auth-signup-fullname')))
        .toBeVisible()
        .withTimeout(3000);

      // Fill in fields
      await element(by.id('auth-signup-fullname')).typeText(TEST_FULLNAME);
      await element(by.id('auth-signup-email')).typeText(generateTestEmail());

      // Enter weak password (less than 6 chars)
      await element(by.id('auth-signup-password')).typeText('12345');
      await element(by.id('auth-signup-confirm-password')).typeText('12345');

      // Try to submit
      await element(by.id('auth-signup-submit')).tap();

      // Should show password strength error
      await waitFor(element(by.text(/password|6 characters|strength|minimum/i)))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should show validation error for empty full name', async () => {
      // Navigate to signup
      await element(by.text(/Sign Up|Create Account|Don't have/)).tap();

      await waitFor(element(by.id('auth-signup-fullname')))
        .toBeVisible()
        .withTimeout(3000);

      // Skip full name, fill others
      await element(by.id('auth-signup-email')).typeText(generateTestEmail());
      await element(by.id('auth-signup-password')).typeText(TEST_PASSWORD);
      await element(by.id('auth-signup-confirm-password')).typeText(TEST_PASSWORD);

      // Try to submit
      await element(by.id('auth-signup-submit')).tap();

      // Should show required field error
      await waitFor(element(by.text(/name|required|full/i)))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('should show error for duplicate email', async () => {
      // Navigate to signup
      await element(by.text(/Sign Up|Create Account|Don't have/)).tap();

      await waitFor(element(by.id('auth-signup-fullname')))
        .toBeVisible()
        .withTimeout(3000);

      // Try to signup with existing email
      await element(by.id('auth-signup-fullname')).typeText(TEST_FULLNAME);
      await element(by.id('auth-signup-email')).typeText(EXISTING_EMAIL);
      await element(by.id('auth-signup-password')).typeText(TEST_PASSWORD);
      await element(by.id('auth-signup-confirm-password')).typeText(TEST_PASSWORD);

      // Submit
      await element(by.id('auth-signup-submit')).tap();

      // Should show account exists error
      await waitFor(
        element(
          by.text(
            /already exists|already registered|email already|in use/i
          )
        )
      )
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Login Flow', () => {
    it('should log in with valid credentials', async () => {
      // We're on login screen already
      await element(by.id('auth-login-email')).typeText(EXISTING_EMAIL);
      await element(by.id('auth-login-password')).typeText(TEST_PASSWORD);
      await element(by.id('auth-login-submit')).tap();

      // Should navigate to dashboard
      await waitFor(element(by.id('dashboard-root')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should show error for invalid credentials', async () => {
      await element(by.id('auth-login-email')).typeText(EXISTING_EMAIL);
      await element(by.id('auth-login-password')).typeText('WrongPassword@123');
      await element(by.id('auth-login-submit')).tap();

      // Should show authentication error
      await waitFor(
        element(
          by.text(/invalid|incorrect|email or password|credentials/i)
        )
      )
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should show error for non-existent email', async () => {
      await element(by.id('auth-login-email')).typeText('nonexistent@test.com');
      await element(by.id('auth-login-password')).typeText(TEST_PASSWORD);
      await element(by.id('auth-login-submit')).tap();

      // Should show not found error
      await waitFor(
        element(by.text(/not found|no user|no account/i))
      )
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should validate email format on login', async () => {
      await element(by.id('auth-login-email')).typeText('not-an-email');
      await element(by.id('auth-login-password')).typeText(TEST_PASSWORD);

      // Button should be disabled or show error
      try {
        await element(by.id('auth-login-submit')).tap();
        // If tap succeeds, check for error message
        await waitFor(element(by.text(/invalid|email|valid email/i)))
          .toBeVisible()
          .withTimeout(3000);
      } catch (e) {
        // Button might be disabled, which is also fine
        expect(element(by.id('auth-login-submit')).isEnabled()).toBe(false);
      }
    });
  });

  describe('Auth State Persistence', () => {
    it('should persist login state after app restart', async () => {
      // Login first
      await element(by.id('auth-login-email')).typeText(EXISTING_EMAIL);
      await element(by.id('auth-login-password')).typeText(TEST_PASSWORD);
      await element(by.id('auth-login-submit')).tap();

      // Wait for dashboard
      await waitFor(element(by.id('dashboard-root')))
        .toBeVisible()
        .withTimeout(5000);

      // Restart app
      await device.launchApp({ newInstance: false });

      // Should still be logged in (dashboard visible)
      await waitFor(element(by.id('dashboard-root')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('should require login after logout', async () => {
      // Login first
      await element(by.id('auth-login-email')).typeText(EXISTING_EMAIL);
      await element(by.id('auth-login-password')).typeText(TEST_PASSWORD);
      await element(by.id('auth-login-submit')).tap();

      await waitFor(element(by.id('dashboard-root')))
        .toBeVisible()
        .withTimeout(5000);

      // Navigate to settings/profile
      await element(by.id('settings-logout') || by.text(/Logout|Log out/i)).tap();

      // Confirm logout if prompted
      await element(by.text(/Yes|Confirm|Logout/i)).atIndex(0).tap();

      // Should be back on login screen
      await waitFor(element(by.id('auth-login-email')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });
});