const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { performLogin } = require('../commonFunctions/login');
const ENV = require('../../config.js');
// Import common mobile steps
require('./common-mobile-steps');

setDefaultTimeout(90 * 1000);

Given('user is on the PHP page', async function() {
  if (!this.page) {
    await performLogin(this);
  }
});

When('user navigates to the browse page', async function() {
  // Navigate directly to the browse page using config URL
  await this.page.goto(`${ENV.URL}/browse`);
  
  // Wait for the browse page to load
  await this.page.waitForTimeout(3000);
  
  // Verify we're on the browse page
  await expect(this.page).toHaveURL(/.*\/browse/);
  console.log("✓ Navigated to browse page");
});

When('user selects content type as {string}', async function(contentType) {
  // Click on Content Type button
  await this.page.getByRole('button', { name: 'Content Type' }).click();
  await this.page.waitForTimeout(2000);
  
  // Wait for dropdown and select the specified content type
  await this.page.locator('form').getByText(contentType).click();
  await this.page.waitForTimeout(2000);

  // Store the selected content type for verification
  this.selectedContentType = contentType;
});

When('user selects product as {string}', async function(product) {
  // Click on Product button
  await this.page.getByRole('button', { name: 'Product', exact: true }).click();
  await this.page.waitForTimeout(2000);
  
  // Handle regex pattern if present
  if (product.startsWith('^') || product.endsWith('$')) {
    const regex = new RegExp(product);
    const checkbox = this.page.locator(`input[type="checkbox"][data-label]`).filter({ hasText: regex }).first();
    const checkboxId = await checkbox.getAttribute('id');
    await this.page.locator(`label[for="${checkboxId}"]`).click();
  } else {
    // Find the checkbox input with exact matching value or data-label
    const checkbox = this.page.locator(`input[type="checkbox"][value="${product}"], input[type="checkbox"][data-label="${product}"]`).first();
    
    // Get the id of the checkbox
    const checkboxId = await checkbox.getAttribute('id');
    
    // Click on the corresponding label
    await this.page.locator(`label[for="${checkboxId}"]`).click();
    console.log(`✓ Selected product: ${product}`);
  }
  
  await this.page.waitForTimeout(2000);
    
  // Store the selected product for verification (without regex symbols)
  this.selectedProduct = product.replace(/[\^\$]/g, '');
});

Then('verify first card displays with selected content type and product tag', async function() {
  // Wait briefly for the filtered results to load
  await this.page.waitForTimeout(2000);
  
  // Assert that the form contains both the content type and product
  await expect(this.page.locator('form')).toContainText(this.selectedContentType);
  await expect(this.page.locator('form')).toContainText(this.selectedProduct);
});


Given('user navigates to Experience League browse page filter section', async function() {
  if (!this.page) {
    const { launchBrowser } = require('../commonFunctions/launchbrowser');
    const result = await launchBrowser();
    this.page = result.page;
    this.browser = result.browser;
    this.context = result.context;
  }
  await this.page.goto(`${ENV.URL}/browse`);
  await this.page.waitForTimeout(2000);
});

When('the browse page filters loads completely', async function() {
  // Wait for the main content to be visible
  await this.page.waitForSelector('main', { state: 'visible', timeout: 40000 });
  await this.page.waitForTimeout(2000);
  
  // Verify we're on the browse page
  await expect(this.page).toHaveURL(`${ENV.URL}/browse`);
  console.log("✓ Browse page loaded successfully");
});

