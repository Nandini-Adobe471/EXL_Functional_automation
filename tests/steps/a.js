const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { performLogin } = require('../commonFunctions/login');

setDefaultTimeout(90 * 1000);

Given('user is logged in to Experience League application', async function() {
  // Use the common login function to log in
  const result = await performLogin(this);
  
  // Wait for the page to stabilize
  await this.page.waitForTimeout(4000);
});

When('the home page loads completely', async function() {
  // Wait for the main content to be visible
  //await this.page.waitForSelector('.browse-card-content', { state: 'visible', timeout: 40000 });
  await this.page.waitForTimeout(5000);
  
  // Verify we're on the home page
  await expect(this.page).toHaveURL(/.*experienceleague-stage.adobe.com\/en\/home/);
});

Then('user checks if Recently viewed block is available', async function() {

  await this.page.waitForTimeout(5000);
  
   const recentlyViewedElement = this.page.locator('#watch-past-events-on-demand')
   //this.page.locator('div').filter({ hasText: 'Recently viewed' });
   // Basic Playwright assertion to check if the element is visible
   await expect(recentlyViewedElement).toBeVisible({ timeout: 10000 });
   console.log("✓ Recently viewed block is visible");
   /*/ Store the selector for later use
   this.recentlyViewedSelector = 'div:has-text("Recently viewed")';
   this.recentlyViewedFound = true;*/
});

When('user clicks on Cookie preferences in the footer', async function() {
  // Scroll to the footer
  await this.page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await this.page.waitForTimeout(2000);
  
  // Look for the Cookie preferences link in the footer
  const cookiePreferencesLink = this.page.locator('footer a:text("Cookie preferences"), footer a:text("Cookie Preferences"), footer [data-testid="cookie-preferences"]');
  
  // Assert that the link is visible
  await expect(cookiePreferencesLink).toBeVisible({ timeout: 10000 });
  
  // Click the Cookie preferences link
  await cookiePreferencesLink.click();
  
  // Wait for the modal to appear
  await this.page.waitForTimeout(2000);
});

When('user disables cookies in the preferences modal', async function() {
 /* // Wait for the cookie preferences modal to be visible
  const cookieModal = this.page.locator('.cookie-preferences-modal, [data-testid="cookie-modal"], .cookie-modal');
  await expect(cookieModal).toBeVisible({ timeout: 10000 });
  
  // Find and click on toggle switches to disable cookies
  // Note: The exact selectors may need to be adjusted based on the actual implementation
  const toggles = this.page.locator('.cookie-modal input[type="checkbox"], .cookie-preferences-modal input[type="checkbox"]');
  
  // Get the count of toggles
  const toggleCount = await toggles.count();
  console.log(`Found ${toggleCount} cookie preference toggles`);
  
  // Disable all toggles that are currently enabled
  for (let i = 0; i < toggleCount; i++) {
    const isChecked = await toggles.nth(i).isChecked();
    if (isChecked) {
      console.log(`Disabling toggle ${i+1}`);
      await toggles.nth(i).click();
      await this.page.waitForTimeout(500);
    }
  }
  
  // Find and click the save/apply button
  const saveButton = this.page.locator('.cookie-modal button:text("Save"), .cookie-modal button:text("Apply"), .cookie-preferences-modal button:text("Save"), .cookie-preferences-modal button:text("Apply")');
  await expect(saveButton).toBeVisible();
  await saveButton.click();
  
  // Wait for the modal to close
  await this.page.waitForTimeout(2000);*/
   await this.page.getByRole('link', { name: 'Cookie preferences' }).click();
   await this.page.waitForTimeout(2000);
  //await this.page.getByRole('button', { name: 'Don’t enable' }).click();
  await this.page.locator('#ot-pc-logo-button .disable-all-btn').click();
await this.page.waitForTimeout(2000);
});

When('user refreshes the page', async function() {
  // Refresh the page
  await this.page.reload();
  
  // Wait for the page to load
  await this.page.waitForSelector('.browse-card-content', { state: 'visible', timeout: 40000 });
  await this.page.waitForTimeout(2000);
});

Then('the Recently viewed block should not be visible', async function() {
  // Skip this check if we didn't find the Recently viewed block initially
  if (!this.recentlyViewedFound) {
    console.log("Skipping visibility check as Recently viewed block was not found initially");
    return;
  }
  
  // Check if the Recently viewed block is now hidden
  const isStillVisible = await this.page.locator(this.recentlyViewedSelector).isVisible().catch(() => false);
  
  if (isStillVisible) {
    console.error("❌ Recently viewed block is still visible after disabling cookies");
  } else {
    console.log("✓ Recently viewed block is correctly hidden after disabling cookies");
  }
  
  // Assert that the block is not visible
  await expect(this.page.locator(this.recentlyViewedSelector)).not.toBeVisible();
  
  // Clean up - close the browser
  if (this.browser) {
    await this.browser.close();
  }
});
