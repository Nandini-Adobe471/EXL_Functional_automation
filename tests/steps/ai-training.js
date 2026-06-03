const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { launchBrowser, closeBrowser } = require('../commonFunctions/launchbrowser');

setDefaultTimeout(90 * 1000);

Given('user navigates to Experience League with adobeQA parameter', async function() {
  // Launch browser
  const result = await launchBrowser();
  this.page = result.page;
  this.browser = result.browser;
  this.context = result.context;
  
  // Clear cache, cookies, and permissions before navigating
  await this.context.clearCookies();
  await this.context.clearPermissions();
  console.log("✓ Cleared cache, cookies, and permissions");
  
  // Navigate to the URL with adobeQA parameter
  await this.page.goto('https://experienceleague-stage.adobe.com/?adobeQA=aimNotification');
  
  // Wait for the page to fully load
  await this.page.waitForTimeout(3000);
  
  // Verify we're on the Experience League page with the correct parameter
  const currentUrl = this.page.url();
  expect(currentUrl).toContain('experienceleague-stage.adobe.com');
  expect(currentUrl).toContain('adobeQA=aimNotification');
  console.log("✓ Successfully navigated to Experience League with adobeQA parameter");
  console.log(`Current URL: ${currentUrl}`);
});

When('user clicks on AI training link', async function() {
  // Find the AI training link by href
  const aiTrainingLink = this.page.locator('a[href="https://experienceleague-stage.adobe.com/en/ai-training"]');
  
  // Verify the AI training link is visible
  await expect(aiTrainingLink).toBeVisible();
  console.log("✓ Found AI training link");
  
  // Get the link text for logging
  const linkText = await aiTrainingLink.textContent();
  console.log(`AI training link text: "${linkText.trim()}"`);
  
  // Click on the AI training link
  await aiTrainingLink.click();
  console.log("✓ Clicked on AI training link");
  
  // Wait for navigation to complete
  await this.page.waitForTimeout(3000);
});

Then('user should be redirected to AI training page', async function() {
  // Verify we're on the AI training page
  const currentUrl = this.page.url();
  expect(currentUrl).toContain('/en/ai-training');
  console.log(`✓ Successfully redirected to AI training page: ${currentUrl}`);
  
  // Optionally verify page content or title
  const pageTitle = await this.page.title();
  console.log(`Page title: "${pageTitle}"`);
  
  // Store the AI training URL for later use
  this.aiTrainingUrl = currentUrl;
  
  // Close the browser after verifying the redirect
  if (this.browser) {
    await closeBrowser(this.browser);
    console.log('✓ Browser closed after clicking AI training link');
  }
});

When('user reloads the page', async function() {
  // Launch a new browser instance
  const result = await launchBrowser();
  this.page = result.page;
  this.browser = result.browser;
  this.context = result.context;
  console.log("✓ Launched new browser instance");
  
  // Clear cache, cookies, and permissions before navigating
  await this.context.clearCookies();
  await this.context.clearPermissions();
  console.log("✓ Cleared cache, cookies, and permissions");
  
  // Navigate to the AI training URL again
  await this.page.goto(this.aiTrainingUrl);
  console.log("✓ Navigated to AI training URL again");
  
  // Wait for 5 seconds for the page to fully load
  await this.page.waitForTimeout(5000);
  console.log("✓ Waited 5 seconds for page to load");
});

Then('AI training page should be displayed', async function() {
  // Verify we're still on the AI training page after reload
  const currentUrl = this.page.url();
  expect(currentUrl).toContain('/en/ai-training');
  console.log(`✓ AI training page is displayed after reload: ${currentUrl}`);
  
  // Verify the page is loaded properly by checking for common elements
  const pageContent = this.page.locator('body');
  await expect(pageContent).toBeVisible();
  console.log("✓ Page content is visible after reload");
  
  // Clean up - close the browser
  if (this.browser) {
    await closeBrowser(this.browser);
    console.log('Browser closed successfully');
  }
});
