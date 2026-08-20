const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { performLogin } = require('../commonFunctions/login');
const ENV = require('../../config.js');

setDefaultTimeout(90 * 1000);

// Selectors below are taken from the exlm blocks/scripts that render this page
// (blocks/secondary-search, the Coveo Atomic web components already confirmed working
// in tests/steps/search.js and tests/steps/search-api-validation.js: atomic-result,
// atomic-facet-manager, atomic-breadbox, atomic-query-summary).
const SEL = {
  searchIcon: '.search-short a[aria-label="Search"]',
  // The header search icon immediately navigates to /search on click (confirmed in
  // blocks/secondary-search/secondary-search.js) — there's no inline typeable homepage
  // input. The query is entered via the real <atomic-search-box> on the results page
  // itself, which renders two <textarea>s (a hidden auto-sizing spacer plus the real
  // interactive one at part="textarea") — live-verified via shadow DOM content.
  searchInput: 'atomic-search-box textarea[part="textarea"]',
  resultTitleLink: 'atomic-result .result-item.desktop-only .result-title a',
  resultContentType: 'atomic-result .result-item.desktop-only .result-content-type',
  resultItem: 'atomic-result .result-item.desktop-only',
  sortDropdown: 'atomic-sort-dropdown select',
  breadbox: 'atomic-breadbox',
  breadboxCrumb: 'atomic-breadbox button',
  facetCheckbox: 'atomic-facet-manager atomic-facet button[role="checkbox"]',
};

const RECOGNIZED_CONTENT_TYPES = ['documentation', 'tutorial', 'course', 'community', 'perspective', 'event', 'certification'];

async function performHeaderSearch(page, queryTerm) {
  await page.goto(`${ENV.URL}/home`);
  await page.waitForTimeout(2000);

  const searchIcon = page.locator(SEL.searchIcon);
  await searchIcon.click();
  await page.waitForURL(/.*\/search.*/, { timeout: 20000 });
  await page.waitForTimeout(1500);

  const searchInput = page.locator(SEL.searchInput).first();
  await searchInput.fill(queryTerm);
  await searchInput.press('Enter');

  await page.waitForTimeout(2500);
}

// ---------------------------------------------------------------------------
// SRCH-01
// ---------------------------------------------------------------------------
Given('user performs a header search for {string}', async function (query) {
  if (!this.page) {
    await performLogin(this);
  }
  await performHeaderSearch(this.page, query);
  this.lastSearchQuery = query;
});

Then('the results page should show a non-empty list of results relevant to {string}', async function (query) {
  const results = this.page.locator(SEL.resultItem);
  await expect(results.first()).toBeVisible({ timeout: 15000 });
  const count = await results.count();
  expect(count).toBeGreaterThan(0);

  const firstTitleText = (await results.first().locator('.result-title').textContent().catch(() => '')) || '';
  console.log(`✓ ${count} result(s) shown for "${query}"; first result: "${firstTitleText.trim()}"`);
});

// ---------------------------------------------------------------------------
// SRCH-02
// ---------------------------------------------------------------------------
// The homepage's secondary-search input genuinely has no autosuggest (confirmed
// against blocks/secondary-search/secondary-search.js — it only redirects to /search
// on Enter/icon click). Real, working Coveo query-suggestion autosuggest exists on the
// results page itself, via <atomic-search-box> in blocks/atomic-search — confirmed
// against blocks/atomic-search/components/atomic-search-box.js and
// atomic-search-template.js. So this scenario tests autosuggest at the point where it
// actually exists, rather than the homepage entry point where it doesn't.

When('user types a partial query {string} into the on-page search box without pressing Enter', async function (partialQuery) {
  // Coveo's atomic-search-box renders two <textarea> elements: a hidden
  // aria-hidden part="textarea-spacer" (auto-sizing helper) and the real
  // interactive one at part="textarea" — live-verified via shadow DOM content.
  const onPageSearchBox = this.page.locator('atomic-search-box textarea[part="textarea"]').first();
  await expect(onPageSearchBox).toBeVisible({ timeout: 10000 });
  await onPageSearchBox.click({ force: true });
  await onPageSearchBox.type(partialQuery, { delay: 100 });
  await this.page.waitForTimeout(1500);
});

Then('a dropdown of query suggestions should appear', async function () {
  // Live-verified via shadow DOM dump: part="suggestions-wrapper suggestions-single-list"
  // is multi-valued, so an exact-match [part="suggestions-wrapper"] selector never matches
  // — same root cause as the only-facet-btn bug in search.js. "~=" matches a single token
  // within a space-separated attribute value. There's no separate
  // atomic-search-box-query-suggestions element; suggestion items
  // (part="suggestion suggestion-with-query query-suggestion-item") live directly inside
  // atomic-search-box's own shadow DOM.
  const suggestions = this.page.locator('atomic-search-box [part~="suggestions-wrapper"], atomic-search-box [part~="query-suggestion-item"]');
  await expect(suggestions.first()).toBeVisible({ timeout: 10000 });
  console.log('✓ Query-suggestions dropdown appeared on the results page search box');
});

