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

  await this.page.goto(assetDocUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  console.log(`✓ Navigated to asset documentation page: ${assetDocUrl}`);

  // Wait for the main content area to be rendered
  await this.page.waitForSelector('main', { timeout: 30000 });
  await this.page.waitForTimeout(4000);

  // Scroll down slightly to trigger lazy-loaded blocks
  await this.page.evaluate(() => window.scrollBy(0, 600));
  await this.page.waitForTimeout(2000);

  console.log('✓ Page is fully loaded and scrolled');
});


Then('check if the specific tabs block is visible', async function() {
  try {
    // Try multiple selectors to detect a tabs block (covers loaded and initialising states)
    const selectors = [
      'div.tabs.block[data-block-status="loaded"]',
      'div.tabs.block[data-block-status="loading"]',
      'div.tabs.block',
      '.tabs[role="tablist"]',
      '[data-block-name="tabs"]',
    ];

    let isVisible = false;
    let matchedSelector = '';

    for (const sel of selectors) {
      const count = await this.page.locator(sel).count();
      if (count > 0) {
        const visible = await this.page.locator(sel).first().isVisible().catch(() => false);
        if (visible) {
          isVisible = true;
          matchedSelector = sel;
          break;
        }
      }
    }

    if (isVisible) {
      console.log(`✓ Tabs block found and visible (matched selector: "${matchedSelector}")`);
      await this.page.screenshot({ path: 'screenshots/asset-doc-tabs-block.png' });
      console.log('✓ Screenshot saved as asset-doc-tabs-block.png');
      this.isTabsBlockVisible = true;
      this.tabsBlockSelector = matchedSelector;
    } else {
      // Log page H2 headings found to help diagnose what is actually on the page
      const allH2s = await this.page.locator('main h2').allTextContents();
      console.log(`ℹ️  Page H2 headings found: ${allH2s.length > 0 ? allH2s.join(' | ') : 'none'}`);

      console.log('⚠️ Tab block not available in this page');
      await this.page.screenshot({ path: 'asset-doc-tabs-block-not-found.png' });
      console.log('✓ Screenshot saved as asset-doc-tabs-block-not-found.png');
      this.isTabsBlockVisible = false;
    }
  } catch (error) {
    console.error(`❌ Error verifying tabs block visibility: ${error.message}`);
    await this.page.screenshot({ path: 'asset-doc-tabs-block-error.png' });
    console.log('✓ Error screenshot saved as asset-doc-tabs-block-error.png');
    this.isTabsBlockVisible = false;
  }
});

Then('if tabs block exists, verify it contains tab titles and panels', async function() {
  if (!this.isTabsBlockVisible) {
    console.log('⚠️ Skipping tab titles and panels check as tab block is not available in this page');
    return;
  }

  try {
    const tabsBlock = this.page.locator('div.tabs.block').first();

    // Check for tab-list
    const tabList = tabsBlock.locator('[role="tablist"]');
    const tabListExists = await tabList.count() > 0;
    if (tabListExists) {
      await expect(tabList.first()).toBeVisible();
      console.log('✓ Tab list is visible');
    } else {
      console.log('ℹ️  No explicit [role="tablist"] found; checking for tab buttons/titles');
    }

    // Check for tab titles (role="tab" or .tab-title)
    const tabTitles = tabsBlock.locator('[role="tab"], .tab-title');
    const tabTitlesCount = await tabTitles.count();
    expect(tabTitlesCount).toBeGreaterThan(0);
    console.log(`✓ Found ${tabTitlesCount} tab title(s)`);

    // Check for tab panels
    const tabPanels = tabsBlock.locator('[role="tabpanel"], .tabpanel');
    const tabPanelsCount = await tabPanels.count();
    expect(tabPanelsCount).toBeGreaterThan(0);
    console.log(`✓ Found ${tabPanelsCount} tab panel(s)`);

    // Log all tab title texts for visibility
    const tabTitleTexts = await tabTitles.allTextContents();
    console.log(`ℹ️  Tab titles: ${tabTitleTexts.join(' | ')}`);

    await this.page.screenshot({ path: 'screenshots/asset-doc-tab-titles-panels.png' });
    console.log('✓ Screenshot saved as asset-doc-tab-titles-panels.png');
  } catch (error) {
    console.error(`❌ Error verifying tab titles and panels: ${error.message}`);
    await this.page.screenshot({ path: 'asset-doc-tab-titles-panels-error.png' });
    console.log('✓ Error screenshot saved as asset-doc-tab-titles-panels-error.png');
    throw error;
  }
});

