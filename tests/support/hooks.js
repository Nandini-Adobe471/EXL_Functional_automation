const { Before, After, AfterAll, Status } = require('@cucumber/cucumber');
const { performLoginOnPage } = require('../commonFunctions/login');
const {
  launchSharedBrowser,
  openNewTab,
  closeSharedBrowser,
  openUnauthTab,
  closeUnauthBrowser,
} = require('../commonFunctions/launchbrowser');
const ENV = require('../../config.js');

// ─────────────────────────────────────────────────────────────────────────────
// SHARED SESSION SETUP
// - Shared auth browser is initialised LAZILY on the first non-@skip-login
//   scenario so that running only unauth features never triggers a login.
// - @skip-login scenarios get their own clean unauthenticated tab each time.
// - After     : Capture screenshot on failure — tab stays open (NOT closed)
// - AfterAll  : Close both browsers after all scenarios finish
//
// Run a single feature:
//   npx cucumber-js --profile single tests/features/events.feature
// ─────────────────────────────────────────────────────────────────────────────

let sharedBrowserReady = false;

// Open a new tab for each scenario.
// Auth browser is initialised lazily — only when a non-@skip-login scenario runs.
Before(async function (scenario) {
  const tags = scenario.pickle.tags.map(t => t.name);
  const isSkipLogin = tags.includes('@skip-login');

  if (isSkipLogin) {
    console.log('[Session] @skip-login scenario — opening unauthenticated tab');
    const { page, browser, context } = await openUnauthTab(ENV.URL);
    this.page = page;
    this.browser = browser;
    this.context = context;
  } else {
    // Initialise the shared authenticated browser the first time it is needed
    if (!sharedBrowserReady) {
      console.log('[Session] Launching shared browser and logging in once...');
      try {
        const { page, browser, context } = await launchSharedBrowser();
        await performLoginOnPage(page);
        sharedBrowserReady = true;
        console.log('[Session] Login complete. All subsequent auth tabs will share this session.');
      } catch (error) {
        console.error('[Session] Shared browser setup failed:', error.message);
        throw error;
      }
    }
    console.log('[Session] Opening new auth tab for scenario');
    const { page, browser, context } = await openNewTab();
    this.page = page;
    this.browser = browser;
    this.context = context;
  }
});

// Capture screenshot on failure — do NOT close the tab
After(async function (scenario) {
  if (scenario.result.status === Status.FAILED && this.page) {
    console.log(`[Session] Test failed: ${scenario.pickle.name}`);
    try {
      const screenshot = await this.page.screenshot({ fullPage: true });
      this.attach(screenshot, 'image/png');
    } catch (error) {
      console.error('[Session] Error capturing screenshot:', error.message);
    }
  }
  // Tab stays open — next scenario opens a new tab to the right
  console.log('[Session] Scenario done. Tab remains open.');
});

// Close the shared browser after ALL scenarios finish
AfterAll(async function () {
  console.log('[Session] All scenarios complete. Closing shared browser.');
  await closeSharedBrowser();
  await closeUnauthBrowser();
});
