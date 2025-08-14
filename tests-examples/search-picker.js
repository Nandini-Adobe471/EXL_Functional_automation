const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { launchBrowser, closeBrowser } = require('../commonFunctions/launchbrowser');

setDefaultTimeout(90 * 1000);

Given('user navigates to Experience League homepage', async function() {
  // Launch browser
  const result = await launchBrowser();
  this.page = result.page;
  this.browser = result.browser;
  this.context = result.context;
  
  // Navigate to the Experience League homepage
  await this.page.goto('https://experienceleague.adobe.com/');
  
  // Wait for the page to fully load
  await this.page.waitForTimeout(3000);
  
  // Verify we're on the homepage
  await expect(this.page).toHaveURL(/.*experienceleague.adobe.com\/?$/);
  console.log("✓ Successfully navigated to Experience League homepage");
});

When('user clicks on search picker', async function() {
  // Find and click the search picker button
  const searchPickerButton = this.page.locator('.search-picker-button');
  await expect(searchPickerButton).toBeVisible();
  await searchPickerButton.click();
  console.log("✓ Clicked on search picker");
  
  // Wait for dropdown to appear
  await this.page.waitForTimeout(1000);
});

Then('dropdown should open with list of values', async function() {
  // Check if dropdown is visible
  const dropdown = this.page.locator('.search-picker-popover.search-picker-popover-visible');
  await expect(dropdown).toBeVisible();
  console.log("✓ Search picker dropdown is visible");
  
  // Check if dropdown has items
  const dropdownItems = dropdown.locator('.search-picker-label');
  const count = await dropdownItems.count();
  expect(count).toBeGreaterThan(0);
  console.log(`✓ Search picker dropdown has ${count} items`);
  
  // Verify at least one dropdown item is visible without printing all values
  const firstItem = dropdownItems.first();
  await expect(firstItem).toBeVisible();
});

When('user navigates to {string}', async function(pageName) {
  // Launch browser if not already launched
  if (!this.page) {
    const result = await launchBrowser();
    this.page = result.page;
    this.browser = result.browser;
    this.context = result.context;
  }
  
  // Construct the URL
  const url = `https://experienceleague.adobe.com/en/${pageName}`;
  console.log(`✓ Navigating directly to: ${url}`);
  
  // Navigate to the URL
  await this.page.goto(url);
  
  // Wait for the page to load
  await this.page.waitForTimeout(3000);
  
  // Verify we're on the correct page
  await expect(this.page).toHaveURL(new RegExp(`.*experienceleague.adobe.com/en/${pageName}.*`));
  console.log(`✓ Successfully navigated to ${pageName} page`);
});

Then('search picker should show {string}', async function(expectedValue) {
  // Find the search picker label
  const searchPickerLabel = this.page.locator('.search-picker-button .search-picker-label');
  await expect(searchPickerLabel).toBeVisible();
  
  // Get the text of the search picker label
  const labelText = await searchPickerLabel.textContent();
  
  // Verify the search picker shows the expected value
  expect(labelText.trim()).toBe(expectedValue);
  console.log(`✓ Search picker shows correct value: "${labelText.trim()}" (expected: "${expectedValue}")`);
});
