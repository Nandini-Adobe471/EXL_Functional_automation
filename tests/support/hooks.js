const { Before, After, BeforeAll, AfterAll, Status } = require('@cucumber/cucumber');
const { performLoginOnPage } = require('../commonFunctions/login');
const {
  launchSharedBrowser,
  openNewTab,
  closeSharedBrowser,
} = require('../commonFunctions/launchbrowser');

// ─────────────────────────────────────────────────────────────────────────────
// SHARED SESSION SETUP
// - BeforeAll : Launch one browser window, log in once on the first tab
// - Before    : Open a NEW TAB to the right in the same browser window
//               Session is shared — no re-login for any scenario
// - After     : Capture screenshot on failure — tab stays open (NOT closed)
// - AfterAll  : Close the entire browser after all scenarios finish
//
// Run a single feature:
//   npx cucumber-js --profile single tests/features/events.feature
// ─────────────────────────────────────────────────────────────────────────────

BeforeAll(async function () {
  console.log('[Session] Launching shared browser and logging in once...');
  try {
    const { page, browser, context } = await launchSharedBrowser();
    // Login on the first tab — cookies/session stored in sharedContext
    await performLoginOnPage(page);
    console.log('[Session] Login complete. All subsequent tabs will share this session.');
    // Keep this login tab open — first scenario will open next to it
  } catch (error) {
    console.error('[Session] BeforeAll setup failed:', error.message);
  }
});

// Open a new tab to the right for each scenario
// Auth session is inherited automatically — no login step needed
Before(async function () {
  console.log('[Session] Opening new tab for scenario');
  const { page, browser, context } = await openNewTab();
  this.page = page;
  this.browser = browser;
  this.context = context;
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
});
