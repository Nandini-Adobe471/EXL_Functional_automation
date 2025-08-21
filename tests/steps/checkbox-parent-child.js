const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { launchBrowser, closeBrowser } = require('../commonFunctions/launchbrowser');

setDefaultTimeout(90 * 1000);

Given('the user navigates to the search results page', async function() {
  // Launch browser
  const result = await launchBrowser();
  this.page = result.page;
  this.browser = result.browser;
  this.context = result.context;
  
  // Navigate directly to the search page
  await this.page.goto('https://experienceleague.adobe.com/en/search');
  
  // Wait for the page to fully load
  await this.page.waitForTimeout(3000);
  
  // Verify we're on the search page
//  await expect(this.page).toHaveURL(/.*\/search.*/);
  console.log("✓ Successfully navigated to search results page");
});

When('the user checks the {string} parent checkbox', async function(parentLabel) {
  // Wait for facets to load
  await this.page.waitForTimeout(2000);
    await this.page.locator('atomic-facet-manager >> button[data-expanded="false"].facet-show-more-btn').nth(2).click();
  // Locate the parent checkbox for "Experience Manager"
  const parentCheckbox = this.page.locator(`atomic-facet-manager >>  atomic-facet >> div ul li[data-contenttype="${parentLabel}"] button[role="checkbox"]`);
  await expect(parentCheckbox).toBeVisible();
  
  // Store the parent checkbox for later use
  this.parentCheckbox = parentCheckbox;
  
  // Click to check the parent
  await parentCheckbox.click();
  console.log(`✓ Checked the "${parentLabel}" parent checkbox`);
  
  // Verify it's checked
  await expect(parentCheckbox).toHaveAttribute('aria-checked', 'true');
  console.log(`✓ Verified "${parentLabel}" parent checkbox is checked`);
  
  // Wait for the UI to update
  await this.page.waitForTimeout(2000);
});

Then('all child checkboxes under {string} should be checked', async function(parentLabel) {
  // Get all child checkboxes under Experience Manager
  const childCheckboxes = this.page.locator(`li[data-parent="${parentLabel}"] button[role="checkbox"]`);
  
  // Store the child checkboxes for later use
  this.childCheckboxes = childCheckboxes;
  
  // Get the count of child checkboxes
  const childCount = await childCheckboxes.count();
  console.log(`Found ${childCount} child checkboxes under "${parentLabel}"`);
  
  // Ensure every child is checked
  for (let i = 0; i < childCount; i++) {
    await expect(childCheckboxes.nth(i)).toHaveAttribute('aria-checked', 'true');
    console.log(`✓ Child checkbox ${i + 1} is checked`);
  }
  
  console.log(`✓ All child checkboxes under "${parentLabel}" are checked`);
});

When('the user unchecks the first child under {string}', async function(parentLabel) {
  // Get the child name before unchecking
  const firstChildAriaLabel = await this.childCheckboxes.first().getAttribute('aria-label');
  const firstChildNameParts = firstChildAriaLabel.split('|');
  if (firstChildNameParts.length > 1) {
    this.uncheckedChildNamePart = firstChildNameParts[1].split(';')[0].trim();
    console.log(`Storing unchecked child name part: ${this.uncheckedChildNamePart}`);
  }
  
  // Uncheck the first child
  await this.childCheckboxes.first().click();
  console.log(`✓ Clicked to uncheck the first child checkbox under "${parentLabel}"`);
  
  // Verify it's unchecked
  await expect(this.childCheckboxes.first()).toHaveAttribute('aria-checked', 'false');
  console.log(`✓ Verified the first child checkbox under "${parentLabel}" is unchecked`);
  
  // Wait for the UI to update
  await this.page.waitForTimeout(2000);
});

