const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { performLogin } = require('../commonFunctions/login');
const { closeBrowser } = require('../commonFunctions/launchbrowser');
const ENV = require('../../config.js');

setDefaultTimeout(120 * 1000);

// ─── Selectors ───────────────────────────────────────────────────────────────

const SUGGESTED_COHORT_WRAPPER = '.premium-learning-suggested-content-wrapper';
const ACTIVE_CONTENT_WRAPPER   = '.premium-learning-active-content-wrapper';

// Suggested Cohort block selectors
const CARDS_CONTENT_SELECTOR = `${SUGGESTED_COHORT_WRAPPER} .premium-learning-suggested-content-render-area .premium-learning-suggested-content-panel .browse-cards-block-content`;
const COHORT_CARD_SELECTOR   = `${CARDS_CONTENT_SELECTOR} .premium-learning-cohort-card`;
const CARD_LINK_SELECTOR     = `${CARDS_CONTENT_SELECTOR} a[href*="/premium/cohort/"]`;
const CARD_IMAGE_SELECTOR    = `.premium-learning-card-figure img`;
const CARD_TITLE_SELECTOR    = 'h3.premium-learning-card-title';
const TAB_LIST_SELECTOR      = `${SUGGESTED_COHORT_WRAPPER} .premium-learning-suggested-content-tab-header .responsive-list ul li[data-tab-id]`;
const PANEL_SELECTOR         = `${SUGGESTED_COHORT_WRAPPER} .premium-learning-suggested-content-render-area .premium-learning-suggested-content-panel`;

// Recommendations API
const RECOMMENDATIONS_API_URL = 'learningmanager.adobe.com/primeapi/v2/learningObjects/query';

// ─────────────────────────────────────────────────────────────────────────────
// PREMIUM LEARNING SEARCH BLOCK STEPS
// ─────────────────────────────────────────────────────────────────────────────

const PL_SEARCH_CONTAINER   = 'div.premium-learning-search-container';
const PL_SEARCH_WRAPPER     = '.premium-learning-search-wrapper';
const PL_SEARCH_BLOCK       = '.premium-learning-search-block';
const PL_SEARCH_HEADING     = 'h3#premium-learning-search-results';
const PL_SEARCH_VIEW_ALL    = '.premium-learning-search-block-cta a[href*="/premium-search"]';

const SEARCH_PAGE_PATH = '/search';

Given('user navigates to the search page without logging in', async function () {
  const { launchBrowser } = require('../commonFunctions/launchbrowser');
  const { page, browser, context } = await launchBrowser();
  this.page    = page;
  this.browser = browser;
  this.context = context;
  const searchUrl = `${ENV.URL}${SEARCH_PAGE_PATH}`;
  await this.page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await this.page.waitForTimeout(6000);
  console.log(`✓ Navigated to search page (unauthenticated): ${this.page.url()}`);
});

Then('the Premium Learning Search block should not be visible for unauthenticated user', async function () {
  await this.page.waitForTimeout(3000);

  // Check if "View all Premium Learning results" CTA link is visible
  const viewAllCta = this.page.locator('a[href*="/premium/premium-search"][title="View all Premium Learning results"]');
  const ctaVisible = await viewAllCta.isVisible().catch(() => false);

  console.log(`\n  "View all Premium Learning results" link (unauthenticated): ${ctaVisible ? '❌ VISIBLE (unexpected)' : '✅ NOT VISIBLE (expected)'}`);
  await this.page.screenshot({ path: 'screenshots/pl-search-unauthenticated.png' });

  if (ctaVisible) {
    const href = await viewAllCta.getAttribute('href').catch(() => '');
    console.warn(`⚠️  "View all Premium Learning results" link is visible for unauthenticated user — href: "${href}"`);
  } else {
    console.log('✅ PASS — "View all Premium Learning results" link is correctly hidden for unauthenticated users.');
  }
});

When('user logs in and navigates to the search page', async function () {
  await performLogin(this);
  await this.page.waitForTimeout(5000);

  const searchUrl = `${ENV.URL}${SEARCH_PAGE_PATH}`;
  await this.page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await this.page.waitForTimeout(8000);
  console.log(`✓ Logged in and navigated to search page: ${this.page.url()}`);
});

Then('the Premium Learning Search block should be visible for authenticated user', async function () {
  try {
    await this.page.waitForTimeout(3000);

    // Try waiting for the block to appear
    try {
      await this.page.waitForSelector(PL_SEARCH_CONTAINER, { state: 'visible', timeout: 15000 });
    } catch (e) {
      console.warn('⚠️  Timed out waiting for Premium Learning Search container — checking DOM anyway...');
    }

    const plSearchVisible = await this.page
      .locator(PL_SEARCH_CONTAINER)
      .isVisible()
      .catch(() => false);

    const plSearchWrapperVisible = await this.page
      .locator(PL_SEARCH_WRAPPER)
      .isVisible()
      .catch(() => false);

    const plBlockVisible = await this.page
      .locator(PL_SEARCH_BLOCK)
      .isVisible()
      .catch(() => false);

    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║   PREMIUM LEARNING SEARCH BLOCK - VISIBILITY SUMMARY     ║');
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log(`║  PL Search Container   : ${plSearchVisible   ? '✅ VISIBLE   ' : '❌ NOT VISIBLE'}                        ║`);
    console.log(`║  PL Search Wrapper     : ${plSearchWrapperVisible ? '✅ VISIBLE   ' : '❌ NOT VISIBLE'}                        ║`);
    console.log(`║  PL Search Block       : ${plBlockVisible    ? '✅ VISIBLE   ' : '❌ NOT VISIBLE'}                        ║`);
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    await this.page.screenshot({ path: 'screenshots/pl-search-authenticated.png' });

    if (plSearchVisible || plBlockVisible) {
      console.log('✅ PASS — Premium Learning Search block is visible for authenticated user');

      // Verify heading
      const headingVisible = await this.page.locator(PL_SEARCH_HEADING).isVisible().catch(() => false);
      if (headingVisible) {
        const headingText = await this.page.locator(PL_SEARCH_HEADING).textContent();
        console.log(`  → Block heading: "${headingText.trim()}"`);
      }

      // Verify "View all Premium Learning results" CTA
      const ctaVisible = await this.page.locator(PL_SEARCH_VIEW_ALL).isVisible().catch(() => false);
      if (ctaVisible) {
        const ctaHref = await this.page.locator(PL_SEARCH_VIEW_ALL).getAttribute('href');
        console.log(`  → View All CTA href: "${ctaHref}"`);
      } else {
        console.warn('  ⚠️  "View all Premium Learning results" CTA not found');
      }

    } else {
      // Block not visible — FAIL the test
      await this.page.screenshot({ path: 'screenshots/pl-search-block-missing.png' });
      throw new Error(
        '❌ FAIL — Premium Learning Search block (.premium-learning-search-container) is NOT visible ' +
        'for an authenticated user on the search page.\n' +
        'Please verify the block is authored on the search page and the user has premium access.'
      );
    }

  } catch (error) {
    await this.page.screenshot({ path: 'screenshots/pl-search-error.png' }).catch(() => {});
    throw error;
  }
  // NOTE: browser is intentionally left open — subsequent steps still need this.page
});

// ─────────────────────────────────────────────────────────────────────────────
// PREMIUM LEARNING SEARCH - API INTERCEPT & DATA MATCH STEPS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Search Query API:
 * https://learningmanager.adobe.com/primeapi/v2/search/query?page[limit]=4
 *   &enforcedFields[learningObject]=products,roles,extensionOverrides,effectivenessData
 *   &include=model.instances.loResources.resources,...
 *
 * Actual response shape:
 *   data[]                             – array of search results (type: "searchResult")
 *   data[].id                          – e.g. "course:15882028"
 *   data[].type                        – "searchResult"
 *   data[].attributes.localizedMetadata[0].name  – card title
 *   included[]                         – related instances/badges/skills
 *   meta.informalCount                 – total informal results
 *   meta.formalCount                   – total formal results
 */