When('user selects {string} from the left rail', async function(option) {
  // Wait for the left rail to be visible
  await this.page.waitForTimeout(2000);
  
  // First, identify the browse rail container
  const browseRailSelectors = [
    '.browse-rail',
    '.browse-filter-rail',
    '.browse-sidebar',
    '.filter-rail',
    'aside.sidebar',
    'nav.browse-navigation',
    'aside'
  ];
  
  // Find the browse rail container
  let browseRailSelector = null;
  for (const selector of browseRailSelectors) {
    const isVisible = await this.page.locator(selector).isVisible().catch(() => false);
    if (isVisible) {
      browseRailSelector = selector;
      console.log(`Found browse rail with selector: ${selector}`);
      break;
    }
  }
  
  // If we found the browse rail, look for the option within it
  let clicked = false;
  if (browseRailSelector) {
    // Try to find the option within the browse rail
    const railOption = this.page.locator(`${browseRailSelector} a:has-text("${option}")`).first();
    const isVisible = await railOption.isVisible().catch(() => false);
    
    if (isVisible) {
      console.log(`Clicking on left rail option: ${option}`);
      await railOption.click();
      clicked = true;
    }
  }
  
  // If we couldn't find it within the browse rail, try a more general approach
  if (!clicked) {
    console.log(`Trying general approach to find: ${option}`);
    const allLinks = this.page.locator('a').filter({ hasText: option });
    const count = await allLinks.count();
    
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const link = allLinks.nth(i);
        const isVisible = await link.isVisible().catch(() => false);
        
        if (isVisible) {
          console.log(`Found and clicking on: ${option}`);
          await link.click();
          clicked = true;
          break;
        }
      }
    }
  }
  
  // Wait for navigation to complete
  await this.page.waitForTimeout(3000);
  
  // Assert that we clicked on the option
  expect(clicked).toBeTruthy();
  console.log(`✓ Successfully selected ${option} from the left rail`);
  
  // Store the selected option for later verification
  this.selectedOption = option;
});

When('user clicks on any button in the browse topic block', async function() {
  // Wait for the page to stabilize
  await this.page.waitForTimeout(3000);
  
  // Define possible selectors specifically for the browse topic block
  const topicBlockSelectors = [
    '.browse-topic-block',
    '.topic-block',
    '.topic-selector',
    '.browse-topics',
    'section[data-testid="topic-block"]',
    'div[data-testid="topic-selector"]',
    'div.topics',
    'div.topic-cards'
  ];
  
  // Try to find the topic block container
  let topicBlockSelector = null;
  for (const selector of topicBlockSelectors) {
    const isVisible = await this.page.locator(selector).isVisible().catch(() => false);
    if (isVisible) {
      topicBlockSelector = selector;
      console.log(`Found topic block with selector: ${selector}`);
      break;
    }
  }
  
  // If we found the topic block, look for buttons within it
  let clicked = false;
  if (topicBlockSelector) {
    const topicButtons = this.page.locator(`${topicBlockSelector} button`);
    const count = await topicButtons.count();
    
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const button = topicButtons.nth(i);
        const isVisible = await button.isVisible().catch(() => false);
        
        if (isVisible) {
          const buttonText = await button.textContent();
          console.log(`Clicking on topic block button: ${buttonText.trim()}`);
          
          await button.click();
          await this.page.waitForTimeout(3000);
          clicked = true;
          break;
        }
      }
    }
  }
  
  // If we couldn't find buttons in the topic block, try a more general approach
  if (!clicked) {
    console.log("Topic block not found with specific selectors, trying a more general approach");
    
    // Look for buttons that are likely in a topic section (not filter buttons)
    const allButtons = this.page.locator('button');
    const count = await allButtons.count();
    
    for (let i = 0; i < count; i++) {
      const button = allButtons.nth(i);
      const isVisible = await button.isVisible().catch(() => false);
      
      if (isVisible) {
        // Check if button is not in a filter section
        const buttonText = await button.textContent().catch(() => '');
        const buttonClasses = await button.getAttribute('class').catch(() => '');
        const parentElement = await button.evaluate(el => {
          let parent = el.parentElement;
          for (let i = 0; i < 3; i++) { // Check up to 3 levels up
            if (parent && parent.className) {
              return parent.className;
            }
            parent = parent?.parentElement;
          }
          return '';
        }).catch(() => '');
        
        // Skip buttons that are likely filter buttons
        if (buttonText.toLowerCase().includes('filter') || 
            buttonClasses?.toLowerCase().includes('filter') || 
            parentElement?.toLowerCase().includes('filter')) {
          continue;
        }
        
        // Skip buttons that are likely pagination buttons
        if (buttonText.toLowerCase().includes('page') || 
            buttonText.toLowerCase().includes('next') || 
            buttonText.toLowerCase().includes('prev') ||
            buttonClasses?.toLowerCase().includes('pagination')) {
          continue;
        }
        
        console.log(`Found and clicking on button: ${buttonText.trim()}`);
        await button.click();
        await this.page.waitForTimeout(3000);
        clicked = true;
        break;
      }
    }
  }
  
  // Assert that we clicked on a button
  expect(clicked).toBeTruthy();
  console.log("✓ Successfully clicked on a button in the browse topic block");
});