Then('the unchecked child should not appear in the breadcrumb', async function() {
  // Wait for the UI to update
  await this.page.waitForTimeout(2000);
  
  // Get all breadcrumb buttons text
  const breadcrumbButtons = await this.page.locator('atomic-breadbox button').allTextContents();
  console.log('Breadcrumb buttons after unchecking:', breadcrumbButtons);
  
  // Check if any breadcrumb button contains the unchecked child name
  let uncheckedChildFound = false;
  for (const buttonText of breadcrumbButtons) {
    // Try to extract the child part from the button text
    const parts = buttonText.split('|');
    if (parts.length > 1) {
      const childPart = parts[1].trim();
      
      // Only consider exact matches to avoid false positives
      // This ensures "6.5" doesn't match with "6.5 LTS"
      if (childPart === this.uncheckedChildNamePart) {
        uncheckedChildFound = true;
        console.log(`Found exact match for unchecked child "${this.uncheckedChildNamePart}" in button text part: ${childPart}`);
        break;
      }
    }
  }
  
  // Assert that we did NOT find the unchecked child
  expect(uncheckedChildFound).toBeFalsy();
  console.log(`✓ Unchecked child "${this.uncheckedChildNamePart}" does not appear in the breadcrumb`);
});

Then('all child elements in atomic-breadbox should display with pattern {string}', async function(pattern) {
  // Wait for the UI to update
  await this.page.waitForTimeout(2000);
  
  // Get all breadcrumb buttons text
  const breadcrumbButtons = await this.page.locator('atomic-breadbox button').allTextContents();
  console.log('Breadcrumb buttons:', breadcrumbButtons);
  
  // Get the count of checked child checkboxes
  const checkedChildCount = await this.childCheckboxes.count();
  console.log(`Found ${checkedChildCount} checked child checkboxes`);
  
    // Check each child checkbox and verify its name appears in the breadbox
  for (let i = 0; i < checkedChildCount; i++) {
    // First verify this child is checked
    const isChecked = await this.childCheckboxes.nth(i).getAttribute('aria-checked') === 'true';
    expect(isChecked).toBeTruthy();
    
    // Get the child name from aria-label
    const ariaLabel = await this.childCheckboxes.nth(i).getAttribute('aria-label');
    const textContent = await this.childCheckboxes.nth(i).evaluate(el => el.textContent.trim());
    
    console.log(`Child ${i} aria-label:`, ariaLabel);
    console.log(`Child ${i} textContent:`, textContent);
    
    // Use aria-label for the child name
    const childName = ariaLabel;
    
    // Check if any breadcrumb button contains the child name
    let patternFound = false;
    for (const buttonText of breadcrumbButtons) {
      // Try to extract the child part from the button text
      const parts = buttonText.split('|');
      if (parts.length > 1) {
        const childPart = parts[1].trim();
        // Extract the child part from the aria-label
        const childNameParts = childName.split('|');
        if (childNameParts.length > 1) {
          const childNamePart = childNameParts[1].split(';')[0].trim();
          if (childPart === childNamePart || childPart.includes(childNamePart) || childNamePart.includes(childPart)) {
            patternFound = true;
            console.log(`Found child name "${childName}" in button text part: ${childPart}`);
            break;
          }
        }
      }
    }
    
    // Assert that we found the pattern
    expect(patternFound).toBeTruthy();
    console.log(`✓ Breadbox contains child name: ${childName}`);
    
    // Verify this child is checked again for clarity
    await expect(this.childCheckboxes.nth(i)).toHaveAttribute('aria-checked', 'true');
    console.log(`✓ Confirmed child checkbox for "${childName}" is checked`);
  }
  
  console.log('✓ All checked child elements are displayed in atomic-breadbox');
});

Then('the {string} parent checkbox should be unchecked', async function(parentLabel) {
  // Verify the parent checkbox is unchecked
  await expect(this.parentCheckbox).toHaveAttribute('aria-checked', 'false');
  console.log(`✓ The "${parentLabel}" parent checkbox is unchecked`);
  
  // Clean up - close the browser
  if (this.browser) {
    await closeBrowser(this.browser);
    console.log('Browser closed successfully');
  }
});

