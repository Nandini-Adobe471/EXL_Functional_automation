
const { Given, Then, Before, After, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium, expect } = require('@playwright/test');

// Set timeout for all steps (90 seconds)
setDefaultTimeout(90 * 1000);

// Test credentials - in a real project, these should be in environment variables
let page, browser;

Before(async function () {

browser = await chromium.launch({ headless: false });

const context = await browser.newContext();

page = await context.newPage();

});


Given('I open the Adobe Experience League homepage', async () => {

await page.goto('https://experienceleague-dev.adobe.com/en');
 
});

Then('print page launched successfully', async () => {

  await page.waitForSelector('.marquee .marquee-cta a', { state: 'visible' });
  await page.click('.marquee .marquee-cta a');
  //await page.waitForLoadState('networkidle');
 await page.waitForTimeout(4000);
  // Wait for the input to become visible and enabled (interactable)
  const emailInput = page.locator('input[aria-label="Email address"]');
  await emailInput.waitFor({ state: 'visible' }); // Optional: Add 'attached' or 'enabled' as needed
 
  // Now safely fill the input
  await emailInput.fill('gsnair+US+Team+VISA+hello+1@adobetest.com');
  await page.getByRole('button',{name:'Continue'}).highlight(); 
  await page.click('button',{name:'Continue'});
  await page.waitForSelector('button',{name:'Continue'}, { state: 'detached' });
  await page.waitForTimeout(4000);
 // await page.waitForLoadState('networkidle');
 
  // Wait for the input to become visible and enabled (interactable)
  const password = page.locator('input[id="PasswordPage-PasswordField"]');
  await password.waitFor({ state: 'visible' }); // Optional: Add 'attached' or 'enabled' as needed
 
  // Now safely fill the input
  await password.fill('Bap@d0be');
  //await page.getByRole('button',{name:'Continue'}).highlight(); 
  await page.click('button[data-id="PasswordPage-ContinueButton"]');
 
});


