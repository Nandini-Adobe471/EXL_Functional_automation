const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { performLogin } = require('../commonFunctions/login');
const ENV = require('../../config.js');

setDefaultTimeout(180 * 1000);

// ─── Selectors ────────────────────────────────────────────────────────────────

const HEADER_SEL = 'div.header.block';
const NAV_SEL = `${HEADER_SEL} nav[role="navigation"]`;

// Logo / Brand
const ADOBE_LOGO_SEL = `${NAV_SEL} div.adobe-logo a[aria-label="Adobe Experience League"]`;
const BRAND_SEL = `${NAV_SEL} div.brand a`;

// Sign In / Profile
const PROFILE_TOGGLE_SEL = `${NAV_SEL} button.profile-toggle`;
const PROFILE_PICTURE_SEL = `${NAV_SEL} img.profile-picture`;
const PROFILE_MENU_SEL = `${NAV_SEL} div.profile-menu`;

// Product Grid
const PRODUCT_GRID_SEL = `${NAV_SEL} div.product-grid`;
const PRODUCT_TOGGLE_SEL = `${NAV_SEL} button.product-toggle`;
const PRODUCT_DROPDOWN_SEL = `${NAV_SEL} div.product-dropdown`;

// Desktop nav wrapper
const NAV_WRAPPER_SEL = `${NAV_SEL} div.nav-wrapper`;

// Hamburger / Mobile drawer
const HAMBURGER_SEL = `${NAV_SEL} button.nav-hamburger`;
const MOBILE_DRAWER_SEL = 'div.nav-mobile-drawer';
const MOBILE_BODY_SEL = `${MOBILE_DRAWER_SEL} div.nav-mobile-body`;
const MOBILE_FOOTER_SEL = `${MOBILE_DRAWER_SEL} div.nav-mobile-footer`;
const MOBILE_SIGNIN_BTN_SEL = `${MOBILE_DRAWER_SEL} button.nav-mobile-signin`;
const MOBILE_PROFILE_PIC_SEL = `${MOBILE_DRAWER_SEL} img.nav-mobile-profile-picture`;

// ─── Given ────────────────────────────────────────────────────────────────────

Given('user is logged in and on the Experience League home page', async function () {
  // Reuse existing shared session if already established (BeforeAll hook);
  // only call performLogin if no session exists yet.
  if (!this.page) {
    await performLogin(this);
  }
  await this.page.goto(`${ENV.URL}/home`);
  await this.page.waitForTimeout(3000);
  console.log('✓ Logged in and on Experience League home page.');
});

// ─── Logo / Brand ─────────────────────────────────────────────────────────────

Then('the Adobe logo should be visible in the header', async function () {
  const logo = this.page.locator(ADOBE_LOGO_SEL);
  await expect(logo).toBeVisible({ timeout: 15000 });
  const icon = logo.locator('span.icon.icon-adobe-red-logo-v2');
  const iconCount = await icon.count();
  expect(iconCount, 'Adobe logo should contain icon-adobe-red-logo-v2 span').toBeGreaterThan(0);
  console.log('✓ Adobe logo visible in header.');
});

Then('the Experience League brand link should be visible in the header', async function () {
  const brand = this.page.locator(BRAND_SEL);
  await expect(brand).toBeVisible({ timeout: 15000 });
  const text = await brand.textContent();
  expect(text.trim()).toContain('Experience League');
  console.log(`✓ Experience League brand link visible: "${text.trim()}"`);
});

// ─── Auth State ───────────────────────────────────────────────────────────────

Then('the Sign In link should not be visible for authenticated user', async function () {
  const signInLink = this.page.locator(`${NAV_SEL} div.sign-in:not(.signed-in) a`);
  const isVisible = await signInLink.isVisible().catch(() => false);
  expect(isVisible, 'Sign In link should NOT be visible for authenticated user').toBe(false);
  console.log('✓ Sign In link not visible for authenticated user.');
});

Then('the profile toggle button with profile picture should be visible', async function () {
  const toggle = this.page.locator(PROFILE_TOGGLE_SEL);
  await expect(toggle).toBeVisible({ timeout: 15000 });
  const pic = this.page.locator(PROFILE_PICTURE_SEL);
  await expect(pic).toBeVisible({ timeout: 10000 });
  const src = await pic.getAttribute('src');
  expect(src && src.trim().length, 'Profile picture src should not be empty').toBeGreaterThan(0);
  console.log('✓ Profile toggle with picture visible.');
});

