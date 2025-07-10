const { chromium } = require('@playwright/test');

async function launchBrowser() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('https://experienceleague-dev.adobe.com/en');

  return { page, browser, context };
}

async function closeBrowser(browser) {
  if (browser) {
    await browser.close();
  }
}

module.exports = { launchBrowser, closeBrowser };
