const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { launchBrowser, closeBrowser } = require('../commonFunctions/launchbrowser');

setDefaultTimeout(90 * 1000);

Given('user navigates to home page', async function() {
  // Launch browser
  const result = await launchBrowser();
  this.page = result.page;
  this.browser = result.browser;
  this.context = result.context;
  
  // Navigate to the home page
  await this.page.goto('https://experienceleague.adobe.com/');
  
  // Wait for the page to fully load
  await this.page.waitForTimeout(3000);
  
  // Verify we're on the home page
 // await expect(this.page).toHaveURL(/.*experienceleague.adobe.com(\/en\/home.*)?$/);
  console.log("✓ Successfully navigated to home page");
});

When('user clicks on search picker button', async function() {
  // Wait for the page to load
  await this.page.waitForTimeout(2000);
  
  // Find and click the search picker button
  const searchPickerButton = this.page.locator('.search-picker-button');
  await expect(searchPickerButton).toBeVisible({ timeout: 10000 });
  
  // Scroll the button into view if needed
  await searchPickerButton.scrollIntoViewIfNeeded();
  
  // Click the search picker button to open the dropdown
  await searchPickerButton.click();
  console.log('✓ Clicked on search picker button');
  
  // Wait for dropdown to appear
  await this.page.waitForTimeout(1000);
});

Then('search picker dropdown should be visible', async function() {
  // Check if dropdown is visible
  const dropdown = this.page.locator('.search-picker-popover#search-picker-popover');
  await expect(dropdown).toBeVisible({ timeout: 10000 });
  console.log("✓ Search picker dropdown is visible");
  
  // Store the dropdown for later use
  this.searchPickerDropdown = dropdown;
});

Then('a checkmark should be displayed against {string} in search picker', async function(optionText) {
  // Find the option with the specified text and data-filter-value
  const option = this.searchPickerDropdown.locator(`.search-picker-label[data-filter-value="${optionText}"], .search-picker-option:has-text("${optionText}")`);
  await expect(option).toBeVisible({ timeout: 10000 });
  
  // Find the checkmark icon within the option
  const checkmark = option.locator('span.icon.icon-checkmark');
  await expect(checkmark).toBeVisible({ timeout: 5000 });
  console.log(`✓ Verified checkmark is displayed against "${optionText}" in search picker`);
});

When('user selects {string} from search picker dropdown', async function(optionText) {
  // Find the option with the specified text
  const option = this.searchPickerDropdown.locator(`.search-picker-label[data-filter-value="${optionText}"], .search-picker-option:has-text("${optionText}")`);
  await expect(option).toBeVisible({ timeout: 10000 });
  
  // Click the option
  await option.click();
  console.log(`✓ Selected "${optionText}" from search picker dropdown`);
  
  // Wait for the UI to update
  await this.page.waitForTimeout(2000);
  
  // Click the search picker button again to reopen the dropdown
  const searchPickerButton = this.page.locator('.search-picker-button');
  await searchPickerButton.click();
  console.log('✓ Reopened search picker dropdown');
  
  // Wait for dropdown to appear
  await this.page.waitForTimeout(1000);
});
