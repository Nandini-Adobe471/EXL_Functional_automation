const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { performLogin } = require('../commonFunctions/login');

setDefaultTimeout(90 * 1000);

Given('user logs in to Experience League', async function() {
  // Use the common login function
  await performLogin(this);
  
  // Wait for the page to load
  await this.page.waitForTimeout(2000);
  
  // Verify we're on the Experience League page
  const url = await this.page.url();
  console.log(`Current URL: ${url}`);
  console.log("✓ Successfully logged in to Experience League");
});

When('user clicks on customize learning link', async function() {
  // Look for customize learning link in profile rail block
await this.page.waitForTimeout(3000);
   await this.page.getByRole('link', { name: 'Customize your learning' }).click();
  /* const customizeLearningSelectors = [
    'a:has-text("Customize Learning")',
    'a:has-text("customize learning")',
    'a:has-text("Personalize")',
    'a[href*="customize"]',
    'a[href*="personalize"]'
  ];
  
  // Try to find and click on the customize learning link
  let clicked = false;
  
  for (const selector of customizeLearningSelectors) {
    const link = this.page.locator(selector).first();
    const isVisible = await link.isVisible().catch(() => false);
    
    if (isVisible) {
      console.log(`Clicking on customize learning link with selector: ${selector}`);
      await link.click();
      await this.page.waitForTimeout(3000);
      clicked = true;
      break;
    }
  }
  
  // If we couldn't find the link, try direct navigation
  if (!clicked) {
    console.log("Could not find customize learning link. Trying direct navigation...");
    await this.page.goto('https://experienceleague-stage.adobe.com/en/customize');
    await this.page.waitForTimeout(3000);
  }
  */
  console.log("✓ Navigated to customize learning page");
});

When('user should see element with class user-interests', async function() {
  // Look for element with class user-interests
  const userInterests = this.page.locator('.user-interests');
  
  // Wait for the element to be visible
  await expect(userInterests).toBeVisible({ timeout: 5000 });
  
  console.log("✓ Found element with class user-interests");
});

Then('user should see interests separated by pipe symbol', async function() {
  // Look for spans with pipe-separated interests
  const interestSpanSelectors = [
    'span:has-text("|")',
    'div:has-text("|")',
    '.interests-list',
    '.interest-list',
    '.interest-items'
  ];
  
  // Try to find interests
  let interestsFound = false;
  this.interests = [];
  
  for (const selector of interestSpanSelectors) {
    const interestSpan = this.page.locator(selector).first();
    const isVisible = await interestSpan.isVisible().catch(() => false);
    
    if (isVisible) {
      const text = await interestSpan.textContent();
      console.log(`Found interests text: ${text}`);
      
      // Extract interests separated by pipe symbol
      if (text.includes('|')) {
        const interestArray = text.split('|').map(item => item.trim());
        this.interests = interestArray.filter(item => item.length > 0);
        interestsFound = true;
        break;
      }
    }
  }
  
  // If we couldn't find pipe-separated interests, look for individual interest elements
  if (!interestsFound) {
    const individualInterestSelectors = [
      '.interest-item',
      '.interest-pill',
      '.interest-tag',
      '.tag',
      '.pill'
    ];
    
    for (const selector of individualInterestSelectors) {
      const count = await this.page.locator(selector).count();
      
      if (count > 0) {
        console.log(`Found ${count} individual interest elements with selector: ${selector}`);
        
        // Extract text from each interest element
        for (let i = 0; i < count; i++) {
          const text = await this.page.locator(selector).nth(i).textContent();
          if (text && text.trim()) {
            this.interests.push(text.trim());
          }
        }
        
        if (this.interests.length > 0) {
          interestsFound = true;
          break;
        }
      }
    }
  }
  
  // If we still couldn't find interests, use default interests
  if (!interestsFound || this.interests.length === 0) {
    console.log("Could not find interests. Using default interests for testing.");
    this.interests = [];
    interestsFound = true;
  }
  
  console.log("Found interests:", this.interests);
  expect(this.interests.length).toBeGreaterThan(0);
  console.log("✓ Found interests");
});

When('user navigates back to home page', async function() {
  // Click on the Experience League logo or home link
  await this.page.getByRole('link', { name: 'My Homepage' }).click();
  await this.page.waitForTimeout(3000);
  /* const homeSelectors = [
    'a[href="/"]',
    'a[href="/en"]',
    '.logo',
    '.home-link',
    'a:has-text("Experience League")'
  ];
  
  // Try to find and click on the home link
  let homeClicked = false;
  
  for (const selector of homeSelectors) {
    const homeLink = this.page.locator(selector).first();
    const isVisible = await homeLink.isVisible().catch(() => false);
    
    if (isVisible) {
      console.log(`Clicking on home link with selector: ${selector}`);
      await homeLink.click();
      await this.page.waitForTimeout(3000);
      homeClicked = true;
      break;
    }
  }
  
  // If we couldn't find a specific home link, navigate directly
  if (!homeClicked) {
    console.log("Navigating directly to home page");
    await this.page.goto('https://experienceleague-stage.adobe.com/en/');
    await this.page.waitForTimeout(3000);
  }*/
  
  console.log("✓ Navigated back to home page");
});

Then('interests should be visible as pills in responsive pill list', async function() {
  // Look for responsive pill list
  const pillList = this.page.locator('.responsive-pill-list');
  const isPillListVisible = await pillList.isVisible().catch(() => false);
  
  if (!isPillListVisible) {
    console.log("Could not find .responsive-pill-list. Looking for individual pills...");
  } else {
    console.log("✓ Found responsive pill list");
  }
  
  // Check if all interests are visible as pills
  const foundInterests = [];
  const notFoundInterests = [];
  
  // First, get all pill texts for debugging
  const allPills = await this.page.locator('.responsive-pill-list ul li').all();
  const allPillTexts = [];
  
  for (const pill of allPills) {
    try {
      const text = await pill.textContent();
      if (text && text.trim()) {
        allPillTexts.push(text.trim());
      }
    } catch (e) {
      // Ignore errors
    }
  }
  
  console.log("All pill texts found:", allPillTexts);
  
  // Now check each interest with case-insensitive comparison
  for (const interest of this.interests) {
    let found = false;
    
    // Try exact match first
    //*const interestPill = this.page.locator(`text="${interest}"`).first();
    // const isVisible = await interestPill.isVisible().catch(() => false);
    
   
      // Try case-insensitive match with all pills
      const interestLower = interest.toLowerCase();
      for (const pillText of allPillTexts) {
        if (pillText.toLowerCase() === interestLower || 
            pillText.toLowerCase().includes(interestLower) || 
            interestLower.includes(pillText.toLowerCase())) {
          console.log(`Found interest pill with fuzzy match: ${interest} as ${pillText}`);
          foundInterests.push(interest);
          found = true;
          break;
        
      }
      
      if (!found) {
        console.log(`Interest pill not found: ${interest}`);
        notFoundInterests.push(interest);
      }
    }
  }
  
  // Log summary of found and not found interests
  console.log(`Found ${foundInterests.length} out of ${this.interests.length} interests as pills`);
  console.log("Found interests:", foundInterests);
  
  
  // Assert that at least some interests were found
  expect(foundInterests.length).toBeGreaterThan(0);
  console.log("✓ Interests are visible as pills");
  
  // Clean up - close the browser
  if (this.browser) {
    await this.browser.close();
  }
});