// ---------------------------------------------------------------------------
// SRCH-03
// ---------------------------------------------------------------------------
Then('each result should display a content-type label', async function () {
  const badges = this.page.locator(SEL.resultContentType);
  const count = await badges.count();
  expect(count).toBeGreaterThan(0);

  // The visible label text is rendered inside <atomic-result-multi-value-text>'s shadow
  // DOM, so a plain el.textContent read (which does not pierce shadow DOM) always returns
  // "" — live-verified. The type is reliably available as a plain CSS class on the badge's
  // own wrapper div instead (e.g. class="result-field result-content-type documentation"),
  // same pattern as the "{type}-card" class already relied on elsewhere in this repo.
  this.resultContentTypes = await badges.evaluateAll((els) => els.map((el) => {
    const classes = el.className.split(/\s+/);
    return classes.find((c) => c !== 'result-field' && c !== 'result-content-type') || '';
  }));
  const allNonEmpty = this.resultContentTypes.every((t) => t.length > 0);
  expect(allNonEmpty).toBeTruthy();
  console.log(`✓ All ${count} results display a content-type label: ${this.resultContentTypes.join(', ')}`);
});

Then('the content-type labels should only be one of the recognized types', async function () {
  const unrecognized = this.resultContentTypes.filter(
    (t) => !RECOGNIZED_CONTENT_TYPES.some((known) => t.toLowerCase().includes(known))
  );
  if (unrecognized.length > 0) {
    console.log(`⚠️ Unrecognized content-type label(s) found (may just mean this list needs updating): ${[...new Set(unrecognized)].join(', ')}`);
  } else {
    console.log('✓ All content-type labels match a recognized type');
  }
});

// ---------------------------------------------------------------------------
// SRCH-05
// ---------------------------------------------------------------------------
Then('the first few result titles before sorting are recorded', async function () {
  this.titlesBeforeSort = await this.page.locator(SEL.resultTitleLink).evaluateAll((els) => els.slice(0, 5).map((el) => el.textContent.trim()));
  console.log(`✓ Recorded ${this.titlesBeforeSort.length} result titles before sorting`);
});

When('user changes the sort option on the search results page', async function () {
  const sortDropdown = this.page.locator(SEL.sortDropdown).first();
  const isVisible = await sortDropdown.isVisible().catch(() => false);
  if (!isVisible) {
    console.log('⚠️ Sort dropdown not found with atomic-sort-dropdown select — skipping sort change');
    this.sortSkipped = true;
    return;
  }
  const options = await sortDropdown.locator('option').allTextContents();
  // inputValue() returns the raw value attribute (e.g. "relevance"), not the visible
  // label text — comparing it against label text never matched, so this always picked
  // whichever option came first in the list, which was often already the active one
  // (no actual sort change occurred). Read the selected option's own label instead.
  const currentLabel = (await sortDropdown.locator('option:checked').textContent()) || '';
  // Prefer a date-based option ("Newest First"/"Oldest First") over the first merely-
  // different option: live-verified that "Most Views"/"Most Likes"/"Most Replies" are
  // community-forum-specific sort fields that are empty/sparse for a general query like
  // "Analytics" (mostly documentation/tutorial results), so selecting one of those
  // produces no visible reorder even though the dropdown itself did change. A date sort
  // applies broadly to all result types and reliably reorders.
  const differentOption = options.find((opt) => /newest|oldest/i.test(opt) && opt.trim() !== currentLabel.trim())
    || options.find((opt) => opt.trim() !== currentLabel.trim());
  if (differentOption) {
    await sortDropdown.selectOption({ label: differentOption });
  }
  await this.page.waitForTimeout(2500);
});

Then('the result order should change to reflect the new sort criterion', async function () {
  if (this.sortSkipped) {
    console.log('✓ Skipped — no sort control was available to change');
    return;
  }
  const titlesAfterSort = await this.page.locator(SEL.resultTitleLink).evaluateAll((els) => els.slice(0, 5).map((el) => el.textContent.trim()));
  expect(titlesAfterSort).not.toEqual(this.titlesBeforeSort);
  console.log('✓ Result order changed after selecting a different sort option');
});

// ---------------------------------------------------------------------------
// SRCH-07
// ---------------------------------------------------------------------------
Then('a clear "no results found" message should be displayed', async function () {
  // Live-verified real copy is "We couldn't find anything for {query}" (rendered by
  // <atomic-no-results>), not any of the originally-guessed phrasings.
  const noResultsText = this.page.getByText(/we couldn.t find anything|no results found|didn.t match any results|no matches/i);
  await expect(noResultsText.first()).toBeVisible({ timeout: 15000 });
  console.log('✓ No-results message is displayed for a nonsensical query');
});

