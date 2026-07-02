const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { performLogin } = require('../commonFunctions/login');
const ENV = require('../../config.js');

setDefaultTimeout(180 * 1000);

const COVEO_API_PATTERN = '**/rest/search/v2?organizationId=adobesystemsincorporatednonprod1**';
const COVEO_URL_REGEX = /adobesystemsincorporatednonprod1\.org\.coveo\.com\/rest\/search\/v2/;

const EVENTS_BLOCK_SELECTOR = 'div.events-search.block.events-v2';
const EVENTS_COUNT_SELECTOR = 'div.events-search-results-count strong.events-search-results-count-value';
const MOBILE_FILTER_TOGGLE_SELECTOR = 'button.events-search-mobile-filter-toggle';
const NO_RESULTS_SELECTOR = 'div.events-search-no-results p.events-search-no-results-message';

// ─── Given ────────────────────────────────────────────────────────────────────

Given('user launches the application and logs in for events validation', async function () {
  this.eventsTotalCount = null;

  // performLogin internally calls launchBrowser() and sets this.page / this.browser / this.context
  await performLogin(this);

  // Register Coveo API intercept on the context AFTER login.
  // The API fires on /events navigation (next step), so registering here is safe.
  await this.context.route(COVEO_API_PATTERN, async (route) => {
    const response = await route.fetch();
    try {
      const body = await response.json();
      if (body && typeof body.totalCount === 'number') {
        this.eventsTotalCount = body.totalCount;
        console.log(`✓ Captured Coveo API totalCount: ${body.totalCount}`);
      }
    } catch (e) {
      console.log('Could not parse Coveo API response:', e.message);
    }
    await route.fulfill({ response });
  });

  console.log('✓ Logged in. Coveo API interceptor active.');
});

Given('user is logged in and on the events page', async function () {
  await performLogin(this);
  await this.page.goto(`${ENV.URL}/events`);
  await this.page.waitForTimeout(4000);
  console.log('✓ Logged in and on /events page.');
});

// ─── When – Navigation ────────────────────────────────────────────────────────

When('user navigates to the events page', async function () {
  const coveoResponsePromise = this.page.waitForResponse(
    (res) => COVEO_URL_REGEX.test(res.url()) && res.status() === 200,
    { timeout: 30000 }
  );

  await this.page.goto(`${ENV.URL}/events`);
  console.log('✓ Navigated to /events page');

  try {
    const coveoResponse = await coveoResponsePromise;
    const body = await coveoResponse.json().catch(() => null);
    if (body && typeof body.totalCount === 'number') {
      this.eventsTotalCount = body.totalCount;
      console.log(`✓ waitForResponse captured Coveo totalCount: ${body.totalCount}`);
    }
  } catch (e) {
    console.log('waitForResponse timed out – relying on context-level intercept.');
  }

  await this.page.waitForTimeout(4000);
});

// ─── Then – Block & Count ─────────────────────────────────────────────────────

Then('the events search block should be visible', async function () {
  const eventsBlock = this.page.locator(EVENTS_BLOCK_SELECTOR);
  const isVisible = await eventsBlock.isVisible().catch(() => false);

  if (!isVisible) {
    console.error('✗ Events block is NOT authored / visible on the page.');
    expect(isVisible, 'Events block not authored: div.events-search.block.events-v2 not found').toBe(true);
  }

  await expect(eventsBlock).toHaveAttribute('data-block-status', 'loaded', { timeout: 20000 });
  console.log('✓ Events search block is visible and fully loaded.');
});

Then('the API totalCount should match the UI events and recordings count', async function () {
  if (this.eventsTotalCount === null) {
    await this.page.waitForTimeout(5000);
  }

  expect(
    this.eventsTotalCount,
    'Coveo API totalCount was not captured. Verify the network request fires on /events page load.'
  ).not.toBeNull();

  const countEl = this.page.locator(EVENTS_COUNT_SELECTOR);
  await expect(countEl).toBeVisible({ timeout: 20000 });
  const uiCountText = await countEl.textContent();
  const uiCount = parseInt(uiCountText.replace(/,/g, '').trim(), 10);

  console.log(`API totalCount: ${this.eventsTotalCount} | UI count: ${uiCount}`);
  expect(isNaN(uiCount), `Could not parse UI count from text: "${uiCountText}"`).toBe(false);
  expect(uiCount).toBe(this.eventsTotalCount);
  console.log(`✓ UI count (${uiCount}) matches API totalCount (${this.eventsTotalCount})`);
});

// ─── Product Filter ───────────────────────────────────────────────────────────

