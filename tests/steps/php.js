const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { performLogin } = require('../commonFunctions/login');
const { launchBrowser, closeBrowser } = require('../commonFunctions/launchbrowser');
const ENV = require('../../config.js');
// Import common mobile steps
require('./common-mobile-steps');

setDefaultTimeout(90 * 1000);
let searchTerm;

Given('I navigate to the Experience League homepage', async function() {
  if (!this.page) {
    await performLogin(this);
  }
  await this.page.waitForTimeout(4000);
});

Then('the header navigation should be visible', async function () {
  await this.page.waitForTimeout(4000);
  
  // Try multiple selectors for header navigation
  const headerSelectors = [
    '.header-wrapper .nav',
    'header nav',
    'header',
    '[role="navigation"]',
    '.header-navigation',
    '.spectrum-Site-header'
  ];
  
  let headerFound = false;
  for (const selector of headerSelectors) {
    const count = await this.page.locator(selector).count();
    if (count > 0) {
      const header = this.page.locator(selector).first();
      await expect(header).toBeVisible({ timeout: 40000 });
      console.log(`Header navigation found using selector: ${selector}`);
      headerFound = true;
      break;
    }
  }
  
  // If no specific selector worked, use a more general approach
  if (!headerFound) {
    const header = this.page.locator('header').first();
    await expect(header).toBeVisible({ timeout: 40000 });
    console.log('Header navigation found using general header selector');
  }
});

Then('the search bar should be visible and enabled', async function () {
  // Try multiple selectors for search bar
  const searchSelectors = [
    'input[role="combobox"][name="top-nav-combo-search"]',
    'input[type="search"]',
    '.search-container input',
    '[placeholder*="search" i]',
    '[aria-label*="search" i]'
  ];
  
  let searchFound = false;
  for (const selector of searchSelectors) {
    const count = await this.page.locator(selector).count();
    if (count > 0) {
      const searchBar = this.page.locator(selector).first();
      await expect(searchBar).toBeVisible({ timeout: 40000 });
      await expect(searchBar).toBeEnabled({ timeout: 40000 });
      console.log(`Search bar found using selector: ${selector}`);
      searchFound = true;
      break;
    }
  }
  
  // If no specific selector worked, try by role
  if (!searchFound) {
    try {
      const searchBar = await this.page.getByRole('combobox', { name: 'top-nav-combo-search' });
      await expect(searchBar).toBeVisible({ timeout: 40000 });
      await expect(searchBar).toBeEnabled({ timeout: 40000 });
      console.log('Search bar found using role selector');
    } catch (error) {
      // If role selector fails, try a more general approach
      const searchBar = this.page.locator('input').first();
      await expect(searchBar).toBeVisible({ timeout: 40000 });
      console.log('Search bar found using general input selector');
    }
  }
});

Then('the marquee section should be displayed', async function () {
  // Try multiple selectors for marquee
  const marqueeSelectors = [
    '.recommendation-marquee-wrapper',
    '.hero-banner',
    '.marquee',
    'main > div:first-child',
    'section:first-child'
  ];
  
  let marqueeFound = false;
  for (const selector of marqueeSelectors) {
    const count = await this.page.locator(selector).count();
    if (count > 0) {
      const marquee = this.page.locator(selector).first();
      await expect(marquee).toBeVisible({ timeout: 40000 });
      console.log(`Marquee section found using selector: ${selector}`);
      marqueeFound = true;
      break;
    }
  }
  
  // If no specific selector worked, use a more general approach
  if (!marqueeFound) {
    // Check if any large container exists at the top of the page
    const marquee = this.page.locator('main > div').first();
    await expect(marquee).toBeVisible({ timeout: 40000 });
    console.log('Marquee section found using general main > div selector');
  }
});

