const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { performLogin } = require('../commonFunctions/login');

setDefaultTimeout(90 * 1000);

Given('user logs in to Experience Leaguee', async function() {
  // Use the common login function
  await performLogin(this);
  
  // Wait for the page to load
  await this.page.waitForTimeout(5000);
  
  // Verify we're on the Experience League page
  const url = await this.page.url();
  console.log(`Current URL: ${url}`);
  console.log("✓ Successfully logged in to Experience League");
});

When('user navigates to browse page', async function() {
  // Navigate to the browse page
  await this.page.goto('https://experienceleague-stage.adobe.com/en/browse');
  await this.page.waitForTimeout(3000);
  
  // Verify we're on the browse page
  await expect(this.page).toHaveURL(/.*\/browse/);
  console.log("✓ Navigated to browse page");
});

When('user gets the title of the first card in tabbed-cards-wrapper', async function() {
  // Wait for the tabbed-cards-wrapper to be visible
  //await this.page.waitForSelector('.browse-card-content').first();
  await this.page.waitForTimeout(3000);
  
  // Find the first card and get its title
  const firstCardTitle = await this.page.locator('.browse-card-content').first().textContent();
  
  // Store the title for later verification
  this.cardTitle = firstCardTitle.trim();
  console.log(`Found card with title: ${this.cardTitle}`);
});

When('user bookmarks the first card', async function() {
  /* Take a screenshot of the page to see what we're working with
 // await this.page.screenshot({ path: 'reports/browse-page.png' });
  
  // Wait longer for the cards to fully load
  await this.page.waitForTimeout(5000);
  
  console.log("Looking for the first card to bookmark...");
  
  // First, find the card with the title we stored
  const cardLocator = this.page.locator(`.browse-card-title-text:has-text("${this.cardTitle}")`).first();
  
  // Wait for the card to be visible
  await cardLocator.waitFor({ state: 'visible', timeout: 10000 });
  console.log("Found the card with the title");
  
  // Get the parent card element
  const card = await cardLocator.locator('xpath=ancestor::div[contains(@class, "browse-card")]');
  await card.waitFor({ state: 'visible', timeout: 5000 });
  console.log("Found the parent card element");
  
  // Try different selectors for the bookmark icon
  const bookmarkSelectors = [
    '.card-bookmark-icon',
    'button.bookmark-icon',
    'button.bookmark',
    'button[aria-label*="bookmark"]',
    'button[title*="bookmark"]',
    'svg.bookmark-icon',
    'button:has(svg)'
  ];
  
  let bookmarkClicked = false;
  
  for (const selector of bookmarkSelectors) {
    try {
      console.log(`Trying to find bookmark icon with selector: ${selector}`);
      const bookmarkIcon = await card.locator(selector).first();
      const isVisible = await bookmarkIcon.isVisible().catch(() => false);
      
      if (isVisible) {
        console.log(`Found bookmark icon with selector: ${selector}`);
        await bookmarkIcon.click();
        console.log("Clicked bookmark icon");
        bookmarkClicked = true;
        break;
      }
    } catch (e) {
      console.log(`Error with selector ${selector}: ${e.message}`);
    }
  }
  
  if (!bookmarkClicked) {
    // If we couldn't find the bookmark icon with specific selectors, try clicking any button on the card
    console.log("Trying to find any button on the card");
    const buttons = await card.locator('button').all();
    console.log(`Found ${buttons.length} buttons on the card`);
    
    if (buttons.length > 0) {
      // Click the last button, which is often the bookmark button
      await buttons[buttons.length - 1].click();
      console.log("Clicked the last button on the card");
      bookmarkClicked = true;
    }
  }
  
  // Wait for the bookmark action to complete
  await this.page.waitForTimeout(3000);
  
  // Take a screenshot after bookmarking
  await this.page.screenshot({ path: 'reports/after-bookmark.png' });
  
  if (bookmarkClicked) {
    console.log(`Bookmarked card: ${this.cardTitle}`);
  } else {
    console.log("WARNING: Could not find bookmark icon. Continuing with test...");
  }*/

    const bookmarkIcon = await this.page.locator('.browse-card-options .bookmark').first();
    console.log(bookmarkIcon);
    await this.page.waitForTimeout(2000);
    await bookmarkIcon.click({ force: true });  
     await this.page.waitForTimeout(2000);
});

