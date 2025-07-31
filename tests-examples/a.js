const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { performLogin } = require('../commonFunctions/login');

setDefaultTimeout(90 * 1000);

Given('user is logged in to Experience League application with valid credentials', async function() {
  // Use the common login function to log in
  const result = await performLogin(this);
  
  // Wait for the page to stabilize
  await this.page.waitForTimeout(2000);
});

When('wait till the page loads completely', async function() {
  // Wait for the main content to be visible
  await this.page.waitForSelector('.browse-card-content', { state: 'visible', timeout: 40000 });
  await this.page.waitForTimeout(2000);
  
  // Check if recommendations section is visible
  console.log("Checking if personalized recommendations section is visible...");
  const recommendationSelectors = [
    '.recommendation-section', 
    '.recommendations-container', 
    '.recommendation-marquee',
    '.recommendation-cards',
    '[data-testid="recommendations"]'
  ];
  
  let recommendationsFound = false;
  for (const selector of recommendationSelectors) {
    const isVisible = await this.page.locator(selector).isVisible().catch(() => false);
    if (isVisible) {
      console.log(`Found recommendations section with selector: ${selector}`);
      this.recommendationSelector = selector;
      recommendationsFound = true;
      break;
    }
  }
  
  if (!recommendationsFound) {
    console.error("⚠️ Could not find recommendations section");
    // Instead of simulating success, we'll assert that the section exists
    await expect(this.page.locator(recommendationSelectors[0])).toBeVisible({
      timeout: 5000,
      message: "Personalized recommendations section should be visible"
    });
  } else {
    console.log("✓ Personalized recommendations section is visible");
  }
});

Then('user captures the target recs count from console', async function() {
  // Execute JavaScript in the browser to get the recommendation count from window.exlm.targetData.length
  await this.page.waitForTimeout(2000);
  const targetDataLength = await this.page.evaluate(() => {
     
    if (window.exlm && window.exlm.targetData ) {
     return window.exlm.targetData.length;
    console.log(`window.exlm.targetData length: ${window.exlm.targetData.length}`);
    } else {
      return null;
    }
  });
  
  if (targetDataLength === null) {
    console.error("⚠️ Could not find window.exlm.targetData in the console");
    throw new Error("window.exlm.targetData not found in the console");
  }
  
  console.log(`Found ${targetDataLength} recs in window.exlm.targetData`);
  
  // Store the count for later comparison
  this.consoleRecommendationCount = targetDataLength;


});

Then('user finds the recommended content blocks count on the page', async function() {
  // Wait for the recommendation cards to be visible
  const recommendationCards = this.page.locator('div[data-block-name="recommended-content"]');
  //await expect(recommendationCards.first()).toBeVisible({ timeout: 10000 });
  
  // Count the number of recommendation cards visible on the page
  const uiRecommendationCount = await recommendationCards.count();
  console.log(`Found ${uiRecommendationCount} recommended content blocks in the php page`);
  
  // Store the count for later comparison
  this.uiRecommendationCount = uiRecommendationCount;
});

Then('user verifies the count matches between target recs and recommended content blocks on php page', async function() {
  console.log(`Comparing recommendation counts: Console=${this.consoleRecommendationCount}, UI=${this.uiRecommendationCount}`);
  
  // Assert that the counts match
  expect(this.uiRecommendationCount).toBe(this.consoleRecommendationCount);
  
  if (this.uiRecommendationCount === this.consoleRecommendationCount) {
    console.log("✓ Recommended content blocks counts matches with recs count");
  } else {
    console.error(`❌ Recommendation counts do not match: Console=${this.consoleRecommendationCount}, UI=${this.uiRecommendationCount}`);
  }
  
  // Clean up - close the browser
  if (this.browser) {
    await this.browser.close();
  }
});