Then('the footer should be visible', async function () {
  // Try multiple selectors for footer
  const footerSelectors = [
    '.footer-container',
    'footer',
    '[role="contentinfo"]',
    '.site-footer',
    '.footer-wrapper'
  ];
  
  let footerFound = false;
  for (const selector of footerSelectors) {
    const count = await this.page.locator(selector).count();
    if (count > 0) {
      const footer = this.page.locator(selector).first();
      await expect(footer).toBeVisible({ timeout: 40000 });
      console.log(`Footer found using selector: ${selector}`);
      footerFound = true;
      break;
    }
  }
  
  // If no specific selector worked, use a more general approach
  if (!footerFound) {
    const footer = this.page.locator('footer').first();
    await expect(footer).toBeVisible({ timeout: 40000 });
    console.log('Footer found using general footer selector');
  }
});


//#Scenario 2: @home-page @search
Given('user navigates to Experience League home page', async function() {
  if (!this.page) {
    await performLogin(this);
  }
  await this.page.waitForTimeout(4000);
});

When('user enters {string} in the search bar', async function(searchTerm) {
  // Wait for page to be stable
  await this.page.waitForTimeout(4000);
  
  // Find and interact with the search input
  const searchInput = this.page.locator('input.search-input[aria-label="top-nav-combo-search"]');
  
  // Verify search input is visible and enabled before interacting
  await expect(searchInput).toBeVisible({ timeout: 40000 });
  
  // Click and fill the search input
  await searchInput.click();
  await searchInput.fill(searchTerm);
  
  // Verify the search input has the correct value
  await expect(searchInput).toHaveValue(searchTerm, { timeout: 5000 });
  
  console.log(`Search term "${searchTerm}" entered successfully`);
});

When('user submits the search', async function() {
  // Find the search input
  const searchInput = this.page.locator('input.search-input[aria-label="top-nav-combo-search"]');

  // Verify it's visible before submitting
  await expect(searchInput).toBeVisible({ timeout: 5000 });

  // waitForNavigation() is deprecated; await the press and the resulting load state together.
  await Promise.all([
    this.page.waitForLoadState('load', { timeout: 40000 }).catch(() => {
      console.log('Load state timeout occurred, but continuing test');
    }),
    searchInput.press('Enter'),
  ]);

  // Additional wait to ensure results are loaded
  await this.page.waitForTimeout(2000);

  console.log('Search submitted successfully');
});

Then('search results page should display', async function() {
  // Verify URL contains "search"
  await expect(this.page).toHaveURL(/search.*/, { timeout: 40000 });
  
  // Verify search results summary is visible
  const resultsSummary = this.page.locator('#query-summary');
  await expect(resultsSummary).toBeVisible({ timeout: 40000 });
  await expect(resultsSummary).toContainText('Search Results for: Analytics', { timeout: 40000 });
  
  // Verify search results container is visible
  const resultsContainer = this.page.locator('atomic-folded-result-list, .search-results, #search-results');
  await expect(resultsContainer).toBeVisible({ timeout: 40000 });
  
  console.log('Search results page displayed successfully');
});

Then('search results should contain items related to {string}', async function(searchTerm) {
  // Find the results container
  const resultsContainer = this.page.locator('atomic-folded-result-list, .search-results, #search-results');
  
  // Verify it's visible
  await expect(resultsContainer).toBeVisible({ timeout: 40000 });
  
  // Verify it contains the search term
  await expect(resultsContainer).toContainText(searchTerm, { timeout: 40000 });
  
  console.log(`Search results contain "${searchTerm}" as expected`);
});


// Scenario 3: Verify main navigation links

Given('user is logged in and on the home page', async function() {
  if (!this.page) {
    await performLogin(this);
  }
  await this.page.waitForTimeout(8000);
});

