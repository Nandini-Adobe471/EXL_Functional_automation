const { Given, When, Then, After, setDefaultTimeout,setWorldConstructor } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { launchBrowser, closeBrowser } = require('../commonFunctions/launchbrowser');
const { performLogin } = require('../commonFunctions/login');
const { chromium } = require('playwright');

setDefaultTimeout(90 * 1000);

// Define a custom World class
class CustomWorld {
  constructor() {
    this.page = null;
    this.browser = null;
    this.context = null;
  }
}

// Tell Cucumber to use our custom world
setWorldConstructor(CustomWorld);

Given('the user is on the landing page', async function () {
  const result = await launchBrowser();
  this.page = result.page;
  this.browser = result.browser;
  this.context = result.context;
});

// After hook to close browser after each scenario
/*After(async function() {
  // Close the browser after each scenario
  if (this.browser) {
    await this.browser.close();
    this.browser = null;
    this.page = null;
    this.context = null;
  }
});*/

When('the user clicks the CTA to begin login', async function () {
  await this.page.waitForTimeout(4000);
  await this.page.waitForSelector('.marquee .marquee-cta a', { state: 'visible' });
  await this.page.click('.marquee .marquee-cta a');
  await this.page.waitForTimeout(4000);
});

When('the user enters their email address {string}', async function (email) {
  //await this.page.waitForTimeout(4000);
  const emailInput = this.page.locator('input[aria-label="Email address"]');
  await emailInput.waitFor({ state: 'visible' });
  await this.page.waitForTimeout(4000);
  await emailInput.fill(email);
  await this.page.waitForTimeout(4000);
});

When('the user clicks the Continue button', async function () {
  await this.page.getByRole('button', { name: 'Continue' }); 
  await this.page.click('button', { name: 'Continue' });
  await this.page.waitForSelector('button', { name: 'Continue' }, { state: 'detached' });
  await this.page.waitForTimeout(4000);
});

When('the user enters their password {string}', async function (password) {
  const passwordInput = this.page.locator('input[id="PasswordPage-PasswordField"]');
  await passwordInput.waitFor({ state: 'visible' });
  await passwordInput.fill(password); 
});

When('the user submits the password form', async function () {
  await this.page.click('button[data-id="PasswordPage-ContinueButton"]');
});

Then('the user should be logged in successfully', async function () {
  await this.page.waitForTimeout(4000);
  //await this.browser.close();
});

Given('user is on Experience League home',async function() {
  // Use the common login function instead of just launching the browser
 // const result = await performLogin(this);
  await this.page.waitForTimeout(4000);
})

When('user bookmarks the first content card', async function() {
    //Locate firstcard
    const firstCard = await this.page.locator('.browse-card-content').first();
    //await expect(firstCard).toBeVisible();
    const firstCardTitle = await firstCard.locator('.browse-card-title-text').textContent();
    console.log(firstCardTitle);
    await this.page.waitForTimeout(4000);

    //click on bookmark icon of first card
    const bookmarkIcon = await this.page.locator('.browse-card-options .bookmark').first();
    console.log(bookmarkIcon);
    await this.page.waitForTimeout(4000);
    await bookmarkIcon.click({ force: true });  

    //Navigate to Bookmark page
    await this.page.waitForTimeout(4000);
    const bookmarPage = await this.page.locator('.profile-rail-links a[title="Bookmarks"]');
    console.log(bookmarPage);
    await bookmarPage.click(); 
    await this.page.waitForTimeout(4000);

    // remove the bookmark of a card from bookmark page
    const bookmarkedCardTitle = await this.page.locator('.bookmarks-content .bookmarks-card .browse-card-title-text').first().textContent();
    if (bookmarkedCardTitle == firstCardTitle) {
      console.log("bookmark Successful");
    } else {
      console.log("bookmark unsuccessful");
    }

    //remove bookmark
    const bookmarkedIcon = await this.page.locator('.browse-card-options .bookmark').first();
    console.log(bookmarkedIcon);
    await this.page.waitForTimeout(4000);
    await bookmarkedIcon.click({ force: true });
});

Then('ensure bookmarked card appears in bookmarks page', async function() {
    await this.page.waitForTimeout(4000);
    if (this.browser) {
    await this.browser.close();
    }
});
