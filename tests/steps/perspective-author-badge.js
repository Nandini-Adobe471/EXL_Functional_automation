const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { performLogin } = require('../commonFunctions/login');
const { closeBrowser } = require('../commonFunctions/launchbrowser');

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
  
  // Close the browser in the last scenario
  if (this.browser) {
    await closeBrowser(this.browser);
    console.log('Browser closed successfully');
  }
});