Then('the sign-in container should have class {string}', async function (expectedClass) {
  const signInDiv = this.page.locator(`${NAV_SEL} div.sign-in`);
  await expect(signInDiv).toBeVisible({ timeout: 15000 });
  const hasClass = await signInDiv.evaluate(
    (el, cls) => el.classList.contains(cls),
    expectedClass
  );
  expect(hasClass, `div.sign-in should have class "${expectedClass}"`).toBe(true);
  console.log(`✓ div.sign-in has class "${expectedClass}".`);
});

// ─── Profile Menu ─────────────────────────────────────────────────────────────

When('user clicks the profile toggle button', async function () {
  const toggle = this.page.locator(PROFILE_TOGGLE_SEL);
  await expect(toggle).toBeVisible({ timeout: 15000 });
  await toggle.click();
  await this.page.waitForTimeout(500);
  console.log('✓ Clicked profile toggle button.');
});

Then('the profile dropdown menu should be visible', async function () {
  const menu = this.page.locator(PROFILE_MENU_SEL);
  await expect(menu).toBeVisible({ timeout: 10000 });
  console.log('✓ Profile dropdown menu is visible.');
});

Then('the profile menu should contain {string} link', async function (linkText) {
  const menu = this.page.locator(PROFILE_MENU_SEL);
  const link = menu.locator('a').filter({ hasText: linkText });
  await expect(link, `Profile menu should contain "${linkText}" link`).toBeVisible({ timeout: 10000 });
  const href = await link.getAttribute('href');
  expect(href && href.trim().length, `"${linkText}" link should have a valid href`).toBeGreaterThan(0);
  console.log(`✓ Profile menu link "${linkText}" present (href="${href}").`);
});

Then('the profile menu Community section should contain {string} link', async function (linkText) {
  const menu = this.page.locator(PROFILE_MENU_SEL);
  const communitySection = menu.locator('div.profile-menu-section').nth(1);
  await expect(communitySection).toBeVisible({ timeout: 10000 });
  const link = communitySection.locator('a').filter({ hasText: linkText });
  await expect(link, `Profile menu Community section should contain "${linkText}"`).toBeVisible({ timeout: 5000 });
  console.log(`✓ Profile menu Community section contains "${linkText}".`);
});

// ─── Product Grid ─────────────────────────────────────────────────────────────

Then('the product grid button should be visible in the header', async function () {
  const gridBtn = this.page.locator(PRODUCT_TOGGLE_SEL);
  await expect(gridBtn).toBeVisible({ timeout: 15000 });
  console.log('✓ Product grid button visible in header.');
});

Then('the product grid container should have class {string}', async function (expectedClass) {
  const gridDiv = this.page.locator(PRODUCT_GRID_SEL);
  await expect(gridDiv).toBeVisible({ timeout: 15000 });
  const hasClass = await gridDiv.evaluate(
    (el, cls) => el.classList.contains(cls),
    expectedClass
  );
  expect(hasClass, `div.product-grid should have class "${expectedClass}"`).toBe(true);
  console.log(`✓ div.product-grid has class "${expectedClass}".`);
});

When('user clicks the product grid button', async function () {
  const gridBtn = this.page.locator(PRODUCT_TOGGLE_SEL);
  await expect(gridBtn).toBeVisible({ timeout: 15000 });
  await gridBtn.click();
  await this.page.waitForTimeout(500);
  console.log('✓ Clicked product grid button.');
});

Then('the product grid dropdown should be visible', async function () {
  const dropdown = this.page.locator(PRODUCT_DROPDOWN_SEL);
  await expect(dropdown).toBeVisible({ timeout: 10000 });
  console.log('✓ Product grid dropdown is visible.');
});

Then('the product grid dropdown should contain {string} link', async function (linkText) {
  const dropdown = this.page.locator(PRODUCT_DROPDOWN_SEL);
  const link = dropdown.locator('a').filter({ hasText: linkText });
  await expect(link, `Product grid dropdown should contain "${linkText}" link`).toBeVisible({ timeout: 5000 });
  const target = await link.getAttribute('target');
  expect(target, `"${linkText}" link should open in a new tab`).toBe('_blank');
  console.log(`✓ Product grid dropdown contains "${linkText}" (target="${target}").`);
});

// ─── Language Selector ────────────────────────────────────────────────────────

const LANG_BTN_SEL = `${NAV_SEL} button.language-selector-button`;
const LANG_POPOVER_SEL = `${NAV_SEL} div.language-selector-popover`;

Then('the language selector button should be visible in the header', async function () {
  const langBtn = this.page.locator(LANG_BTN_SEL);
  await expect(langBtn).toBeVisible({ timeout: 15000 });
  console.log('✓ Language selector button visible in header.');
});

When('user clicks the language selector button', async function () {
  const langBtn = this.page.locator(LANG_BTN_SEL);
  await expect(langBtn).toBeVisible({ timeout: 15000 });
  await langBtn.click();
  await this.page.waitForTimeout(500);
  console.log('✓ Clicked language selector button.');
});

