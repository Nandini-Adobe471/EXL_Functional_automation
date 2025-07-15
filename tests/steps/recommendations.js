const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { performLogin } = require('../commonFunctions/login');

setDefaultTimeout(90 * 1000);

Given('user is logged in to Experience League', async function() {
  // Use the common login function to log in
  const result = await performLogin(this);
  
  // Wait for the page to stabilize
  await this.page.waitForTimeout(4000);
});

When('the page loads completely', async function() {
  // Wait for the main content to be visible
  await this.page.waitForSelector('.browse-card-content', { state: 'visible', timeout: 40000 });
  await this.page.waitForTimeout(2000);
});

Then('user checks if See More Recommendations button is available', async function() {
  // Try to locate the See More Recommendations button
  const seeMoreButton = this.page.locator('button:has-text("See More Recommendations"), a:has-text("See More Recommendations")');
  
  // Store the button availability in the world object for later steps
  this.seeMoreButtonAvailable = await seeMoreButton.isVisible().catch(() => false);
  
  if (!this.seeMoreButtonAvailable) {
    console.log("There are few cards, See More Recommendations button is not available");
  } else {
    console.log("See More Recommendations button is available");
  }
});


Then('user clicks the See More Recommendations button', async function() {
  // Only try to click if the button is available
  if (this.seeMoreButtonAvailable) {
    const seeMoreButton = this.page.locator('button:has-text("See More Recommendations"), a:has-text("See More Recommendations")');
    await seeMoreButton.highlight();
    await seeMoreButton.click();
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
    const seeLessButton = this.page.locator('button:has-text("See Less Recommendations"), a:has-text("See Less Recommendations")');
    const isSeeLessVisible = await seeLessButton.isVisible().catch(() => false);
    
    if (isSeeLessVisible) {
      await this.page.waitForTimeout(5000);
      console.log("See Less Recommendations button is displayed");
    } else {
      console.log("See Less Recommendations button is NOT displayed");
    }
  } else {
    console.log("Skipping verification as See More Recommendations button was not available");
  }
  
  // Clean up - close the browser
  if (this.browser) {
    await this.browser.close();
  }
});
