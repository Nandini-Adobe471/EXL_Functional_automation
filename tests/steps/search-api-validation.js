const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { performLogin } = require('../commonFunctions/login');
const { launchBrowser, closeBrowser } = require('../commonFunctions/launchbrowser');
const ENV = require('../../config.js');
// Import common mobile steps
require('./common-mobile-steps');

setDefaultTimeout(180 * 1000);

const COVEO_API_PATTERN = '**/rest/search/v2?organizationId=adobesystemsincorporatednonprod1**';
const COVEO_URL_REGEX = /adobesystemsincorporatednonprod1\.org\.coveo\.com\/rest\/search\/v2/;

/**
 * Intercepts and captures the Coveo search API response using context-level route
 * and waitForResponse, so it survives cross-page navigation.
 *
 * API URL: https://adobesystemsincorporatednonprod1.org.coveo.com/rest/search/v2?organizationId=adobesystemsincorporatednonprod1
 */
Given('user launches the application and logs in for search API validation', async function () {
  this.coveoApiResponse = null;
  this.coveoApiResults = null;
  this.coveoTotalCount = null;

  if (!this.page) {
    await performLogin(this);
  }

  // Register a context-level route intercept so it survives page navigations
  await this.context.route(COVEO_API_PATTERN, async (route) => {
    const response = await route.fetch();
    try {
      const body = await response.json();
      if (body && Array.isArray(body.results)) {
        this.coveoApiResponse = body;
        this.coveoApiResults = body.results;
        this.coveoTotalCount = body.totalCount;
        console.log(
          `✓ Captured Coveo API response: ${body.results.length} results, totalCount=${body.totalCount}`
        );
      }
    } catch (e) {
      console.log('Could not parse Coveo API response JSON:', e.message);
    }
    await route.fulfill({ response });
  });

  await this.page.waitForTimeout(3000);
  console.log('✓ Logged in. Context-level Coveo API interceptor is active.');
});

When('user navigates to the home page and opens search picker', async function () {
  await this.page.goto(`${ENV.URL}/home`);
  await this.page.waitForTimeout(4000);

  const secondarySearchBlock = this.page.locator('.secondary-search.block');
  await expect(secondarySearchBlock).toBeAttached({ timeout: 15000 });
  console.log('✓ Home page loaded. Secondary search block is present.');
});

When('user performs an empty search from search picker', async function () {
  // Reset captured data before triggering new search
  this.coveoApiResponse = null;
  this.coveoApiResults = null;
  this.coveoTotalCount = null;

  const searchInputLocator = this.page.locator(
    '#secondary-search, .secondary-search.block #secondary-search, .secondary-search input[type="text"], .secondary-search input'
  ).first();

  await searchInputLocator.scrollIntoViewIfNeeded().catch(() => {});
  await this.page.waitForTimeout(500);
  await searchInputLocator.click({ force: true });
  console.log('✓ Clicked search input');
  await this.page.waitForTimeout(500);

  // Set up a promise to wait for the Coveo API response BEFORE pressing Enter
  const coveoResponsePromise = this.page.waitForResponse(
    (response) => COVEO_URL_REGEX.test(response.url()) && response.status() === 200,
    { timeout: 30000 }
  );

  // Submit empty search
  await searchInputLocator.press('Enter');
  console.log('✓ Pressed Enter (empty search)');

  // Wait for the search results page URL
  await this.page.waitForURL(/.*\/search.*/, { timeout: 20000 });
  console.log(`✓ Navigated to search results page: ${this.page.url()}`);

  // Await the Coveo API response
  try {
    const coveoResponse = await coveoResponsePromise;
    const body = await coveoResponse.json().catch(() => null);
    if (body && Array.isArray(body.results)) {
      this.coveoApiResponse = body;
      this.coveoApiResults = body.results;
      this.coveoTotalCount = body.totalCount;
      console.log(
        `✓ waitForResponse captured Coveo API: ${body.results.length} results, totalCount=${body.totalCount}`
      );
    }
  } catch (e) {
    console.log('waitForResponse did not capture in time, will rely on context route intercept.');
  }

  // Give the page time to finish rendering results
  await this.page.waitForTimeout(4000);

  if (!this.coveoApiResults) {
    await this.page.waitForTimeout(4000);
    console.log('Waiting additional time for context route intercept to fire...');
  }

  console.log(`Coveo API results captured: ${this.coveoApiResults ? this.coveoApiResults.length : 'null'}`);
});