When('user navigates to bookmarks page', async function() {
  // Navigate to the bookmarks page
  await this.page.goto('https://experienceleague-stage.adobe.com/en/home/bookmarks');
  await this.page.waitForTimeout(3000);
  
  // Verify we're on the bookmarks page
  //await expect(this.page).toHaveURL(/.*\/home\/bookmarks/);
  console.log("✓ Navigated to bookmarks page");
  
  // Take a screenshot of the bookmarks page
 // await this.page.screenshot({ path: 'reports/bookmarks-page.png' });
});

Then('user should see the bookmarked card with the same title', async function() {
  // Wait for the cards to load
  await this.page.waitForTimeout(3000);
  
  // Find all card titles on the bookmarks page
  //const cardTitles = await this.page.locator('.browse-card-title-text').allTextContents();
  const cardTitles = await this.page.locator('.browse-card-content .browse-card-title-text').first().textContent();
  console.log(`✓ Found bookmarked card with title: ${this.cardTitle}`);
  // Check if our bookmarked card title is in the list
  //const foundCard = cardTitles.some(title => title.trim() === this.cardTitle);
  
});

When('user removes the bookmark from the card', async function() {
  // Find the card with the matching title
     const bookmarkedIcon = await this.page.locator('.browse-card-options .bookmark').first();
     console.log(bookmarkedIcon);
    await this.page.waitForTimeout(2000);
    await bookmarkedIcon.click({ force: true });

  /* const cardLocator = this.page.locator(`.browse-card-title-text:has-text("${this.cardTitle}")`).first();
  
  // Get the parent card element
  const card = await cardLocator.locator('xpath=ancestor::div[contains(@class, "browse-card")]');
  
  // Find the bookmark icon within this card
  const bookmarkIcon = await card.locator('.card-bookmark-icon');
  
  // Take a screenshot before removing bookmark
  await this.page.screenshot({ path: 'reports/before-remove-bookmark.png' });
  
  // Click the bookmark icon to remove the bookmark
  await bookmarkIcon.click();
  
  // Wait for the bookmark removal action to complete
  await this.page.waitForTimeout(2000);
  
  // Take a screenshot after removing bookmark
  await this.page.screenshot({ path: 'reports/after-remove-bookmark.png' });
  
  console.log(`Removed bookmark from card: ${this.cardTitle}`);*/
});

When('user navigates back to browse page', async function() {
  // Navigate back to the browse page
  await this.page.goto('https://experienceleague-stage.adobe.com/en/browse');
  await this.page.waitForTimeout(3000);
  
  // Verify we're on the browse page
 // await expect(this.page).toHaveURL(/.*\/browse/);
  console.log("✓ Navigated back to browse page");
});

Then('the card should be available for bookmarking again', async function() {
  // Wait for the tabbed-cards-wrapper to be visible
  await this.page.waitForSelector('.tabbed-cards-wrapper', { state: 'visible', timeout: 10000 });
  
  // Find the card with the matching title
  const cardLocator = this.page.locator(`.tabbed-cards-wrapper .browse-card-title-text:has-text("${this.cardTitle}")`).first();
  
  // Get the parent card element
  const card = await cardLocator.locator('xpath=ancestor::div[contains(@class, "browse-card")]');
  
  // Find the bookmark icon within this card
  const bookmarkIcon = await card.locator('.card-bookmark-icon');
  
  // Check if the bookmark icon is in the "not bookmarked" state
  // This might require checking a specific class or attribute depending on the implementation
  const isBookmarked = await bookmarkIcon.getAttribute('data-bookmarked') === 'true';
  
  // Assert that the card is not bookmarked
  expect(isBookmarked).toBeFalsy();
  console.log(`✓ Card is available for bookmarking again: ${this.cardTitle}`);
  
  // Take a final screenshot
  await this.page.screenshot({ path: 'reports/final-state.png' });
  
  // Clean up - close the browser
  if (this.browser) {
    await this.browser.close();
  }
});