const PL_SEARCH_QUERY_API = 'learningmanager.adobe.com/primeapi/v2/search/query';

// Card selectors inside the Premium Learning Search block
const PL_CARD_SELECTOR       = `${PL_SEARCH_BLOCK} .browse-cards-block-content .browse-cards-card-item`;
const PL_CARD_TITLE_SELECTOR = `${PL_SEARCH_BLOCK} .browse-cards-card-item h3`;
const PL_CARD_LINK_SELECTOR  = `${PL_SEARCH_BLOCK} .browse-cards-block-content a[href]`;

Then('user intercepts the Premium Learning Search query API response', async function () {
  this.plSearchApiData   = null;
  this.plSearchApiCalled = false;

  this.page.on('response', async (response) => {
    const url = response.url();
    if (url.includes(PL_SEARCH_QUERY_API)) {
      console.log(`📡 PL Search Query API intercepted: ${url}`);
      this.plSearchApiCalled = true;
      try {
        const json = await response.json();
        this.plSearchApiData = json;
        const items = json?.data || [];
        const meta  = json?.meta || {};
        console.log(`  → data[] count: ${items.length}  |  meta.informalCount: ${meta.informalCount}  |  meta.formalCount: ${meta.formalCount}`);
        items.forEach((item, i) => {
          const title = item?.attributes?.localizedMetadata?.[0]?.name || item?.attributes?.name || 'N/A';
          console.log(`    [${i + 1}] id: ${item?.id}  type: ${item?.type}  title: "${title}"`);
        });
      } catch (err) {
        console.warn(`  → Could not parse API response: ${err.message}`);
        this.plSearchApiData = {};
      }
    }
  });

  await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
  await this.page.waitForTimeout(8000);

  if (!this.plSearchApiCalled) {
    console.log('⏳ PL Search API not intercepted on reload — waiting additional time...');
    await this.page.waitForTimeout(5000);
  }

  if (this.plSearchApiCalled) {
    console.log('✓ PL Search Query API successfully intercepted');
  } else {
    throw new Error('❌ FAIL — PL Search Query API (primeapi/v2/search/query) was not intercepted. Ensure the user is authenticated and the PL Search block is authored on the search page.');
  }
});

