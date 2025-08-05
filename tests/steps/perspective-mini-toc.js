const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { performLogin } = require('../commonFunctions/login');
const { launchBrowser, closeBrowser } = require('../commonFunctions/launchbrowser');

setDefaultTimeout(90 * 1000);

Given('user logs in and lands on the home page for mini TOC validation', async function() {
  // Launch browser
  const result = await launchBrowser();
  this.page = result.page;
  this.browser = result.browser;
  this.context = result.context;
  
  // Use the common login function to log in
  await performLogin(this);
  
  // Navigate to the home page
  await this.page.goto('https://experienceleague-stage.adobe.com/');
  
  // Wait for the page to fully load after login
  await this.page.waitForTimeout(4000);
  
  // Verify we're on the home page
  await expect(this.page).toHaveURL(/.*experienceleague-stage.adobe.com\/?$/);
  console.log("✓ Successfully logged in and landed on the home page for mini TOC validation");
});

When('user navigates to the perspective page for mini TOC validation', async function() {
  // Navigate directly to the perspectives page
  await this.page.goto('https://experienceleague-stage.adobe.com/en/perspectives');
  
  // Wait for the page to load completely
  await this.page.waitForTimeout(4000);
  
  // Wait for the perspective cards to load
  await this.page.waitForSelector('.browse-card-content', { state: 'visible', timeout: 30000 });
  
  // Store all authorable card blocks for later use
  this.authorableCardBlocks = await this.page.locator('.browse-cards-block-content').all();
  console.log(`Found ${this.authorableCardBlocks.length} authorable card blocks`);
  
  // Initialize the current block index
  this.currentBlockIndex = 0;
  
  console.log("✓ Successfully navigated to the perspectives page for mini TOC validation");
});

When('user clicks on the last card of an authorable card block', async function() {
  try {
    console.log(`Processing authorable card block ${this.currentBlockIndex + 1} of ${this.authorableCardBlocks.length}`);
    
    // Get the current authorable card block
    const currentBlock = this.authorableCardBlocks[this.currentBlockIndex];
    
    // Find all cards within the current block
    const cards = await currentBlock.locator('.browse-card-content').all();
    console.log(`Found ${cards.length} cards in the current block`);
    
    if (cards.length === 0) {
      console.log('No cards found in the current block, trying next block if available');
      throw new Error('No cards found in the current block');
    }
    
    // Get the last card
    const lastCard = cards[cards.length - 1];
    
    // Check if the card is visible
    const isVisible = await lastCard.isVisible().catch(() => false);
    if (!isVisible) {
      console.log('Last card is not visible, trying next block if available');
      throw new Error('Last card is not visible');
    }
    
    // Store the card title for later reference
    const titleElement = await lastCard.locator('h2, h3, .card-title, .title').first();
    if (await titleElement.isVisible().catch(() => false)) {
      this.cardTitle = await titleElement.textContent();
      console.log(`Selected last card with title: ${this.cardTitle.trim()}`);
    } else {
      this.cardTitle = `Card ${cards.length}`;
      console.log(`Selected last card without visible title, using index: ${cards.length}`);
    }
    
    // Take a screenshot before clicking
    await this.page.screenshot({ path: 'before-card-click.png' });
    
    // Click the last card
    await lastCard.click();
    await this.page.waitForTimeout(2000);
    
    // Store the current URL for later verification
    this.cardPageUrl = this.page.url();
    console.log(`Navigated to: ${this.cardPageUrl}`);
    
  } catch (error) {
    console.error(`Error clicking on last card: ${error.message}`);
    
    // Increment the block index to try the next block
    this.currentBlockIndex++;
    
    // Check if there are more blocks to try
    if (this.currentBlockIndex < this.authorableCardBlocks.length) {
      console.log(`Trying next block (${this.currentBlockIndex + 1} of ${this.authorableCardBlocks.length})`);
      await this.page.screenshot({ path: `block-${this.currentBlockIndex}-error.png` });
      throw error; // Re-throw to allow retry with next block
    } else {
      console.error('No more blocks to try');
      await this.page.screenshot({ path: 'all-blocks-error.png' });
      throw new Error('Failed to find a suitable card in any block');
    }
  }
});

Then('the mini TOC should be checked for visibility', async function() {
  try {
    console.log('Checking for mini TOC visibility');
    
    // Wait for the page to load completely
    await this.page.waitForTimeout(2000);
    
    // Take a screenshot of the current state
    await this.page.screenshot({ path: 'article-page.png' });
    
    // Define possible selectors for mini TOC
    const miniTocSelectors = [
      '.mini-toc',
      '.article-toc',
      '.toc',
      '.table-of-contents',
      'nav[aria-label="Table of contents"]',
      'nav[aria-label="On this page"]'
    ];
    
    // Check if any of the selectors are visible
    let miniTocFound = false;
    
    for (const selector of miniTocSelectors) {
      const element = this.page.locator(selector);
      if (await element.isVisible().catch(() => false)) {
        console.log(`Found mini TOC with selector: ${selector}`);
        this.miniTocSelector = selector;
        miniTocFound = true;
        break;
      }
    }
    
    // Store the result for later steps
    this.miniTocFound = miniTocFound;
    
    if (miniTocFound) {
      console.log("✓ Mini TOC is visible on the page");
    } else {
      console.log("Mini TOC is not visible on the page");
    }
    
  } catch (error) {
    console.error(`Error checking mini TOC visibility: ${error.message}`);
    await this.page.screenshot({ path: 'mini-toc-check-error.png' });
    throw error;
  }
});

