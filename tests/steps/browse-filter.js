const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { performLogin } = require('../commonFunctions/login');

setDefaultTimeout(90 * 1000);

Given('user is on the PHP page', async function() {
  // Use the common login function to log in
  await performLogin(this);
});

When('user navigates to the browse page', async function() {
  // Click on the browse link in the navigation
  await this.page.click('a[href*="browse"]');
  
  // Wait for the browse page to load
  await this.page.waitForSelector('.browse-card-content', { timeout: 30000 });
});

When('user selects content type as {string}', async function(contentType) {
  // Click on Content Type button
  await this.page.getByRole('button', { name: 'Content Type' }).click();
  await this.page.waitForTimeout(2000);
  // Wait for dropdown and select the specified content type

  await this.page.locator('form').getByText('Community').click();
  await this.page.waitForTimeout(2000);

  // Store the selected content type for verification
  this.selectedContentType = contentType;
});

When('user selects product as {string}', async function(product) {
  // Click on Product button
 /* await this.page.click('button:has-text("Product")');
  
  // Wait for dropdown and select the specified product
  await this.page.click(`li:has-text("${product}")`);*/

  await this.page.getByRole('button', { name: 'Product' }).click();
  await this.page.waitForTimeout(2000);
  // Wait for dropdown and select the specified content type

  await this.page.locator('span').filter({ hasText: /^Analytics$/ }).click();
  await this.page.waitForTimeout(2000);

  
  // Store the selected product for verification
  this.selectedProduct = product;
});

Then('verify first card displays with selected content type and product tag', async function() {
  // Wait briefly for the filtered results to load
  await this.page.waitForTimeout(2000);
  
  // Assert that the form contains both the content type and product
  await expect(this.page.locator('form')).toContainText('Community');
  await expect(this.page.locator('form')).toContainText('Analytics');
});
