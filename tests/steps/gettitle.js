
const { Given, Then,Before, After, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium, expect } = require("@playwright/test");
//const { Page } = require("playwright");
setDefaultTimeout(60 * 1000);

//const assert = require('assert');

let page, browser;

Before(async function () {

browser = await chromium.launch({ headless: false });

const context = await browser.newContext();

page = await context.newPage();

});


Given('I open the Adobe Experience League homepage', async () => {

await page.goto('https://experienceleague-dev.adobe.com/en');
  //await browser.url('https://experienceleague-dev.adobe.com/en');
});

Then('print page launched successfully', async () => {

  // await page.waitForSelector('.marquee .marquee-cta a')
  // await page.click('.marquee .marquee-cta a')
  // await page.locator('input[aria-label="Email address"]',{ delay: 3000 }).click
  // await page.waitForSelector('input[aria-label="Email address"]',{ delay: 3000 })
  // await page.locator('input[aria-label="Email address"]').fill('hcl40471@adobe.com')
  // //await page.getByRole('button',{name:'Continue'}).click 
 
  await page.waitForSelector('.marquee .marquee-cta a', { state: 'visible' });
  await page.click('.marquee .marquee-cta a');
  await page.waitForLoadState('networkidle');
 
  // Wait for the input to become visible and enabled (interactable)
  const emailInput = page.locator('input[aria-label="Email address"]');
  await emailInput.waitFor({ state: 'visible' }); // Optional: Add 'attached' or 'enabled' as needed
 
  // Now safely fill the input
  await emailInput.fill('hcl40471@adobe.com');
 
});