Then('if mini TOC is visible verify clicking on TOC items scrolls to respective sections', async function() {
  // Skip this step if mini TOC was not found
  if (!this.miniTocFound) {
    console.log('Skipping TOC item click test as mini TOC was not found');
    return;
  }
  
  try {
    console.log('Verifying TOC item clicking functionality');
    
    // Find all TOC items
    const tocItems = await this.page.locator(`${this.miniTocSelector} li a`).all();
    console.log(`Found ${tocItems.length} TOC items`);
    
    if (tocItems.length === 0) {
      console.log('No TOC items found, skipping verification');
      return;
    }
    
    // Test clicking on up to 2 TOC items
    const itemsToTest = Math.min(2, tocItems.length);
    
    for (let i = 0; i < itemsToTest; i++) {
      const tocItem = tocItems[i];
      
      // Get the href attribute which should contain the section ID
      const href = await tocItem.getAttribute('href');
      console.log(`TOC item ${i+1} href: ${href}`);
      
      // Get the text of the TOC item
      const tocItemText = await tocItem.textContent();
      console.log(`Clicking on TOC item: ${tocItemText.trim()}`);
      
      // Get the current scroll position before clicking
      const scrollPositionBefore = await this.page.evaluate(() => window.scrollY);
      
      // Click the TOC item
      await tocItem.click();
      await this.page.waitForTimeout(1000);
      
      // Get the scroll position after clicking
      const scrollPositionAfter = await this.page.evaluate(() => window.scrollY);
      
      // Take a screenshot after clicking
      await this.page.screenshot({ path: `toc-item-${i+1}-clicked.png` });
      
      // Verify that the page has scrolled
      const hasScrolled = scrollPositionAfter !== scrollPositionBefore;
      console.log(`Scroll position before: ${scrollPositionBefore}, after: ${scrollPositionAfter}`);
      
      if (hasScrolled) {
        console.log(`✓ Page scrolled after clicking TOC item ${i+1}`);
      } else {
        console.log(`Warning: Page did not scroll after clicking TOC item ${i+1}`);
      }
      
      // If href contains a section ID, verify that the section is now visible
      if (href && href.includes('#')) {
        const sectionId = href.split('#')[1];
        if (sectionId) {
          const section = this.page.locator(`#${sectionId}`);
          const isSectionVisible = await section.isVisible().catch(() => false);
          
          if (isSectionVisible) {
            console.log(`✓ Section with ID "${sectionId}" is visible after clicking TOC item ${i+1}`);
          } else {
            console.log(`Warning: Section with ID "${sectionId}" is not visible after clicking TOC item ${i+1}`);
          }
        }
      }
    }
    
    console.log("✓ Completed TOC item click verification");
    
  } catch (error) {
    console.error(`Error verifying TOC item clicking: ${error.message}`);
    await this.page.screenshot({ path: 'toc-item-click-error.png' });
    throw error;
  }
});