When('user selects the first option from the Product filter', async function () {
  // Product filter (el_product) is expanded by default — pick the first visible option label to click
  const firstCheckbox = this.page.locator('section[data-filter-type="el_product"] input[type="checkbox"]').first();
  await expect(firstCheckbox).toBeAttached({ timeout: 15000 });

  this.selectedProduct = await firstCheckbox.getAttribute('data-label');
  const checkboxId = await firstCheckbox.getAttribute('id');

  // Capture the count shown next to this filter label before clicking
  const label = this.page.locator(`label[for="${checkboxId}"]`);
  await expect(label).toBeVisible({ timeout: 15000 });
  const countSpan = label.locator('span.events-search-filter-option-count');
  const countText = await countSpan.textContent().catch(() => '');
  const parsed = parseInt(countText.replace(/[^0-9]/g, '').trim(), 10);
  this.expectedFilterCount = isNaN(parsed) ? null : parsed;
  console.log(`Filter item count for "${this.selectedProduct}": ${this.expectedFilterCount}`);

  await label.click();
  await this.page.waitForTimeout(3000);
  console.log(`✓ Selected first Product filter option: "${this.selectedProduct}"`);
});

Then('results count should update', async function () {
  const countEl = this.page.locator(EVENTS_COUNT_SELECTOR);
  await expect(countEl).toBeVisible({ timeout: 15000 });
  const text = await countEl.textContent();
  const uiCount = parseInt(text.replace(/,/g, '').trim(), 10);

  expect(isNaN(uiCount), `Could not parse UI results count from text: "${text}"`).toBe(false);
  expect(uiCount, 'Results count should be greater than 0 after applying a filter').toBeGreaterThan(0);
  console.log(`✓ Results count after filter: ${uiCount} events and recordings`);

  // Assert displayed count matches the count shown next to the filter item label
  if (this.expectedFilterCount !== null && this.expectedFilterCount !== undefined) {
    expect(
      uiCount,
      `UI results count (${uiCount}) does not match the filter item count (${this.expectedFilterCount})`
    ).toBe(this.expectedFilterCount);
    console.log(`✓ UI count (${uiCount}) matches filter item count (${this.expectedFilterCount})`);
  } else {
    console.log('⚠ Filter item count was not captured — skipping count match assertion.');
  }
});

Then('each result card should show the selected product or include it in the multisolution tooltip', async function () {
  const product = this.selectedProduct;
  const cards = this.page.locator('div.events-search-card-item');
  const count = await cards.count();
  expect(count, 'No result cards found after applying Product filter').toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);
    const solutionText = (await card.locator('.browse-card-solution-text').textContent().catch(() => '')).trim();

    if (solutionText.toLowerCase() === 'multisolution') {
      // Multisolution: the selected product must appear in the tooltip text
      const tooltipText = await card.locator('.tooltip-text').textContent().catch(() => '');
      expect(
        tooltipText,
        `Card [${i + 1}] is multisolution but tooltip does not contain "${product}". Tooltip: "${tooltipText}"`
      ).toContain(product);
      console.log(`✓ Card [${i + 1}] multisolution — tooltip contains "${product}"`);
    } else {
      // Single product: solution text must match
      expect(
        solutionText,
        `Card [${i + 1}] solution "${solutionText}" does not match selected product "${product}"`
      ).toBe(product);
      console.log(`✓ Card [${i + 1}] product: "${solutionText}"`);
    }
  }
});

// ─── Series Filter ────────────────────────────────────────────────────────────

When('user expands the Series filter group', async function () {
  const header = this.page.locator('section[data-filter-type="el_event_series"] button.events-search-filter-group-header');
  await expect(header).toBeVisible({ timeout: 15000 });
  if (await header.getAttribute('aria-expanded') !== 'true') {
    await header.click();
    await this.page.waitForTimeout(500);
  }
  console.log('✓ Series filter group expanded.');
});

When('user selects the first option from the Series filter', async function () {
  const firstCheckbox = this.page.locator('section[data-filter-type="el_event_series"] input[type="checkbox"]').first();
  await expect(firstCheckbox).toBeAttached({ timeout: 15000 });
  this.selectedSeries = await firstCheckbox.getAttribute('data-label');
  const checkboxId = await firstCheckbox.getAttribute('id');
  const label = this.page.locator(`label[for="${checkboxId}"]`);
  await expect(label).toBeVisible({ timeout: 15000 });

  // Capture the count shown next to this filter label before clicking
  const countSpan = label.locator('span.events-search-filter-option-count');
  const countText = await countSpan.textContent().catch(() => '');
  const parsed = parseInt(countText.replace(/[^0-9]/g, '').trim(), 10);
  this.expectedFilterCount = isNaN(parsed) ? null : parsed;
  console.log(`Filter item count for "${this.selectedSeries}": ${this.expectedFilterCount}`);

  await label.click();
  await this.page.waitForTimeout(3000);
  console.log(`✓ Selected first Series filter option: "${this.selectedSeries}"`);
});

