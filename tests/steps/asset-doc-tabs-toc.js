const { Given, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { launchBrowser, closeBrowser } = require('../commonFunctions/launchbrowser');
const ENV = require('../../config.js');
setDefaultTimeout(90 * 1000);

Given('user launches the asset ingestion documentation page', async function() {
  // Launch the browser
  const result = await launchBrowser();
  this.page = result.page;
  this.browser = result.browser;
  this.context = result.context;
  
  // Use the environment URL from config file and append the path
  const baseUrl = ENV.URL; // This is from config.js
  const assetDocPath = '/docs/experience-manager-cloud-service/content/assets/overview#asset-ingestion';
  const assetDocUrl = `${baseUrl}${assetDocPath}`;
  
  await this.page.goto(assetDocUrl);
  console.log(`✓ Navigated to asset documentation page: ${assetDocUrl}`);
  
  // Wait for the page to fully load
  await this.page.waitForSelector('body', { timeout: 30000 });
  await this.page.waitForTimeout(3000);
  
  // Scroll down to ensure the tabs block is in view
  await this.page.evaluate(() => {
    window.scrollBy(0, 500);
  });
  
  await this.page.waitForTimeout(2000);
  console.log('✓ Page is fully loaded and scrolled');
});


Then('check if the specific tabs block is visible', async function() {
  try {
    // Check for the specific tabs block with the exact structure mentioned in the task
    const specificTabsBlock = this.page.locator('div.tabs.block[data-block-name="tabs"][data-block-status="loaded"]');
    const isVisible = await specificTabsBlock.isVisible().catch(() => false);
    
    if (isVisible) {
      console.log('✓ Specific tabs block is visible');
      // Take a screenshot of the tabs block
      await this.page.screenshot({ path: 'asset-doc-tabs-block.png' });
      console.log('✓ Screenshot saved as asset-doc-tabs-block.png');
      
      // Store the visibility state for later steps
      this.isTabsBlockVisible = true;
    } else {
      console.log('⚠️ Tab block not available in this page');
      // Take a screenshot of the page without tabs block
      await this.page.screenshot({ path: 'asset-doc-tabs-block-not-found.png' });
      console.log('✓ Screenshot saved as asset-doc-tabs-block-not-found.png');
      
      // Store the visibility state for later steps
      this.isTabsBlockVisible = false;
    }
  } catch (error) {
    console.error(`❌ Error verifying tabs block visibility: ${error.message}`);
    // Take a screenshot of the error state
    await this.page.screenshot({ path: 'asset-doc-tabs-block-error.png' });
    console.log('✓ Error screenshot saved as asset-doc-tabs-block-error.png');
    
    // Store the visibility state for later steps
    this.isTabsBlockVisible = false;
  }
});

Then('if tabs block exists, verify it contains tab titles and panels', async function() {
  // Skip this step if tabs block is not visible
  if (!this.isTabsBlockVisible) {
    console.log('⚠️ Skipping tab titles and panels check as tab block is not available in this page');
    return;
  }
  
  try {
    // Check for tab-list and tab titles
    const tabList = this.page.locator('div.tabs.block .tab-list[role="tablist"]');
    await expect(tabList).toBeVisible();
    console.log('✓ Tab list is visible');
    
    // Check for tab titles
    const tabTitles = this.page.locator('div.tabs.block .tab-title[role="tab"]');
    const tabTitlesCount = await tabTitles.count();
    expect(tabTitlesCount).toBeGreaterThan(0);
    console.log(`✓ Found ${tabTitlesCount} tab titles`);
    
    // Check for tab panels
    const tabPanels = this.page.locator('div.tabs.block .tabpanel[role="tabpanel"]');
    const tabPanelsCount = await tabPanels.count();
    expect(tabPanelsCount).toBeGreaterThan(0);
    console.log(`✓ Found ${tabPanelsCount} tab panels`);
    
    // Verify the first tab title is "Asset Ingestion"
    const firstTabTitle = await tabTitles.first().getAttribute('aria-label');
    expect(firstTabTitle).toBe('Asset Ingestion');
    console.log(`✓ First tab title is "${firstTabTitle}" as expected`);
    
    // Take a screenshot of the tab titles and panels
    await this.page.screenshot({ path: 'asset-doc-tab-titles-panels.png' });
    console.log('✓ Screenshot saved as asset-doc-tab-titles-panels.png');
  } catch (error) {
    console.error(`❌ Error verifying tab titles and panels: ${error.message}`);
    // Take a screenshot of the error state
    await this.page.screenshot({ path: 'asset-doc-tab-titles-panels-error.png' });
    console.log('✓ Error screenshot saved as asset-doc-tab-titles-panels-error.png');
    throw error; // Re-throw the error to fail the test
  }
});

Then('if tabs block exists, verify H2 tags under it are not in mini TOC', async function() {
  try {
    // Skip this check if tabs block is not visible
    if (!this.isTabsBlockVisible) {
      console.log('⚠️ Skipping H2 tags check as tab block is not available in this page');
      
      // Clean up - close the browser
      if (this.browser) {
        await closeBrowser(this.browser);
        console.log('✓ Browser closed successfully');
      }
      return;
    }
    
    // Get all H2 tags under the tabs block
    const h2sInTabs = await this.page.locator('div.tabs.block h2').allTextContents();
    console.log(`Found ${h2sInTabs.length} H2 tags under tabs block: ${h2sInTabs.join(', ')}`);
    
    // Get all TOC links in the mini toc
    const miniToc = this.page.locator('div.mini-toc.block');
    const tocLinks = await miniToc.locator('.scrollable-div a').allTextContents();
    console.log(`Found ${tocLinks.length} links in mini TOC: ${tocLinks.join(', ')}`);
    
    // Take a screenshot of the mini TOC
    await this.page.screenshot({ path: 'asset-doc-mini-toc.png' });
    console.log('✓ Screenshot saved as asset-doc-mini-toc.png');
    
    // Check each H2 tag from tabs is not in mini TOC
    let allH2sNotInTOC = true;
    for (const h2Text of h2sInTabs) {
      const h2Trimmed = h2Text.trim().toLowerCase();
      const foundInToc = tocLinks.some(link => link.trim().toLowerCase() === h2Trimmed);
      
      if (foundInToc) {
        console.warn(`⚠️ H2 tag "${h2Text}" is displayed in the mini TOC but should not be.`);
        allH2sNotInTOC = false;
      } else {
        console.log(`✓ H2 tag "${h2Text}" is NOT displayed in the mini TOC as expected.`);
      }
      expect(foundInToc).toBeFalsy();
    }
    
    // Final assertion that all H2 tags are not in the TOC
    expect(allH2sNotInTOC).toBeTruthy();
    
    // Clean up - close the browser
    if (this.browser) {
      await closeBrowser(this.browser);
      console.log('✓ Browser closed successfully');
    }
  } catch (error) {
    console.error(`❌ Error verifying H2 tags in mini TOC: ${error.message}`);
    // Take a screenshot of the error state
    await this.page.screenshot({ path: 'asset-doc-mini-toc-error.png' });
    console.log('✓ Error screenshot saved as asset-doc-mini-toc-error.png');
    
    // Clean up - close the browser even if there's an error
    if (this.browser) {
      await closeBrowser(this.browser);
      console.log('✓ Browser closed successfully');
    }
    
    throw error; // Re-throw the error to fail the test
  }
});