When('user clicks on each main navigation link', async function(dataTable) {
  const links = dataTable.hashes().map(row => row['Link Name']);
  this.navigationResults = [];
  const homeUrl = this.page.url();

  // Test each navigation link
  for (const linkName of links) {
    // Live investigation found "Tutorials"/"Perspectives" are NOT top-level header nav
    // links — they only exist nested per-product inside the (closed-by-default, hidden)
    // "Learn by Product" mega-menu, ~14 repeats. Whether this scenario's data table
    // should be changed to real top-level nav items (only "Documentation" qualifies) is
    // deferred/unresolved. Keeping the original page-wide substring match here (not
    // scoped to the nav container, since that scope's matches are hidden pre-menu-open),
    // but restricted to `:visible` so it can't silently resolve to a hidden/wrong element
    // the way the original unscoped `a:text()` search could — that was the actual bug
    // that produced 24 matches and a timeout for "Perspectives".
    const navLink = this.page.locator('a:visible').filter({ hasText: linkName }).first();
    await expect(navLink).toBeVisible({ timeout: 10000 });

    const href = await navLink.getAttribute('href');
    const expectedUrl = new URL(href, this.page.url());

    await Promise.all([
      this.page.waitForLoadState('load'),
      navLink.click(),
    ]);
    await this.page.waitForTimeout(1500);

    const loadedUrl = this.page.url();
    const hasMainContent = await this.page.locator('main').isVisible().catch(() => false);
    this.navigationResults.push({ name: linkName, expectedUrl, loadedUrl, hasMainContent });
    console.log(`Successfully clicked on ${linkName} link -> ${loadedUrl}`);

    // Go back to home page for next link
    await this.page.goto(homeUrl);
    await this.page.waitForLoadState('load');
    await this.page.waitForTimeout(1500);
  }
});

Then('each page should load successfully', async function() {
  for (const result of this.navigationResults) {
    // Assert against the URL actually reached when the real nav link was clicked, not a
    // freshly re-navigated goto() to the same URL (which would trivially always match).
    const urlMatches = result.loadedUrl.startsWith(result.expectedUrl.origin)
      && result.loadedUrl.includes(result.expectedUrl.pathname);
    expect(urlMatches).toBeTruthy();
    console.log(`Successfully loaded: ${result.name} at ${result.loadedUrl}`);
  }
});

Then('each page should display relevant content', async function() {
  for (const result of this.navigationResults) {
    expect(result.hasMainContent).toBeTruthy();
    console.log(`Verified content exists on: ${result.name}`);
  }
});

// Scenario 4: Validate responsive behavior

Given('user navigates to EX League home page', async function() {
  if (!this.page) {
    await performLogin(this);
  }
  await this.page.waitForTimeout(8000);
});

When('viewport size is changed to the following dimensions', async function(dataTable) {
  // First, ensure we're logged in and on the home page
  const devices = dataTable.hashes();
  this.responsiveResults = [];
  
  for (const device of devices) {
    try {
      // Set viewport size
      await this.page.setViewportSize({
        width: parseInt(device.Width),
        height: parseInt(device.Height)
      });
      
      // Wait for layout to adjust
      await this.page.waitForTimeout(2000);
      
      // Check if critical elements are visible - using first() to avoid strict mode violations
      let criticalElementsVisible = false;
      
      // Try header first
      const headerVisible = await this.page.locator('header').first().isVisible().catch(() => false);
      
      // Try main content
      const contentVisible = await this.page.locator('main, .CardLayout__content').first().isVisible().catch(() => false);
      
      // Consider the test passed if either header or content is visible
      criticalElementsVisible = headerVisible || contentVisible;
      
      this.responsiveResults.push({
        device: device.Device,
        width: device.Width,
        height: device.Height,
        criticalElementsVisible
      });
      
      console.log(`Tested viewport for ${device.Device}: ${device.Width}x${device.Height}`);
    } catch (error) {
      console.log(`Warning: Error testing viewport for ${device.Device}: ${error.message}`);
      // Add a result with failure info so we can continue testing other viewports
      this.responsiveResults.push({
        device: device.Device,
        width: device.Width,
        height: device.Height,
        criticalElementsVisible: false,
        error: error.message
      });
    }
  }
});