// ─── Event Type Filter ────────────────────────────────────────────────────────

When('user expands the Event Type filter group', async function () {
  const header = this.page.locator('section[data-filter-type="el_contenttype"] button.events-search-filter-group-header');
  await expect(header).toBeVisible({ timeout: 15000 });
  if (await header.getAttribute('aria-expanded') !== 'true') {
    await header.click();
    await this.page.waitForTimeout(500);
  }
  console.log('✓ Event Type filter group expanded.');
});

When('user selects the first option from the Event Type filter', async function () {
  const firstCheckbox = this.page.locator('section[data-filter-type="el_contenttype"] input[type="checkbox"]').first();
  await expect(firstCheckbox).toBeAttached({ timeout: 15000 });
  this.selectedEventType = await firstCheckbox.getAttribute('data-label');
  const checkboxId = await firstCheckbox.getAttribute('id');
  const label = this.page.locator(`label[for="${checkboxId}"]`);
  await expect(label).toBeVisible({ timeout: 15000 });

  // Capture the count shown next to this filter label before clicking
  const countSpan = label.locator('span.events-search-filter-option-count');
  const countText = await countSpan.textContent().catch(() => '');
  const parsed = parseInt(countText.replace(/[^0-9]/g, '').trim(), 10);
  this.expectedFilterCount = isNaN(parsed) ? null : parsed;
  console.log(`Filter item count for "${this.selectedEventType}": ${this.expectedFilterCount}`);

  await label.click();
  await this.page.waitForTimeout(3000);
  console.log(`✓ Selected first Event Type filter option: "${this.selectedEventType}"`);
});

Then('result cards should be visible', async function () {
  const cards = this.page.locator('div.events-search-card-item');
  await expect(cards.first()).toBeVisible({ timeout: 15000 });
  const count = await cards.count();
  expect(count).toBeGreaterThan(0);
  console.log(`✓ ${count} result card(s) visible after filter.`);
});

// ─── On Demand / Upcoming Card Structure Validation ──────────────────────────

When('user selects the {string} option from the Event Type filter', async function (optionLabel) {
  const checkboxes = this.page.locator('section[data-filter-type="el_contenttype"] input[type="checkbox"]');
  await expect(checkboxes.first()).toBeAttached({ timeout: 15000 });
  const count = await checkboxes.count();

  let matched = false;
  for (let i = 0; i < count; i++) {
    const cb = checkboxes.nth(i);
    const label = await cb.getAttribute('data-label');
    if (label && label.trim().toLowerCase() === optionLabel.trim().toLowerCase()) {
      const checkboxId = await cb.getAttribute('id');
      const labelEl = this.page.locator(`label[for="${checkboxId}"]`);
      await expect(labelEl).toBeVisible({ timeout: 15000 });

      const countSpan = labelEl.locator('span.events-search-filter-option-count');
      const countText = await countSpan.textContent().catch(() => '');
      const parsed = parseInt(countText.replace(/[^0-9]/g, '').trim(), 10);
      this.expectedFilterCount = isNaN(parsed) ? null : parsed;
      console.log(`Filter item count for "${optionLabel}": ${this.expectedFilterCount}`);

      await labelEl.click();
      await this.page.waitForTimeout(3000);
      this.selectedEventType = label.trim();
      console.log(`✓ Selected Event Type filter option: "${this.selectedEventType}"`);
      matched = true;
      break;
    }
  }

  if (!matched) {
    throw new Error(`Event Type filter option "${optionLabel}" was not found.`);
  }
});

Then('each On Demand event card should not have the event time block', async function () {
  const cards = this.page.locator('div.events-search-card-item');
  await expect(cards.first()).toBeVisible({ timeout: 15000 });
  const count = await cards.count();
  expect(count, 'No result cards found after applying On Demand filter').toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);
    const eventTimeBlock = card.locator('div.browse-card-event-time');
    const isPresent = await eventTimeBlock.count();
    expect(
      isPresent,
      `Card [${i + 1}] should NOT have div.browse-card-event-time but it was found`
    ).toBe(0);
    console.log(`✓ Card [${i + 1}] (On Demand) — no event time block present`);
  }
});

