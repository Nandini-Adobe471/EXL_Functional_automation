const { chromium } = require('@playwright/test');
const ENV = require('../../config.js');

// Shared browser instance (authenticated)
let sharedBrowser = null;
// Shared browser context — all tabs open inside this single context/window
let sharedContext = null;

// Unauthenticated shared browser instance (no login)
let unauthBrowser = null;
let unauthContext = null;

/**
 * Original launch: opens a brand-new browser + context + page.
 * Used by the default (non-shared) flow.
 */
async function launchBrowser() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(ENV.URL);
  return { page, browser, context };
}

/**
 * STEP 1 — Call once (BeforeAll).
 * Launches one browser window with one shared context, opens the first page for login.
 */
async function launchSharedBrowser() {
  sharedBrowser = await chromium.launch({ headless: false });
  sharedContext = await sharedBrowser.newContext();
  const page = await sharedContext.newPage();
  await page.goto(ENV.URL);
  return { page, browser: sharedBrowser, context: sharedContext };
}

/**
 * STEP 2 — Call per scenario (Before).
 * Opens a NEW TAB to the right inside the same browser window and context.
 * Session (cookies/auth) is automatically shared — no login needed.
 */
async function openNewTab() {
  if (!sharedContext) {
    throw new Error('[SharedBrowser] sharedContext is not initialized. Call launchSharedBrowser() first.');
  }
  const page = await sharedContext.newPage();
  await page.goto(ENV.URL);
  return { page, browser: sharedBrowser, context: sharedContext };
}

/**
 * Closes the shared browser at the very end of the session.
 * Call once in AfterAll.
 */
async function closeSharedBrowser() {
  try {
    if (sharedBrowser && sharedBrowser.isConnected()) {
      await sharedBrowser.close();
    }
  } catch (e) {
    console.error('Error closing shared browser:', e.message);
  } finally {
    sharedBrowser = null;
    sharedContext = null;
  }
}

async function closeBrowser(browser) {
  if (browser) {
    await browser.close();
  }
}

/**
 * STEP 1 (unauth) — Call once to launch an unauthenticated browser.
 * No login is performed. All unauth scenarios share this single browser window.
 */
async function launchUnauthBrowser() {
  unauthBrowser = await chromium.launch({ headless: false });
  unauthContext = await unauthBrowser.newContext();
  const page = await unauthContext.newPage();
  return { page, browser: unauthBrowser, context: unauthContext };
}

/**
 * STEP 2 (unauth) — Opens a new tab in the unauthenticated browser.
 * If not yet launched, launches it automatically.
 */
async function openUnauthTab(url) {
  if (!unauthContext) {
    await launchUnauthBrowser();
  }
  const page = await unauthContext.newPage();
  if (url) {
    await page.goto(url);
  }
  return { page, browser: unauthBrowser, context: unauthContext };
}

/**
 * Closes the unauthenticated shared browser.
 * Call once in AfterAll if needed.
 */
async function closeUnauthBrowser() {
  try {
    if (unauthBrowser && unauthBrowser.isConnected()) {
      await unauthBrowser.close();
    }
  } catch (e) {
    console.error('Error closing unauth browser:', e.message);
  } finally {
    unauthBrowser = null;
    unauthContext = null;
  }
}

module.exports = {
  launchBrowser,
  closeBrowser,
  launchSharedBrowser,
  openNewTab,
  closeSharedBrowser,
  launchUnauthBrowser,
  openUnauthTab,
  closeUnauthBrowser,
};