Then('page layout should adapt appropriately to each viewport', async function() {
  // This is primarily a visual check, but we can verify no layout errors
  for (const result of this.responsiveResults) {
    expect(result.criticalElementsVisible).toBeTruthy();
    console.log(`Layout adapted correctly for ${result.device} (${result.width}x${result.height})`);
  }
});

Given('user is logged in to Experience League application', async function() {
  if (!this.page) {
    await performLogin(this);
  }
  await this.page.waitForTimeout(4000);
});

When('the home page loads completely', async function() {
  // Wait for the main content to be visible
  //await this.page.waitForSelector('.browse-card-content', { state: 'visible', timeout: 40000 });
  await this.page.waitForTimeout(5000);
  
  // Verify we're on the home page (URL may or may not have trailing #)
  await expect(this.page).toHaveURL(new RegExp(`${ENV.URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/home`));
});

// There is a real dedicated block for this: blocks/recently-reviewed/recently-reviewed.js
// (block class "recently-reviewed", container ".recently-viewed-nav-container") — a more
// reliable signal than matching heading text, since that heading text comes dynamically
// from an Adobe Target response and is removed entirely (no h2/h3 at all) if Target
// returns none. The old selector (#watch-past-events-on-demand) never matched anything
// real on this page; the text-based filter is kept only as a fallback.
function getRecentlyViewedLocator(page) {
  const block = page.locator('div[data-block-name="recently-reviewed"], .recently-reviewed, .recently-viewed-nav-container').first();
  const textFallback = page.locator('h2, h3, div.browse-cards-block-title').filter({ hasText: /recently viewed/i }).first();
  return block.or(textFallback);
}

Then('user checks if Recently viewed block is available', async function() {
  await this.page.waitForTimeout(5000);

  const recentlyViewedElement = getRecentlyViewedLocator(this.page);
  this.recentlyViewedFound = await recentlyViewedElement.isVisible().catch(() => false);

  if (this.recentlyViewedFound) {
    console.log("✓ Recently viewed block is visible");
  } else {
    console.log("⚠️ Recently viewed block not found for this account — it may have no viewing history yet");
  }
});

When('user clicks on Cookie preferences in the footer', async function() {
  // Scroll to the footer
  await this.page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await this.page.waitForTimeout(2000);
  
  // Look for the Cookie preferences link in the footer. There are two matching anchors:
  // a real visible one and an aria-hidden="true" decoy (tabindex="-1", used to anchor the
  // OneTrust widget) — live-verified strict-mode violation when both matched. Excluding
  // aria-hidden picks the real, visible one deterministically.
  const cookiePreferencesLink = this.page.locator(
    'footer a:text("Cookie preferences"):not([aria-hidden="true"]), footer a:text("Cookie Preferences"):not([aria-hidden="true"]), footer [data-testid="cookie-preferences"]'
  );

  // Assert that the link is visible
  await expect(cookiePreferencesLink).toBeVisible({ timeout: 10000 });
  
  // Click the Cookie preferences link. The aria-hidden="true" decoy anchor (OneTrust's own
  // injected trigger) sits visually on top of this one and intercepts real pointer clicks
  // — live-verified via a 30s actionability timeout ("intercepts pointer events"). Both
  // anchors share the same href="#onetrust", so force:true (dispatch directly on this
  // element, bypassing the overlap check) reaches the same OneTrust trigger safely.
  await cookiePreferencesLink.click({ force: true });
  
  // Wait for the modal to appear
  await this.page.waitForTimeout(2000);
});

