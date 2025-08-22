const { chromium } = require('@playwright/test');
const ENV = require('../../config.js');

async function launchBrowser() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(ENV.URL);

  return { page, browser, context };
}

async function closeBrowser(browser) {
  if (browser) {
    await browser.close();
  }
}

module.exports = { launchBrowser, closeBrowser };
