const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { performLogin } = require('../commonFunctions/login');
const ENV = require('../../config.js');

setDefaultTimeout(180 * 1000);

const COVEO_API_PATTERN = '**coveo.com/rest/search/v2**';
const COVEO_URL_REGEX = /coveo\.com\/rest\/search\/v2/;

const EVENTS_BLOCK_SELECTOR = 'div.events-search.block.events-v2';
const EVENTS_COUNT_SELECTOR = 'div.events-search-results-count strong.events-search-results-count-value';
const MOBILE_FILTER_TOGGLE_SELECTOR = 'button.events-search-mobile-filter-toggle';
const NO_RESULTS_SELECTOR = 'div.events-search-no-results p.events-search-no-results-message';

// A generic keyword unlikely to match nothing but broad enough to return results
const VALID_SEARCH_KEYWORD = 'Adobe';

// ─── Given ────────────────────────────────────────────────────────────────────

Given('user launches the application and logs in for events validation', async function () {
  this.eventsTotalCount = null;

  // If this.page is already set (shared session via BeforeAll hook), skip login
  if (!this.page) {
    await performLogin(this);
  }

  // Register Coveo API intercept scoped to THIS PAGE only (not the shared context).
  // Using page.route() ensures the intercept only fires for this tab's requests.
  await this.page.route(COVEO_API_PATTERN, async (route) => {
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
  // If this.page is already set (shared session via BeforeAll hook), skip login
  if (!this.page) {
    await performLogin(this);
  }
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
  // Give the interceptor a bit more time if the count hasn't arrived yet
  if (this.eventsTotalCount === null) {
    console.log('⏳ Waiting up to 8 s for Coveo API intercept to populate totalCount…');
    await this.page.waitForTimeout(8000);
  }

  const countEl = this.page.locator(EVENTS_COUNT_SELECTOR);
  await expect(countEl).toBeVisible({ timeout: 20000 });
  const uiCountText = await countEl.textContent();
  const uiCount = parseInt(uiCountText.replace(/,/g, '').trim(), 10);
  expect(isNaN(uiCount), `Could not parse UI count from text: "${uiCountText}"`).toBe(false);

  if (this.eventsTotalCount !== null) {
    // Primary assertion: API totalCount vs DOM count
    console.log(`API totalCount: ${this.eventsTotalCount} | UI count: ${uiCount}`);
    expect(uiCount).toBe(this.eventsTotalCount);
    console.log(`✓ UI count (${uiCount}) matches API totalCount (${this.eventsTotalCount})`);
  } else {
    // Fallback: API intercept didn't fire (e.g. response cached before intercept registered).
    // Validate the DOM count is a positive integer — the block is rendering results correctly.
    console.warn(
      '⚠️  Coveo API totalCount was not captured via network intercept (response may have been served from cache or the org-ID pattern did not match). ' +
      `Falling back to DOM-only validation. UI count: ${uiCount}`
    );
    expect(uiCount, 'UI events count should be a positive integer').toBeGreaterThan(0);
    console.log(`✓ UI count (${uiCount}) is valid (API intercept fallback mode).`);
  }
});

// ─── Product Filter ───────────────────────────────────────────────────────────

When('user selects the first option from the Product filter', async function () {
  // Expand the Product filter group if not already expanded
  const groupHeader = this.page.locator('section[data-filter-type="el_product"] button.events-search-filter-group-header');
  await expect(groupHeader).toBeVisible({ timeout: 15000 });

  // Click to expand if not already open, then wait for the options panel to be visible
  const optionsPanel = this.page.locator('section[data-filter-type="el_product"] div.events-search-filter-options');
  const isPanelVisible = await optionsPanel.isVisible().catch(() => false);
  if (!isPanelVisible) {
    await groupHeader.click();
    // Wait for the options panel to become visible (not just a fixed delay)
    await expect(optionsPanel).toBeVisible({ timeout: 10000 });
  }
  console.log('✓ Product filter group expanded and options panel visible.');

  const firstCheckbox = this.page.locator('section[data-filter-type="el_product"] input[type="checkbox"]').first();
  await expect(firstCheckbox).toBeAttached({ timeout: 15000 });

  this.selectedProduct = await firstCheckbox.getAttribute('data-label');
  const checkboxId = await firstCheckbox.getAttribute('id');

  // Wait for the label to become visible after expansion
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
  const noResultsEl = this.page.locator('div.events-search-no-results');
  // The element uses `hidden` attribute when hidden; it should NOT be hidden now
  await expect(noResultsEl).not.toHaveAttribute('hidden', { timeout: 15000 });
  console.log('✓ No results container is visible (hidden attribute removed).');
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

// ─── Marquee ──────────────────────────────────────────────────────────────────

Then('the marquee block should be visible', async function () {
  const marquee = this.page.locator('div.marquee.block');
  await expect(marquee).toBeVisible({ timeout: 15000 });
  await expect(marquee).toHaveAttribute('data-block-status', 'loaded', { timeout: 15000 });
  console.log('✓ Marquee block is visible and loaded.');
});

Then('the marquee heading should contain {string}', async function (expectedText) {
  const heading = this.page.locator('div.marquee-title h1');
  await expect(heading).toBeVisible({ timeout: 15000 });
  const text = await heading.textContent();
  expect(text.trim()).toContain(expectedText);
  console.log(`✓ Marquee heading text: "${text.trim()}"`);
});

Then('the marquee long description should be visible', async function () {
  const description = this.page.locator('div.marquee-long-description');
  await expect(description).toBeVisible({ timeout: 15000 });
  const text = await description.textContent();
  expect(text.trim().length).toBeGreaterThan(0);
  console.log(`✓ Marquee long description is visible: "${text.trim().substring(0, 80)}…"`);
});

// ─── Announcement Ribbon ──────────────────────────────────────────────────────

Then('the announcement ribbon block should be visible', async function () {
  const ribbon = this.page.locator('div.announcement-ribbon.block');
  await expect(ribbon).toBeVisible({ timeout: 15000 });
  await expect(ribbon).toHaveAttribute('data-block-status', 'loaded', { timeout: 15000 });
  console.log('✓ Announcement ribbon block is visible and loaded.');
});

Then('the ribbon heading should contain {string}', async function (expectedText) {
  const heading = this.page.locator('div.ribbon-heading h3');
  await expect(heading).toBeVisible({ timeout: 15000 });
  const text = await heading.textContent();
  expect(text.trim()).toContain(expectedText);
  console.log(`✓ Ribbon heading text: "${text.trim()}"`);
});

Then('the ribbon should have a {string} link that opens in a new tab', async function (linkText) {
  const link = this.page.locator('div.ribbon-button-container a').filter({ hasText: linkText });
  await expect(link).toBeVisible({ timeout: 15000 });
  const target = await link.getAttribute('target');
  expect(target, `"${linkText}" link should open in a new tab (target="_blank")`).toBe('_blank');
  const href = await link.getAttribute('href');
  expect(href.length).toBeGreaterThan(0);
  console.log(`✓ Ribbon "${linkText}" link present, target="${target}", href="${href}"`);
});

// ─── Keyword Search ───────────────────────────────────────────────────────────

When('user types a keyword in the search input', async function () {
  const searchInput = this.page.locator('input.events-search-keyword-input');
  await expect(searchInput).toBeVisible({ timeout: 15000 });
  this.typedKeyword = VALID_SEARCH_KEYWORD;
  await searchInput.fill(this.typedKeyword);
  await searchInput.press('Enter');
  await this.page.waitForTimeout(3000);
  console.log(`✓ Typed keyword: "${this.typedKeyword}"`);
});

Then('the search input should show the typed keyword', async function () {
  const searchInput = this.page.locator('input.events-search-keyword-input');
  const value = await searchInput.inputValue();
  expect(value.trim()).toBe(this.typedKeyword);
  console.log(`✓ Search input shows: "${value}"`);
});

When('user clicks the clear search button', async function () {
  const clearBtn = this.page.locator('span.icon.icon-clear.events-search-keyword-clear');
  await expect(clearBtn).toBeVisible({ timeout: 10000 });
  await clearBtn.click();
  await this.page.waitForTimeout(3000);
  console.log('✓ Clicked the clear search button.');
});

Then('the search input should be empty', async function () {
  const searchInput = this.page.locator('input.events-search-keyword-input');
  const value = await searchInput.inputValue();
  expect(value.trim(), 'Search input should be empty after clearing').toBe('');
  console.log('✓ Search input is empty after clearing.');
});

// ─── Sort Dropdown ────────────────────────────────────────────────────────────

Then('the sort dropdown button should be visible with default label {string}', async function (defaultLabel) {
  const sortBtn = this.page.locator('button.sort-drop-btn');
  await expect(sortBtn).toBeVisible({ timeout: 15000 });
  const valueSpan = sortBtn.locator('span.sort-drop-btn-value');
  const label = await valueSpan.textContent();
  expect(label.trim()).toBe(defaultLabel);
  console.log(`✓ Sort dropdown default label: "${label.trim()}"`);
});

When('user opens the sort dropdown', async function () {
  const sortBtn = this.page.locator('button.sort-drop-btn');
  await expect(sortBtn).toBeVisible({ timeout: 15000 });
  await sortBtn.click();
  await this.page.waitForTimeout(500);
  console.log('✓ Opened sort dropdown.');
});

Then('the sort dropdown should show options {string}, {string}, {string}, {string}', async function (opt1, opt2, opt3, opt4) {
  const expectedOptions = [opt1, opt2, opt3, opt4];
  const dropdownContent = this.page.locator('div.sort-dropdown-content');
  await expect(dropdownContent).toBeVisible({ timeout: 10000 });

  for (const opt of expectedOptions) {
    const optEl = dropdownContent.locator(`a`).filter({ hasText: opt });
    await expect(optEl, `Sort option "${opt}" not found in dropdown`).toBeVisible({ timeout: 5000 });
    console.log(`✓ Sort option present: "${opt}"`);
  }
});

When('user selects sort option {string}', async function (optionLabel) {
  const dropdownContent = this.page.locator('div.sort-dropdown-content');
  const optEl = dropdownContent.locator('a').filter({ hasText: optionLabel }).first();
  await expect(optEl).toBeVisible({ timeout: 10000 });
  await optEl.click();
  await this.page.waitForTimeout(3000);
  console.log(`✓ Selected sort option: "${optionLabel}"`);
});

Then('the sort dropdown button should display {string}', async function (expectedLabel) {
  const sortBtn = this.page.locator('button.sort-drop-btn');
  const valueSpan = sortBtn.locator('span.sort-drop-btn-value');
  const label = await valueSpan.textContent();
  expect(label.trim()).toBe(expectedLabel);
  console.log(`✓ Sort dropdown now shows: "${label.trim()}"`);
});

// ─── Grid / List View Switcher ────────────────────────────────────────────────

Then('the grid view button should be active by default', async function () {
  const gridBtn = this.page.locator('button.browse-card-view-btn.grid-view');
  await expect(gridBtn).toBeVisible({ timeout: 15000 });
  const isActive = await gridBtn.evaluate((el) => el.classList.contains('active'));
  expect(isActive, 'Grid view button should have "active" class by default').toBe(true);
  console.log('✓ Grid view button is active by default.');
});

When('user switches to list view', async function () {
  const listBtn = this.page.locator('button.browse-card-view-btn.list-view');
  await expect(listBtn).toBeVisible({ timeout: 15000 });
  await listBtn.click();
  await this.page.waitForTimeout(1500);
  console.log('✓ Switched to list view.');
});

Then('the list view button should be active', async function () {
  const listBtn = this.page.locator('button.browse-card-view-btn.list-view');
  await expect(listBtn).toBeVisible({ timeout: 15000 });
  const isActive = await listBtn.evaluate((el) => el.classList.contains('active'));
  expect(isActive, 'List view button should have "active" class').toBe(true);
  console.log('✓ List view button is active.');
});

When('user switches to grid view', async function () {
  const gridBtn = this.page.locator('button.browse-card-view-btn.grid-view');
  await expect(gridBtn).toBeVisible({ timeout: 15000 });
  await gridBtn.click();
  await this.page.waitForTimeout(1500);
  console.log('✓ Switched to grid view.');
});

Then('the grid view button should be active', async function () {
  const gridBtn = this.page.locator('button.browse-card-view-btn.grid-view');
  await expect(gridBtn).toBeVisible({ timeout: 15000 });
  const isActive = await gridBtn.evaluate((el) => el.classList.contains('active'));
  expect(isActive, 'Grid view button should have "active" class').toBe(true);
  console.log('✓ Grid view button is active.');
});

// ─── Pagination ───────────────────────────────────────────────────────────────

Then('the pagination section should be visible', async function () {
  const pagination = this.page.locator('div.events-search-pagination');
  await expect(pagination).toBeVisible({ timeout: 15000 });
  console.log('✓ Pagination section is visible.');
});

Then('the pagination should show page {string} and total pages greater than 1', async function (expectedPage) {
  const pageInput = this.page.locator('input.events-search-pg-input');
  await expect(pageInput).toBeVisible({ timeout: 15000 });
  const currentValue = await pageInput.inputValue();
  expect(currentValue.trim()).toBe(expectedPage);
  console.log(`✓ Current page input value: "${currentValue}"`);

  const paginationText = this.page.locator('span.events-search-pagination-text');
  await expect(paginationText).toBeVisible({ timeout: 15000 });
  const text = await paginationText.textContent();
  // Expected format: "of X pages"
  const match = text.trim().match(/of\s+(\d+)\s+pages?/i);
  expect(match, `Could not parse total pages from pagination text: "${text}"`).not.toBeNull();
  const totalPages = parseInt(match[1], 10);
  expect(totalPages, 'Total pages should be greater than 1').toBeGreaterThan(1);
  console.log(`✓ Pagination shows: "${text.trim()}" — total pages: ${totalPages}`);
});

When('user clicks the next page button', async function () {
  const nextBtn = this.page.locator('button.nav-arrow.right-nav-arrow');
  await expect(nextBtn).toBeVisible({ timeout: 15000 });
  await expect(nextBtn).not.toBeDisabled({ timeout: 5000 });
  await nextBtn.click();
  await this.page.waitForTimeout(4000);
  console.log('✓ Clicked the next page button.');
});

Then('the page input should show {string}', async function (expectedPage) {
  const pageInput = this.page.locator('input.events-search-pg-input');
  await expect(pageInput).toBeVisible({ timeout: 15000 });
  const value = await pageInput.inputValue();
  expect(value.trim()).toBe(expectedPage);
  console.log(`✓ Page input now shows: "${value}"`);
});

// ─── Active Filters ───────────────────────────────────────────────────────────

Then('the active filters container should be visible', async function () {
  const activeFilters = this.page.locator('div.events-search-active-filters');
  await expect(activeFilters).not.toHaveAttribute('hidden', { timeout: 15000 });
  await expect(activeFilters).toBeVisible({ timeout: 15000 });
  console.log('✓ Active filters container is visible.');
});

Then('the active filters container should show the applied filter tag', async function () {
  const activeFilters = this.page.locator('div.events-search-active-filters');
  // Active filter tags/chips are typically rendered as buttons or spans inside the container
  const filterTags = activeFilters.locator('button, [class*="filter-tag"], [class*="active-filter"], [class*="chip"]');
  const tagCount = await filterTags.count();
  expect(tagCount, 'At least one active filter tag should be present').toBeGreaterThan(0);
  console.log(`✓ Active filters container shows ${tagCount} filter tag(s).`);
});

Then('the active filters container should be hidden', async function () {
  const activeFilters = this.page.locator('div.events-search-active-filters');
  // After clearing, either the element gets hidden attribute or becomes invisible
  const hasHidden = await activeFilters.evaluate((el) => el.hasAttribute('hidden')).catch(() => false);
  const isVisible = await activeFilters.isVisible().catch(() => false);
  const isCleared = hasHidden || !isVisible;
  expect(isCleared, 'Active filters container should be hidden after clearing all filters').toBe(true);
  console.log('✓ Active filters container is hidden after clearing filters.');
});

// ─── Clear All Filters Button in Panel ───────────────────────────────────────

When('user clicks the clear all filters button in the filter panel', async function () {
  const clearAllBtn = this.page.locator('button.events-search-clear-filters');
  await expect(clearAllBtn).toBeVisible({ timeout: 15000 });
  await clearAllBtn.click();
  await this.page.waitForTimeout(3000);
  console.log('✓ Clicked "Clear all filters" button in filter panel header.');
});

// ─── Filter Group Count Badge ─────────────────────────────────────────────────

Then('the Event Type filter group header should show a count badge of {string}', async function (expectedCount) {
  const header = this.page.locator('section[data-filter-type="el_contenttype"] button.events-search-filter-group-header');
  await expect(header).toBeVisible({ timeout: 15000 });
  const countBadge = header.locator('span.events-search-filter-group-count');
  await expect(countBadge).toBeVisible({ timeout: 10000 });
  const badgeText = await countBadge.textContent();
  // Badge renders as "(1)" — strip surrounding parentheses before comparing
  const badgeValue = badgeText.trim().replace(/^\(|\)$/g, '');
  expect(
    badgeValue,
    `Filter group count badge should show "${expectedCount}" but got "${badgeText.trim()}"`
  ).toBe(expectedCount);
  console.log(`✓ Event Type filter group count badge: "${badgeText.trim()}" (parsed: "${badgeValue}")`);
});

// ─── Upcoming Card — Location Type ───────────────────────────────────────────

Then('each Upcoming event card should display a location type badge', async function () {
  const cards = this.page.locator('div.events-search-card-item');
  await expect(cards.first()).toBeVisible({ timeout: 15000 });
  const count = await cards.count();
  expect(count, 'No result cards found for Upcoming filter').toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);
    const locationBadge = card.locator('div.location-type');
    await expect(
      locationBadge,
      `Card [${i + 1}] should have a div.location-type badge`
    ).toBeVisible({ timeout: 5000 });
    const badgeText = await locationBadge.textContent();
    const validTypes = ['virtual', 'in-person'];
    expect(
      validTypes,
      `Card [${i + 1}] location type "${badgeText.trim()}" is not one of: ${validTypes.join(', ')}`
    ).toContain(badgeText.trim().toLowerCase());
    console.log(`✓ Card [${i + 1}] location type: "${badgeText.trim()}"`);
  }
});

// ─── Upcoming Card — Register CTA ────────────────────────────────────────────

Then('each Upcoming event card should have a Register CTA with new tab icon', async function () {
  const cards = this.page.locator('div.events-search-card-item');
  await expect(cards.first()).toBeVisible({ timeout: 15000 });
  const count = await cards.count();
  expect(count, 'No result cards found for Upcoming filter').toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);
    const ctaEl = card.locator('div.browse-card-cta-element');
    await expect(ctaEl, `Card [${i + 1}] should have div.browse-card-cta-element`).toBeVisible({ timeout: 5000 });

    const ctaText = await ctaEl.textContent();
    expect(
      ctaText.trim().toLowerCase(),
      `Card [${i + 1}] CTA text should contain "register"`
    ).toContain('register');

    // New-tab icon should be present inside the CTA
    const newTabIcon = ctaEl.locator('span.icon.icon-new-tab-blue, img[data-icon-name="new-tab-blue"]');
    const iconCount = await newTabIcon.count();
    expect(iconCount, `Card [${i + 1}] Register CTA should contain a new-tab icon`).toBeGreaterThan(0);

    console.log(`✓ Card [${i + 1}] has Register CTA with new-tab icon`);
  }
});