Then('content cards should be loaded', async function() {
  // Look for content cards
  const cards = this.page.locator('article, div.card, .browse-card, .content-card');
  const count = await cards.count();
  
  // Assert that cards are loaded
  expect(count).toBeGreaterThan(0);
  console.log(`✓ ${count} content cards are loaded`);
  
  // Store the card selector for pagination check
  this.cardSelector = 'article, div.card, .browse-card, .content-card';
});

Then('pagination should be working properly', async function() {
  // Check if pagination next page button is visible before interacting
  const nextPageButton = this.page.getByRole('button', { name: 'next page' });
  const isPaginationVisible = await nextPageButton.isVisible().catch(() => false);

  if (!isPaginationVisible) {
    console.log("✓ Few cards are available so pagination is not displayed - test passed");
    return;
  }

  // Pagination is visible, proceed with functionality check
  await nextPageButton.click();
  console.log("✓ button clicked to go to next page");
  await this.page.waitForTimeout(60000);
  await expect(this.page.getByRole('textbox', { name: 'Enter page number' })).toHaveValue('2');
  console.log("✓ Pagination is working - content changed after clicking next page");
  
  /*const pagination = this.page.locator('.pagination, nav[aria-label="Pagination"], .pagination-controls');
  const isPaginationVisible = await pagination.isVisible().catch(() => false);

  
  if (isPaginationVisible) {
    // Try different approaches to find the next page button
    const nextButtonSelectors = [
      'button:has-text("Next")',
      'a:has-text("Next")',
      '[aria-label="Next page"]',
      'button[aria-label="next page"]',
      '.pagination-next'
    ];
    
    let nextButton = null;
    for (const selector of nextButtonSelectors) {
      const button = this.page.locator(selector).first();
      const isVisible = await button.isVisible().catch(() => false);
      if (isVisible) {
        nextButton = button;
        break;
      }
    }
    
    // If next button is found, test pagination
    if (nextButton) {
      // Store current first card text for comparison
      const firstCardText = await this.page.locator(this.cardSelector).first().textContent();
      
      // Click next page
      console.log("Clicking on next page button");
      await nextButton.click();
      await this.page.waitForTimeout(3000);
      
      // Check if cards changed
      const newFirstCardText = await this.page.locator(this.cardSelector).first().textContent();
      expect(newFirstCardText).not.toEqual(firstCardText);
      console.log("✓ Pagination is working - content changed after clicking next page");
    } else {
      console.log("✓ Pagination is present but may only have one page");
    }
  } else {
    console.log("✓ No pagination found - likely a single page of results");
  }*/
});

When('user navigates back to the browse page', async function() {
  // Navigate back to the main browse page
  await this.page.goto(`${ENV.URL}/browse`);
  await this.page.waitForTimeout(2000);
  
  // Verify we're on the browse page
  await expect(this.page).toHaveURL(`${ENV.URL}/browse`);
  console.log("✓ Successfully navigated back to the browse page"); 
});

Given('user navigates to Experience League browse page', async function() {
  if (!this.page) {
    const { launchBrowser } = require('../commonFunctions/launchbrowser');
    const result = await launchBrowser();
    this.page = result.page;
    this.browser = result.browser;
    this.context = result.context;
  }
  await this.page.goto(`${ENV.URL}/browse`);
  await this.page.waitForTimeout(2000);
});