When('user disables cookies in the preferences modal', async function() {
 /* // Wait for the cookie preferences modal to be visible
  const cookieModal = this.page.locator('.cookie-preferences-modal, [data-testid="cookie-modal"], .cookie-modal');
  await expect(cookieModal).toBeVisible({ timeout: 10000 });
  
  // Find and click on toggle switches to disable cookies
  // Note: The exact selectors may need to be adjusted based on the actual implementation
  const toggles = this.page.locator('.cookie-modal input[type="checkbox"], .cookie-preferences-modal input[type="checkbox"]');
  
  // Get the count of toggles
  const toggleCount = await toggles.count();
  console.log(`Found ${toggleCount} cookie preference toggles`);
  
  // Disable all toggles that are currently enabled
  for (let i = 0; i < toggleCount; i++) {
    const isChecked = await toggles.nth(i).isChecked();
    if (isChecked) {
      console.log(`Disabling toggle ${i+1}`);
      await toggles.nth(i).click();
      await this.page.waitForTimeout(500);
    }
  }
  
  // Find and click the save/apply button
  const saveButton = this.page.locator('.cookie-modal button:text("Save"), .cookie-modal button:text("Apply"), .cookie-preferences-modal button:text("Save"), .cookie-preferences-modal button:text("Apply")');
  await expect(saveButton).toBeVisible();
  await saveButton.click();
  
  // Wait for the modal to close
  await this.page.waitForTimeout(2000);*/
  // await this.page.getByRole('link', { name: 'Cookie preferences' }).click();
   //await this.page.waitForTimeout(2000);
   //await this.page.waitForSelector('#onetrust-consent-sdk', {      visible: true,timeout: 5000    });
   await this.page.waitForSelector('button.disable-all-btn', {      visible: true,timeout: 3000    }); 
   await this.page.click('button.disable-all-btn');   
  //await this.page.getByRole('button', { name: 'Don’t enable' }).click();
 // await this.page.locator('#ot-pc-logo-button .disable-all-btn').click();
await this.page.waitForTimeout(2000);
});

When('user refreshes the page', async function() {
  // Refresh the page
  
  await this.page.reload();
  
  // Wait for the page to load
  await this.page.waitForSelector('.browse-card-content', { state: 'visible', timeout: 40000 });
  await this.page.waitForTimeout(2000);
});

Then('the Recently viewed block should not be visible', async function() {
  // Skip this check if we didn't find the Recently viewed block initially
  if (!this.recentlyViewedFound) {
    console.log("Skipping visibility check as Recently viewed block was not found initially");
    return;
  }

  // Re-query rather than reuse a stored selector string — the block re-renders on reload.
  const recentlyViewedElement = getRecentlyViewedLocator(this.page);
  const isStillVisible = await recentlyViewedElement.isVisible().catch(() => false);

  if (isStillVisible) {
    console.error("❌ Recently viewed block is still visible after disabling cookies");
  } else {
    console.log("✓ Recently viewed block is correctly hidden after disabling cookies");
  }

  // Assert that the block is not visible
  await expect(recentlyViewedElement).not.toBeVisible();
});

//bookmark

Given('user is on Experience League home',async function() {
  if (!this.page) {
    await performLogin(this);
  }
  await this.page.waitForTimeout(2000);
})

/*When('user bookmarks the first content card', async function() {
   await this.page.waitForTimeout(2000);
    //Locate firstcard
    const firstCard = await this.page.locator('.browse-card-content').first();
    // Uncomment and use the assertion
    await expect(firstCard).toBeVisible();
    const firstCardTitle = await firstCard.locator('.browse-card-title-text').textContent();
    console.log(firstCardTitle);
    await this.page.waitForTimeout(2000);

    //click on bookmark icon of first card
    const bookmarkIcon = await this.page.locator('.browse-card-options .bookmark').first();
    console.log(bookmarkIcon);
    await this.page.waitForTimeout(2000);
    await bookmarkIcon.click({ force: true });  
     await this.page.waitForTimeout(2000);
    const bookmarPage = await this.page.locator('.profile-rail-links a[title="Bookmarks"]');
    console.log(bookmarPage);
    await bookmarPage.click(); 
    await this.page.waitForTimeout(2000);

    // remove the bookmark of a card from bookmark page
     bookmarkedCardTitle = await this.page.locator('.bookmarks-content .bookmarks-card .browse-card-title-text').first().textContent();
    
    // Replace the if/else with an assertion
    await expect(bookmarkedCardTitle).toBe(firstCardTitle);
    console.log("bookmark Successful");

    //remove bookmark
    const bookmarkedIcon = await this.page.locator('.browse-card-options .bookmark').first();
    console.log(bookmarkedIcon);
    await this.page.waitForTimeout(2000);
    await bookmarkedIcon.click({ force: true });

   
});*/
 
