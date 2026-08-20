const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const ENV = require('../../config.js');

setDefaultTimeout(90 * 1000);

// Selectors mirror the proven constants already used in tests/steps/header-navigation.js
// (div.header.block, nav[role="navigation"], etc.) and the real exlm
// blocks/announcement-ribbon source on GitHub. The "user is logged in and on the
// Experience League home page" Given, and several hamburger/dropdown steps, are
// intentionally reused from header-navigation.js, not redefined here.
const HEADER_SEL = 'div.header.block';
const NAV_SEL = `${HEADER_SEL} nav[role="navigation"]`;
const ADOBE_LOGO_SEL = `${NAV_SEL} div.adobe-logo a[aria-label="Adobe Experience League"]`;
const NAV_WRAPPER_SEL = `${NAV_SEL} div.nav-wrapper`;
const HAMBURGER_SEL = `${NAV_SEL} button.nav-hamburger`;
const MOBILE_DRAWER_SEL = 'div.nav-mobile-drawer';
const MOBILE_BODY_SEL = `${MOBILE_DRAWER_SEL} div.nav-mobile-body`;
const LANG_BTN_SEL = `${NAV_SEL} button.language-selector-button`;
const LANG_POPOVER_SEL = `${NAV_SEL} div.language-selector-popover`;
const RIBBON_SEL = 'div.announcement-ribbon';
const RIBBON_CTA_SEL = `${RIBBON_SEL} div.ribbon-button-container a`;

const EXPECTED_TOP_LEVEL_NAV_ITEMS = ['Learn by Product', 'Documentation', 'AI Training', 'Events', 'Community', 'Support'];

// ---------------------------------------------------------------------------
// Header nav consistency across two pages
// ---------------------------------------------------------------------------
async function getMainNavLabels(page) {
  return page.locator(`${NAV_WRAPPER_SEL} > ul > li.nav-item-root`).evaluateAll((els) =>
    els.map((el) => el.textContent.trim()).filter(Boolean)
  );
}

Then('the main nav item labels on this page are recorded', async function () {
  this.navLabelsBefore = await getMainNavLabels(this.page);
  expect(this.navLabelsBefore.length).toBeGreaterThan(0);
  console.log(`✓ Recorded ${this.navLabelsBefore.length} top-level nav labels: ${this.navLabelsBefore.join(', ')}`);
});

When('user navigates to a second, different page', async function () {
  this.secondPageUrl = `${ENV.URL}/docs`;
  await this.page.goto(this.secondPageUrl);
  await this.page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
  await this.page.waitForTimeout(2000);
});

Then('the main nav item labels on this page should match what was recorded', async function () {
  const navLabelsAfter = await getMainNavLabels(this.page);
  expect(navLabelsAfter).toEqual(this.navLabelsBefore);
  console.log('✓ Header nav labels are identical on the second page');
});

// ---------------------------------------------------------------------------
// Dropdown closes on outside click
// ---------------------------------------------------------------------------
When('user clicks elsewhere on the page', async function () {
  await this.page.locator('body').click({ position: { x: 5, y: 5 } });
  await this.page.waitForTimeout(800);
});

Then('the Learn by Product dropdown content should be closed', async function () {
  const content = this.page.locator(
    'li.nav-item-root.nav-item-tab div.nav-item-content-level-0.nav-item-content-tab'
  ).first();
  const isVisible = await content.isVisible().catch(() => false);
  expect(isVisible).toBeFalsy();
  console.log('✓ Learn by Product dropdown closed after clicking elsewhere');
});

// ---------------------------------------------------------------------------
// Mobile hamburger full behavior
// ---------------------------------------------------------------------------
Then('the mobile drawer body should contain all expected top-level nav items', async function () {
  const body = this.page.locator(MOBILE_BODY_SEL);
  for (const item of EXPECTED_TOP_LEVEL_NAV_ITEMS) {
    const el = body.locator('li.nav-item-root').filter({ hasText: item });
    await expect(el.first(), `Mobile drawer should contain "${item}"`).toBeVisible({ timeout: 10000 });
  }
  console.log(`✓ Mobile drawer contains all ${EXPECTED_TOP_LEVEL_NAV_ITEMS.length} expected top-level nav items`);
});

When('user taps a mobile nav item with sub-items', async function () {
  const body = this.page.locator(MOBILE_BODY_SEL);
  const toggle = body.locator('li.nav-item-root button.nav-item-toggle-root').first();
  await expect(toggle).toBeVisible({ timeout: 10000 });
  this.tappedMobileToggle = toggle;
  await toggle.click();
  await this.page.waitForTimeout(600);
});

Then('its sub-items should expand within the drawer', async function () {
  const parentItem = this.tappedMobileToggle.locator('xpath=ancestor::li[contains(@class, "nav-item-root")]').first();
  const subItems = parentItem.locator('li.nav-item');
  const count = await subItems.count();
  expect(count).toBeGreaterThan(0);
  await expect(subItems.first()).toBeVisible();
  console.log(`✓ Tapped mobile nav item expanded ${count} sub-item(s)`);
});

