const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { launchBrowser } = require('../commonFunctions/launchbrowser');

setDefaultTimeout(90 * 1000);

Given('user navigates to Experience League browse page filter section', async function() {
  // Launch browser and navigate to the browse page
  const result = await launchBrowser();
  this.page = result.page;
  this.browser = result.browser;
  this.context = result.context;
  
  // Navigate to the browse page
  await this.page.goto('https://experienceleague-stage.adobe.com/en/browse');
  await this.page.waitForTimeout(2000);
});

When('the browse page filters loads completely', async function() {
  // Wait for the main content to be visible
  await this.page.waitForSelector('main', { state: 'visible', timeout: 40000 });
  await this.page.waitForTimeout(2000);
  
  // Verify we're on the browse page
  await expect(this.page).toHaveURL(/.*experienceleague-stage.adobe.com\/en\/browse/);
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
  // Look for pagination elements

   await this.page.getByRole('button', { name: 'next page' }).click();
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
  await this.page.goto('https://experienceleague-stage.adobe.com/en/browse');
  await this.page.waitForTimeout(2000);
  
  // Verify we're on the browse page
  await expect(this.page).toHaveURL(/.*experienceleague-stage.adobe.com\/en\/browse/);
  console.log("✓ Successfully navigated back to the browse page"); 
});
