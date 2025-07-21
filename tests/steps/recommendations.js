const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { performLogin } = require('../commonFunctions/login');

setDefaultTimeout(90 * 1000);

Given('user is logged in to Experience League', async function() {
  // Use the common login function to log in
  const result = await performLogin(this);
  
  // Wait for the page to stabilize
  await this.page.waitForTimeout(2000);
});

When('the page loads completely', async function() {
  // Wait for the main content to be visible
  await this.page.waitForSelector('.browse-card-content', { state: 'visible', timeout: 40000 });
  await this.page.waitForTimeout(2000);
});

Then('user checks if See More Recommendations button is available', async function() {
  // Try to locate the See More Recommendations button with exact text match
  // Using capital 'M' in "More" as that's a common capitalization
  await this.page.waitForTimeout(2000);
  const seeMoreButton = this.page.locator('.recommendation-marquee-see-more-btn button:text("See More recommendations"), a:text("See More recommendations")');
 /* await seeMoreButton.focus();
  await seeMoreButton.click();
  console.log("test");*/
  // Store the button and its availability in the world object for later steps
  this.seeMoreButton = seeMoreButton;
 this.seeMoreButtonAvailable = await seeMoreButton.isVisible().catch(() => false);
  
  if (!this.seeMoreButtonAvailable) {
    console.log("There are few cards, See More Recommendations button is not available");
  } else {
    console.log("See More Recommendations button is available");
    // Basic assertion to check button visibility
    await expect(seeMoreButton).toBeVisible();
  }
});


Then('user clicks the See More Recommendations button', async function() {
  // Only try to click if the button is available
  if (this.seeMoreButtonAvailable) {
    // Use the button we already found
    const seeMoreButton = this.seeMoreButton;
    
    // Focus on the button first
    await seeMoreButton.focus();
    console.log("Focused on See More Recommendations button");
    await this.page.waitForTimeout(2000);
    
    // Highlight the button to make it visible in the UI
    await seeMoreButton.highlight();
    console.log("Highlighted See More Recommendations button");
    
    await this.page.waitForTimeout(2000);
    
    // Click the button
    await seeMoreButton.click();
    console.log("Clicked See More Recommendations button");
    await this.page.waitForTimeout(6000);
  } else {
    console.log("Skipping click as See More Recommendations button is not available");
  }
});

Then('waits for additional recommendations to load', async function() {
  // Only wait if the button was clicked
  if (this.seeMoreButtonAvailable) {
    await this.page.waitForTimeout(5000);
    
    // Log the number of cards
    const cardCount = await this.page.locator('.browse-card-content').count();
    console.log(`Number of recommendation cards: ${cardCount}`);
  } else {
    console.log("Skipping wait as See More Recommendations button was not available");
  }
});

Then('verifies that See Less Recommendations is displayed', async function() {
  if (this.seeMoreButtonAvailable) {
    // Check for the See Less Recommendations button
    const seeLessButton = this.page.locator('button:text("See Less recommendations"), a:text("See Less recommendations")');
    // Basic assertion to check See Less button visibility
    await expect(seeLessButton).toBeVisible({ timeout: 10000 });
    console.log("See Less Recommendations button is displayed");
  } else {
    console.log("Skipping verification as See More Recommendations button was not available");
  }
  
  // Clean up - close the browser
  if (this.browser) {
    await this.browser.close();
  }
});