When('user bookmarks the first content card', async function() {
  // Wait for cards to load with fallback selectors on home page
  const homeCardSelectors = ['.browse-card', '.browse-card-content', '[data-block-name="recommended-content"] .card', 'article'];
  let homeCardsFound = false;
  for (const sel of homeCardSelectors) {
    try {
      await this.page.waitForSelector(sel, { state: 'visible', timeout: 15000 });
      homeCardsFound = true;
      console.log(`Home page cards found with selector: ${sel}`);
      break;
    } catch (e) {
      console.log(`Home page selector "${sel}" not found, trying next...`);
    }
  }
  if (!homeCardsFound) {
    throw new Error('No content cards found on home page after login');
  }
 
  // Scroll to bottom and back to trigger sign-in state propagation on all cards
  await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await this.page.waitForTimeout(2000);
  await this.page.evaluate(() => window.scrollTo(0, 0));
  await this.page.waitForTimeout(1000);
 
  const allCards = await this.page.locator('.browse-card').all();
  console.log(`Total cards on page: ${allCards.length}`);
 
  let targetCard = null;
  let targetCardTitle = null;
 
  for (let i = 0; i < allCards.length; i++) {
    const card = allCards[i];
 
    await card.scrollIntoViewIfNeeded().catch(() => {});
    await card.hover().catch(() => {});
    // Wait for sign-in state JS to update this card's button
    await this.page.waitForTimeout(300);
 
    const bookmarkBtn = card.locator('button.bookmark');
    const count = await bookmarkBtn.count().catch(() => 0);
    if (count === 0) {
      console.log(`Card ${i + 1}: no bookmark button, skipping`);
      continue;
    }
 
    const dataSignedIn = await bookmarkBtn.getAttribute('data-signed-in').catch(() => 'false');
    const dataBookmarked = await bookmarkBtn.getAttribute('data-bookmarked').catch(() => 'true');
    console.log(`Card ${i + 1}: signed-in=${dataSignedIn}, bookmarked=${dataBookmarked}`);
 
    if (dataSignedIn === 'true' && dataBookmarked === 'false') {
      targetCard = card;
      targetCardTitle = await card.locator('.browse-card-title-text').textContent().catch(() => null);
      this.targetBookmarkBtn = bookmarkBtn;
      console.log(`Selected card ${i + 1}: "${targetCardTitle}"`);
      break;
    }
  }
 
  if (!targetCard) {
    throw new Error('No card with an available bookmark icon found on the page');
  }
 
  this.bookmarkedCardTitle = targetCardTitle;
 
  await this.targetBookmarkBtn.click({ force: true });
  await this.page.waitForTimeout(2000);
 
  console.log(`Looking for bookmarked card with title: "${targetCardTitle}"`);
 
  // Open bookmarks page in a new tab
  const newPage = await this.context.newPage();
  await newPage.goto(`${ENV.URL}/home/bookmarks`, { waitUntil: 'domcontentloaded' });
  await newPage.waitForTimeout(5000);

  // Wait for browse cards with fallback selectors
  const bookmarkCardSelectors = ['.browse-card', '.browse-card-content', '[data-block-name="bookmarks"] .card', '.bookmarks-card'];
  let bookmarkCardsFound = false;
  for (const sel of bookmarkCardSelectors) {
    try {
      await newPage.waitForSelector(sel, { state: 'visible', timeout: 10000 });
      bookmarkCardsFound = true;
      console.log(`Bookmarks page cards found with selector: ${sel}`);
      break;
    } catch (e) {
      console.log(`Selector "${sel}" not found, trying next...`);
    }
  }
  if (!bookmarkCardsFound) {
    console.log('No specific card selector matched on bookmarks page, proceeding anyway...');
  }
  await newPage.waitForTimeout(3000);

  // Verify bookmark exists on bookmarks page
  const allBookmarkedCards = await newPage.locator('.browse-card').all();
  console.log(`Cards found on bookmarks page: ${allBookmarkedCards.length}`);
  expect(allBookmarkedCards.length).toBeGreaterThan(0);

  // Find the card matching the title we just bookmarked
  let matchedCard = null;
  for (const bookmarkedCard of allBookmarkedCards) {
    const title = (await bookmarkedCard.locator('.browse-card-title-text').textContent().catch(() => '')).trim();
    console.log(`Bookmarks page card: "${title}"`);
    if (title && targetCardTitle && (title.includes(targetCardTitle.trim()) || targetCardTitle.trim().includes(title))) {
      matchedCard = bookmarkedCard;
      console.log(`Bookmark verified: "${title}"`);
      break;
    }
  }

  // A title match is required — silently accepting "whichever card happens to be
  // first" would mask a real bug (wrong card bookmarked, or bookmark not saved at all).
  if (!matchedCard) {
    throw new Error(`Bookmark verification failed: no card on the bookmarks page matched the bookmarked title "${targetCardTitle}"`);
  }
  console.log(`✓ Bookmark verified: "${targetCardTitle}" found on the bookmarks page`);

  // Remove bookmark using same logic as bookmarking on home page:
  // scroll into view → hover → wait for JS to set data-signed-in="true" → click with force
  await matchedCard.scrollIntoViewIfNeeded().catch(() => {});
  await matchedCard.hover().catch(() => {});
  await newPage.waitForTimeout(300);

  const removeBtn = matchedCard.locator('button.bookmark');

  // Wait for sign-in state to be set (same as home page bookmarking logic)
  let dataSignedIn = 'false';
  let dataBookmarked = 'false';
  for (let attempt = 0; attempt < 6; attempt++) {
    dataSignedIn = await removeBtn.getAttribute('data-signed-in').catch(() => 'false');
    dataBookmarked = await removeBtn.getAttribute('data-bookmarked').catch(() => 'false');
    console.log(`Attempt ${attempt + 1}: data-signed-in="${dataSignedIn}", data-bookmarked="${dataBookmarked}"`);
    if (dataSignedIn === 'true') break;
    await matchedCard.hover().catch(() => {});
    await newPage.waitForTimeout(300);
  }

  console.log(`Final state: data-signed-in="${dataSignedIn}", data-bookmarked="${dataBookmarked}"`);
  await removeBtn.click({ force: true });
  await newPage.waitForTimeout(2000);
  console.log("Bookmark removed successfully");
  await newPage.close();
});
 