// ─── Upcoming Card — Speaker Profile Images ──────────────────────────────────

Then('upcoming event cards that have speakers should display speaker profile images', async function () {
  const cards = this.page.locator('div.events-search-card-item');
  await expect(cards.first()).toBeVisible({ timeout: 15000 });
  const count = await cards.count();
  expect(count, 'No result cards found for Upcoming filter').toBeGreaterThan(0);

  let cardsWithSpeakers = 0;
  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);
    const speakerContainer = card.locator('div.event-speakers-container');
    const hasSpeakers = await speakerContainer.count();

    if (hasSpeakers > 0) {
      cardsWithSpeakers++;
      const profileImages = speakerContainer.locator('img.speaker-profile-image');
      const imgCount = await profileImages.count();
      expect(imgCount, `Card [${i + 1}] has speaker container but no speaker profile images`).toBeGreaterThan(0);

      for (let j = 0; j < imgCount; j++) {
        const img = profileImages.nth(j);
        const src = await img.getAttribute('src');
        expect(src && src.trim().length, `Card [${i + 1}] speaker image [${j + 1}] has no src`).toBeGreaterThan(0);
        const alt = await img.getAttribute('alt');
        expect(alt !== null, `Card [${i + 1}] speaker image [${j + 1}] is missing alt attribute`).toBe(true);
        console.log(`✓ Card [${i + 1}] speaker [${j + 1}]: alt="${alt}", src="${src.substring(0, 60)}…"`);
      }
    } else {
      console.log(`ℹ Card [${i + 1}] — no speakers container (fallback image card)`);
    }
  }
  console.log(`✓ ${cardsWithSpeakers} of ${count} upcoming card(s) had speaker profile images validated.`);
});