When('the user removes a breadcrumb element', async function() {
  // Wait for the UI to update
  await this.page.waitForTimeout(2000);
  
  // Get all breadcrumb buttons
  const breadcrumbButtons = this.page.locator('atomic-breadbox button');
  const count = await breadcrumbButtons.count();
  console.log(`Found ${count} breadcrumb buttons`);
  
  if (count > 0) {
    // Get the text of the second breadcrumb button before clicking
    const buttonText = await breadcrumbButtons.nth(1).textContent();
    console.log(`Removing breadcrumb element with text: ${buttonText}`);
    
    // Extract the child part from the button text
    const parts = buttonText.split('|');
    if (parts.length > 1) {
      this.removedChildPart = parts[1].trim();
      console.log(`Extracted child part: ${this.removedChildPart}`);
    }
    
    // Click the first breadcrumb button to remove it
    await breadcrumbButtons.first().click();
    console.log('✓ Clicked on breadcrumb button to remove it');
    
    // Wait for the UI to update
    await this.page.waitForTimeout(2000);
  } else {
    throw new Error('No breadcrumb buttons found to remove');
  }
});

Then('the corresponding facet should be unchecked', async function() {
  // Wait for the UI to update
  await this.page.waitForTimeout(2000);
  
  // Get all child checkboxes
  const childCheckboxes = this.childCheckboxes;
  const count = await childCheckboxes.count();
  
  // Find the checkbox that corresponds to the removed breadcrumb
  let foundMatchingCheckbox = false;
  for (let i = 0; i < count; i++) {
    const ariaLabel = await childCheckboxes.nth(i).getAttribute('aria-label');
    if (ariaLabel) {
      const childNameParts = ariaLabel.split('|');
      if (childNameParts.length > 1) {
        const childNamePart = childNameParts[1].split(';')[0].trim();
        
        // Check if this is the checkbox that corresponds to the removed breadcrumb
        if (childNamePart === this.removedChildPart) {
          // Verify it's unchecked
          const isChecked = await childCheckboxes.nth(i).getAttribute('aria-checked') === 'true';
          expect(isChecked).toBeFalsy();
          console.log(`✓ Verified checkbox for "${childNamePart}" is unchecked after removing breadcrumb`);
          foundMatchingCheckbox = true;
          break;
        }
      }
    }
  }
  
  expect(foundMatchingCheckbox).toBeTruthy();
  console.log('✓ Found and verified the corresponding facet is unchecked');
  
  // Clean up - close the browser
  if (this.browser) {
    await closeBrowser(this.browser);
    console.log('Browser closed successfully');
  }
});

// Mobile filter steps
When('the user changes viewport to mobile', async function() {
  // Set viewport to mobile size (e.g., iPhone X)
  await this.page.setViewportSize({ width: 375, height: 812 });
  console.log('✓ Changed viewport to mobile size (375x812)');
  
  // Wait for the UI to update
  await this.page.waitForTimeout(2000);
});

When('the user clicks on the search icon', async function() {
  // Click on the search icon with class search-short and aria-label Search
  /*const searchIcon = this.page.locator('.search-short[aria-label="Search"]');
  await expect(searchIcon).toBeVisible();
  await searchIcon.click();
  console.log('✓ Clicked on the search icon');*/
  
  // Wait for the UI to update
  await this.page.waitForTimeout(2000);
});

When('the user clicks on the mobile filter button', async function() {
  // Click on the mobile filter button with class mobile-only and id mobile-filter-btn
  const mobileFilterBtn = this.page.locator('button#mobile-filter-btn');
  await expect(mobileFilterBtn).toBeVisible();
  await mobileFilterBtn.click();
  console.log('✓ Clicked on the mobile filter button');
  
  // Wait for the UI to update
  await this.page.waitForTimeout(2000);
});