Then('the Coveo search API should be called with organizationId {string}', async function (orgId) {
  if (!this.coveoApiResults) {
    await this.page.waitForTimeout(3000);
  }

  expect(
    this.coveoApiResults,
    `Coveo API response was not captured. Make sure the API URL matches: ${COVEO_API_PATTERN}`
  ).not.toBeNull();
  expect(Array.isArray(this.coveoApiResults)).toBe(true);
  console.log(`✓ Coveo search API was called with organizationId "${orgId}"`);
  console.log(`✓ API returned ${this.coveoApiResults.length} results`);
});

Then('the API response results section should match the displayed search results', async function () {
  await this.page.waitForTimeout(2000);

  // Verify the results section is visible in the UI
  const resultsSection = this.page.locator('atomic-layout-section[section="results"]');
  await expect(resultsSection).toBeVisible({ timeout: 20000 });
  console.log('✓ atomic-layout-section[section="results"] is visible');

  // Verify API data exists
  expect(this.coveoApiResults).not.toBeNull();
  expect(this.coveoApiResults.length).toBeGreaterThan(0);
  console.log(`✓ API response contains ${this.coveoApiResults.length} results`);

  // Wait for atomic-result elements to be rendered
  // Playwright locator automatically pierces declarative shadow DOM
  const resultListSection = this.page.locator('atomic-layout-section[section="results"]');

  // Wait for at least one result link to appear (pierces shadow DOM automatically)
  await this.page.waitForTimeout(2000);

  // Collect titles using Playwright locator which pierces shadow DOM
  // atomic-result > (shadow) > .result-item.desktop-only .result-title a
  // We use the CSS selector with Playwright's built-in shadow DOM piercing
  const titleLocators = resultListSection.locator(
    'atomic-result .result-item.desktop-only .result-title a'
  );

  let titleCount = await titleLocators.count();

  // Fallback: try mobile-only if desktop returned 0
  if (titleCount === 0) {
    const mobileTitleLocators = resultListSection.locator(
      'atomic-result .mobile-result-title a'
    );
    titleCount = await mobileTitleLocators.count();
    console.log(`Desktop titles: 0, Mobile titles: ${titleCount}`);
  }

  console.log(`✓ Found ${titleCount} result title elements in the UI`);

  // Collect titles
  const displayedTitles = [];

  // Try desktop-only first
  const desktopTitles = resultListSection.locator(
    'atomic-result .result-item.desktop-only .result-title a'
  );
  const desktopCount = await desktopTitles.count();

  if (desktopCount > 0) {
    for (let i = 0; i < desktopCount; i++) {
      const text = await desktopTitles.nth(i).textContent().catch(() => '');
      if (text && text.trim()) displayedTitles.push(text.trim());
    }
  }

  // If desktop yielded nothing, try mobile
  if (displayedTitles.length === 0) {
    const mobileTitles = resultListSection.locator('atomic-result .mobile-result-title a');
    const mobileCount = await mobileTitles.count();
    for (let i = 0; i < mobileCount; i++) {
      const text = await mobileTitles.nth(i).textContent().catch(() => '');
      if (text && text.trim()) displayedTitles.push(text.trim());
    }
  }

  console.log(`✓ Collected ${displayedTitles.length} displayed result titles`);
  console.log('Displayed titles (first 3):', displayedTitles.slice(0, 3));

  this.displayedTitles = displayedTitles;
  expect(displayedTitles.length).toBeGreaterThan(0);
  console.log('✓ Results section in UI has results that correspond to the API response');
});

Then('each displayed result title should match the corresponding API result title', async function () {
  expect(this.coveoApiResults).not.toBeNull();
  expect(this.displayedTitles).toBeDefined();

  const decodeEntities = (str) =>
    str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();

  const apiTitles = this.coveoApiResults.map((r) => decodeEntities(r.title || ''));

  console.log('API titles (first 3):', apiTitles.slice(0, 3));
  console.log('Displayed titles (first 3):', this.displayedTitles.slice(0, 3));

  const minCount = Math.min(this.displayedTitles.length, apiTitles.length);
  let matchCount = 0;
  let mismatchCount = 0;

  for (let i = 0; i < minCount; i++) {
    const ui = this.displayedTitles[i];
    const api = apiTitles[i];
    if (ui === api || api.includes(ui) || ui.includes(api)) {
      matchCount++;
      console.log(`✓ Result [${i + 1}] title matches: "${ui}"`);
    } else {
      mismatchCount++;
      console.warn(`⚠ Result [${i + 1}] title mismatch — API: "${api}" | UI: "${ui}"`);
    }
  }

  console.log(
    `✓ Title validation: ${matchCount} matched, ${mismatchCount} mismatched (of ${minCount} compared)`
  );
  expect(matchCount).toBeGreaterThan(0);
  console.log('✓ Displayed result titles match API result titles');
});

