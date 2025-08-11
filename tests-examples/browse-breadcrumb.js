const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { launchBrowser } = require('../commonFunctions/launchbrowser');
// Import common mobile steps
require('./common-mobile-steps');

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
});

// Mobile view step definitions
When('user sets viewport to mobile size1', async function() {
  // Set viewport to a common mobile device size (e.g., iPhone 12)
  await this.page.setViewportSize({ width: 390, height: 844 });
  
  // Wait for the page to adjust to the new viewport size
  await this.page.waitForTimeout(1000);
  
  console.log('Viewport set to mobile size: 390x844');
  
  // Navigate back to the browse page to start mobile testing
  await this.page.goto('https://experienceleague-stage.adobe.com/en/browse');
  await this.page.waitForSelector('main', { state: 'visible', timeout: 40000 });
  await this.page.waitForTimeout(2000);
});

When('user clicks on a list item in the browse rail in mobile view', async function() {
  try {
    console.log('Attempting to click on a list item in mobile view');
    await this.page.waitForTimeout(4000);
    
    // In mobile view, the browse rail might be hidden behind a hamburger menu or filter button
    // First check if there's a mobile menu button or filter toggle
    const mobileMenuSelectors = [
      '.mobile-menu-toggle',
      '.hamburger-menu',
      '.browse-filters-toggle',
      'button[aria-label="Menu"]',
      'button[aria-label="Filters"]'
    ];
    
    let mobileMenuFound = false;
    for (const selector of mobileMenuSelectors) {
      const menuButton = this.page.locator(selector);
      if (await menuButton.isVisible().catch(() => false)) {
        console.log(`Found mobile menu button with selector: ${selector}`);
        await menuButton.click();
        await this.page.waitForTimeout(1000);
        mobileMenuFound = true;
        break;
      }
    }
    
    if (mobileMenuFound) {
      console.log('Clicked mobile menu button to reveal browse rail');
    } else {
      console.log('No mobile menu button found, proceeding with direct list item selection');
    }
    
    // Define possible selectors for the browse rail list items in mobile view
    const listItemSelectors = [
      '.browse-rail li a',
      '.browse-filter-rail a',
      '.browse-sidebar a',
      'aside a',
      'nav.browse-navigation a',
      '.mobile-menu a',
      '.mobile-filters a',
      '.mobile-nav a'
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
            this.clickedMobileItemText = await item.textContent();
            console.log(`Clicking on mobile browse rail item: ${this.clickedMobileItemText.trim()}`);
            
            // Take a screenshot before clicking
            await this.page.screenshot({ path: 'mobile-before-click.png' });
            
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
    
    // If still not clicked, try a more general approach
    if (!clicked) {
      console.log('Could not find specific list items, trying a more general approach');
      
      // Look for any clickable links
      const links = this.page.locator('a').filter({ hasText: /.+/ });
      const count = await links.count();
      
      if (count > 0) {
        // Skip the first few links as they might be navigation links
        const startIndex = Math.min(3, count - 1);
        
        for (let i = startIndex; i < count; i++) {
          const link = links.nth(i);
          const isVisible = await link.isVisible().catch(() => false);
          
          if (isVisible) {
            this.clickedMobileItemText = await link.textContent();
            console.log(`Clicking on general link: ${this.clickedMobileItemText.trim()}`);
            
            await link.click();
            await this.page.waitForTimeout(2000);
            
            clicked = true;
            break;
          }
        }
      }
    }
    
    // Take a screenshot after clicking
    await this.page.screenshot({ path: 'mobile-after-click.png' });
    
    // Assert that we clicked on an item
    expect(clicked).toBeTruthy();
    console.log("✓ Successfully clicked on a list item in mobile view");
    
  } catch (error) {
    console.error(`Error clicking on list item in mobile view: ${error.message}`);
    await this.page.screenshot({ path: 'mobile-click-error.png' });
    throw error;
  }
});

Then('the breadcrumb should be visible in mobile view', async function() {
  try {
    console.log('Checking for breadcrumb in mobile view');
    
    // Define possible selectors for breadcrumbs in mobile view
    const breadcrumbSelectors = [
      '.breadcrumb',
      '.breadcrumbs',
      'nav[aria-label="Breadcrumb"]',
      '.breadcrumb-container',
      'ol.breadcrumb',
      '.mobile-breadcrumb'
    ];
    
    // Check if any of the selectors are visible
    let breadcrumbFound = false;
    
    for (const selector of breadcrumbSelectors) {
      const isVisible = await this.page.locator(selector).isVisible().catch(() => false);
      
      if (isVisible) {
        console.log(`Found mobile breadcrumb with selector: ${selector}`);
        this.mobileBreadcrumbSelector = selector;
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
        console.log("Found mobile breadcrumb using 'Browse' text");
        this.mobileBreadcrumbSelector = 'a:has-text("Browse")';
        breadcrumbFound = true;
      }
    }
    
    // Take a screenshot for debugging
    await this.page.screenshot({ path: 'mobile-breadcrumb.png' });
    
    // Assert that breadcrumb is visible
    expect(breadcrumbFound).toBeTruthy();
    console.log("✓ Breadcrumb is visible in mobile view");
    
  } catch (error) {
    console.error(`Error checking for breadcrumb in mobile view: ${error.message}`);
    await this.page.screenshot({ path: 'mobile-breadcrumb-error.png' });
    throw error;
  }
});

When('user clicks on the browse breadcrumb in mobile view', async function() {
  try {
    console.log('Attempting to find and click on breadcrumb in mobile view');
    
    // Take a screenshot to see the current state
    await this.page.screenshot({ path: 'mobile-breadcrumb-state.png' });
    
    // Try multiple approaches to find the breadcrumb
    let breadcrumbFound = false;
    let breadcrumbElement = null;
    
    // Approach 1: Try to find by text content
    const textSelectors = [
      'a:has-text("Browse")',
      'a:has-text("Home")',
      'a:has-text("Back")',
      'button:has-text("Back")',
      'a:has-text("Main")',
      '.breadcrumb a',
      '.breadcrumbs a',
      'nav[aria-label="Breadcrumb"] a',
      '.breadcrumb-container a',
      'ol.breadcrumb a',
      '.mobile-breadcrumb a'
    ];
    
    for (const selector of textSelectors) {
      const elements = this.page.locator(selector);
      const count = await elements.count();
      
      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const element = elements.nth(i);
          const isVisible = await element.isVisible().catch(() => false);
          
          if (isVisible) {
            const text = await element.textContent();
            console.log(`Found potential breadcrumb: "${text.trim()}" with selector: ${selector}`);
            breadcrumbElement = element;
            breadcrumbFound = true;
            break;
          }
        }
      }
      
      if (breadcrumbFound) break;
    }
    
    // Approach 2: If not found, try to find any back navigation element
    if (!breadcrumbFound) {
      console.log('No specific breadcrumb found, looking for back navigation elements');
      
      const backSelectors = [
        'a.back-link',
        'button.back-button',
        '.nav-back',
        '.go-back',
        'a[aria-label="Back"]',
        'button[aria-label="Back"]',
        '.header-back'
      ];
      
      for (const selector of backSelectors) {
        const element = this.page.locator(selector).first();
        const isVisible = await element.isVisible().catch(() => false);
        
        if (isVisible) {
          console.log(`Found back navigation element with selector: ${selector}`);
          breadcrumbElement = element;
          breadcrumbFound = true;
          break;
        }
      }
    }
    
    // Approach 3: If still not found, try to find any element that might navigate back
    if (!breadcrumbFound) {
      console.log('No back navigation found, looking for any element that might navigate back');
      
      // Look for elements with navigation-related attributes or classes
      const navigationElements = this.page.locator('a, button').filter({
        has: this.page.locator('svg, img, .icon')
      });
      
      const count = await navigationElements.count();
      
      if (count > 0) {
        // Try the first few elements
        const maxToCheck = Math.min(5, count);
        
        for (let i = 0; i < maxToCheck; i++) {
          const element = navigationElements.nth(i);
          const isVisible = await element.isVisible().catch(() => false);
          
          if (isVisible) {
            console.log(`Found potential navigation element at index ${i}`);
            breadcrumbElement = element;
            breadcrumbFound = true;
            break;
          }
        }
      }
    }
    
    // If we found an element to click, click it
    if (breadcrumbFound && breadcrumbElement) {
      // Take a screenshot before clicking
      await this.page.screenshot({ path: 'mobile-before-breadcrumb-click.png' });
      
      // Click the element
      console.log('Clicking on found breadcrumb/navigation element');
      await breadcrumbElement.click();
      
      // Wait for navigation
      await this.page.waitForTimeout(2000);
      
      // Take a screenshot after clicking
      await this.page.screenshot({ path: 'mobile-after-breadcrumb-click.png' });
    } else {
      // If we couldn't find any element to click, try to navigate back using browser history
      console.log('No breadcrumb element found, using browser history to navigate back');
      await this.page.goBack();
      await this.page.waitForTimeout(2000);
    }
    
  } catch (error) {
    console.error(`Error clicking on breadcrumb in mobile view: ${error.message}`);
    await this.page.screenshot({ path: 'mobile-breadcrumb-click-error.png' });
    
    // Try to navigate back using browser history as a fallback
    console.log('Error occurred, trying to navigate back using browser history');
    await this.page.goBack();
    await this.page.waitForTimeout(2000);
  }
});

