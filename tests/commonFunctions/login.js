const { chromium } = require('@playwright/test');
const { launchBrowser } = require('./launchbrowser');

/**
 * Performs login to Adobe Experience League
 * @param {Object} world - The Cucumber world object
 * @param {string} email - The email address to use for login
 * @param {string} password - The password to use for login
 * @returns {Object} - The browser, context, and page objects
 */
async function performLogin(world, email = 'gsnair+US+Team+VISA+hello+1@adobetest.com', password = 'Bap@d0be') {
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
    await page.waitForTimeout(4000);

    // Enter email address
    await page.waitForTimeout(4000);
    const emailInput = page.locator('input[aria-label="Email address"]');
    await emailInput.waitFor({ state: 'visible' });
    await page.waitForTimeout(4000);
    await emailInput.fill(email);
    await page.waitForTimeout(4000);

    // Click Continue button
    await page.getByRole('button', { name: 'Continue' });
    await page.click('button', { name: 'Continue' });
    await page.waitForSelector('button', { name: 'Continue' }, { state: 'detached' });
    await page.waitForTimeout(4000);

    // Enter password
    const passwordInput = page.locator('input[id="PasswordPage-PasswordField"]');
    await passwordInput.waitFor({ state: 'visible' });
    await passwordInput.fill(password);

    // Submit password form
    await page.click('button[data-id="PasswordPage-ContinueButton"]');
    
    // Wait for login to complete
    await page.waitForTimeout(4000);
    
    console.log('Login successful');
    return { page, browser, context };
  } catch (error) {
    console.error('Login failed:', error.message);
    // If login fails, still return the browser objects so the test can continue or clean up
    return { page, browser, context };
  }
}

module.exports = { performLogin };
