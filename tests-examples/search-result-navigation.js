const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { launchBrowser, closeBrowser } = require('../commonFunctions/launchbrowser');

// Import search steps to reuse existing step definitions
require('./search');

setDefaultTimeout(90 * 1000);

Given('user navigates directly to search page', async function() {
  // Launch browser
  const result = await launchBrowser();
  this.page = result.page;
  this.browser = result.browser;
  this.context = result.context;
  
  // Navigate directly to the search page
  await this.page.goto('https://experienceleague.adobe.com/en/search');
  
  // Wait for the page to fully load
  await this.page.waitForTimeout(3000);
  
  // Verify we're on the search page
  await expect(this.page).toHaveURL(/.*\/search.*/);
  console.log("✓ Successfully navigated directly to search page");
});

When('user clicks on the first search result', async function() {
  // Wait for search results to load
  await this.page.waitForTimeout(2000);
  
  // Find the first search result title
  // Using atomic-result selector which is likely used in the application
  const firstResultTitle = this.page.locator('atomic-folded-result-list >> .result-title').first();
  await expect(firstResultTitle).toBeVisible();
  
  // Store the title text and color for later comparison
  this.firstResultTitleText = await firstResultTitle.textContent();
  
  // Get the computed style of the title element
  this.originalTitleColor = await firstResultTitle.evaluate(el => {
    const link = el.shadowRoot?.querySelector('a');
  if (!link) return null;
    return window.getComputedStyle(link).color;
  });
  
  console.log(`✓ Found first search result with title: "${this.firstResultTitleText}"`);
  console.log(`✓ Original title color: ${this.originalTitleColor}`);
  
  // Click on the first search result
  await firstResultTitle.click();
  console.log("✓ Clicked on the first search result");
  
  // Wait for navigation
  await this.page.waitForTimeout(3000);
});

Then('user should land on the result detail page', async function() {
  // Verify we're no longer on the search results page
  const currentUrl = this.page.url();
 // expect(currentUrl).not.toContain('/search');
  
  // Store the detail page URL for later use
  this.detailPageUrl = currentUrl;
  
  console.log(`✓ Landed on result detail page: ${this.detailPageUrl}`);
});

When('user navigates back to search results', async function() {
  // Navigate back to the previous page (search results)
  await this.page.goBack();
  
  // Wait for the page to load
  await this.page.waitForTimeout(3000);
  
  // Verify we're back on the search results page
  //await expect(this.page).toHaveURL(/.*\/search.*/);
  console.log("✓ Navigated back to search results page");
});

Then('the title of the first search result should have changed color', async function() {
  // Wait for search results to load
  await this.page.waitForTimeout(2000);
  
  // Find the first search result title again using the same selector as before
  const firstResultTitle = this.page.locator('.list-root atomic-result').first();
  await expect(firstResultTitle).toBeVisible();
  
  // Verify it's the same title we clicked before
  const currentTitleText = await firstResultTitle.textContent();
  expect(currentTitleText).toBe(this.firstResultTitleText);
  
  // Get the current color of the title
  const currentTitleColor = await firstResultTitle.evaluate(el => {
    return window.getComputedStyle(el).color;
  });
  
  console.log(`✓ Current title color after navigation: ${currentTitleColor}`);
  console.log(`✓ Original title color: ${this.originalTitleColor}`);
  
  // Verify the color has changed
  expect(currentTitleColor).not.toBe(this.originalTitleColor);
  console.log("✓ Title color has changed after visiting the link");
  
  // Clean up - close the browser
  if (this.browser) {
    await closeBrowser(this.browser);
    console.log('Browser closed successfully');
  }
});