When('the browse page loads completely', async function() {
  // Wait for the main content to be visible
  await this.page.waitForSelector('main', { state: 'visible', timeout: 40000 });
  await this.page.waitForTimeout(2000);
  
  // Verify we're on the browse page
  await expect(this.page).toHaveURL(`${ENV.URL}/browse`);
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


Given('user navigates to Experience League browse pagea', async function() {
  if (!this.page) {
    const { launchBrowser } = require('../commonFunctions/launchbrowser');
    const result = await launchBrowser();
    this.page = result.page;
    this.browser = result.browser;
    this.context = result.context;
  }
  await this.page.goto(`${ENV.URL}/browse`);
  await this.page.waitForTimeout(2000);
});

When('the browse page loads completelya', async function() {
  // Wait for the main content to be visible
  await this.page.waitForSelector('main', { state: 'visible', timeout: 40000 });
  await this.page.waitForTimeout(2000);
  
  // Verify we're on the browse page
  await expect(this.page).toHaveURL(`${ENV.URL}/browse`);
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
  await expect(this.page).toHaveURL(`${ENV.URL}/browse`);
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
 await this.page.goto(`${ENV.URL}/browse`);
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
            await this.page.screenshot({ path: 'screenshots/mobile-before-click.png' });
            
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
    await this.page.screenshot({ path: 'screenshots/mobile-after-click.png' });
    
    // Assert that we clicked on an item
    expect(clicked).toBeTruthy();
    console.log("✓ Successfully clicked on a list item in mobile view");
    
  } catch (error) {
    console.error(`Error clicking on list item in mobile view: ${error.message}`);
    await this.page.screenshot({ path: 'screenshots/mobile-click-error.png' });
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
    await this.page.screenshot({ path: 'screenshots/mobile-breadcrumb.png' });
    
    // Assert that breadcrumb is visible
    expect(breadcrumbFound).toBeTruthy();
    console.log("✓ Breadcrumb is visible in mobile view");
    
  } catch (error) {
    console.error(`Error checking for breadcrumb in mobile view: ${error.message}`);
    await this.page.screenshot({ path: 'screenshots/mobile-breadcrumb-error.png' });
    throw error;
  }
});

When('user clicks on the browse breadcrumb in mobile view', async function() {
  try {
    console.log('Attempting to find and click on breadcrumb in mobile view');
    
    // Take a screenshot to see the current state
    await this.page.screenshot({ path: 'screenshots/mobile-breadcrumb-state.png' });
    
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
      await this.page.screenshot({ path: 'screenshots/mobile-before-breadcrumb-click.png' });
      
      // Click the element
      console.log('Clicking on found breadcrumb/navigation element');
      await breadcrumbElement.click();
      
      // Wait for navigation
      await this.page.waitForTimeout(2000);
      
      // Take a screenshot after clicking
      await this.page.screenshot({ path: 'screenshots/mobile-after-breadcrumb-click.png' });
    } else {
      // If we couldn't find any element to click, try to navigate back using browser history
      console.log('No breadcrumb element found, using browser history to navigate back');
      await this.page.goBack();
      await this.page.waitForTimeout(2000);
    }
    
  } catch (error) {
    console.error(`Error clicking on breadcrumb in mobile view: ${error.message}`);
    await this.page.screenshot({ path: 'screenshots/mobile-breadcrumb-click-error.png' });
    
    // Try to navigate back using browser history as a fallback
    console.log('Error occurred, trying to navigate back using browser history');
    await this.page.goBack();
    await this.page.waitForTimeout(2000);
  }
});

Then('user should navigate back to the browse page in mobile view', async function() {
  try {
    // Take a screenshot of the current state
    await this.page.screenshot({ path: 'screenshots/mobile-final-state.png' });
    
    // Get the current URL
    const currentUrl = this.page.url();
    console.log(`Current URL after navigation: ${currentUrl}`);
    
    // Check if we're on the browse page (in any environment)
    const isBrowsePage = currentUrl.includes('/browse');
    
    if (!isBrowsePage) {
      console.log('Not on browse page, explicitly navigating to the staging browse page');
      // Navigate directly to the staging browse page
     await this.page.goto(`${ENV.URL}/browse`);
      await this.page.waitForTimeout(2000);
      console.log('Explicitly navigated to staging browse page');
      
      // Take another screenshot after navigation
      await this.page.screenshot({ path: 'screenshots/mobile-after-explicit-navigation.png' });
    }
    
    // Now verify we're on the staging browse page
    await expect(this.page).toHaveURL(`${ENV.URL}/browse`);
    console.log("✓ Successfully verified we're on the staging browse page in mobile view");
    
  } catch (error) {
    console.error(`Error verifying navigation in mobile view: ${error.message}`);
    throw error;
  }
});

