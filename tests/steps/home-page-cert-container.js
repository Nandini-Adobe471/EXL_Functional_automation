const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { launchBrowser } = require('../commonFunctions/launchbrowser');

setDefaultTimeout(90 * 1000);

Given('user navigates to Experience League home apage', async function() {
  // Launch browser and navigate to the home page
  // Use the common login function to log in
  const result = await performLogin(this);
  
  // Wait for the page to stabilize
  await this.page.waitForTimeout(4000);
});

When('the home page loaads completely', async function() {
  // Wait for the main content to be visible
  await this.page.waitForSelector('main', { state: 'visible', timeout: 40000 });
  await this.page.waitForTimeout(2000);
  
  // Verify we're on the home page
  await expect(this.page).toHaveURL(/.*experienceleague-stage.adobe.com\/en\/?$/);
  
  
});

Then('the certification top container should be visible', async function() {

  await this.page.locator('.cert-top-container, [data-testid="cert-top-container"]').toBeVisible();
  console.log("✓ cert-top-container visible on home page");
  /* / Define possible selectors for the certification top container
  const certContainerSelectors = [
    '.cert-top-container',
    '[data-testid="cert-top-container"]',
    '.certification-container',
    '.certification-top-section',
    'section.certification'
  ];
  
  // Check if any of the selectors are visible
  let certContainerFound = false;
  
  for (const selector of certContainerSelectors) {
    const isVisible = await this.page.locator(selector).isVisible().catch(() => false);
    
    if (isVisible) {
      console.log(`Found certification top container with selector: ${selector}`);
      certContainerFound = true;
      
       
      break;
    }
  }*/
 
  
});