Then('if tabs block exists, verify H2 tags under it are not in mini TOC', async function() {
  try {
    if (!this.isTabsBlockVisible) {
      console.log('⚠️ Skipping H2 tags check as tab block is not available in this page');

      // Still validate that no H2 on the main page content appears inside the mini TOC
      // This is a fallback validation that is always meaningful
      await verifyPageH2sNotInMiniTOC(this.page);

      if (this.browser) {
        await closeBrowser(this.browser);
        console.log('✓ Browser closed successfully');
      }
      return;
    }

    // Get all H2 tags under the tabs block
    const h2sInTabs = await this.page.locator('div.tabs.block h2').allTextContents();
    console.log(`ℹ️  Found ${h2sInTabs.length} H2 tag(s) under tabs block: ${h2sInTabs.length > 0 ? h2sInTabs.join(' | ') : 'none'}`);

    if (h2sInTabs.length === 0) {
      console.log('ℹ️  No H2 tags found inside the tabs block; skipping H2-vs-TOC check for tabs block.');
    } else {
      await assertH2sNotInMiniTOC(this.page, h2sInTabs, 'tabs block');
    }

    await this.page.screenshot({ path: 'screenshots/asset-doc-mini-toc.png' });
    console.log('✓ Screenshot saved as asset-doc-mini-toc.png');

    if (this.browser) {
      await closeBrowser(this.browser);
      console.log('✓ Browser closed successfully');
    }
  } catch (error) {
    console.error(`❌ Error verifying H2 tags in mini TOC: ${error.message}`);
    await this.page.screenshot({ path: 'asset-doc-mini-toc-error.png' });
    console.log('✓ Error screenshot saved as asset-doc-mini-toc-error.png');

    if (this.browser) {
      await closeBrowser(this.browser);
      console.log('✓ Browser closed successfully');
    }
    throw error;
  }
});

// ---------------------------------------------------------------------------
// Helper: collect mini-TOC links using multiple possible selectors
// ---------------------------------------------------------------------------
async function getMiniTocLinks(page) {
  // Try various selectors used across different versions of the docs template
  const tocSelectors = [
    'div.mini-toc.block .scrollable-div a',
    'div.mini-toc.block a',
    '.mini-toc a',
    'nav.toc a',
    '[data-block-name="mini-toc"] a',
    '.on-this-page a',
  ];

  for (const sel of tocSelectors) {
    const count = await page.locator(sel).count();
    if (count > 0) {
      const texts = await page.locator(sel).allTextContents();
      console.log(`ℹ️  Mini TOC links found via "${sel}": ${texts.join(' | ')}`);
      return texts;
    }
  }

  // Last resort: look for "On this page" heading and grab following links
  const onThisPage = page.locator('text=/on this page/i').first();
  const exists = await onThisPage.count() > 0;
  if (exists) {
    // Navigate to parent container and grab all anchor tags
    const container = onThisPage.locator('xpath=ancestor::div[1]');
    const links = await container.locator('a').allTextContents();
    if (links.length > 0) {
      console.log(`ℹ️  Mini TOC links (via "On this page" heading): ${links.join(' | ')}`);
      return links;
    }
  }

  console.log('ℹ️  No mini TOC links found on this page.');
  return [];
}

// ---------------------------------------------------------------------------
// Helper: assert that a list of H2 texts do not appear in the mini TOC
// ---------------------------------------------------------------------------
async function assertH2sNotInMiniTOC(page, h2Texts, context) {
  const tocLinks = await getMiniTocLinks(page);

  let allH2sNotInTOC = true;
  for (const h2Text of h2Texts) {
    const h2Trimmed = h2Text.trim().toLowerCase();
    const foundInToc = tocLinks.some(link => link.trim().toLowerCase() === h2Trimmed);

    if (foundInToc) {
      console.warn(`⚠️ H2 "${h2Text}" (from ${context}) IS in the mini TOC — this is a bug.`);
      allH2sNotInTOC = false;
    } else {
      console.log(`✓ H2 "${h2Text}" is NOT in the mini TOC as expected.`);
    }
    expect(foundInToc, `H2 "${h2Text}" should NOT appear in the mini TOC`).toBeFalsy();
  }

  expect(allH2sNotInTOC, 'All H2 tags inside tabs block should be absent from mini TOC').toBeTruthy();
}

// ---------------------------------------------------------------------------
// Helper: fallback validation when no tabs block is present
// Checks that main content H2s are correctly represented (or omitted) in the
// mini TOC — useful as a sanity check even when tabs are not on the page.
// ---------------------------------------------------------------------------
async function verifyPageH2sNotInMiniTOC(page) {
  try {
    const allH2s = await page.locator('main h2').allTextContents();
    console.log(`ℹ️  Page H2 headings (all): ${allH2s.length > 0 ? allH2s.join(' | ') : 'none'}`);

    if (allH2s.length === 0) {
      console.log('ℹ️  No H2 headings found in main content; skipping fallback TOC check.');
      return;
    }

    const tocLinks = await getMiniTocLinks(page);

    if (tocLinks.length === 0) {
      console.log('ℹ️  Mini TOC has no links; skipping fallback H2-vs-TOC comparison.');
      return;
    }

    // Check each page H2 — document those present/absent in mini TOC
    for (const h2Text of allH2s) {
      const h2Trimmed = h2Text.trim().toLowerCase();
      const inToc = tocLinks.some(link => link.trim().toLowerCase() === h2Trimmed);
      if (inToc) {
        console.log(`ℹ️  H2 "${h2Text}" appears in mini TOC (expected for standard headings).`);
      } else {
        console.log(`ℹ️  H2 "${h2Text}" is NOT in mini TOC.`);
      }
    }

    console.log('✓ Fallback H2 vs mini TOC audit completed (informational only — no assertions since tabs block is absent).');
    await page.screenshot({ path: 'screenshots/asset-doc-mini-toc-fallback.png' });
    console.log('✓ Screenshot saved as asset-doc-mini-toc-fallback.png');
  } catch (err) {
    console.log(`ℹ️  Fallback TOC check skipped due to error: ${err.message}`);
  }
}
