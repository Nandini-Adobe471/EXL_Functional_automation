const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { launchBrowser, closeBrowser } = require('../commonFunctions/launchbrowser');
const ENV = require('../../config.js');

setDefaultTimeout(90 * 1000);

Given('user navigates to Experience League tutorials page', async function() {
  // Launch browser
  const result = await launchBrowser();
  this.page = result.page;
  this.browser = result.browser;
  this.context = result.context;
  
  // Navigate to the Experience League tutorials page
  await this.page.goto(`${ENV.URL}/docs/home-tutorials`);
  
  // Wait for the page to fully load
  await this.page.waitForTimeout(5000);
  
  console.log("✓ Successfully navigated to the Experience League tutorials page");
});

Then('user should see {string} in the breadcrumb navigation', async function(expectedText) {
  // Find the breadcrumb navigation element
  const breadcrumbsBlock = this.page.locator('div.breadcrumbs.block');
  await expect(breadcrumbsBlock).toBeVisible({ timeout: 10000 });
  console.log("✓ Breadcrumb navigation is visible");
  
  // Find the Tutorials link in the breadcrumb
  const tutorialsLink = breadcrumbsBlock.locator('a:text("Tutorials")');
  await expect(tutorialsLink).toBeVisible({ timeout: 5000 });
  
  // Get the text content of the link
  const actualText = await tutorialsLink.textContent();
  
  // Verify the text matches the expected text
  expect(actualText.trim()).toBe(expectedText);
  console.log(`✓ Breadcrumb contains "${actualText.trim()}" as expected`);
  
  // Take a screenshot for verification
  await this.page.screenshot({ path: 'tutorials-breadcrumb.png' });
  console.log("✓ Screenshot captured for verification");
  
  // Clean up - close the browser
  if (this.browser) {
    await closeBrowser(this.browser);
    console.log("✓ Browser closed successfully");
  }
});