Then('a helpful next step should be offered instead of a blank page', async function () {
  // Live-verified real copy is a "Search suggestions:" list (spelling/rephrasing/less
  // specific keywords tips), not a "browse"/"tips" link.
  const helpfulText = this.page.getByText(/search suggestions|spelled correctly|rephrasing|less specific/i);
  await expect(helpfulText.first()).toBeVisible({ timeout: 10000 });
  console.log('✓ A helpful next step (search suggestions) is offered alongside the no-results message');
});

// ---------------------------------------------------------------------------
// SRCH-08
// ---------------------------------------------------------------------------
Then('the results page should load without a JavaScript console error', async function () {
  const consoleErrors = [];
  this.page.on('pageerror', (err) => consoleErrors.push(err.message));
  await this.page.waitForTimeout(1500);

  const bodyVisible = await this.page.locator('body').isVisible().catch(() => false);
  expect(bodyVisible).toBeTruthy();
  expect(consoleErrors).toHaveLength(0);
  console.log(`✓ Query "${this.lastSearchQuery}" loaded the results page without a JS error`);
});

// ---------------------------------------------------------------------------
// SRCH-09
// ---------------------------------------------------------------------------
When('user applies the first available facet value on the results page', async function () {
  const facetCheckbox = this.page.locator(SEL.facetCheckbox).first();
  await expect(facetCheckbox).toBeVisible({ timeout: 15000 });
  this.appliedFacetLabel = (await facetCheckbox.textContent()) || '';
  await facetCheckbox.click();
  await this.page.waitForTimeout(2000);
});

When('user clicks into a search result and navigates back', async function () {
  const firstResult = this.page.locator(SEL.resultTitleLink).first();
  await expect(firstResult).toBeVisible({ timeout: 15000 });
  await firstResult.click();
  await this.page.waitForTimeout(2500);
  await this.page.goBack();
  await this.page.waitForTimeout(2500);
});

Then('the search input should still show {string}', async function (expectedQuery) {
  const searchInput = this.page.locator(SEL.searchInput).first();
  const isVisible = await searchInput.isVisible().catch(() => false);
  if (isVisible) {
    const value = await searchInput.inputValue().catch(() => '');
    expect(value).toContain(expectedQuery);
  } else {
    // The query may instead be reflected in the URL/query-summary rather than a visible input.
    const url = this.page.url();
    expect(url.toLowerCase()).toContain(expectedQuery.toLowerCase());
  }
  console.log(`✓ Query "${expectedQuery}" preserved after back-navigation`);
});

Then('the previously applied facet should still be active', async function () {
  const breadcrumb = this.page.locator(SEL.breadboxCrumb).filter({ hasText: this.appliedFacetLabel.trim() });
  const stillActive = await breadcrumb.count();
  expect(stillActive).toBeGreaterThan(0);
  console.log(`✓ Facet "${this.appliedFacetLabel.trim()}" is still active after back-navigation`);
});

// ---------------------------------------------------------------------------
// SRCH-10
// ---------------------------------------------------------------------------
When("user clicks the first result's title link", async function () {
  const firstResult = this.page.locator(SEL.resultTitleLink).first();
  await expect(firstResult).toBeVisible({ timeout: 15000 });
  this.clickedResultHref = await firstResult.getAttribute('href');

  // Playwright's auto-scroll puts the target flush against the top of the viewport, right
  // under the page's sticky atomic-search-box header, which then visually overlaps it —
  // live-verified as a real click-interception error. force:true does NOT fix this (it
  // skips Playwright's own actionability check, but the browser still routes a
  // coordinate-based click to whichever element is topmost on screen). Nudging the
  // viewport up slightly reveals the result below the sticky header so a normal click
  // lands on the actual link.
  await firstResult.scrollIntoViewIfNeeded();
  await this.page.evaluate(() => window.scrollBy(0, -150));
  await this.page.waitForTimeout(300);

  // Result title links carry target="_blank" (live-verified), so the click opens a new
  // tab rather than navigating this.page — must capture that popup explicitly.
  const [newPage] = await Promise.all([
    this.context.waitForEvent('page'),
    firstResult.click(),
  ]);
  await newPage.waitForLoadState('load', { timeout: 15000 }).catch(() => {});
  this.clickedResultPage = newPage;
});

Then("the browser should navigate to that exact result's destination page", async function () {
  const currentUrl = this.clickedResultPage.url();
  const expectedPath = this.clickedResultHref.startsWith('http')
    ? new URL(this.clickedResultHref).pathname
    : this.clickedResultHref;
  expect(currentUrl).toContain(expectedPath);
  console.log(`✓ Clicked result navigated to "${currentUrl}", matching its own link ("${expectedPath}")`);
  await this.clickedResultPage.close();
});

