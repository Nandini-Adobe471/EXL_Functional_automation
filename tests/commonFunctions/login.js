const { chromium } = require('@playwright/test');
const { launchBrowser } = require('./launchbrowser');
const ENV = require('../../config.js');


/**
 * Performs login to Adobe Experience League
 * @param {Object} world - The Cucumber world object
 * @param {string} email - The email address to use for login
 * @param {string} password - The password to use for login
 * @returns {Object} - The browser, context, and page objects
 */
async function performLogin(world, email = ENV.EMAIL, password = ENV.PASSWORD) {
  // Launch browser and navigate to the site
  const result = await launchBrowser();
  const { page, browser, context } = result;
  
  // Set the world properties if world object is provided
  if (world) {
    world.page = page;
    world.browser = browser;
    world.context = context;
  }

  try {
    // Click the CTA to begin login
    await page.waitForSelector('.marquee .marquee-cta a', { state: 'visible' });
    await page.click('.marquee .marquee-cta a');
    await page.waitForTimeout(2000);

    // Enter email address
    await page.waitForTimeout(2000);
    const emailInput = page.locator('.EmailOrPhoneField__inputs .EmailOrPhoneField__textfield input');
   // await emailInput.click() ;
    //await emailInput.waitFor({ state: 'visible' });
    await page.waitForTimeout(3000);
    await emailInput.fill(email);
    await page.waitForTimeout(2000);

    // Click Continue button
    await page.getByRole('button', { name: 'Continue' });
    await page.click('button', { name: 'Continue' });
    await page.waitForSelector('button', { name: 'Continue' }, { state: 'detached' });
    await page.waitForTimeout(2000);

    // Enter password
    const passwordInput = page.locator('input[id="PasswordPage-PasswordField"]');
    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill(password);

    // Submit password form
    await page.click('button[data-id="PasswordPage-ContinueButton"]');

    // Wait for post-login redirect and full page load
    // First wait for the login/IMS page to navigate away
    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {
      console.log('waitForNavigation timed out — page may have already navigated');
    });

    // Wait for the Experience League page to fully load
    // (profile icon or nav is a reliable indicator that the user is logged in)
    try {
      await page.waitForSelector(
        '.profile-button, .account, [data-toggle="account"], .nav-sign-in .profile-picture',
        { state: 'visible', timeout: 20000 }
      );
      console.log('✅ Login confirmed — profile element visible');
    } catch (e) {
      console.warn('⚠️  Profile element not found after login — waiting additional time for page to settle');
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    }

    // Extra buffer to allow any post-login JS initialization to complete
    await page.waitForTimeout(3000);

    console.log('Login successful');
    return { page, browser, context };
  } catch (error) {
    console.error('Login failed:', error.message);
    // If login fails, still return the browser objects so the test can continue or clean up
    return { page, browser, context };
  }
}

/**
 * Performs logout from Adobe Experience League
 * @param {Object} page - The Playwright page object
 * @returns {Promise<void>}
 */
async function performLogout(page) {
  if (!page) {
    console.error('Cannot logout: Page object is not provided');
    return;
  }

  try {
    // Navigate to the home page
    await page.goto(ENV.URL);
    await page.waitForTimeout(2000);
    
    // Click on user profile icon to open menu
    const profileButton = page.locator('.profile-button');
    await profileButton.waitFor({ state: 'visible' });
    await profileButton.click();
    await page.waitForTimeout(1000);
    
    // Click on Sign Out option
    const signOutButton = page.locator('text=Sign Out');
    await signOutButton.waitFor({ state: 'visible' });
    await signOutButton.click();
    await page.waitForTimeout(2000);
    
    console.log('Logout completed successfully');
  } catch (error) {
    console.error('Logout failed:', error.message);
  }
}

/**
 * Performs login on an already-open page (no new browser launch).
 * Used when the browser/page is already set up (e.g. shared session flow).
 * @param {Object} page - Playwright page object
 * @param {string} email
 * @param {string} password
 */
async function performLoginOnPage(page, email = ENV.EMAIL, password = ENV.PASSWORD) {
  try {
    await page.waitForSelector('.marquee .marquee-cta a', { state: 'visible' });
    await page.click('.marquee .marquee-cta a');
    await page.waitForTimeout(2000);

    const emailInput = page.locator('.EmailOrPhoneField__inputs .EmailOrPhoneField__textfield input');
    await page.waitForTimeout(3000);
    await emailInput.fill(email);
    await page.waitForTimeout(2000);

    await page.getByRole('button', { name: 'Continue' });
    await page.click('button', { name: 'Continue' });
    await page.waitForSelector('button', { name: 'Continue' }, { state: 'detached' });
    await page.waitForTimeout(2000);

    const passwordInput = page.locator('input[id="PasswordPage-PasswordField"]');
    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill(password);

    await page.click('button[data-id="PasswordPage-ContinueButton"]');

    await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }).catch(() => {
      console.log('waitForNavigation timed out — page may have already navigated');
    });

    try {
      await page.waitForSelector(
        '.profile-button, .account, [data-toggle="account"], .nav-sign-in .profile-picture',
        { state: 'visible', timeout: 20000 }
      );
      console.log('✅ Login confirmed — profile element visible');
    } catch (e) {
      console.warn('⚠️  Profile element not found after login — waiting additional time');
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    }

    await page.waitForTimeout(3000);
    console.log('Login successful (on existing page)');
  } catch (error) {
    console.error('Login failed (on existing page):', error.message);
  }
}

module.exports = { performLogin, performLoginOnPage, performLogout };