When('user clears all filters', async function () {
  // Try clicking the "Clear all" / "Clear filters" button if present
  const clearBtn = this.page.locator('button.events-search-clear-all, button[data-clear-all], a.events-search-clear-all').first();
  const isClearVisible = await clearBtn.isVisible().catch(() => false);
  if (isClearVisible) {
    await clearBtn.click();
    await this.page.waitForTimeout(3000);
    console.log('✓ Cleared all filters via Clear All button.');
  } else {
    // Fall back: uncheck every checked checkbox
    const checkedBoxes = this.page.locator('input[type="checkbox"]:checked');
    const cbCount = await checkedBoxes.count();
    for (let i = 0; i < cbCount; i++) {
      const cb = checkedBoxes.nth(i);
      const id = await cb.getAttribute('id');
      const labelEl = this.page.locator(`label[for="${id}"]`);
      await labelEl.click().catch(() => cb.click());
      await this.page.waitForTimeout(500);
    }
    await this.page.waitForTimeout(2000);
    console.log(`✓ Cleared ${cbCount} filter(s) manually.`);
  }
});

Then('each Upcoming event card should have the event time block', async function () {
  const cards = this.page.locator('div.events-search-card-item');
  await expect(cards.first()).toBeVisible({ timeout: 15000 });
  const count = await cards.count();
  expect(count, 'No result cards found after applying Upcoming filter').toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);
    const eventTimeBlock = card.locator('div.browse-card-event-time');
    await expect(
      eventTimeBlock,
      `Card [${i + 1}] should have div.browse-card-event-time but it was NOT found`
    ).toBeVisible({ timeout: 5000 });
    const h6Text = await eventTimeBlock.locator('h6').textContent().catch(() => '');
    console.log(`✓ Card [${i + 1}] (Upcoming) — event time block present: "${h6Text.trim()}"`);
  }
});

Then('each Upcoming event card should not have bookmark or copy link', async function () {
  const cards = this.page.locator('div.events-search-card-item');
  const count = await cards.count();
  expect(count, 'No result cards found for Upcoming filter').toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);

    // Bookmark: button or element with bookmark-related classes
    const bookmarkEl = card.locator(
      'button.bookmark, button[data-bookmark], .card-bookmark, .browse-card-bookmark, [class*="bookmark"]'
    );
    const bookmarkCount = await bookmarkEl.count();
    expect(
      bookmarkCount,
      `Card [${i + 1}] should NOT have a bookmark element but found ${bookmarkCount}`
    ).toBe(0);

    // Copy link: button or anchor with copy-link-related classes
    const copyLinkEl = card.locator(
      'button.copy-link, button[data-copy-link], .card-copy-link, .browse-card-copy-link, [class*="copy-link"]'
    );
    const copyLinkCount = await copyLinkEl.count();
    expect(
      copyLinkCount,
      `Card [${i + 1}] should NOT have a copy link element but found ${copyLinkCount}`
    ).toBe(0);

    console.log(`✓ Card [${i + 1}] (Upcoming) — no bookmark or copy link present`);
  }
});

// ─── No Results ───────────────────────────────────────────────────────────────

When('user types a search term that returns no results', async function () {
  const searchInput = this.page.locator('input.events-search-keyword-input');
  await expect(searchInput).toBeVisible({ timeout: 15000 });
  await searchInput.fill('xyzzy_no_results_12345');
  await searchInput.press('Enter');
  await this.page.waitForTimeout(3000);
  console.log('✓ Entered search term that should return no results.');
});

Then('the no results message should be displayed', async function () {
  const noResultsMsg = this.page.locator(NO_RESULTS_SELECTOR);
  await expect(noResultsMsg).toBeVisible({ timeout: 15000 });
  const text = await noResultsMsg.textContent();
  expect(text.trim()).toBe('Sorry, no results were found.');
  console.log(`✓ No results message displayed: "${text.trim()}"`);
});

// ─── Mobile Filter Toggle ─────────────────────────────────────────────────────

Then('the events search block should be visible in mobile view', async function () {
  const eventsBlock = this.page.locator(EVENTS_BLOCK_SELECTOR);
  await expect(eventsBlock).toBeVisible({ timeout: 15000 });
  console.log('✓ Events search block is visible in mobile view.');
});

Then('the mobile filter toggle should expand filters on click', async function () {
  const filterToggle = this.page.locator(MOBILE_FILTER_TOGGLE_SELECTOR);
  await expect(filterToggle).toBeVisible({ timeout: 15000 });

  const ariaExpandedBefore = await filterToggle.getAttribute('aria-expanded');
  expect(ariaExpandedBefore).toBe('false');
  console.log(`✓ Filter toggle aria-expanded before click: ${ariaExpandedBefore}`);

  await filterToggle.click();
  await this.page.waitForTimeout(500);

  const ariaExpandedAfter = await filterToggle.getAttribute('aria-expanded');
  expect(ariaExpandedAfter).toBe('true');
  console.log(`✓ Filter toggle aria-expanded after click: ${ariaExpandedAfter}`);
  console.log('✓ Mobile filter toggle expands correctly on click.');
});