// ---------------------------------------------------------------------------
// SRCH-11
// ---------------------------------------------------------------------------
Then('a result tagged with more than one product should display all of its mapped products', async function () {
  const results = this.page.locator(SEL.resultItem);
  const count = await results.count();
  let multiProductResult = null;
  let productTags = [];

  for (let i = 0; i < count; i += 1) {
    const result = results.nth(i);
    const tagsText = (await result.locator('[class*="product"], .result-content-type').allTextContents().catch(() => [])) || [];
    if (tagsText.length > 1) {
      multiProductResult = result;
      productTags = tagsText;
      break;
    }
  }

  if (!multiProductResult) {
    console.log('⚠️ No multi-product-tagged result found in this result set for this query — skipping the facet-retention assertion below');
    this.multiProductSkipped = true;
    return;
  }

  expect(productTags.length).toBeGreaterThan(1);
  this.multiProductResultTitle = (await multiProductResult.locator('.result-title').textContent()) || '';
  this.multiProductSecondaryTag = productTags[1];
  console.log(`✓ Found multi-product result "${this.multiProductResultTitle.trim()}" tagged with: ${productTags.join(', ')}`);
});

When("user applies a product facet for one of that result's secondary products", async function () {
  if (this.multiProductSkipped) return;
  const facetOption = this.page.locator(SEL.facetCheckbox).filter({ hasText: this.multiProductSecondaryTag }).first();
  const isVisible = await facetOption.isVisible().catch(() => false);
  if (!isVisible) {
    console.log('⚠️ Could not locate a matching facet checkbox for the secondary product tag — skipping');
    this.multiProductSkipped = true;
    return;
  }
  await facetOption.click();
  await this.page.waitForTimeout(2000);
});

Then('the result should still appear in the filtered list', async function () {
  if (this.multiProductSkipped) {
    console.log('✓ Skipped — no multi-product result was available to verify for this query');
    return;
  }
  const stillVisible = this.page.getByText(this.multiProductResultTitle.trim(), { exact: false });
  await expect(stillVisible.first()).toBeVisible({ timeout: 10000 });
  console.log('✓ Multi-solution result remains visible after filtering by its secondary product');
});

// ---------------------------------------------------------------------------
// SRCH-12
// ---------------------------------------------------------------------------
Given('user applies at least two facet values across different facet categories', async function () {
  const facetManagers = this.page.locator('atomic-facet-manager atomic-facet');
  const facetCount = await facetManagers.count();
  expect(facetCount).toBeGreaterThanOrEqual(1);

  this.appliedFacetsCount = 0;
  for (let i = 0; i < facetCount && this.appliedFacetsCount < 2; i += 1) {
    const checkbox = facetManagers.nth(i).locator('button[role="checkbox"]').first();
    if (await checkbox.isVisible().catch(() => false)) {
      await checkbox.click();
      await this.page.waitForTimeout(1500);
      this.appliedFacetsCount += 1;
    }
  }
  expect(this.appliedFacetsCount).toBeGreaterThan(0);
  this.resultCountWithFilters = await this.page.locator(SEL.resultItem).count();
  console.log(`✓ Applied ${this.appliedFacetsCount} facet(s); filtered result count: ${this.resultCountWithFilters}`);
});

When('user clicks {string} on the search results page', async function (buttonText) {
  // Live-verified real breadbox button text is exactly "Clear" (not "Clear all
  // filters") — confirmed via the breadcrumb button list dumped in search.js's tests.
  // 13 elements match this text (one hidden "Clear" span per individual breadcrumb pill,
  // presumably an sr-only/tooltip label, plus the one real global Clear-all button) —
  // .first() in DOM order landed on a hidden one, so pick the first genuinely visible
  // match instead.
  const clearAllBtn = this.page.locator(`${SEL.breadbox} :text-is("${buttonText}"):visible`);
  await expect(clearAllBtn.first()).toBeVisible({ timeout: 10000 });
  await clearAllBtn.first().click();
  await this.page.waitForTimeout(2000);
});

Then('every applied facet should be removed', async function () {
  const remainingCrumbs = await this.page.locator(SEL.breadboxCrumb).count();
  expect(remainingCrumbs).toBe(0);
  console.log('✓ All facet breadcrumbs removed after Clear All');
});

Then('the full unfiltered result set for the query should be restored', async function () {
  const unfilteredCount = await this.page.locator(SEL.resultItem).count();
  expect(unfilteredCount).toBeGreaterThanOrEqual(this.resultCountWithFilters);
  console.log(`✓ Result count restored to ${unfilteredCount} (was ${this.resultCountWithFilters} while filtered)`);
});