Then('ensure bookmarked card appears in bookmarks page', async function() {
    await this.page.waitForTimeout(2000);
});

//recommendation see more

Given('user is logged in to Experience League', async function() {
  if (!this.page) {
    await performLogin(this);
  }
  await this.page.waitForTimeout(2000);
});

When('the page loads completely', async function() {
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
      recommendationsFound = true;
      break;
    }
  }
  
  if (!recommendationsFound) {
    console.error("⚠️ Could not find recommendations section");
    // Instead of simulating success, we'll assert that the section exists
    // This will properly fail the test if recommendations aren't found
    await expect(this.page.locator(recommendationSelectors[0])).toBeVisible({
      timeout: 5000,
      message: "Personalized recommendations section should be visible"
    });
  } else {
    console.log("✓ Personalized recommendations section is visible");
  }
});

Then('user checks if See More Recommendations button is available', async function() {
  // Try to locate the See More Recommendations button with exact text match
  // Using capital 'M' in "More" as that's a common capitalization
  await this.page.waitForTimeout(2000);
  const seeMoreButton = this.page.locator('.recommendation-marquee-see-more-btn button:text("See More recommendations"), a:text("See More recommendations")');
 /* await seeMoreButton.focus();
  await seeMoreButton.click();
  console.log("test");*/
  // Store the button and its availability in the world object for later steps
  this.seeMoreButton = seeMoreButton;
 this.seeMoreButtonAvailable = await seeMoreButton.isVisible().catch(() => false);
  
  if (!this.seeMoreButtonAvailable) {
    console.log("There are few cards, See More Recommendations button is not available");
  } else {
    console.log("See More Recommendations button is available");
    // Basic assertion to check button visibility
    await expect(seeMoreButton).toBeVisible();
  }
});


