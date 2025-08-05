const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { performLogin } = require('../commonFunctions/login');
const { closeBrowser } = require('../commonFunctions/launchbrowser');
// Import common mobile steps
require('./common-mobile-steps');

setDefaultTimeout(90 * 1000);

Given('user logs in and lands on PHP page', async function() {
  // Use the common login function to log in
  await performLogin(this);
  // Wait for the page to fully load after login
  await this.page.waitForTimeout(2000);
});

When('user navigates to the perspective page', async function() {
  // Navigate directly to the perspectives page
  await this.page.goto('https://experienceleague-stage.adobe.com/en/perspectives');
  
  // Wait for the page to load completely
  await this.page.waitForTimeout(4000);
  
  // Wait for the perspective cards to load
  await this.page.waitForSelector('.browse-card-content', { state: 'visible', timeout: 30000 });
});

When('user selects author type as {string}', async function(authorType) {
  // Click on the Author Type button
  await this.page.getByRole('button', { name: 'Author Type' }).click();
  /*const authorTypeButton = this.page.getByRole('button', { name: 'Author Type' });
  await authorTypeButton.waitFor({ state: 'visible' });
  await authorTypeButton.click();*/
  
  // Wait for dropdown to appear and select the author type
  const authorOption = this.page.locator('main').getByText(authorType, { exact: true });
  await authorOption.waitFor({ state: 'visible' });
  await authorOption.click();
 // await this.page.locator('form').getByText(authorType).click();
 //await page.getByRole('main').getByText('Adobe', { exact: true }).click();
  //await this.page.waitForTimeout(2000);
  
  // Store the selected author type for verification
  /*this.selectedAuthorType = authorType;
  
  // Wait for the filter to be applied
  await this.page.waitForLoadState('networkidle');*/
});

Then('verify first card displays with {string} badge', async function(badgeText) {
  // Get the first perspective card
  const firstCard = this.page.locator('.browse-card-content').first();
  await firstCard.waitFor({ state: 'visible' });
  
  // Get the author badge from the first card
  const authorBadge = firstCard.locator('.browse-card-author-badge');
  await authorBadge.waitFor({ state: 'visible' });
  
  // Get the badge text
  const badgeContent = await authorBadge.textContent();
  
  // Verify that the badge contains the expected text
  expect(badgeContent.trim()).toContain(badgeText);
  
  // Log the verification for debugging purposes
  console.log(`Verified first card displays with badge: ${badgeText}`);
});

// Mobile view step definitions
// Note: 'user sets viewport to mobile size' step is now in common-mobile-steps.js

When('user selects author type as {string} in mobile view', async function(authorType) {
  try {
    console.log('Starting mobile author type selection');
    
    // In mobile view, there might be a filter icon or hamburger menu
    // Try to find and click on filter icon if it exists
    const filterIcon = this.page.locator('.browse-filters-toggle');
    if (await filterIcon.isVisible()) {
      console.log('Filter icon found, clicking it');
      await filterIcon.click();
      await this.page.waitForTimeout(1000);
    } else {
      console.log('No filter icon found, proceeding with direct filter selection');
    }
    
    // Click on the Author Type button - using a more generic selector
    console.log('Attempting to click Author Type filter');
    const authorTypeButton = this.page.getByRole('button', { name: 'Author Type' });
    
    // Wait for the button to be visible and enabled
    await authorTypeButton.waitFor({ state: 'visible', timeout: 5000 });
    if (!(await authorTypeButton.isEnabled())) {
      console.log('Author Type button is not enabled, trying alternative approach');
      // Try an alternative approach - look for any visible filter options
      const filterOptions = this.page.locator('.browse-filters-option');
      await filterOptions.first().click();
    } else {
      await authorTypeButton.click();
    }
    
    await this.page.waitForTimeout(1000);
    
    // Wait for dropdown to appear and select the author type
    console.log(`Looking for author option: ${authorType}`);
    const authorOption = this.page.locator('main').getByText(authorType, { exact: true });
    await authorOption.waitFor({ state: 'visible', timeout: 5000 });
    await authorOption.click();
    
    // If there's an apply button in mobile view, click it
    const applyButton = this.page.getByRole('button', { name: 'Apply' });
    if (await applyButton.isVisible()) {
      console.log('Apply button found, clicking it');
      await applyButton.click();
    }
    
    // Wait for the filter to be applied
    console.log('Waiting for filter to be applied');
    await this.page.waitForTimeout(2000);
    
  } catch (error) {
    console.error(`Error in mobile author selection: ${error.message}`);
    // Take a screenshot for debugging
    await this.page.screenshot({ path: 'mobile-filter-error.png' });
    throw error;
  }
});

Then('verify first card displays with {string} badge in mobile view', async function(badgeText) {
  // Get the first perspective card in mobile view
  const firstCard = this.page.locator('.browse-card-content').first();
  await firstCard.waitFor({ state: 'visible' });
  
  // Get the author badge from the first card
  const authorBadge = firstCard.locator('.browse-card-author-badge');
  await authorBadge.waitFor({ state: 'visible' });
  
  // Get the badge text
  const badgeContent = await authorBadge.textContent();
  
  // Verify that the badge contains the expected text
  expect(badgeContent.trim()).toContain(badgeText);
  
  // Log the verification for debugging purposes
  console.log(`Verified first card displays with badge in mobile view: ${badgeText}`);
  
  // Close the browser in the last scenario
  if (this.browser) {
    await closeBrowser(this.browser);
    console.log('Browser closed successfully');
  }
});