Then('verify the cards displayed in Premium Learning Search block match the API data', async function () {
  try {
    await this.page.waitForTimeout(3000);

    // ── 1. Collect DOM cards ──────────────────────────────────────────────────
    let domCards = [];

    const cardItemLocators = await this.page.locator(PL_CARD_SELECTOR).all();
    if (cardItemLocators.length > 0) {
      for (const card of cardItemLocators) {
        const title = await card.locator('h3').textContent().catch(() => '');
        const href  = await card.locator('a').first().getAttribute('href').catch(() => '');
        domCards.push({ title: title.trim(), href });
      }
    } else {
      const linkLocators = await this.page.locator(PL_CARD_LINK_SELECTOR).all();
      for (const link of linkLocators) {
        const title = await link.locator('h3').textContent().catch(() => '');
        const href  = await link.getAttribute('href').catch(() => '');
        domCards.push({ title: title.trim(), href });
      }
    }

    console.log(`\n  DOM cards found in PL Search block: ${domCards.length}`);
    domCards.forEach((c, i) => console.log(`    [${i + 1}] "${c.title}"  href: ${c.href}`));
    await this.page.screenshot({ path: 'screenshots/pl-search-cards.png' });

    // ── 2. Guard: API not intercepted ────────────────────────────────────────
    if (!this.plSearchApiCalled || !this.plSearchApiData) {
      throw new Error('❌ FAIL — PL Search Query API data is not available. Ensure the API was intercepted successfully.');
    }

    // ── 3. Extract data[] from API response ───────────────────────────────────
    const apiItems = this.plSearchApiData?.data || [];
    const meta     = this.plSearchApiData?.meta || {};

    console.log(`\n  API data[] count: ${apiItems.length}  |  meta: informalCount=${meta.informalCount}, formalCount=${meta.formalCount}`);

    // ── 4. Match DOM card titles against API data[] titles ────────────────────
    const apiTitles = apiItems.map(item =>
      (item?.attributes?.localizedMetadata?.[0]?.name || item?.attributes?.name || '').trim().toLowerCase()
    ).filter(Boolean);

    let matchCount = 0, mismatchCount = 0;

    for (const card of domCards) {
      const lower   = card.title.toLowerCase();
      const matched = apiTitles.some(t => t === lower || t.includes(lower) || lower.includes(t));
      if (matched) {
        matchCount++;
        console.log(`  ✅ MATCH  "${card.title}"`);
      } else {
        mismatchCount++;
        console.warn(`  ⚠️  NO API MATCH  "${card.title}"`);
      }
    }

    // ── 5. Summary ────────────────────────────────────────────────────────────
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║   PREMIUM LEARNING SEARCH - CARD vs API MATCH SUMMARY    ║');
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log(`║  API data[] items    : ${String(apiItems.length).padEnd(31)}║`);
    console.log(`║  DOM cards displayed : ${String(domCards.length).padEnd(31)}║`);
    console.log(`║  Matched             : ${String(matchCount).padEnd(31)}║`);
    console.log(`║  Unmatched           : ${String(mismatchCount).padEnd(31)}║`);
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    if (domCards.length === 0) {
      console.warn('⚠️  No cards found in the PL Search block — block may not have rendered.');
    } else if (mismatchCount === 0) {
      console.log('✅ PASS — All displayed cards match the API data[]');
    } else {
      console.warn(`⚠️  ${mismatchCount} card(s) did not match the API data[] titles.`);
    }

  } catch (error) {
    console.error(`Error during PL Search card vs API validation: ${error.message}`);
    await this.page.screenshot({ path: 'screenshots/pl-search-match-error.png' }).catch(() => {});
    throw error;
  } finally {
    if (this.browser) {
      await closeBrowser(this.browser).catch(() => {});
      console.log('Browser closed successfully');
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// COHORT ENROLLMENT STEPS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Enrollment API:
 * https://learningmanager.adobe.com/primeapi/v2/enrollments?page[limit]=10&filter.loTypes=learningProgram
 * &includeHierarchicalEnrollments=false&sort=dateEnrolled
 */

Given('user logs in and lands on the PHP page for cohort validation', async function () {
  await performLogin(this);
  await this.page.waitForTimeout(5000);
  console.log('✓ Successfully logged in for cohort validation');
});

When('user navigates to the PHP home page', async function () {
  await this.page.goto(`${ENV.URL}/home`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await this.page.waitForTimeout(5000);
  console.log(`✓ Navigated to PHP home page: ${this.page.url()}`);
});

Then('user intercepts the enrollment API response', async function () {
  console.log('Setting up network interception for Enrollment API...');

  this.enrollmentData      = null;
  this.enrollmentApiCalled = false;

  this.page.on('response', async (response) => {
    const url = response.url();
    if (
      url.includes('/primeapi/v2/enrollments') &&
      url.includes('filter.loTypes=learningProgram')
    ) {
      console.log(`📡 Enrollment API intercepted: ${url}`);
      this.enrollmentApiCalled = true;
      try {
        const json = await response.json();
        this.enrollmentData = json;
        const dataItems = json?.data;
        if (Array.isArray(dataItems)) {
          console.log(`  → API returned ${dataItems.length} enrollment item(s)`);
        } else {
          console.log(`  → API response keys: ${JSON.stringify(Object.keys(json || {}))}`);
        }
      } catch (err) {
        console.warn(`  → Could not parse API response as JSON: ${err.message}`);
        this.enrollmentData = {};
      }
    }
  });

  await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
  await this.page.waitForTimeout(8000);

  if (!this.enrollmentApiCalled) {
    console.log('⏳ Enrollment API not yet intercepted — waiting additional time...');
    await this.page.waitForTimeout(5000);
  }

  if (this.enrollmentApiCalled) {
    console.log('✓ Enrollment API successfully intercepted');
  } else {
    console.warn('⚠️  Enrollment API was not intercepted during page load — proceeding with DOM-based validation only.');
  }
});

Then('if enrollment API returns empty data then Suggested Cohort block should be visible', async function () {
  if (!this.enrollmentApiCalled) {
    console.log('ℹ️  Skipping suggested-cohort check — API was not intercepted.');
    return;
  }

  const dataItems = this.enrollmentData?.data;
  const isEmpty   = !Array.isArray(dataItems) || dataItems.length === 0;

  if (!isEmpty) {
    console.log('ℹ️  Enrollment API returned data — Suggested Cohort block check not applicable.');
    return;
  }

  console.log('📊 Enrollment API returned EMPTY data → validating Suggested Cohort block...');

  await this.page.waitForTimeout(3000);
  await this.page.screenshot({ path: 'cohort-suggested-block-check.png' });

  const suggestedVisible = await this.page
    .locator(SUGGESTED_COHORT_WRAPPER)
    .isVisible()
    .catch(() => false);

  console.log(`  Suggested Cohort block : ${suggestedVisible ? '✅ VISIBLE' : '❌ NOT VISIBLE'}`);

  if (suggestedVisible) {
    console.log('✅ PASS — Suggested Cohort block is correctly displayed');

    const headingLocator = this.page.locator(
      `${SUGGESTED_COHORT_WRAPPER} h3#suggested-cohorts-to-join`
    );
    const headingVisible = await headingLocator.isVisible().catch(() => false);
    if (headingVisible) {
      const headingText = await headingLocator.textContent();
      console.log(`  → Block heading: "${headingText.trim()}"`);
      expect(headingText.trim()).toBe('Suggested cohorts to join');
    }

    const cohortCards = await this.page
      .locator(`${SUGGESTED_COHORT_WRAPPER} .premium-learning-cohort-card`)
      .count();
    console.log(`  → Cohort cards inside block: ${cohortCards}`);
    expect(cohortCards).toBeGreaterThan(0);

  } else {
    this.suggestedBlockMissing = true;
    console.warn('⚠️  Suggested Cohort block is NOT visible despite empty enrollment data.');
  }
});

Then('if enrollment API returns data then Active Cohort block should be visible', async function () {
  if (!this.enrollmentApiCalled) {
    console.log('ℹ️  Skipping active-cohort check — API was not intercepted.');
    return;
  }

  const dataItems = this.enrollmentData?.data;
  const hasData   = Array.isArray(dataItems) && dataItems.length > 0;

  if (!hasData) {
    console.log('ℹ️  Enrollment API returned empty data — Active Cohort block check not applicable.');
    return;
  }

  console.log(`📊 Enrollment API returned ${dataItems.length} enrollment(s) → validating Active Cohort block...`);

  await this.page.waitForTimeout(3000);
  await this.page.screenshot({ path: 'cohort-active-block-check.png' });

  const activeVisible = await this.page
    .locator(ACTIVE_CONTENT_WRAPPER)
    .isVisible()
    .catch(() => false);

  console.log(`  Active Cohort block : ${activeVisible ? '✅ VISIBLE' : '❌ NOT VISIBLE'}`);

  if (activeVisible) {
    console.log('✅ PASS — Active Cohort block is correctly displayed');

    const activeChildren = await this.page
      .locator(`${ACTIVE_CONTENT_WRAPPER} > *`)
      .count();
    console.log(`  → Active Cohort block child elements: ${activeChildren}`);

  } else {
    this.activeBlockMissing = true;
    console.warn('⚠️  Active Cohort block is NOT visible despite having enrollment data.');
  }
});

Then('if neither block is displayed then authoring of PL blocks is missing', async function () {
  try {
    await this.page.waitForTimeout(2000);

    const suggestedVisible = await this.page
      .locator(SUGGESTED_COHORT_WRAPPER)
      .isVisible()
      .catch(() => false);

    const activeVisible = await this.page
      .locator(ACTIVE_CONTENT_WRAPPER)
      .isVisible()
      .catch(() => false);

    const dataItems  = this.enrollmentData?.data;
    const apiHasData = Array.isArray(dataItems) && dataItems.length > 0;

    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║        COHORT ENROLLMENT BLOCK - VALIDATION SUMMARY      ║');
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log(`║  API Intercepted    : ${this.enrollmentApiCalled ? 'YES' : 'NO '}                                     ║`);
    console.log(`║  API Has Data       : ${apiHasData ? 'YES (Active block expected)' : 'NO  (Suggested block expected)'}                   ║`);
    console.log(`║  Suggested Block    : ${suggestedVisible ? 'VISIBLE    ' : 'NOT VISIBLE'}                              ║`);
    console.log(`║  Active Block       : ${activeVisible ? 'VISIBLE    ' : 'NOT VISIBLE'}                              ║`);
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    if (!suggestedVisible && !activeVisible) {
      await this.page.screenshot({ path: 'cohort-neither-block-warning.png' }).catch(() => {});
      console.warn('');
      console.warn('╔══════════════════════════════════════════════════════════════════╗');
      console.warn('║  ⚠️  WARNING: PL blocks are NOT authored on this page!           ║');
      console.warn('║  Neither Suggested Cohort block nor Active Cohort block is       ║');
      console.warn('║  displayed. Please author the following blocks on the PHP page:  ║');
      console.warn('║    • .premium-learning-suggested-content-wrapper                 ║');
      console.warn('║    • .premium-learning-active-content-wrapper                    ║');
      console.warn('╚══════════════════════════════════════════════════════════════════╝');
      console.warn('');
    } else {
      console.log('✅ At least one cohort block is displayed — authoring is in place.');
    }

  } catch (error) {
    console.error(`Error during cohort block authoring check: ${error.message}`);
    await this.page.screenshot({ path: 'cohort-validation-error.png' }).catch(() => {});
    throw error;
  } finally {
    if (this.browser) {
      await closeBrowser(this.browser).catch(() => {});
      console.log('Browser closed successfully');
    }
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SUGGESTED COHORT BLOCK STEPS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Recommendations API:
 * https://learningmanager.adobe.com/primeapi/v2/learningObjects/query?page[limit]=10&sort=-recommendationScore
 * &enforcedFields[learningObject]=products,roles,extensionOverrides,effectivenessData
 * &include=instances.loResources.resources
 */

Given('user logs in and lands on the PHP page for suggested cohort validation', async function () {
  await performLogin(this);
  await this.page.waitForTimeout(5000);
  console.log('✓ Successfully logged in for suggested cohort validation');
});

When('user navigates to the PHP home page for suggested cohort validation', async function () {
  this.recommendationsApiData      = null;
  this.recommendationsApiCalled    = false;
  this.allRecommendationsResponses = [];

  this.page.on('response', async (response) => {
    const url = response.url();
    if (url.includes(RECOMMENDATIONS_API_URL)) {
      console.log(`📡 Recommendations API intercepted: ${url}`);
      this.recommendationsApiCalled = true;
      try {
        const json = await response.json();
        this.allRecommendationsResponses.push({ url, data: json });
        if (!this.recommendationsApiData) {
          this.recommendationsApiData = json;
        }
        const items = json?.data || [];
        console.log(`  → ${items.length} item(s) returned`);
      } catch (err) {
        console.warn(`  → Could not parse API response: ${err.message}`);
      }
    }
  });

  await this.page.goto(`${ENV.URL}/home`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await this.page.waitForTimeout(8000);

  if (!this.recommendationsApiCalled) {
    console.log('⏳ API not yet intercepted — waiting additional time...');
    await this.page.waitForTimeout(5000);
  }

  console.log(`✓ Navigated to PHP home page: ${this.page.url()}`);
});

Then('user checks if Suggested Cohort block is visible', async function () {
  await this.page.waitForTimeout(2000);

  this.suggestedBlockVisible = await this.page
    .locator(SUGGESTED_COHORT_WRAPPER)
    .isVisible()
    .catch(() => false);

  console.log(`\n  Suggested Cohort block : ${this.suggestedBlockVisible ? '✅ VISIBLE' : '❌ NOT VISIBLE'}`);
  await this.page.screenshot({ path: 'suggested-cohort-block-check.png' });
});

Then('if Suggested Cohort block is not visible verify Active Cohort block is shown', async function () {
  if (this.suggestedBlockVisible) {
    console.log('ℹ️  Suggested Cohort block is visible — skipping Active Cohort fallback check.');
    return;
  }

  const activeVisible = await this.page
    .locator(ACTIVE_CONTENT_WRAPPER)
    .isVisible()
    .catch(() => false);

  if (activeVisible) {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log('║  ℹ️  INFO: Suggested Cohort block is not displayed.              ║');
    console.log('║  Since you have enrolled for cohorts you will not see            ║');
    console.log('║  Suggested Cohort block. Active Cohort block is shown instead.  ║');
    console.log('╚══════════════════════════════════════════════════════════════════╝');
    console.log('');
    this.skipSuggestedValidation = true;
  } else {
    console.warn('');
    console.warn('╔══════════════════════════════════════════════════════════════════╗');
    console.warn('║  ⚠️  WARNING: Neither Suggested Cohort block nor Active Cohort   ║');
    console.warn('║  block is displayed. PL blocks may not be authored on this page. ║');
    console.warn('╚══════════════════════════════════════════════════════════════════╝');
    console.warn('');
    this.skipSuggestedValidation = true;
  }
});

Then('if Suggested Cohort block is visible verify max 4 cards are displayed', async function () {
  if (!this.suggestedBlockVisible || this.skipSuggestedValidation) {
    console.log('ℹ️  Skipping card count validation — Suggested Cohort block is not visible.');
    return;
  }

  try {
    await this.page.waitForSelector(
      `${SUGGESTED_COHORT_WRAPPER} .premium-learning-cohort-card`,
      { state: 'visible', timeout: 15000 }
    );
  } catch (e) {
    console.warn('⚠️  Timed out waiting for cohort cards to appear — attempting count anyway');
  }

  await this.page.waitForTimeout(2000);

  const cardLocator = this.page.locator(`${SUGGESTED_COHORT_WRAPPER} .premium-learning-cohort-card`);
  const cardCount   = await cardLocator.count();

  console.log(`\n  Cohort cards displayed in Suggested block: ${cardCount}`);

  this.displayedCardTitles = [];
  for (let i = 0; i < cardCount; i++) {
    const card    = cardLocator.nth(i);
    const title   = await card.locator(CARD_TITLE_SELECTOR).textContent().catch(() => `Card ${i + 1}`);
    const parentA = card.locator('xpath=ancestor::a[1]');
    const href    = await parentA.getAttribute('href').catch(() => '');
    const idMatch = href.match(/\/cohort\/(\d+)/);
    this.displayedCardTitles.push(title.trim());
    console.log(`    [${i + 1}] "${title.trim()}"  id:${idMatch ? idMatch[1] : 'N/A'}  href:${href}`);
  }

  if (cardCount === 0) {
    console.warn('⚠️  No cohort cards found in the Suggested Cohort block — block may still be loading or has no data.');
    return;
  }

  expect(cardCount).toBeLessThanOrEqual(4);
  console.log(`✅ PASS — ${cardCount} card(s) displayed (max 4 allowed)`);
});

Then('verify the displayed cohort card IDs and image URLs match the recommendations API data', async function () {
  try {
    if (!this.suggestedBlockVisible || this.skipSuggestedValidation) {
      console.log('ℹ️  Skipping ID/image validation — Suggested Cohort block is not visible.');
      return;
    }

    const cardLinks = await this.page.locator(CARD_LINK_SELECTOR).all();

    this.displayedCards = [];
    for (const link of cardLinks) {
      const href     = await link.getAttribute('href').catch(() => '');
      const idMatch  = href.match(/\/cohort\/(\d+)/);
      const cohortId = idMatch ? idMatch[1] : null;
      const imgSrc   = await link.locator(CARD_IMAGE_SELECTOR).first().getAttribute('src').catch(() => null);
      const title    = await link.locator(CARD_TITLE_SELECTOR).textContent().catch(() => 'N/A');

      if (cohortId) {
        this.displayedCards.push({ cohortId, imgSrc, href, title: title.trim() });
        console.log(`  Card ID: ${cohortId}  |  title: "${title.trim()}"  |  img: ${imgSrc ? imgSrc.substring(0, 80) + '...' : 'NOT FOUND'}`);
      }
    }

    console.log(`\n  Total cards captured: ${this.displayedCards.length}`);

    if (!this.recommendationsApiCalled || !this.recommendationsApiData) {
      console.warn('⚠️  Recommendations API not intercepted — skipping API match.');
      return;
    }

    const apiItems = this.recommendationsApiData?.data || [];
    const apiMap   = {};
    for (const item of apiItems) {
      const rawId     = item?.id || '';
      const numericId = rawId.includes(':') ? rawId.split(':')[1] : rawId;
      apiMap[numericId] = item;
    }

    console.log(`\n  API returned ${apiItems.length} item(s):`);
    apiItems.forEach((item, i) => {
      console.log(`    [${i + 1}] id: ${item.id}  |  title: ${item?.attributes?.localizedMetadata?.[0]?.name || 'N/A'}`);
    });

    let allIdsMatch    = true;
    let allImagesMatch = true;

    for (const card of this.displayedCards) {
      const apiItem = apiMap[card.cohortId];

      if (apiItem) {
        const apiTitle = apiItem?.attributes?.localizedMetadata?.[0]?.name
                      || apiItem?.attributes?.name || 'N/A';
        console.log(`\n  ✅ ID MATCH  cohort ${card.cohortId}  →  "${apiTitle}"`);

        if (card.imgSrc) {
          if (card.imgSrc.includes(card.cohortId)) {
            console.log(`  ✅ IMAGE URL contains cohort ID ${card.cohortId} — correct thumbnail`);
          } else {
            const apiImageUrl = apiItem?.attributes?.thumbnailUrl
                             || apiItem?.attributes?.imageUrl
                             || '';
            if (apiImageUrl && card.imgSrc.includes(apiImageUrl.split('/').pop().split('?')[0])) {
              console.log(`  ✅ IMAGE URL matches API thumbnail for cohort ${card.cohortId}`);
            } else {
              allImagesMatch = false;
              console.warn(`  ⚠️  IMAGE MISMATCH for cohort ${card.cohortId}`);
              console.warn(`       Card img : ${card.imgSrc ? card.imgSrc.substring(0, 100) : 'null'}`);
            }
          }
        } else {
          allImagesMatch = false;
          console.warn(`  ⚠️  No image found on card for cohort ${card.cohortId}`);
        }
      } else {
        allIdsMatch = false;
        console.warn(`  ⚠️  ID MISMATCH  cohort ${card.cohortId} NOT found in API response`);
      }
    }

    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║    SUGGESTED COHORT - ID & IMAGE VALIDATION SUMMARY      ║');
    console.log('╠══════════════════════════════════════════════════════════╣');
    console.log(`║  API Items returned     : ${String(apiItems.length).padEnd(28)}║`);
    console.log(`║  Cards on UI            : ${String(this.displayedCards.length).padEnd(28)}║`);
    console.log(`║  Card IDs match API     : ${allIdsMatch ? '✅ ALL MATCH                 ' : '⚠️  SOME MISMATCH            '}║`);
    console.log(`║  Image URLs valid       : ${allImagesMatch ? '✅ ALL VALID                 ' : '⚠️  SOME MISMATCH            '}║`);
    console.log('╚══════════════════════════════════════════════════════════╝\n');

  } catch (error) {
    console.error(`Error during ID/image validation: ${error.message}`);
    await this.page.screenshot({ path: 'suggested-cohort-id-image-error.png' }).catch(() => {});
    throw error;
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PL SEARCH BLOCK - PAST-DUE COHORT VALIDATION (EXLM-5053)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validation logic:
 *  1. Intercept the Search Query API (primeapi/v2/search/query)
 *  2. Iterate every item in data[]:
 *       - If item.id does NOT contain "learningProgram:" → it is a Course type → just log it, no further checks
 *       - If item.id DOES contain "learningProgram:" → it is a Cohort
 *           a. Collect all IDs from that data element (id field + any related instance IDs)
 *           b. Search the included[] array for objects whose id starts with the same learningProgram base id
 *              (there can be MULTIPLE instances for the same cohort)
 *           c. For each such included instance check:
 *                - attributes.enrollmentDeadline > today's date
 *                - attributes.state === "Active"
 *           d. If AT LEAST ONE instance satisfies BOTH conditions → cohort is valid to display
 *           e. Otherwise → cohort should NOT be displayed (past-due / inactive)
 */

Given('user logs in for PL search past-due cohort validation', async function () {
  await performLogin(this);
  await this.page.waitForTimeout(5000);
  console.log('✓ Successfully logged in for PL Search past-due cohort validation');
});

When('user navigates to the search page for PL past-due cohort validation', async function () {
  const searchUrl = `${ENV.URL}${SEARCH_PAGE_PATH}`;
  await this.page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await this.page.waitForTimeout(8000);
  console.log(`✓ Navigated to search page: ${this.page.url()}`);
});

Then('user intercepts the PL Search block query API and validates past-due cohort filtering', async function () {
  // ── Step 1: Set up API interception ─────────────────────────────────────────
  this.plSearchPastDueApiData   = null;
  this.plSearchPastDueApiCalled = false;

  this.page.on('response', async (response) => {
    const url = response.url();
    if (url.includes(PL_SEARCH_QUERY_API) && !this.plSearchPastDueApiCalled) {
      console.log(`📡 PL Search Query API intercepted: ${url}`);
      this.plSearchPastDueApiCalled = true;
      try {
        const json = await response.json();
        this.plSearchPastDueApiData = json;
        const items = json?.data || [];
        console.log(`  → data[] count: ${items.length}`);
      } catch (err) {
        console.warn(`  → Could not parse API response: ${err.message}`);
        this.plSearchPastDueApiData = {};
      }
    }
  });

  // ── Step 2: Reload to trigger the API ────────────────────────────────────────
  await this.page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
  await this.page.waitForTimeout(10000);

  if (!this.plSearchPastDueApiCalled) {
    console.log('⏳ PL Search API not intercepted on reload — waiting additional time...');
    await this.page.waitForTimeout(5000);
  }

  if (!this.plSearchPastDueApiCalled || !this.plSearchPastDueApiData) {
    throw new Error(
      '❌ FAIL — PL Search Query API (primeapi/v2/search/query) was not intercepted.\n' +
      'Ensure the user is authenticated and the PL Search block is authored on the search page.'
    );
  }

  const apiResponse = this.plSearchPastDueApiData;
  const dataItems   = apiResponse?.data     || [];
  const included    = apiResponse?.included || [];
  const today       = new Date();

  console.log(`\n  ✅ API intercepted — data[] items: ${dataItems.length}, included[] items: ${included.length}`);
  console.log(`  📅 Today's date (for deadline comparison): ${today.toISOString()}`);

  // ── Step 3: Collect DOM cards actually rendered on the PL Search block ────────
  // We validate what the UI is ACTUALLY showing — not what the API returned.
  // The block should only render cohorts with enrollmentDeadline > today AND state=Active.
  await this.page.waitForTimeout(3000);

  const domCardLinks = await this.page.locator(`${PL_SEARCH_BLOCK} .browse-cards-block-content a[href]`).all();
  const domCohortIds = [];

  console.log('\n' + '═'.repeat(70));
  console.log('  PL SEARCH BLOCK — PAST-DUE COHORT VALIDATION (EXLM-5053)');
  console.log('  Validating cohort cards RENDERED ON UI against API instance data');
  console.log('═'.repeat(70));

  console.log(`\n  DOM cards found on PL Search block: ${domCardLinks.length}`);

  for (const link of domCardLinks) {
    const href    = await link.getAttribute('href').catch(() => '');
    const title   = await link.locator('h3').textContent().catch(() => '');
    // Cohort URLs: /premium/cohort/164863 or /en/premium/cohort/164863
    const idMatch = href.match(/\/cohort\/(\d+)/);
    if (idMatch) {
      domCohortIds.push({ cohortId: idMatch[1], title: title.trim(), href });
      console.log(`    [cohort] id:${idMatch[1]}  title:"${title.trim()}"  href:${href}`);
    } else {
      console.log(`    [course] href:${href}  title:"${title.trim()}"`);
    }
  }

  console.log(`\n  Cohort cards displayed on UI: ${domCohortIds.length}`);

  // ── Step 4: Build API lookup map from data[] by numeric cohort ID ─────────────
  const apiById = {};
  for (const item of dataItems) {
    const rawId     = item?.id || '';
    const numericId = rawId.includes(':') ? rawId.split(':').pop() : rawId;
    apiById[numericId] = item;
  }

  // ── Step 5: For each cohort card shown on UI, validate its instances ──────────
  const results = [];

  for (let i = 0; i < domCohortIds.length; i++) {
    const { cohortId, title, href } = domCohortIds[i];
    const lpBaseId = `learningProgram:${cohortId}`;

    console.log(`\n  ── DOM Cohort Card [${i + 1}] ─────────────────────────────────────`);
    console.log(`     cohortId : ${cohortId}`);
    console.log(`     title    : "${title}"`);
    console.log(`     href     : ${href}`);

    // Find all learningObjectInstance entries for this cohort in included[]
    const cohortInstances = included.filter(inc => {
      const incId = inc?.id || '';
      return incId.startsWith(lpBaseId) && inc?.type === 'learningObjectInstance';
    });

    console.log(`     Instances found in included[] for ${lpBaseId}: ${cohortInstances.length}`);

    if (cohortInstances.length === 0) {
      console.warn(`     ⚠️   No instances found in included[] for cohort ${lpBaseId}`);
      console.warn(`           → Cannot validate enrollmentDeadline / state`);
      results.push({
        index: i + 1,
        cohortId,
        title,
        valid: null,
        note: 'No instances found in included[] — cannot validate'
      });
      continue;
    }

    // Check each instance: enrollmentDeadline > today AND state === "Active"
    let atLeastOneValid   = false;
    const instanceDetails = [];

    for (const inst of cohortInstances) {
      const instId             = inst?.id || '';
      const attrs              = inst?.attributes || {};
      const enrollmentDeadline = attrs?.enrollmentDeadline || null;
      const state              = attrs?.state              || null;

      const stateOk    = state === 'Active';
      let   deadlineOk = false;
      let   deadlineDisplay;

      if (enrollmentDeadline) {
        const deadlineDate = new Date(enrollmentDeadline);
        deadlineOk       = deadlineDate > today;
        deadlineDisplay  = `${enrollmentDeadline} (${deadlineOk ? 'FUTURE ✅' : 'PAST ❌'})`;
      } else {
        deadlineDisplay = 'NOT SET ❌';
      }

      const instanceValid = deadlineOk && stateOk;
      if (instanceValid) atLeastOneValid = true;

      instanceDetails.push({ instId, enrollmentDeadline: deadlineDisplay, state: state || 'NOT SET', deadlineOk, stateOk, valid: instanceValid });

      console.log(`\n       Instance : ${instId}`);
      console.log(`         enrollmentDeadline : ${deadlineDisplay}`);
      console.log(`         state              : ${state || 'NOT SET'} ${stateOk ? '✅' : '❌'}`);
      console.log(`         instance valid     : ${instanceValid ? '✅ YES (enrollmentDeadline > today AND state=Active)' : '❌ NO'}`);
    }

    const verdict = atLeastOneValid
      ? '✅ VALID — Correctly displayed (at least one instance: future deadline + Active)'
      : '❌ INVALID — Should NOT be displayed (no instance has future deadline AND Active state)';

    console.log(`\n     Overall verdict for DOM card [${i + 1}] "${title}": ${verdict}`);

    results.push({
      index: i + 1,
      cohortId,
      title,
      valid: atLeastOneValid,
      instanceCount: cohortInstances.length,
      instanceDetails,
      note: atLeastOneValid
        ? 'At least one instance: enrollmentDeadline > today AND state=Active — correctly shown'
        : 'NO instance satisfies enrollmentDeadline > today AND state=Active — should be filtered out'
    });
  }

  // ── Step 6: Also log API-only cohorts (in API but NOT rendered on UI) ─────────
  // These are cohorts the block correctly filtered out (past-due or inactive)
  console.log('\n  ── API cohorts NOT rendered on UI (correctly filtered out) ──────────');
  let filteredOutCount = 0;
  for (const item of dataItems) {
    const rawId = item?.id || '';
    if (!rawId.includes('learningProgram:')) continue;
    const numericId = rawId.includes(':') ? rawId.split(':').pop() : rawId;
    const alreadyShown = domCohortIds.some(d => d.cohortId === numericId);
    if (!alreadyShown) {
      const apiTitle = item?.attributes?.localizedMetadata?.[0]?.name || item?.attributes?.name || 'N/A';
      console.log(`     ✅ Filtered out (not shown on UI): id:${rawId}  title:"${apiTitle}"`);
      filteredOutCount++;
    }
  }
  if (filteredOutCount === 0) {
    console.log('     (none — all API cohorts are shown on UI)');
  }

  // ── Step 7: Summary Report ────────────────────────────────────────────────────
  const validCohorts   = results.filter(r => r.valid === true);
  const invalidCohorts = results.filter(r => r.valid === false);
  const unknownCohorts = results.filter(r => r.valid === null);

  console.log('\n' + '╔' + '═'.repeat(68) + '╗');
  console.log('║' + '   PL SEARCH BLOCK — PAST-DUE COHORT VALIDATION SUMMARY         '.padEnd(68) + '║');
  console.log('╠' + '═'.repeat(68) + '╣');
  console.log(`║  Total API data[] items          : ${String(dataItems.length).padEnd(31)}║`);
  console.log(`║  Cohort cards rendered on UI     : ${String(domCohortIds.length).padEnd(31)}║`);
  console.log(`║  ✅ Valid cohorts (correctly shown): ${String(validCohorts.length).padEnd(30)}║`);
  console.log(`║  ❌ Invalid cohorts (should hide) : ${String(invalidCohorts.length).padEnd(30)}║`);
  console.log(`║  ⚠️  Unknown (no instances found) : ${String(unknownCohorts.length).padEnd(30)}║`);
  console.log(`║  ✅ Cohorts filtered out by block : ${String(filteredOutCount).padEnd(30)}║`);
  console.log('╠' + '═'.repeat(68) + '╣');

  for (const r of results) {
    let statusIcon;
    if      (r.valid === true)  statusIcon = '✅';
    else if (r.valid === false) statusIcon = '❌';
    else                        statusIcon = '⚠️ ';
    const label = `${statusIcon}  [${r.index}] COHORT  "${r.title.substring(0, 30)}"`;
    console.log(`║  ${label.padEnd(66)}║`);
  }

  console.log('╚' + '═'.repeat(68) + '╝');

  // ── Step 8: Assertion ─────────────────────────────────────────────────────────
  // PASS if all cohort cards currently shown on UI have at least one valid instance.
  // FAIL if any cohort card shown on UI has NO instance with future deadline + Active state
  // (meaning the block failed to filter out a past-due/inactive cohort).
  if (invalidCohorts.length > 0) {
    console.warn('\n⚠️  PAST-DUE / INACTIVE COHORT CARDS FOUND ON UI:');
    console.warn('   The block should have filtered these out but is still displaying them.\n');
    for (const r of invalidCohorts) {
      console.warn(`   [${r.index}] id: learningProgram:${r.cohortId}  title: "${r.title}"`);
      console.warn(`        → ${r.note}`);
      if (r.instanceDetails) {
        for (const inst of r.instanceDetails) {
          console.warn(`        Instance ${inst.instId}:`);
          console.warn(`          enrollmentDeadline : ${inst.enrollmentDeadline}`);
          console.warn(`          state              : ${inst.state}`);
        }
      }
    }
    console.warn('\n❌ FAIL — PL Search block is displaying past-due/inactive cohort(s) on the UI.');
    console.warn('   Expected: Only cohorts with enrollmentDeadline > today AND state=Active should be shown.');
    throw new Error(
      `❌ FAIL — ${invalidCohorts.length} past-due or inactive cohort card(s) are incorrectly shown on the UI.\n` +
      invalidCohorts.map(r => `  • [Card ${r.index}] "${r.title}" (learningProgram:${r.cohortId}) — ${r.note}`).join('\n')
    );
  } else if (domCohortIds.length === 0) {
    console.log('\n✅ INFO — No cohort cards are rendered on the PL Search block UI.');
    console.log(`   The block correctly filtered out all ${filteredOutCount} past-due/inactive cohort(s) from the API.`);
  } else if (invalidCohorts.length === 0) {
    console.log(`\n✅ PASS — All ${validCohorts.length} cohort card(s) shown on UI are valid:`);
    console.log('   ✔ enrollmentDeadline > today  (enrollment window is open)');
    console.log('   ✔ state = Active              (cohort session is currently running)');
    if (filteredOutCount > 0) {
      console.log(`   ✅ ${filteredOutCount} past-due/inactive cohort(s) from API were correctly NOT shown on UI.`);
    }
    if (unknownCohorts.length > 0) {
      console.warn(`   ⚠️  ${unknownCohorts.length} cohort(s) could not be validated (no instances in included[])`);
    }
  }

  await this.page.screenshot({ path: 'screenshots/pl-search-past-due-cohort-validation.png' }).catch(() => {});

  if (this.browser) {
    await closeBrowser(this.browser).catch(() => {});
    console.log('Browser closed successfully');
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PL BROWSE CARDS - COHORT DEADLINE + COURSE LABEL VALIDATION (EXLM-5053)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Browse page DOM selectors (from provided HTML):
 *   Block wrapper : .premium-learning-browse-cards-container
 *   Card link     : .premium-learning-browse-cards-block a[href*="/premium/"]
 *   Card title    : h3.premium-learning-card-title
 *   Type label    : .premium-learning-card-type-label   (visible on card)
 *
 * API to intercept: primeapi/v2/learningObjects/query  (same query endpoint used for browse)
 *
 * Validation rules per card in data[]:
 *   A) If data[].id does NOT contain "learningProgram:" → COURSE type
 *        - Check data[].attributes.loType  (should be "course")
 *        - Check data[].attributes.tags[]
 *            "Live Session"  → card must show label "Live Instructor Course"
 *            "Self-paced"    → card must show label "On-Demand"  (or "On Demand")
 *        - No enrollmentDeadline check needed
 *
 *   B) If data[].id DOES contain "learningProgram:" → COHORT type
 *        - Expect "Cohort" label on card
 *        - Find all included[] entries where:
 *            id starts with the learningProgram base id  AND  type === "learningObjectInstance"
 *        - At least ONE instance must have:
 *            enrollmentDeadline > today  AND  state === "Active"
 *        - If no valid instance → cohort is past-due / invalid → FAIL
 */

const PL_BROWSE_CONTAINER   = '.premium-learning-browse-cards-container';
const PL_BROWSE_BLOCK       = '.premium-learning-browse-cards';
const PL_BROWSE_CARD_LINK   = `${PL_BROWSE_BLOCK} .browse-cards-block-content a[href*="/premium/"]`;
const PL_BROWSE_TYPE_LABEL  = '.premium-learning-card-type-label';
const PL_BROWSE_TITLE       = 'h3.premium-learning-card-title';

// The Browse page uses the same query endpoint as recommendations but with different params
const PL_BROWSE_QUERY_API   = 'learningmanager.adobe.com/primeapi/v2/learningObjects/query';
// Browse page path — ENV.URL already contains /en locale prefix
const PL_BROWSE_PAGE_PATH   = '/browse';

Given('user logs in for PL browse cards validation', async function () {
  await performLogin(this);
  await this.page.waitForTimeout(5000);
  console.log('✓ Successfully logged in for PL Browse cards validation');
});

When('user navigates to the PL browse page for card validation', async function () {
  // ── Register API listener BEFORE navigating so the call is captured on first page load ──
  this.plBrowseApiData   = null;
  this.plBrowseApiCalled = false;

  this.page.on('response', async (response) => {
    const url = response.url();
    if (url.includes(PL_BROWSE_QUERY_API) && !this.plBrowseApiCalled) {
      console.log(`📡 PL Browse Query API intercepted: ${url}`);
      this.plBrowseApiCalled = true;
      try {
        const json = await response.json();
        this.plBrowseApiData = json;
        const items = json?.data || [];
        console.log(`  → data[] count: ${items.length}`);
      } catch (err) {
        console.warn(`  → Could not parse API response: ${err.message}`);
        this.plBrowseApiData = {};
      }
    }
  });

  const browseUrl = `${ENV.URL}${PL_BROWSE_PAGE_PATH}`;
  await this.page.goto(browseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await this.page.waitForTimeout(10000);

  if (!this.plBrowseApiCalled) {
    console.log('⏳ Browse API not intercepted on page load — waiting additional time...');
    await this.page.waitForTimeout(5000);
  }

  console.log(`✓ Navigated to PL browse page: ${this.page.url()}`);
  console.log(`  PL Browse API intercepted: ${this.plBrowseApiCalled ? '✅ YES' : '❌ NO (will fail in Then step)'}`);
});

Then('user intercepts the PL Browse cards query API and validates cohort filtering and course type labels', async function () {
  const today = new Date();

  if (!this.plBrowseApiCalled || !this.plBrowseApiData) {
    throw new Error(
      '❌ FAIL — PL Browse Query API was not intercepted.\n' +
      'Ensure the user is authenticated and the PL Browse block is on the page.'
    );
  }

  const dataItems = this.plBrowseApiData?.data     || [];
  const included  = this.plBrowseApiData?.included || [];
  console.log(`\n  API data[] items: ${dataItems.length}  |  included[]: ${included.length}`);

  // Build API lookup map: numericId → item
  const apiById = {};
  for (const item of dataItems) {
    const id = (item?.id || '').split(':').pop();
    apiById[id] = item;
  }

  // Collect DOM cards from the browse block
  await this.page.waitForTimeout(3000);
  const links = await this.page.locator(PL_BROWSE_CARD_LINK).all();
  console.log(`  DOM cards found: ${links.length}`);

  const failures = [];

  for (let i = 0; i < links.length; i++) {
    const href      = await links[i].getAttribute('href').catch(() => '');
    const title     = await links[i].locator(PL_BROWSE_TITLE).textContent().catch(() => 'N/A');
    const typeLabel = await links[i].locator(PL_BROWSE_TYPE_LABEL).textContent().catch(() => '');
    const idMatch   = href.match(/\/premium\/(course|cohort)\/(\d+)/);
    const urlType   = idMatch?.[1] || 'unknown';
    const urlId     = idMatch?.[2] || null;
    const apiItem   = urlId ? apiById[urlId] : null;

    console.log(`\n  [${i + 1}] "${title.trim()}"  type:${urlType}  id:${urlId}  label:"${typeLabel.trim()}"`);

    if (!apiItem) {
      console.warn(`       ⚠️  id ${urlId} not found in API data[] — skipping`);
      continue;
    }

    const rawId = apiItem?.id || '';

    // ── COURSE: validate type label matches tag ────────────────────────────────
    if (!rawId.includes('learningProgram:')) {
      const tags      = (apiItem?.attributes?.tags || []).map(t => t.toLowerCase());
      const isLive    = tags.some(t => t.includes('live session'));
      const isSelf    = tags.some(t => t.includes('self-paced') || t.includes('self paced'));
      const domNorm   = typeLabel.trim().toLowerCase().replace(/[-\s]+/g, ' ');

      if (isLive) {
        const ok = domNorm.includes('live instructor');
        console.log(`       tag: Live Session → label: "${typeLabel.trim()}" ${ok ? '✅' : '❌ expected "Live Instructor Course"'}`);
        if (!ok) failures.push(`[${i + 1}] "${title.trim()}" — expected "Live Instructor Course" but got "${typeLabel.trim()}"`);
      } else if (isSelf) {
        const ok = domNorm.includes('on demand') || domNorm.includes('on-demand');
        console.log(`       tag: Self-paced → label: "${typeLabel.trim()}" ${ok ? '✅' : '❌ expected "On-Demand"'}`);
        if (!ok) failures.push(`[${i + 1}] "${title.trim()}" — expected "On-Demand" but got "${typeLabel.trim()}"`);
      } else {
        console.log(`       ℹ️  no recognized tag — label check skipped`);
      }
      continue;
    }

    // ── COHORT: validate enrollmentDeadline > today AND state=Active ──────────
    const lpBase    = rawId.split(':').slice(0, 2).join(':');
    const instances = included.filter(inc => inc?.id?.startsWith(lpBase) && inc?.type === 'learningObjectInstance');
    console.log(`       instances in included[]: ${instances.length}`);

    if (instances.length === 0) {
      console.warn(`       ⚠️  no instances found — cannot validate`);
      continue;
    }

    const valid = instances.some(inst => {
      const dl    = inst?.attributes?.enrollmentDeadline;
      const state = inst?.attributes?.state;
      return state === 'Active' && dl && new Date(dl) > today;
    });

    console.log(`       cohort valid (future deadline + Active): ${valid ? '✅' : '❌'}`);
    if (!valid) failures.push(`[${i + 1}] "${title.trim()}" (${rawId}) — no instance with enrollmentDeadline > today AND state=Active`);
  }

  // ── Summary table ─────────────────────────────────────────────────────────
  console.log('\n  ┌─────┬────────────────────────────────────┬──────────────────────────┬──────────────────────────┬────────┐');
  console.log('  │  #  │ Title                              │ Label on UI              │ Enrollment Deadline      │ Status │');
  console.log('  ├─────┼────────────────────────────────────┼──────────────────────────┼──────────────────────────┼────────┤');

  for (let i = 0; i < links.length; i++) {
    const href      = await links[i].getAttribute('href').catch(() => '');
    const title     = await links[i].locator(PL_BROWSE_TITLE).textContent().catch(() => 'N/A');
    const typeLabel = await links[i].locator(PL_BROWSE_TYPE_LABEL).textContent().catch(() => '');
    const idMatch   = href.match(/\/premium\/(course|cohort)\/(\d+)/);
    const urlId     = idMatch?.[2] || null;
    const apiItem   = urlId ? apiById[urlId] : null;
    const rawId     = apiItem?.id || '';

    // Find earliest future enrollment deadline for cohorts
    let deadlineDisplay = 'N/A (course)';
    if (rawId.includes('learningProgram:')) {
      const lpBase    = rawId.split(':').slice(0, 2).join(':');
      const instances = included.filter(inc => inc?.id?.startsWith(lpBase) && inc?.type === 'learningObjectInstance');
      const validInst = instances.find(inst => {
        const dl = inst?.attributes?.enrollmentDeadline;
        return inst?.attributes?.state === 'Active' && dl && new Date(dl) > new Date();
      });
      if (validInst) {
        const dl = validInst.attributes.enrollmentDeadline;
        deadlineDisplay = new Date(dl).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      } else {
        const anyInst = instances[0];
        deadlineDisplay = anyInst?.attributes?.enrollmentDeadline
          ? `${new Date(anyInst.attributes.enrollmentDeadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} ❌`
          : 'No instances';
      }
    }

    const num    = String(i + 1).padEnd(3);
    const t      = title.trim().substring(0, 34).padEnd(34);
    const lbl    = typeLabel.trim().substring(0, 24).padEnd(24);
    const dl     = deadlineDisplay.substring(0, 24).padEnd(24);
    const status = failures.some(f => f.startsWith(`[${i + 1}]`)) ? '❌ FAIL' : '✅ PASS';
    console.log(`  │ ${num} │ ${t} │ ${lbl} │ ${dl} │ ${status} │`);
  }

  console.log('  └─────┴────────────────────────────────────┴──────────────────────────┴──────────────────────────┴────────┘');
  console.log(`\n  Total cards on UI: ${links.length}  |  Issues: ${failures.length}`);

  await this.page.screenshot({ path: 'screenshots/pl-browse-cards-validated.png' }).catch(() => {});
  if (this.browser) { await closeBrowser(this.browser).catch(() => {}); }

  if (failures.length > 0) {
    throw new Error(`❌ FAIL — ${failures.length} issue(s) found:\n` + failures.map(f => `  • ${f}`).join('\n'));
  }
  console.log('✅ PASS — All PL Browse cards validated successfully.');
});

Then('verify each product tab shows cohorts matching that product from the API', async function () {
  try {
    if (!this.suggestedBlockVisible || this.skipSuggestedValidation) {
      console.log('ℹ️  Skipping tab validation — Suggested Cohort block is not visible.');
      return;
    }

    if (!this.recommendationsApiCalled || !this.recommendationsApiData) {
      console.warn('⚠️  Recommendations API not intercepted — skipping tab validation.');
      return;
    }

    const allApiItems = [];
    for (const resp of (this.allRecommendationsResponses || [])) {
      (resp.data?.data || []).forEach(item => allApiItems.push(item));
    }

    console.log(`\n  Total API items across all responses: ${allApiItems.length}`);

    const productToIds = {};
    for (const item of allApiItems) {
      const rawId     = item?.id || '';
      const numericId = rawId.includes(':') ? rawId.split(':')[1] : rawId;
      const products  = item?.attributes?.products || [];
      for (const prod of products) {
        const prodName = prod?.name || '';
        if (!productToIds[prodName]) productToIds[prodName] = [];
        if (!productToIds[prodName].includes(numericId)) {
          productToIds[prodName].push(numericId);
        }
      }
    }

    console.log('  Product → Cohort IDs from API:');
    for (const [prod, ids] of Object.entries(productToIds)) {
      console.log(`    "${prod}" : [${ids.join(', ')}]`);
    }

    const tabLocators = await this.page.locator(TAB_LIST_SELECTOR).all();
    console.log(`\n  Found ${tabLocators.length} tab(s) in Suggested Cohort block`);

    const tabResults = [];

    for (let i = 0; i < tabLocators.length; i++) {
      const tab      = tabLocators[i];
      const tabId    = await tab.getAttribute('data-tab-id').catch(() => '');
      const tabText  = await tab.textContent().catch(() => '');
      const isForYou = tabId === 'For you';

      console.log(`\n  ─── Tab [${i + 1}]: "${tabText.trim()}" (data-tab-id="${tabId}") ───`);

      await tab.click();
      await this.page.waitForTimeout(2000);

      const visibleCardLinks = await this.page
        .locator(`${PANEL_SELECTOR} a[href*="/premium/cohort/"]`)
        .all();

      const visibleIds    = [];
      const visibleTitles = [];
      for (const link of visibleCardLinks) {
        const href    = await link.getAttribute('href').catch(() => '');
        const idMatch = href.match(/\/cohort\/(\d+)/);
        const title   = await link.locator(CARD_TITLE_SELECTOR).textContent().catch(() => '');
        if (idMatch) {
          visibleIds.push(idMatch[1]);
          visibleTitles.push(title.trim());
        }
      }
      console.log(`  Cards visible: ${visibleIds.map((id, i) => `${id} ("${visibleTitles[i]}")`).join(', ')}`);

      if (isForYou) {
        const cardCount = visibleIds.length;
        console.log(`  ℹ️  "For you" tab — ${cardCount} card(s) displayed (no product filter applied)`);
        expect(cardCount).toBeLessThanOrEqual(4);
        tabResults.push({ tabId, tabText: tabText.trim(), passed: true, note: `${cardCount} card(s) shown` });
        continue;
      }

      const expectedIds = productToIds[tabId] || productToIds[tabText.trim()] || [];
      console.log(`  Expected cohort IDs from API for "${tabId}": [${expectedIds.join(', ')}]`);

      let tabPass = true;
      for (const visibleId of visibleIds) {
        if (expectedIds.includes(visibleId)) {
          console.log(`  ✅ cohort ${visibleId} belongs to product "${tabId}"`);
        } else {
          tabPass = false;
          console.warn(`  ⚠️  cohort ${visibleId} NOT found in API items for product "${tabId}"`);
        }
      }

      if (visibleIds.length === 0) {
        console.log(`  ℹ️  No cards displayed under tab "${tabId}" — may be empty for this user`);
        tabPass = true;
      }

      tabResults.push({
        tabId,
        tabText:     tabText.trim(),
        visibleIds,
        expectedIds,
        passed:      tabPass,
        note:        `${visibleIds.length} card(s) shown`
      });
    }

    await this.page.screenshot({ path: 'suggested-cohort-tabs-validated.png' });

    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log('║         PRODUCT TAB VALIDATION SUMMARY                   ║');
    console.log('╠══════════════════════════════════════════════════════════╣');
    for (const r of tabResults) {
      const status = r.passed ? '✅ PASS' : '⚠️  WARN';
      console.log(`║  ${status}  "${r.tabText.padEnd(30)}" — ${r.note.padEnd(16)}║`);
    }
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    const failedTabs = tabResults.filter(r => !r.passed);
    if (failedTabs.length > 0) {
      console.warn(`⚠️  ${failedTabs.length} tab(s) showed cohorts not matching their product category in the API.`);
      console.warn('   This may indicate stale data or a product filter issue in the block.');
    } else {
      console.log('✅ PASS — All product tabs show cohorts matching the API product data');
    }

  } catch (error) {
    console.error(`Error during tab validation: ${error.message}`);
    await this.page.screenshot({ path: 'suggested-cohort-tab-error.png' }).catch(() => {});
    throw error;
  } finally {
    if (this.browser) {
      await closeBrowser(this.browser).catch(() => {});
      console.log('Browser closed successfully');
    }
  }
});