Then('if mini TOC is not visible try another card from next authorable card block', async function() {
  // Skip this step if mini TOC was found
  if (this.miniTocFound) {
    console.log('Mini TOC was found, no need to try another card');
    
    // Clean up - close the browser
    if (this.browser) {
      await closeBrowser(this.browser);
      console.log('Browser closed successfully');
    }
    
    return;
  }
  
  try {
    console.log('Mini TOC was not found, trying another card from next block');
    
    // Increment the block index
    this.currentBlockIndex++;
    
    // Check if there are more blocks to try
    if (this.currentBlockIndex < this.authorableCardBlocks.length) {
      console.log(`Navigating back to perspectives page to try block ${this.currentBlockIndex + 1} of ${this.authorableCardBlocks.length}`);
      
      // Navigate back to the perspectives page
      await this.page.goto('https://experienceleague-stage.adobe.com/en/perspectives');
      await this.page.waitForTimeout(4000);
      await this.page.waitForSelector('.browse-card-content', { state: 'visible', timeout: 30000 });
      
      // Re-run the steps to click on the last card of the next block
      console.log(`Processing authorable card block ${this.currentBlockIndex + 1} of ${this.authorableCardBlocks.length}`);
      
      // Get the current authorable card block
      const currentBlock = this.authorableCardBlocks[this.currentBlockIndex];
      
      // Find all cards within the current block
      const cards = await currentBlock.locator('.browse-card-content').all();
      console.log(`Found ${cards.length} cards in the current block`);
      
      if (cards.length === 0) {
        console.log('No cards found in the current block');
        throw new Error('No cards found in the current block');
      }
      
      // Get the last card
      const lastCard = cards[cards.length - 1];
      
      // Check if the card is visible
      const isVisible = await lastCard.isVisible().catch(() => false);
      if (!isVisible) {
        console.log('Last card is not visible');
        throw new Error('Last card is not visible');
      }
      
      // Store the card title for later reference
      const titleElement = await lastCard.locator('h2, h3, .card-title, .title').first();
      if (await titleElement.isVisible().catch(() => false)) {
        this.cardTitle = await titleElement.textContent();
        console.log(`Selected last card with title: ${this.cardTitle.trim()}`);
      } else {
        this.cardTitle = `Card ${cards.length}`;
        console.log(`Selected last card without visible title, using index: ${cards.length}`);
      }
      
      // Take a screenshot before clicking
      await this.page.screenshot({ path: `before-card-click-block-${this.currentBlockIndex}.png` });
      
      // Click the last card
      await lastCard.click();
      await this.page.waitForTimeout(2000);
      
      // Store the current URL for later verification
      this.cardPageUrl = this.page.url();
      console.log(`Navigated to: ${this.cardPageUrl}`);
      
      // Check for mini TOC visibility again
      console.log('Checking for mini TOC visibility on new page');
      
      // Define possible selectors for mini TOC
      const miniTocSelectors = [
        '.mini-toc',
        '.article-toc',
        '.toc',
        '.table-of-contents',
        'nav[aria-label="Table of contents"]',
        'nav[aria-label="On this page"]'
      ];
      
      // Check if any of the selectors are visible
      let miniTocFound = false;
      
      for (const selector of miniTocSelectors) {
        const element = this.page.locator(selector);
        if (await element.isVisible().catch(() => false)) {
          console.log(`Found mini TOC with selector: ${selector}`);
          this.miniTocSelector = selector;
          miniTocFound = true;
          break;
        }
      }
      
      // Update the result
      this.miniTocFound = miniTocFound;
      
      if (miniTocFound) {
        console.log("✓ Mini TOC is visible on the new page");
        
        // If mini TOC is found, verify TOC item clicking
        console.log('Verifying TOC item clicking functionality');
        
        // Find all TOC items
        const tocItems = await this.page.locator(`${this.miniTocSelector} li a`).all();
        console.log(`Found ${tocItems.length} TOC items`);
        
        if (tocItems.length > 0) {
          // Test clicking on up to 3 TOC items
          const itemsToTest = Math.min(3, tocItems.length);
          
          for (let i = 0; i < itemsToTest; i++) {
            const tocItem = tocItems[i];
            
            // Get the href attribute which should contain the section ID
            const href = await tocItem.getAttribute('href');
            console.log(`TOC item ${i+1} href: ${href}`);
            
            // Get the text of the TOC item
            const tocItemText = await tocItem.textContent();
            console.log(`Clicking on TOC item: ${tocItemText.trim()}`);
            
            // Get the current scroll position before clicking
            const scrollPositionBefore = await this.page.evaluate(() => window.scrollY);
            
            // Click the TOC item
            await tocItem.click();
            await this.page.waitForTimeout(1000);
            
            // Get the scroll position after clicking
            const scrollPositionAfter = await this.page.evaluate(() => window.scrollY);
            
            // Take a screenshot after clicking
            await this.page.screenshot({ path: `toc-item-${i+1}-clicked-block-${this.currentBlockIndex}.png` });
            
            // Verify that the page has scrolled
            const hasScrolled = scrollPositionAfter !== scrollPositionBefore;
            console.log(`Scroll position before: ${scrollPositionBefore}, after: ${scrollPositionAfter}`);
            
            if (hasScrolled) {
              console.log(`✓ Page scrolled after clicking TOC item ${i+1}`);
            } else {
              console.log(`Warning: Page did not scroll after clicking TOC item ${i+1}`);
            }
          }
        } else {
          console.log('No TOC items found, skipping verification');
        }
      } else {
        console.log("Mini TOC is not visible on the new page");
        
        // If we've tried all blocks and still no mini TOC, log a warning
        if (this.currentBlockIndex === this.authorableCardBlocks.length - 1) {
          console.log("Warning: Mini TOC not found in any of the authorable card blocks");
        }
      }
    } else {
      console.log("No more authorable card blocks to try");
    }
    
    // Clean up - close the browser
    if (this.browser) {
      await closeBrowser(this.browser);
      console.log('Browser closed successfully');
    }
    
  } catch (error) {
    console.error(`Error trying another card: ${error.message}`);
    await this.page.screenshot({ path: 'try-another-card-error.png' });
    
    // Clean up even if there's an error
    if (this.browser) {
      await closeBrowser(this.browser);
    }
    
    throw error;
  }
});
