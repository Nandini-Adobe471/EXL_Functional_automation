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
    const emailInput = page.locator('input[aria-label="Email address"]');
    await emailInput.waitFor({ state: 'visible' });
    await emailInput.click();