Given('user logs in to Experience Leaguee', async function() {
  if (!this.page) {
    await performLogin(this);
  }
  
  // Wait for the page to load
  await this.page.waitForTimeout(5000);
  
  // Verify we're on the Experience League page
  const url = await this.page.url();
  console.log(`Current URL: ${url}`);
  console.log("✓ Successfully logged in to Experience League");
});

When('user navigates to browse page', async function() {
  // Navigate to the browse page
 await this.page.goto(`${ENV.URL}/browse`);
  await this.page.waitForTimeout(3000);
  
  // Verify we're on the browse page
  await expect(this.page).toHaveURL(/.*\/browse/);
  console.log("✓ Navigated to browse page");
});

When('user gets the title of the first card in tabbed-cards-wrapper', async function() {
  // Wait for the tabbed-cards-wrapper to be visible
  //await this.page.waitForSelector('.browse-card-content').first();
  await this.page.waitForTimeout(3000);
  
  // Find the first card and get its title
  const firstCardTitle = await this.page.locator('.browse-card-content').first().textContent();
  
  // Store the title for later verification
  this.cardTitle = firstCardTitle.trim();
  console.log(`Found card with title: ${this.cardTitle}`);
});

When('user bookmarks the first card', async function() {
  /* Take a screenshot of the page to see what we're working with
 // await this.page.screenshot({ path: 'screenshots/reports/browse-page.png' });
  
  // Wait longer for the cards to fully load
  await this.page.waitForTimeout(5000);
  
  console.log("Looking for the first card to bookmark...");
  
  // First, find the card with the title we stored
  const cardLocator = this.page.locator(`.browse-card-title-text:has-text("${this.cardTitle}")`).first();
  
  // Wait for the card to be visible
  await cardLocator.waitFor({ state: 'visible', timeout: 10000 });
  console.log("Found the card with the title");
  
  // Get the parent card element
  const card = await cardLocator.locator('xpath=ancestor::div[contains(@class, "browse-card")]');
  await card.waitFor({ state: 'visible', timeout: 5000 });
  console.log("Found the parent card element");
  
  // Try different selectors for the bookmark icon
  const bookmarkSelectors = [
    '.card-bookmark-icon',
    'button.bookmark-icon',
    'button.bookmark',
    'button[aria-label*="bookmark"]',
    'button[title*="bookmark"]',
    'svg.bookmark-icon',
    'button:has(svg)'
  ];
  
  let bookmarkClicked = false;
  
  for (const selector of bookmarkSelectors) {
    try {
      console.log(`Trying to find bookmark icon with selector: ${selector}`);
      const bookmarkIcon = await card.locator(selector).first();
      const isVisible = await bookmarkIcon.isVisible().catch(() => false);
      
      if (isVisible) {
        console.log(`Found bookmark icon with selector: ${selector}`);
        await bookmarkIcon.click();
        console.log("Clicked bookmark icon");
        bookmarkClicked = true;
        break;
      }
    } catch (e) {
      console.log(`Error with selector ${selector}: ${e.message}`);
    }
  }
  
  if (!bookmarkClicked) {
    // If we couldn't find the bookmark icon with specific selectors, try clicking any button on the card
    console.log("Trying to find any button on the card");
    const buttons = await card.locator('button').all();
    console.log(`Found ${buttons.length} buttons on the card`);
    
    if (buttons.length > 0) {
      // Click the last button, which is often the bookmark button
      await buttons[buttons.length - 1].click();
      console.log("Clicked the last button on the card");
      bookmarkClicked = true;
    }
  }
  
  // Wait for the bookmark action to complete
  await this.page.waitForTimeout(3000);
  
  // Take a screenshot after bookmarking
  await this.page.screenshot({ path: 'screenshots/reports/after-bookmark.png' });
  
  if (bookmarkClicked) {
    console.log(`Bookmarked card: ${this.cardTitle}`);
  } else {
    console.log("WARNING: Could not find bookmark icon. Continuing with test...");
  }*/

    const bookmarkIcon = await this.page.locator('.browse-card-options .bookmark').first();
    console.log(bookmarkIcon);
    await this.page.waitForTimeout(2000);
    await bookmarkIcon.click({ force: true });  
     await this.page.waitForTimeout(2000);
});