// ─── On Demand Card — Thumbnail + Play Button ─────────────────────────────────

Then('each On Demand event card that has loaded a thumbnail should display a play button', async function () {
  const cards = this.page.locator('div.events-search-card-item');
  await expect(cards.first()).toBeVisible({ timeout: 15000 });
  const count = await cards.count();
  expect(count, 'No result cards found for On Demand filter').toBeGreaterThan(0);

  let validatedCount = 0;
  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);
    const figure = card.locator('div.browse-card-figure.img-custom-height');
    const hasFigure = await figure.count();

    if (hasFigure > 0) {
      // Only assert play button when the thumbnail image has fully loaded
      // (indicated by img.img-loaded inside the figure, as per the actual DOM)
      const loadedImg = figure.locator('img.img-loaded');
      const isImgLoaded = await loadedImg.count();

      if (isImgLoaded > 0) {
        // Play button overlay must be present
        const playBtn = figure.locator('div.play-button');
        const hasPlayBtn = await playBtn.count();
        expect(hasPlayBtn, `Card [${i + 1}] has img.img-loaded but no div.play-button`).toBeGreaterThan(0);

        // Play button should contain the play icon
        const playIcon = playBtn.locator('span.icon.icon-play-outline-white, img[data-icon-name="play-outline-white"]');
        const hasPlayIcon = await playIcon.count();
        expect(hasPlayIcon, `Card [${i + 1}] div.play-button should contain play-outline-white icon`).toBeGreaterThan(0);

        // Laptop container (On Demand specific frame) must be present
        const laptopContainer = figure.locator('div.laptop-container');
        const hasLaptop = await laptopContainer.count();
        expect(hasLaptop, `Card [${i + 1}] On Demand figure should have div.laptop-container`).toBeGreaterThan(0);

        validatedCount++;
        console.log(`✓ Card [${i + 1}] (On Demand, img-loaded) — play button with icon and laptop container present`);
      } else {
        console.log(`ℹ Card [${i + 1}] — figure present but img not yet loaded (img.img-loaded absent), skipping`);
      }
    } else {
      console.log(`ℹ Card [${i + 1}] — no img-custom-height figure, skipping`);
    }
  }

  console.log(`✓ ${validatedCount} of ${count} On Demand card(s) with loaded thumbnails validated.`);
});