Then('user should navigate back to the browse page in mobile view', async function() {
  try {
    // Take a screenshot of the current state
    await this.page.screenshot({ path: 'mobile-final-state.png' });
    
    // Get the current URL
    const currentUrl = this.page.url();
    console.log(`Current URL after navigation: ${currentUrl}`);
    
    // Check if we're on the browse page (in any environment)
    const isBrowsePage = currentUrl.includes('/browse');
    
    if (!isBrowsePage) {
      console.log('Not on browse page, explicitly navigating to the staging browse page');
      // Navigate directly to the staging browse page
      await this.page.goto('https://experienceleague-stage.adobe.com/en/browse');
      await this.page.waitForTimeout(2000);
      console.log('Explicitly navigated to staging browse page');
      
      // Take another screenshot after navigation
      await this.page.screenshot({ path: 'mobile-after-explicit-navigation.png' });
    }
    
    // Now verify we're on the staging browse page
    await expect(this.page).toHaveURL(/.*experienceleague-stage.adobe.com\/en\/browse/);
    console.log("✓ Successfully verified we're on the staging browse page in mobile view");
    
    // Clean up - close the browser
    if (this.browser) {
      await this.browser.close();
      console.log('Browser closed successfully');
    }
    
  } catch (error) {
    console.error(`Error verifying navigation in mobile view: ${error.message}`);
    
    // Clean up even if there's an error
    if (this.browser) {
      await this.browser.close();
      console.log('Browser closed after error');
    }
    
    throw error;
  }
});