Then('the language selector popover should be visible', async function () {
  const popover = this.page.locator(LANG_POPOVER_SEL);
  await expect(popover).toBeVisible({ timeout: 10000 });
  console.log('✓ Language selector popover is visible.');
});

Then('the language selector should contain English option', async function () {
  const popover = this.page.locator(LANG_POPOVER_SEL);
  const englishOption = popover.locator('span.language-selector-label[data-value="en"]');
  await expect(englishOption).toBeVisible({ timeout: 5000 });
  const text = await englishOption.textContent();
  expect(text.trim()).toBe('English');
  console.log('✓ Language selector contains "English" option.');
});

// ─── Learn by Product Dropdown ────────────────────────────────────────────────

When('user clicks the {string} nav toggle', async function (toggleText) {
  const navWrapper = this.page.locator(NAV_WRAPPER_SEL);
  const toggle = navWrapper
    .locator('li.nav-item-root button.nav-item-toggle-root')
    .filter({ hasText: toggleText });
  await expect(toggle).toBeVisible({ timeout: 15000 });
  await toggle.click();
  await this.page.waitForTimeout(600);
  console.log(`✓ Clicked nav toggle: "${toggleText}".`);
});

Then('the Learn by Product dropdown content should be visible', async function () {
  const content = this.page.locator(
    'li.nav-item-root.nav-item-tab div.nav-item-content-level-0.nav-item-content-tab'
  ).first();
  await expect(content).toBeVisible({ timeout: 10000 });
  console.log('✓ Learn by Product dropdown content is visible.');
});

Then('the dropdown should contain product {string}', async function (productName) {
  const content = this.page.locator(
    'li.nav-item-root.nav-item-tab div.nav-item-content-level-0.nav-item-content-tab'
  ).first();
  const productToggle = content
    .locator('li.nav-item button.nav-item-toggle span.nav-item-toggle-text')
    .filter({ hasText: productName });
  const count = await productToggle.count();
  expect(count, `Learn by Product dropdown should contain "${productName}"`).toBeGreaterThan(0);
  console.log(`✓ Learn by Product dropdown contains "${productName}".`);
});

When('user clicks the {string} product item toggle', async function (productName) {
  const content = this.page.locator(
    'li.nav-item-root.nav-item-tab div.nav-item-content-level-0.nav-item-content-tab'
  ).first();
  const productToggle = content
    .locator('li.nav-item button.nav-item-toggle')
    .filter({ hasText: productName })
    .first();
  await expect(productToggle).toBeVisible({ timeout: 10000 });
  await productToggle.click();
  await this.page.waitForTimeout(500);
  console.log(`✓ Clicked product item toggle: "${productName}".`);
});

Then('the Analytics sub-menu should be visible', async function () {
  // Use exact text match to avoid matching "Customer Journey Analytics"
  const subMenu = this.page.locator('div.nav-item-content-level-1').filter({
    has: this.page.locator('div.nav-tab-heading:text-is("Analytics")')
  }).first();
  await expect(subMenu).toBeVisible({ timeout: 10000 });
  console.log('✓ Analytics sub-menu is visible.');
});

Then('the Analytics sub-menu should contain a {string} link', async function (linkText) {
  const subMenu = this.page.locator('div.nav-item-content-level-1').filter({
    has: this.page.locator('div.nav-tab-heading:text-is("Analytics")')
  }).first();
  const link = subMenu.locator('li.nav-item-leaf a').filter({ hasText: linkText });
  await expect(link, `Analytics sub-menu should contain "${linkText}" link`).toBeVisible({ timeout: 5000 });
  console.log(`✓ Analytics sub-menu contains "${linkText}" link.`);
});

Then('the Analytics sub-menu should contain an {string} link', async function (linkText) {
  const subMenu = this.page.locator('div.nav-item-content-level-1').filter({
    has: this.page.locator('div.nav-tab-heading:text-is("Analytics")')
  }).first();
  const link = subMenu.locator('li.nav-item-leaf a').filter({ hasText: linkText });
  await expect(link, `Analytics sub-menu should contain "${linkText}" link`).toBeVisible({ timeout: 5000 });
  console.log(`✓ Analytics sub-menu contains "${linkText}" link.`);
});

// ─── Desktop Navigation Items ─────────────────────────────────────────────────