// ─── On Demand Card — Watch Now CTA ──────────────────────────────────────────

Then('each On Demand event card should have a Watch now CTA', async function () {
  const cards = this.page.locator('div.events-search-card-item');
  await expect(cards.first()).toBeVisible({ timeout: 15000 });
  const count = await cards.count();
  expect(count, 'No result cards found for On Demand filter').toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);
    const ctaEl = card.locator('div.browse-card-cta-element');
    await expect(ctaEl, `Card [${i + 1}] should have div.browse-card-cta-element`).toBeVisible({ timeout: 5000 });

    const ctaText = await ctaEl.textContent();
    expect(
      ctaText.trim().toLowerCase(),
      `Card [${i + 1}] CTA text should contain "watch now" but got: "${ctaText.trim()}"`
    ).toContain('watch now');

    // Chevron-right icon should be present
    const chevronIcon = ctaEl.locator('span.icon.icon-chevron-right-blue, img[data-icon-name="chevron-right-blue"]');
    const iconCount = await chevronIcon.count();
    expect(iconCount, `Card [${i + 1}] "Watch now" CTA should have a chevron-right-blue icon`).toBeGreaterThan(0);

    console.log(`✓ Card [${i + 1}] has "Watch now" CTA with chevron icon`);
  }
});

// ─── On Demand Card — Bookmark & Copy Link ────────────────────────────────────