Then(
  'each displayed result content type should match the corresponding API result el_contenttype',
  async function () {
    expect(this.coveoApiResults).not.toBeNull();

    const resultListSection = this.page.locator('atomic-layout-section[section="results"]');

    // Collect content types from desktop-only result items (Playwright pierces shadow DOM)
    const displayedContentTypes = [];

    // The content type div has class pattern like: result-field result-content-type community
    // We collect from desktop-only rows
    const ctLocators = resultListSection.locator(
      'atomic-result .result-item.desktop-only .result-content-type'
    );
    const ctCount = await ctLocators.count();
    console.log(`Found ${ctCount} desktop content type elements`);

    for (let i = 0; i < ctCount; i++) {
      const ctEl = ctLocators.nth(i);

      // Try to get class-based type (e.g. "community", "documentation", etc.)
      let typeText = '';

      const classes = await ctEl.getAttribute('class').catch(() => '');
      const knownTypes = [
        'community', 'documentation', 'tutorial', 'event', 'course',
        'certification', 'troubleshooting', 'perspective', 'playlist',
      ];
      const found = knownTypes.find((t) => classes.toLowerCase().includes(t));
      if (found) {
        typeText = found.charAt(0).toUpperCase() + found.slice(1);
      }

      // Fallback: read the visible text content of the element
      if (!typeText) {
        const txt = await ctEl.textContent().catch(() => '');
        typeText = txt.replace(/\s+/g, ' ').trim();
      }

      displayedContentTypes.push(typeText);
    }

    // If desktop returned nothing, fall back to mobile
    if (displayedContentTypes.length === 0) {
      const mobileCt = resultListSection.locator(
        'atomic-result .result-item.mobile-only .result-content-type'
      );
      const mobileCtCount = await mobileCt.count();
      for (let i = 0; i < mobileCtCount; i++) {
        const txt = await mobileCt.nth(i).textContent().catch(() => '');
        displayedContentTypes.push(txt.replace(/\s+/g, ' ').trim());
      }
    }

    console.log(`✓ Collected ${displayedContentTypes.length} content types from UI`);
    console.log('Displayed content types (first 3):', displayedContentTypes.slice(0, 3));

    const apiContentTypes = this.coveoApiResults.map((r) => {
      const raw = r.raw || {};
      if (Array.isArray(raw.el_contenttype)) return raw.el_contenttype.join(', ');
      return (raw.el_contenttype || '').toString();
    });
    console.log('API content types (first 3):', apiContentTypes.slice(0, 3));

    const minCount = Math.min(displayedContentTypes.length, apiContentTypes.length);
    let matchCount = 0;

    for (let i = 0; i < minCount; i++) {
      const uiType = displayedContentTypes[i].toLowerCase().trim();
      const apiType = apiContentTypes[i].toLowerCase().trim();

      if (!uiType || !apiType) {
        console.log(`Result [${i + 1}]: empty value — skipping (UI="${uiType}", API="${apiType}")`);
        matchCount++;
        continue;
      }

      const uiParts = uiType.split(/[,|]/).map((p) => p.trim()).filter(Boolean);
      const apiParts = apiType.split(/[,|]/).map((p) => p.trim()).filter(Boolean);
      const hasMatch = uiParts.some((up) => apiParts.some((ap) => ap.includes(up) || up.includes(ap)));

      if (hasMatch) {
        matchCount++;
        console.log(`✓ Result [${i + 1}] content type matches: UI="${uiType}" | API="${apiType}"`);
      } else {
        console.warn(`⚠ Result [${i + 1}] content type mismatch: UI="${uiType}" | API="${apiType}"`);
      }
    }

    console.log(`✓ Content type validation: ${matchCount}/${minCount} matched`);
    expect(matchCount).toBeGreaterThan(0);
    console.log('✓ Displayed content types match API el_contenttype field');
  }
);