Then('the main navigation should contain {string} menu item', async function (itemText) {
  const navWrapper = this.page.locator(NAV_WRAPPER_SEL);
  await expect(navWrapper).toBeVisible({ timeout: 15000 });
  const toggle = navWrapper.locator('li.nav-item-root').filter({
    has: this.page.locator(`button span.nav-item-toggle-text:has-text("${itemText}")`)
  });
  const toggleCount = await toggle.count();
  if (toggleCount > 0) {
    console.log(`✓ Desktop nav contains menu item (toggle): "${itemText}".`);
    return;
  }
  const link = navWrapper.locator('li.nav-item-root a').filter({ hasText: itemText });
  const linkCount = await link.count();
  expect(linkCount, `Desktop nav should contain "${itemText}"`).toBeGreaterThan(0);
  console.log(`✓ Desktop nav contains nav link: "${itemText}".`);
});

Then('the main navigation should contain {string} link', async function (linkText) {
  const navWrapper = this.page.locator(NAV_WRAPPER_SEL);
  await expect(navWrapper).toBeVisible({ timeout: 15000 });
  const link = navWrapper.locator('li.nav-item-root.nav-item-leaf a').filter({ hasText: linkText });
  await expect(link, `Desktop nav should contain "${linkText}" link`).toBeVisible({ timeout: 10000 });
  console.log(`✓ Desktop nav link "${linkText}" visible.`);
});

Then('the desktop navigation should contain {string} link', async function (linkText) {
  const navWrapper = this.page.locator(NAV_WRAPPER_SEL);
  await expect(navWrapper).toBeVisible({ timeout: 15000 });
  const link = navWrapper.locator('li.nav-item-root a').filter({ hasText: linkText });
  await expect(link, `Desktop nav should contain "${linkText}" link`).toBeVisible({ timeout: 10000 });
  console.log(`✓ Desktop nav contains "${linkText}" link (authenticated).`);
});

// ─── Hamburger / Mobile Drawer ────────────────────────────────────────────────

When('user clicks the hamburger menu button', async function () {
  // Hamburger is hidden on desktop via CSS media query — switch to mobile viewport first
  await this.page.setViewportSize({ width: 375, height: 812 });
  await this.page.waitForTimeout(500);
  const hamburger = this.page.locator(HAMBURGER_SEL);
  await expect(hamburger).toBeVisible({ timeout: 15000 });
  await hamburger.click();
  await this.page.waitForTimeout(600);
  console.log('✓ Clicked hamburger menu button (mobile viewport 375×812).');
});

Then('the mobile navigation drawer should be open', async function () {
  const drawer = this.page.locator(MOBILE_DRAWER_SEL);
  await expect(drawer).toBeVisible({ timeout: 10000 });
  const hamburger = this.page.locator(HAMBURGER_SEL);
  const ariaExpanded = await hamburger.getAttribute('aria-expanded');
  expect(ariaExpanded, 'Hamburger aria-expanded should be "true" when drawer is open').toBe('true');
  console.log('✓ Mobile navigation drawer is open.');
});

Then('the mobile drawer body should contain {string} link', async function (linkText) {
  const body = this.page.locator(MOBILE_BODY_SEL);
  const link = body.locator('li.nav-item-root a').filter({ hasText: linkText });
  await expect(link, `Mobile drawer body should contain "${linkText}" link`).toBeVisible({ timeout: 10000 });
  console.log(`✓ Mobile drawer body contains "${linkText}" link.`);
});

// ─── Premium Learning Redirect ────────────────────────────────────────────────

When('user clicks the {string} link in the desktop navigation', async function (linkText) {
  const navWrapper = this.page.locator(NAV_WRAPPER_SEL);
  await expect(navWrapper).toBeVisible({ timeout: 15000 });
  const link = navWrapper.locator('li.nav-item-root a').filter({ hasText: linkText });
  await expect(link, `Desktop nav should contain "${linkText}" link`).toBeVisible({ timeout: 10000 });
  const href = await link.getAttribute('href');
  console.log(`ℹ Clicking "${linkText}" — href="${href}"`);
  await link.click();
  await this.page.waitForTimeout(4000);
  console.log(`✓ Clicked "${linkText}" link in desktop navigation.`);
});

Then('the user should be redirected to the premium learning page', async function () {
  const currentUrl = this.page.url();
  expect(
    currentUrl,
    `Expected URL to contain "/premium/home" but got: "${currentUrl}"`
  ).toContain('/premium/home');
  console.log(`✓ User redirected to premium learning page: "${currentUrl}".`);
});

Then('the header should be visible on the premium learning page', async function () {
  // Use .first() — premium page may render two div.header.block elements
  const header = this.page.locator(HEADER_SEL).first();
  await expect(header, 'Header block should be visible on /premium/home').toBeVisible({ timeout: 15000 });
  await expect(header).toHaveAttribute('data-block-status', 'loaded', { timeout: 15000 });
  console.log('✓ Header is visible and loaded on the premium learning page.');
});
