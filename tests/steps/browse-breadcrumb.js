const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { launchBrowser } = require('../commonFunctions/launchbrowser');

setDefaultTimeout(90 * 1000);

Given('user navigates to Experience League browse pagea', async function() {
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

When('the browse page loads completelya', async function() {
  // Wait for the main content to be visible
  await this.page.waitForSelector('main', { state: 'visible', timeout: 40000 });
  await this.page.waitForTimeout(2000);
  
  // Verify we're on the browse page
  await expect(this.page).toHaveURL(/.*experienceleague-stage.adobe.com\/en\/browse/);
  console.log("✓ Browse page loaded successfully");
});

When('user clicks on a list item in the browse rail', async function() {
   await this.page.waitForTimeout(4000);
  // Define possible selectors for the browse rail list items
  const listItemSelectors = [
    '.browse-rail li a',
    '.browse-filter-rail a',
    '.browse-sidebar a',
    'aside a',
    'nav.browse-navigation a'
  ];
  
  // Try to find and click on a list item
  let clicked = false;
  
  for (const selector of listItemSelectors) {
    const count = await this.page.locator(selector).count();
    
    if (count > 0) {
      // Find the first visible item
      for (let i = 0; i < count; i++) {
        const item = this.page.locator(selector).nth(i);
        const isVisible = await item.isVisible().catch(() => false);
        
        if (isVisible) {
          // Store the text of the item for later verification
          this.clickedItemText = await item.textContent();
          console.log(`Clicking on browse rail item: ${this.clickedItemText.trim()}`);
          
          // Click the item
          await item.click();
          await this.page.waitForTimeout(2000);
          
          clicked = true;
          break;
        }
      }
    }
    
    if (clicked) break;
  }
  
  // Assert that we clicked on an item
  expect(clicked).toBeTruthy();
  console.log("✓ Successfully clicked on a browse rail list item");
});

Then('the breadcrumb should be visible', async function() {
  // Define possible selectors for breadcrumbs
  const breadcrumbSelectors = [
    '.breadcrumb',
    '.breadcrumbs',
    'nav[aria-label="Breadcrumb"]',
    '.breadcrumb-container',
    'ol.breadcrumb'
  ];
  
  // Check if any of the selectors are visible
  let breadcrumbFound = false;
  
  for (const selector of breadcrumbSelectors) {
    const isVisible = await this.page.locator(selector).isVisible().catch(() => false);
    
    if (isVisible) {
      console.log(`Found breadcrumb with selector: ${selector}`);
      this.breadcrumbSelector = selector;
      breadcrumbFound = true;
      break;
    }
  }
  
  // If no specific selector worked, try a more general approach
  if (!breadcrumbFound) {
    // Look for elements that might be breadcrumbs
    const possibleBreadcrumb = this.page.locator('a:has-text("Browse")').first();
    const isVisible = await possibleBreadcrumb.isVisible().catch(() => false);
    
    if (isVisible) {
      console.log("Found breadcrumb using 'Browse' text");
      this.breadcrumbSelector = 'a:has-text("Browse")';
      breadcrumbFound = true;
    }
  }
  
  // Assert that breadcrumb is visible
  expect(breadcrumbFound).toBeTruthy();
  console.log("✓ Breadcrumb is visible");
});

When('user clicks on the browse breadcrumb', async function() {
  // Find and click on the browse link in the breadcrumb
  const browseBreadcrumb = this.page.locator('a:has-text("Browse")').first();
  
  // Verify it's visible before clicking
  await expect(browseBreadcrumb).toBeVisible({ timeout: 5000 });
  
  // Click on the browse breadcrumb
  console.log("Clicking on 'Browse' breadcrumb");
  await browseBreadcrumb.click();
  
  // Wait for navigation
  await this.page.waitForTimeout(2000);
});

Then('user should navigate back to the browse page', async function() {
  // Verify we're back on the browse page
  await expect(this.page).toHaveURL(/.*experienceleague-stage.adobe.com\/en\/browse/);
  console.log("✓ Successfully navigated back to the browse page");
  
  // Clean up - close the browser
  if (this.browser) {
    await this.browser.close();
  }
});