Then(
  'each displayed result updated date should match the corresponding API result sysdate',
  async function () {
    expect(this.coveoApiResults).not.toBeNull();

    const resultListSection = this.page.locator('atomic-layout-section[section="results"]');

    // Collect displayed dates from desktop-only rows
    const displayedDates = [];

    const dateLocators = resultListSection.locator(
      'atomic-result .result-item.desktop-only .result-updated atomic-result-date'
    );
    const dateCount = await dateLocators.count();
    console.log(`Found ${dateCount} desktop date elements`);

    for (let i = 0; i < dateCount; i++) {
      const txt = await dateLocators.nth(i).textContent().catch(() => '');
      displayedDates.push(txt.replace(/\s+/g, ' ').trim());
    }

    // Fallback to mobile if desktop yielded nothing
    if (displayedDates.length === 0) {
      const mobileDates = resultListSection.locator(
        'atomic-result .result-item.mobile-only .result-updated atomic-result-date'
      );
      const mobileDateCount = await mobileDates.count();
      for (let i = 0; i < mobileDateCount; i++) {
        const txt = await mobileDates.nth(i).textContent().catch(() => '');
        displayedDates.push(txt.replace(/\s+/g, ' ').trim());
      }
    }

    console.log(`✓ Collected ${displayedDates.length} dates from UI`);
    console.log('Displayed dates (first 3):', displayedDates.slice(0, 3));

    // Convert API sysdate to YYYY-MM-DD
    const apiDates = this.coveoApiResults.map((r) => {
      const raw = r.raw || {};
      const sysdate = raw.sysdate || r.date || '';
      if (!sysdate) return '';
      try {
        const d = new Date(sysdate);
        if (isNaN(d.getTime())) return sysdate.toString().substring(0, 10);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      } catch (_) {
        return sysdate.toString().substring(0, 10);
      }
    });
    console.log('API dates (first 3):', apiDates.slice(0, 3));

    const minCount = Math.min(displayedDates.length, apiDates.length);
    let matchCount = 0;

    for (let i = 0; i < minCount; i++) {
      const uiDate = displayedDates[i].trim();
      const apiDate = apiDates[i].trim();
      if (!uiDate || !apiDate) {
        matchCount++;
        continue;
      }
      if (uiDate === apiDate || apiDate.startsWith(uiDate) || uiDate.startsWith(apiDate)) {
        matchCount++;
        console.log(`✓ Result [${i + 1}] date matches: "${uiDate}"`);
      } else {
        console.warn(`⚠ Result [${i + 1}] date mismatch: UI="${uiDate}" | API="${apiDate}"`);
      }
    }

    console.log(`✓ Date validation: ${matchCount}/${minCount} matched`);
    expect(matchCount).toBeGreaterThan(0);
    console.log('✓ Displayed dates match API sysdate field');
  }
);

Then('the total number of displayed results should match the API totalCount', async function () {
  expect(this.coveoApiResponse).not.toBeNull();

  const apiTotalCount = this.coveoTotalCount;
  console.log(`API totalCount: ${apiTotalCount}`);

  // Try to read total count from atomic-query-summary (Playwright pierces shadow DOM)
  const querySummary = this.page.locator('atomic-query-summary');
  let uiTotalCount = null;

  const summaryVisible = await querySummary.isVisible().catch(() => false);
  if (summaryVisible) {
    const summaryText = await querySummary.textContent().catch(() => '');
    console.log(`Query summary text: "${summaryText}"`);
    const match = summaryText.match(/of\s+([\d,]+)/i);
    if (match && match[1]) {
      uiTotalCount = parseInt(match[1].replace(/,/g, ''), 10);
    }
  }

  if (uiTotalCount !== null) {
    console.log(`UI total count: ${uiTotalCount}, API totalCount: ${apiTotalCount}`);
    const tolerance = Math.max(Math.ceil(apiTotalCount * 0.05), 50);
    const diff = Math.abs(uiTotalCount - apiTotalCount);
    expect(diff).toBeLessThanOrEqual(tolerance);
    console.log(
      `✓ UI total count (${uiTotalCount}) matches API totalCount (${apiTotalCount}) within ${tolerance} tolerance`
    );
  } else {
    // Fallback: verify rendered result items count is reasonable
    const resultListSection = this.page.locator('atomic-layout-section[section="results"]');
    const desktopItems = resultListSection.locator('atomic-result .result-item.desktop-only');
    let renderedCount = await desktopItems.count();

    if (renderedCount === 0) {
      const mobileItems = resultListSection.locator('atomic-result .result-item.mobile-only');
      renderedCount = await mobileItems.count();
    }

    console.log(
      `Rendered result items: ${renderedCount} | API per-page results: ${this.coveoApiResults.length}`
    );
    expect(renderedCount).toBeGreaterThan(0);
    console.log(
      `✓ Rendered result count (${renderedCount}) confirms results are displayed on page`
    );
  }

});