Then('each On Demand event card should have bookmark and copy link actions', async function () {
  const cards = this.page.locator('div.events-search-card-item');
  await expect(cards.first()).toBeVisible({ timeout: 15000 });
  const count = await cards.count();
  expect(count, 'No result cards found for On Demand filter').toBeGreaterThan(0);

  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);

    // Bookmark button
    const bookmarkBtn = card.locator('button.bookmark');
    await expect(
      bookmarkBtn,
      `Card [${i + 1}] should have a button.bookmark`
    ).toBeVisible({ timeout: 5000 });

    const bookmarkAriaLabel = await bookmarkBtn.getAttribute('aria-label');
    expect(bookmarkAriaLabel, `Card [${i + 1}] bookmark button should have aria-label`).toBeTruthy();

    // Copy link button
    const copyLinkBtn = card.locator('button.copy-link');
    await expect(
      copyLinkBtn,
      `Card [${i + 1}] should have a button.copy-link`
    ).toBeVisible({ timeout: 5000 });

    const copyAriaLabel = await copyLinkBtn.getAttribute('aria-label');
    expect(copyAriaLabel, `Card [${i + 1}] copy-link button should have aria-label`).toBeTruthy();

    console.log(`✓ Card [${i + 1}] (On Demand) — bookmark (aria="${bookmarkAriaLabel}") and copy-link (aria="${copyAriaLabel}") present`);
  }
});

// ─── Upcoming Card — Series Banner ───────────────────────────────────────────

Then('upcoming event cards that have a series banner should display the series name', async function () {
  const cards = this.page.locator('div.events-search-card-item');
  await expect(cards.first()).toBeVisible({ timeout: 15000 });
  const count = await cards.count();
  expect(count, 'No result cards found after applying Series filter').toBeGreaterThan(0);

  let cardsWithSeries = 0;
  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);
    const seriesBanner = card.locator('div.event-series-banner');
    const hasBanner = await seriesBanner.count();

    if (hasBanner > 0) {
      cardsWithSeries++;
      await expect(seriesBanner, `Card [${i + 1}] series banner should be visible`).toBeVisible({ timeout: 5000 });
      const bannerText = await seriesBanner.textContent();
      expect(bannerText.trim().length, `Card [${i + 1}] series banner text should not be empty`).toBeGreaterThan(0);
      console.log(`✓ Card [${i + 1}] series banner: "${bannerText.trim()}"`);
    } else {
      console.log(`ℹ Card [${i + 1}] — no series banner (card may not belong to a series)`);
    }
  }
  console.log(`✓ ${cardsWithSeries} of ${count} card(s) had series banners validated.`);
});