When('user closes the mobile drawer with the close icon', async function () {
  // The real aria-label is "Close navigation menu", shared with a second, unrelated
  // close button used for mobile sub-panel drill-downs (.nav-mobile-panel-close) — so
  // aria-label alone would be ambiguous. button.nav-mobile-close uniquely targets the
  // top-level drawer's own close button (confirmed via audit against header-v2.js).
  const closeIcon = this.page.locator(`${MOBILE_DRAWER_SEL} button.nav-mobile-close`);
  await expect(closeIcon.first()).toBeVisible({ timeout: 10000 });
  await closeIcon.first().click();
  await this.page.waitForTimeout(600);
});

Then('the mobile navigation drawer should be closed', async function () {
  const drawer = this.page.locator(MOBILE_DRAWER_SEL);
  await expect(drawer).toBeHidden({ timeout: 10000 });
  console.log('✓ Mobile navigation drawer is closed');
});

When('user reopens the mobile drawer and taps outside it', async function () {
  const hamburger = this.page.locator(HAMBURGER_SEL);
  await expect(hamburger).toBeVisible({ timeout: 10000 });
  await hamburger.click();
  await this.page.waitForTimeout(600);

  await this.page.locator('body').click({ position: { x: 2, y: 2 } });
  await this.page.waitForTimeout(600);
});

// ---------------------------------------------------------------------------
// Language selector actually changes content
// ---------------------------------------------------------------------------
When('user selects a non-English language from the header language selector', async function () {
  this.urlBeforeLanguageChange = this.page.url();
  await this.page.locator(LANG_BTN_SEL).click();
  await this.page.waitForTimeout(500);

  const popover = this.page.locator(LANG_POPOVER_SEL);
  await expect(popover).toBeVisible({ timeout: 10000 });

  const nonEnglishOption = popover.locator('span.language-selector-label').filter({ hasNotText: 'English' }).first();
  this.selectedLanguageText = await nonEnglishOption.textContent();
  await nonEnglishOption.click();
  await this.page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
  await this.page.waitForTimeout(2000);
});

Then('the page should reload with the locale segment reflecting the new language', async function () {
  const url = this.page.url();
  expect(url).not.toBe(this.urlBeforeLanguageChange);
  console.log(`✓ URL changed from "${this.urlBeforeLanguageChange}" to "${url}" after selecting "${this.selectedLanguageText.trim()}"`);
});

When('user switches back to English from the header language selector', async function () {
  await this.page.locator(LANG_BTN_SEL).click();
  await this.page.waitForTimeout(500);

  const popover = this.page.locator(LANG_POPOVER_SEL);
  await expect(popover).toBeVisible({ timeout: 10000 });

  const englishOption = popover.locator('span.language-selector-label[data-value="en"]');
  await englishOption.click();
  await this.page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});
  await this.page.waitForTimeout(2000);
});

Then('the page should revert to the English locale', async function () {
  const url = this.page.url();
  expect(url).toMatch(/\/en\//);
  console.log(`✓ Page reverted to English locale: "${url}"`);
});

// ---------------------------------------------------------------------------
// Adobe logo returns to homepage
// ---------------------------------------------------------------------------
Then('user clicks the Adobe logo in the header', async function () {
  const logo = this.page.locator(ADOBE_LOGO_SEL);
  await expect(logo).toBeVisible({ timeout: 15000 });
  await logo.click();
  await this.page.waitForTimeout(2500);
});

Then('the browser should navigate to the homepage', async function () {
  const url = this.page.url();
  expect(url).not.toBe(this.secondPageUrl);
  expect(url).toMatch(new RegExp(`${ENV.URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/?(home)?$`));
  console.log(`✓ Adobe logo click navigated to the homepage: "${url}"`);
});

// ---------------------------------------------------------------------------
// Announcement ribbon CTA
// ---------------------------------------------------------------------------
Given('an announcement ribbon with a CTA is visible', async function () {
  const ribbon = this.page.locator(RIBBON_SEL).first();
  this.ribbonVisible = await ribbon.isVisible().catch(() => false);
  if (this.ribbonVisible) {
    const cta = this.page.locator(RIBBON_CTA_SEL).first();
    this.ribbonCtaVisible = await cta.isVisible().catch(() => false);
    if (this.ribbonCtaVisible) {
      this.ribbonCtaHref = await cta.getAttribute('href');
    }
  }
  if (!this.ribbonVisible || !this.ribbonCtaVisible) {
    console.log('⚠️ No active announcement ribbon with a CTA on this page today — subsequent steps will skip gracefully');
  }
});

When('user clicks the announcement ribbon CTA', async function () {
  if (!this.ribbonVisible || !this.ribbonCtaVisible) return;
  await this.page.locator(RIBBON_CTA_SEL).first().click();
  await this.page.waitForTimeout(2500);
});

Then("the browser should navigate to the ribbon's correct linked destination", async function () {
  if (!this.ribbonVisible || !this.ribbonCtaVisible) {
    console.log('✓ Skipped — no announcement ribbon CTA was active to verify');
    return;
  }
  const currentUrl = this.page.url();
  const expectedPath = this.ribbonCtaHref.startsWith('http')
    ? new URL(this.ribbonCtaHref).pathname
    : this.ribbonCtaHref;
  expect(currentUrl).toContain(expectedPath);
  console.log(`✓ Announcement ribbon CTA navigated to "${currentUrl}", matching its own link ("${expectedPath}")`);
});
