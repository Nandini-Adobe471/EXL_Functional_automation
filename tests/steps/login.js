const { Given, When, Then } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { launchBrowser } = require('../commonFunctions/launchbrowser');

let page; 

const { chromium } = require('playwright');

Given('the user is on the landing page', async function () {
  page = await launchBrowser();
  /*browser = await chromium.launch({ headless: false }); 
  context = await browser.newContext();
  page = await context.newPage();
  await page.goto('https://experienceleague-dev.adobe.com/en'); */
});

When('the user clicks the CTA to begin login', async function () {
  await page.waitForSelector('.marquee .marquee-cta a', { state: 'visible' });
  await page.click('.marquee .marquee-cta a');
  await page.waitForTimeout(4000);
});

When('the user enters their email address {string}', async function (email) {
  await page.waitForTimeout(4000);
  const emailInput = page.locator('input[aria-label="Email address"]');
  await emailInput.waitFor({ state: 'visible' });
    await page.waitForTimeout(4000);
  await emailInput.fill(email);
    await page.waitForTimeout(4000);

});

When('the user clicks the Continue button', async function () {
  await page.getByRole('button', { name: 'Continue' }); 
  await page.click('button', { name: 'Continue' });
  await page.waitForSelector('button', { name: 'Continue' }, { state: 'detached' });
  await page.waitForTimeout(4000);
});

When('the user enters their password {string}', async function (password) {
  const passwordInput = page.locator('input[id="PasswordPage-PasswordField"]');
  await passwordInput.waitFor({ state: 'visible' });
  await passwordInput.fill(password); 
});

When('the user submits the password form', async function () {
  await page.click('button[data-id="PasswordPage-ContinueButton"]');
});

Then('the user should be logged in successfully', async function () {
  await page.waitForTimeout(4000);
  //await browser.close();
});

Given('user is on Experience League home',async function() {
    await page.waitForTimeout(4000)
})

When('user bookmarks the first content card', async function() {

    //Locate firstcard
    const firstCard= await page.locator('.browse-card-content').first();
    //await expect(firstCard).toBeVisible();
    const firstCardTitle= await firstCard.locator('.browse-card-title-text').textContent();
    console.log(firstCardTitle);
    await page.waitForTimeout(4000);

    //click on bookmark icon of first card
    const bookmarkIcon= await page.locator('.browse-card-options .bookmark').first();
    console.log(bookmarkIcon);
    await page.waitForTimeout(4000);
    await bookmarkIcon.click({ force: true });  

    //Navigate to Bookmark page
    await page.waitForTimeout(4000);
    const bookmarPage= await page.locator('.profile-rail-links a[title="Bookmarks"]');
    console.log(bookmarPage);
    await bookmarPage.click(); 
    await page.waitForTimeout(4000);

    // remove the bookmark of a card from bookmark page
    const bookmarkedCardTitle= await page.locator('.bookmarks-content .bookmarks-card .browse-card-title-text').first().textContent();
    if (bookmarkedCardTitle==firstCardTitle)
    {
      console.log("bookmark Successful");
    }
    else
    {
    console.log("bookmark unsuccessful");
    }

    //remove bookmark
    const bookmarkedIcon= await page.locator('.browse-card-options .bookmark').first();
    console.log(bookmarkedIcon);
    await page.waitForTimeout(4000);
    await bookmarkedIcon.click({ force: true });
});
Then('ensure bookmarked card appears in bookmarks page',async function() {
    await page.waitForTimeout(4000)
});