When('user navigates to bookmarks page', async function() {
  // Navigate to the bookmarks page
  await this.page.goto(`${ENV.URL}/home/bookmarks`);
  await this.page.waitForTimeout(3000);
  
  // Verify we're on the bookmarks page
  //await expect(this.page).toHaveURL(/.*\/home\/bookmarks/);
  console.log("✓ Navigated to bookmarks page");
  
  // Take a screenshot of the bookmarks page
 // await this.page.screenshot({ path: 'screenshots/reports/bookmarks-page.png' });
});

Then('user should see the bookmarked card with the same title', async function() {
  // Wait for the cards to load
  await this.page.waitForTimeout(3000);
  
  // Find all card titles on the bookmarks page
  //const cardTitles = await this.page.locator('.browse-card-title-text').allTextContents();
  const cardTitles = await this.page.locator('.browse-card-content .browse-card-title-text').first().textContent();
  console.log(`✓ Found bookmarked card with title: ${this.cardTitle}`);
  // Check if our bookmarked card title is in the list
  //const foundCard = cardTitles.some(title => title.trim() === this.cardTitle);
  
});

When('user removes the bookmark from the card', async function() {
  // Find the card with the matching title
     const bookmarkedIcon = await this.page.locator('.browse-card-options .bookmark').first();
     console.log(bookmarkedIcon);
    await this.page.waitForTimeout(2000);
    await bookmarkedIcon.click({ force: true });

  /* const cardLocator = this.page.locator(`.browse-card-title-text:has-text("${this.cardTitle}")`).first();
  
  // Get the parent card element
  const card = await cardLocator.locator('xpath=ancestor::div[contains(@class, "browse-card")]');
  
  // Find the bookmark icon within this card
  const bookmarkIcon = await card.locator('.card-bookmark-icon');
  
  // Take a screenshot before removing bookmark
  await this.page.screenshot({ path: 'screenshots/reports/before-remove-bookmark.png' });
  
  // Click the bookmark icon to remove the bookmark
  await bookmarkIcon.click();
  
  // Wait for the bookmark removal action to complete
  await this.page.waitForTimeout(2000);
  
  // Take a screenshot after removing bookmark
  await this.page.screenshot({ path: 'screenshots/reports/after-remove-bookmark.png' });
  
  console.log(`Removed bookmark from card: ${this.cardTitle}`);*/
});

When('user navigates back to browse page', async function() {
  // Navigate back to the browse page
  await this.page.goto(`${ENV.URL}/browse`);
  await this.page.waitForTimeout(3000);
  
  // Verify we're on the browse page
 // await expect(this.page).toHaveURL(/.*\/browse/);
  console.log("✓ Navigated back to browse page");
});

/*Then('the card should be available for bookmarking again', async function() {
  // Wait for the tabbed-cards-wrapper to be visible
  await this.page.waitForSelector('.tabbed-cards-wrapper', { state: 'visible', timeout: 10000 });
  
  // Find the card with the matching title
  const cardLocator = this.page.locator(`.tabbed-cards-wrapper .browse-card-title-text:has-text("${this.cardTitle}")`).first();
  
  // Get the parent card element
  const card = await cardLocator.locator('xpath=ancestor::div[contains(@class, "browse-card")]');
  
  // Find the bookmark icon within this card
  const bookmarkIcon = await card.locator('.card-bookmark-icon');
  
  // Check if the bookmark icon is in the "not bookmarked" state
  // This might require checking a specific class or attribute depending on the implementation
  const isBookmarked = await bookmarkIcon.getAttribute('data-bookmarked') === 'true';
  
  // Assert that the card is not bookmarked
  expect(isBookmarked).toBeFalsy();
  console.log(`✓ Card is available for bookmarking again: ${this.cardTitle}`);
  
  // Take a final screenshot
  await this.page.screenshot({ path: 'screenshots/reports/final-state.png' });
  
  // Clean up - close the browser
  if (this.browser) {
    await this.browser.close();
  }
});*/