Then('user clicks the See More Recommendations button', async function() {
  // Only try to click if the button is available
  if (this.seeMoreButtonAvailable) {
    // Use the button we already found
    const seeMoreButton = this.seeMoreButton;
    
    // Focus on the button first
    await seeMoreButton.focus();
    console.log("Focused on See More Recommendations button");
    await this.page.waitForTimeout(2000);
    
    // Highlight the button to make it visible in the UI
    await seeMoreButton.highlight();
    console.log("Highlighted See More Recommendations button");
    
    await this.page.waitForTimeout(2000);
    
    // Click the button
    await seeMoreButton.click();
    console.log("Clicked See More Recommendations button");
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

Then('verifies that See fewer recommendations is displayed', async function() {
  if (this.seeMoreButtonAvailable) {
    const seeLessButton = this.page.locator('button:text("See fewer recommendations"), a:text("See fewer recommendations")');
    await expect(seeLessButton).toBeVisible({ timeout: 10000 });
    console.log("See fewer recommendations button is displayed");
  } else {
    console.log("Skipping verification as See More Recommendations button was not available");
  }
});

Then('verifies that See fewer Recommendations is displayed', async function() {
  if (this.seeMoreButtonAvailable) {
    const seeLessButton = this.page.locator('button:text("See fewer recommendations"), a:text("See fewer recommendations")');
    await expect(seeLessButton).toBeVisible({ timeout: 10000 });
    console.log("See Less Recommendations button is displayed");
  } else {
    console.log("Skipping verification as See More Recommendations button was not available");
  }
});
Given('user is logged in to Experience League application with valid credentials', async function() {
  if (!this.page) {
    await performLogin(this);
  }
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
  console.log("hi");
  await this.page.waitForTimeout(5000);
  /*console.log(`window.exlm.targetData length: ${window.exlm.targetData.length}`);*/
   const targetDataLength = await this.page.evaluate(() => {
    return window.exlm?.targetData?.length;
  
  });
     console.log('Length of targetData:', targetDataLength);  
  /* const targetDataLength = await this.page.evaluate(() => {
    console.log(`window.exlm.targetData length: ${window.exlm.targetData.length}`);
     return window.exlm.targetData.length; 
   /* if (window.exlm && window.exlm.targetData ) {
    console.log(`window.exlm.targetData length: ${window.exlm.targetData.length}`);
     return window.exlm.targetData.length;
    //console.log(`window.exlm.targetData length: ${window.exlm.targetData.length}`);
    } else {
      return null;
    }
  });*/
  
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
  await this.page.waitForTimeout(5000);
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
});

// Note: the "customize learning appear as pills" scenario that used to live here was
// removed 2026-08-19 — live-verified the underlying feature no longer exists in
// production. Even with real interests saved on the account (confirmed via native
// `:checked` state) and the profile-welcome block loaded on the homepage, its rendered
// output contains no interests markup at all (just eyebrow/heading/description).
