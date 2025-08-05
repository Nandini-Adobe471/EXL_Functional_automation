const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { performLogin } = require('../commonFunctions/login');
const { launchBrowser } = require('../commonFunctions/launchbrowser');
// Import common mobile steps
require('./common-mobile-steps');

setDefaultTimeout(90 * 1000);

Given('user navigates to Experience League browse page', async function() {
  // Launch browser and navigate to the browse page
  const result = await launchBrowser();
  this.page = result.page;
  this.browser = result.browser;
  this.context = result.context;
  
  // Navigate to the browse page
  await this.page.goto('https://experienceleague-stage.adobe.com/en/browse');
  
  // Wait for the page to stabilize
  await this.page.waitForTimeout(2000);
});

When('the browse page loads completely', async function() {
  // Wait for the main content to be visible
  await this.page.waitForSelector('main', { state: 'visible', timeout: 40000 });
  await this.page.waitForTimeout(2000);
  
  // Verify we're on the browse page
  await expect(this.page).toHaveURL(/.*experienceleague-stage.adobe.com\/en\/browse/);
  console.log("✓ Browse page loaded successfully");
});

Then('the browse rail should be visible', async function() {
  // Define possible selectors for the browse rail
  const browseRailSelectors = [
    '.browse-rail',
    '.browse-filter-rail',
    '.browse-sidebar',
    '.filter-rail',
    'aside.sidebar',
    'nav.browse-navigation'
  ];
  
  // Check if any of the selectors are visible
  let browseRailFound = false;
  for (const selector of browseRailSelectors) {
    const isVisible = await this.page.locator(selector).isVisible().catch(() => false);
    if (isVisible) {
      console.log(`Found browse rail with selector: ${selector}`);
      this.browseRailSelector = selector;
      browseRailFound = true;
      break;
    }
  }
  
  // Assert that the browse rail is visible
  if (!browseRailFound) {
    console.error("⚠️ Could not find browse rail");
    // Try a more general approach
    const sidebar = this.page.locator('aside').first();
    await expect(sidebar).toBeVisible({
      timeout: 5000,
      message: "Browse rail should be visible"
    });
    this.browseRailSelector = 'aside';
    console.log("✓ Found browse rail using general aside selector");
  } else {
    console.log("✓ Browse rail is visible");
  }
});

Then('the browse rail list items should be visible', async function() {
  // Define possible selectors for list items within the browse rail
  const listItemSelectors = [
    `${this.browseRailSelector} li`,
    `${this.browseRailSelector} .filter-item`,
    `${this.browseRailSelector} .browse-item`,
    `${this.browseRailSelector} .nav-item`,
    `${this.browseRailSelector} a`
  ];
  
  // Check if any of the selectors have visible items
  let listItemsFound = false;
  let listItemsCount = 0;
  
  for (const selector of listItemSelectors) {
    const count = await this.page.locator(selector).count();
    if (count > 0) {
      const firstItem = this.page.locator(selector).first();
      const isVisible = await firstItem.isVisible().catch(() => false);
      
      if (isVisible) {
        listItemsCount = count;
        console.log(`Found ${count} list items with selector: ${selector}`);
        listItemsFound = true;
        
        // Log the text of the first few items
        const maxItemsToLog = Math.min(5, count);
        for (let i = 0; i < maxItemsToLog; i++) {
          const itemText = await this.page.locator(selector).nth(i).textContent();
          console.log(`Item ${i+1}: ${itemText.trim()}`);
        }
        
        break;
      }
    }
  }
  
  // Assert that list items are visible
  if (!listItemsFound) {
    console.error("⚠️ Could not find list items in browse rail");
    // Try a more general approach
    const items = this.page.locator(`${this.browseRailSelector} *`).filter({ hasText: /.+/ });
    const count = await items.count();
    
    if (count > 0) {
      console.log(`Found ${count} elements with text in the browse rail`);
      listItemsFound = true;
      listItemsCount = count;
    }
  }
  
  // Final assertion
  expect(listItemsFound).toBeTruthy();
  expect(listItemsCount).toBeGreaterThan(0);
  console.log(`✓ Browse rail contains ${listItemsCount} visible list items`);
});

// Note: 'user sets viewport to mobile size' step is in common-mobile-steps.js
// Mobile view validation steps have been removed as requested
