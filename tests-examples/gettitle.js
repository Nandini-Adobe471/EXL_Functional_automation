const { Given, Then, Before, After, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium, expect } = require('@playwright/test');
const { performLogin } = require('../commonFunctions/login');
const {allure} = require ('allure-cucumberjs')

// Set timeout for all steps (90 seconds)
setDefaultTimeout(90 * 1000);

// Test credentials - in a real project, these should be in environment variables
// let this.page, browser;

Before(async function () {
  this.browser = await chromium.launch({ headless: false });
  this.context = await this.browser.newContext();
  this.page = await this.context.newPage();
});

After(async function () {
  // Close the browser after each scenario
  if (this.browser) {
    await this.browser.close();
  }
});


Given('I open the Adobe Experience League homepage', async function () {
  await this.page.goto('https://experienceleague-dev.adobe.com/en');
  const screenshot = await this.page.screenshot();
  this.attach(screenshot, 'image/png')
});

Then('print page launched successfully', async function () {
  // Use the common login function instead of duplicating login code
  await performLogin(this);
});
