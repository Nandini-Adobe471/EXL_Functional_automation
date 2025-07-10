
const { Given, Then, Before, After, setDefaultTimeout } = require('@cucumber/cucumber');
const { chromium, expect } = require('@playwright/test');
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

  await this.page.waitForSelector('.marquee .marquee-cta a', { state: 'visible' });
  
  await this.page.click('.marquee .marquee-cta a');
  //await this.page.waitForLoadState('networkidle');
 await this.page.waitForTimeout(4000);
  // Wait for the input to become visible and enabled (interactable)
  const emailInput = this.page.locator('input[aria-label="Email address"]');
  await emailInput.waitFor({ state: 'visible' }); // Optional: Add 'attached' or 'enabled' as needed
 
  // Now safely fill the input
  await emailInput.fill('gsnair+US+Team+VISA+hello+1@adobetest.com');
  await this.page.getByRole('button',{name:'Continue'}).highlight(); 
  await this.page.click('button',{name:'Continue'});
  await this.page.waitForSelector('button',{name:'Continue'}, { state: 'detached' });
  await this.page.waitForTimeout(4000);
 // await this.page.waitForLoadState('networkidle');
 
  // Wait for the input to become visible and enabled (interactable)
  // const password = this.page.locator('input[id="Passwordthis.page-PasswordField"]');
  // await password.waitFor({ state: 'visible' }); // Optional: Add 'attached' or 'enabled' as needed
 
  // Now safely fill the input
  // await password.fill('Bap@d0be');
  // //await this.page.getByRole('button',{name:'Continue'}).highlight(); 
  // await this.page.click('button[data-id="Passwordthis.page-ContinueButton"]');
 
});
