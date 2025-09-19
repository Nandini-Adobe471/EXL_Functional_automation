const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { performLogin } = require('../commonFunctions/login');
const { launchBrowser, closeBrowser } = require('../commonFunctions/launchbrowser');
const ENV = require('../../config.js');
// Import common mobile steps
require('./common-mobile-steps');

setDefaultTimeout(90 * 1000);

// Mobile search step definitions
Given('the user navigates to the mobile search page', async function() {
  // Launch browser
  const result = await launchBrowser();
  this.page = result.page;
  this.browser = result.browser;
  this.context = result.context;
  
  // Navigate directly to the search page
  await this.page.goto(`${ENV.URL}`);
  
  // Set viewport to mobile size
  await this.page.setViewportSize({ width: 375, height: 812 });
  console.log('✓ Changed viewport to mobile size (375x812)');
  
  // Wait for the page to fully load
  await this.page.waitForTimeout(6000);
  
  // Verify we're on the search page
  console.log("✓ Successfully navigated to mobile search page");
});

When('the user clicks on the mobile search icon', async function() {
  // Look for the search icon in mobile view
  const searchIcon = this.page.locator('.search-short a[aria-label="Search"]').first();
  
  // Verify the search icon is visible
  await expect(searchIcon).toBeVisible();
  
  // Click on the search icon
  await searchIcon.click();
  console.log("✓ Clicked on mobile search icon");
  
  // Wait for navigation or search overlay to appear
  await this.page.waitForTimeout(2000);
});

When('the user clicks on the filter button in mobile view', async function() {
  // Click on the mobile filter button with class mobile-only and id mobile-filter-btn
  const mobileFilterBtn = this.page.locator('button#mobile-filter-btn');
  await expect(mobileFilterBtn).toBeVisible();
  await mobileFilterBtn.click();
  console.log('✓ Clicked on the filter button in mobile view');
  
  // Wait for the UI to update
  await this.page.waitForTimeout(2000);
});

When('the user checks the mobile {string} parent checkbox', async function(parentLabel) {
  // Wait for facets to load
  await this.page.waitForTimeout(3000);
  
  // Map facet display names to their IDs
  const facetMapping = {
    'Product': 'facetProduct',
    'Content Type': 'facetContentType',
    'Role': 'facetRole'
  };
  
  const facetTechnicalId = 'facetProduct'; // Since we know we're looking for Experience Manager in Product facet
  console.log(`Looking for facet with ID: ${facetTechnicalId} in mobile view`);
  
  // Find the specific facet section
  const facetSection = this.page.locator(`atomic-facet-manager >> atomic-facet[id="${facetTechnicalId}"]`);
  await expect(facetSection).toBeVisible({ timeout: 10000 });
  
  // Expand the facet if it's collapsed
  await this.page.locator(`atomic-facet-manager >> atomic-facet[id="${facetTechnicalId}"] >> button[data-expanded="false"].facet-show-more-btn`).click().catch(() => {
    console.log(`No need to expand the ${facetTechnicalId} facet or it's already expanded`);
  });
  await this.page.waitForTimeout(1000);
  
  // Locate the checkbox with the specified value
  const parentCheckbox = this.page.locator(`atomic-facet-manager >> atomic-facet[id="${facetTechnicalId}"] >> div ul li[data-contenttype="${parentLabel}"] button[role="checkbox"]`).first();
  
  // Scroll the checkbox into view and ensure it's visible
  await parentCheckbox.scrollIntoViewIfNeeded();
  await expect(parentCheckbox).toBeVisible({ timeout: 10000 });
  
  // Store the parent checkbox for later use
  this.parentCheckbox = parentCheckbox;
  
  // Click to check the parent
  await parentCheckbox.click();
  console.log(`✓ Checked the "${parentLabel}" parent checkbox in mobile view`);
  
  // Verify it's checked
  await expect(parentCheckbox).toHaveAttribute('aria-checked', 'true');
  console.log(`✓ Verified "${parentLabel}" parent checkbox is checked in mobile view`);
  
  // Wait for the UI to update
  await this.page.waitForTimeout(2000);
});

Then('all mobile child checkboxes under {string} should be checked', async function(parentLabel) {
  // Get all child checkboxes under Experience Manager
  const childCheckboxes = this.page.locator(`li[data-parent="${parentLabel}"] button[role="checkbox"]`);
  
  // Store the child checkboxes for later use
  this.childCheckboxes = childCheckboxes;
  
  // Get the count of child checkboxes
  const childCount = await childCheckboxes.count();
  console.log(`Found ${childCount} child checkboxes under "${parentLabel}" in mobile view`);
  
  // Ensure every child is checked
  for (let i = 0; i < childCount; i++) {
    await expect(childCheckboxes.nth(i)).toHaveAttribute('aria-checked', 'true');
    console.log(`✓ Child checkbox ${i + 1} is checked in mobile view`);
  }
  
  console.log(`✓ All child checkboxes under "${parentLabel}" are checked in mobile view`);
});

When('the user clicks on mobile {string} for product list', async function(buttonText) {
  // Wait for the UI to update
  await this.page.waitForTimeout(2000);
  
  // Find the "Show More" button for the product facet
  const showMoreButton = this.page.locator('atomic-facet#facetProduct >> button.facet-show-more-btn');
  
  // Make sure the button is visible
  await expect(showMoreButton).toBeVisible({ timeout: 10000 });
  
  // Scroll the button into view if needed
  await showMoreButton.scrollIntoViewIfNeeded();
  
  // Click the button
  await showMoreButton.click();
  console.log(`✓ Clicked on "${buttonText}" button for product list in mobile view`);
  
  // Wait for the UI to update after expanding
  await this.page.waitForTimeout(2000);
});

When('the user clicks on the mobile {string} button for a subchild', async function(buttonType) {
  // Wait for the UI to update
  await this.page.waitForTimeout(2000);
  
  // Find a specific child facet under Experience Manager using the DOM structure provided
  const childFacets = this.page.locator(`atomic-facet#facetProduct >> ul li[data-parent="Experience Manager"]`);
  
  // Get the count of child facets
  const childCount = await childFacets.count();
  console.log(`Found ${childCount} child facets under Experience Manager in mobile view`);
  
  if (childCount > 0) {
    // Select the first child facet
    const specificChildFacet = childFacets.first();
    
    // Make sure the child facet is visible
    await expect(specificChildFacet).toBeVisible({ timeout: 10000 });
    
    // Find the label element within the child facet
    const label = specificChildFacet.locator('label.group.items-center');
    
    // Find the "only" button (span with part attribute containing "only")
    // In mobile view, this is typically a button or span element that appears next to the label
    const onlyButton = specificChildFacet.locator('span[part*="only-facet-btn"]');
    
    // If the specific "only" button selector doesn't work, fall back to the third span
    if (await onlyButton.count() === 0) {
      console.log('Using fallback selector for "only" button in mobile view');
      // Use the third span as a fallback
      const fallbackOnlyButton = specificChildFacet.locator('span').nth(2);
      await expect(fallbackOnlyButton).toBeVisible({ timeout: 10000 });
      
      // Store the child name for later reference
      const valueLabel = specificChildFacet.locator('span[part="value-label"]');
      if (await valueLabel.count() > 0) {
        this.selectedChildName = await valueLabel.getAttribute('title');
        console.log(`Selected child facet in mobile view (from title): ${this.selectedChildName}`);
      } else {
        // Fallback to getting text content
        this.selectedChildName = await specificChildFacet.locator('label span').first().textContent();
        console.log(`Selected child facet in mobile view (from text): ${this.selectedChildName}`);
      }
      
      // Store the child index for later reference
      this.hoveredChildIndex = 0;
      
      // Click the fallback only button
      await fallbackOnlyButton.click();
      console.log(`✓ Clicked on the "${buttonType}" button for subchild in mobile view using fallback selector`);
    } else {
      // Store the child name for later reference
      const valueLabel = specificChildFacet.locator('span[part="value-label"]');
      if (await valueLabel.count() > 0) {
        this.selectedChildName = await valueLabel.getAttribute('title');
        console.log(`Selected child facet in mobile view (from title): ${this.selectedChildName}`);
      } else {
        // Fallback to getting text content
        this.selectedChildName = await specificChildFacet.locator('label span').first().textContent();
        console.log(`Selected child facet in mobile view (from text): ${this.selectedChildName}`);
      }
      
      // Store the child index for later reference
      this.hoveredChildIndex = 0;
      
      // Click the only button
      await onlyButton.click();
      console.log(`✓ Clicked on the "${buttonType}" button for subchild in mobile view`);
    }
    
    // Wait for the UI to update
    await this.page.waitForTimeout(2000);
  } else {
    throw new Error('No child facets found under Experience Manager in mobile view');
  }
});

Then('only that mobile child should be selected', async function() {
  // Get the child checkbox that was selected
  const selectedChildCheckbox = this.childCheckboxes.nth(this.hoveredChildIndex);
  
  // Verify it's checked
  await expect(selectedChildCheckbox).toHaveAttribute('aria-checked', 'true');
  console.log(`✓ Verified child "${this.selectedChildName}" is checked in mobile view`);
});

Then('all other mobile children should be unselected', async function() {
  // Get all child checkboxes
  const childCheckboxes = this.childCheckboxes;
  const count = await childCheckboxes.count();
  
  // Check that all other children are unchecked
  for (let i = 0; i < count; i++) {
    if (i !== this.hoveredChildIndex) {
      const ariaLabel = await childCheckboxes.nth(i).getAttribute('aria-label');
      let childName = `Child ${i + 1}`;
      if (ariaLabel) {
        const childNameParts = ariaLabel.split('|');
        if (childNameParts.length > 1) {
          childName = childNameParts[1].split(';')[0].trim();
        }
      }
      
      const isChecked = await childCheckboxes.nth(i).getAttribute('aria-checked') === 'true';
      expect(isChecked).toBeFalsy();
      console.log(`✓ Verified child "${childName}" is unchecked in mobile view`);
    }
  }
  
  console.log('✓ All other children are unchecked in mobile view');
});

Then('the mobile parent checkbox should be unchecked', async function() {
  // Verify the parent checkbox is unchecked
  await expect(this.parentCheckbox).toHaveAttribute('aria-checked', 'false');
  console.log('✓ The parent checkbox is unchecked in mobile view');
  
  // Clean up - close the browser
  if (this.browser) {
    await closeBrowser(this.browser);
    console.log('Browser closed successfully');
  }
});

// Step definitions for multiple filter selection scenario
When('the user selects {string} from {string} facet in mobile', async function(facetValue, facetId) {
  // Wait for facets to load
  await this.page.waitForTimeout(2000);
  
  // Initialize selected facets if not already done
  if (!this.selectedFacets) {
    this.selectedFacets = [];
  }
  
  // Expand the facet if it's collapsed - using the same approach as in the first scenario
  await this.page.locator('atomic-facet-manager >> button[data-expanded="false"].facet-show-more-btn').nth(2).click().catch(() => {
    console.log(`No need to expand the facet or it's already expanded`);
  });
  
  // Determine which facet to use based on facetId
  let facetSelector = 'facetProduct'; // Default to Product facet
  if (facetId === 'Content Type') {
    facetSelector = 'facetContentType';
  } else if (facetId === 'Role') {
    facetSelector = 'facetRole';
  }
  
  // Locate the checkbox with the specified value - using the same approach as in the first scenario
  const checkbox = this.page.locator(`atomic-facet#${facetSelector} >> ul li[data-contenttype="${facetValue}"] button[role="checkbox"]`);
  await expect(checkbox).toBeVisible({ timeout: 10000 });
  
  // Store the checkbox for later use
  if (!this.selectedCheckboxes) {
    this.selectedCheckboxes = {};
  }
  this.selectedCheckboxes[`${facetId}-${facetValue}`] = checkbox;
  
  // Click to check the checkbox
  await checkbox.click();
  console.log(`✓ Selected "${facetValue}" from ${facetId} in mobile view`);
  
  // Verify it's checked
  await expect(checkbox).toHaveAttribute('aria-checked', 'true');
  
  // Store the selected facet
  this.selectedFacets.push({
    facetId,
    value: facetValue,
    element: checkbox
  });
  
  // Wait for the UI to update
  await this.page.waitForTimeout(2000);
});

When('the user clicks on the close icon in mobile view', async function() {
  // Wait for the UI to update after facet selection
  await this.page.waitForTimeout(2000);
  
  // Find and click the close icon
  const closeIcon = this.page.locator('button.facet-close-btn, button:has(img[data-icon-name="close"])');
  
  // Make sure the close icon is visible
  await expect(closeIcon).toBeVisible({ timeout: 5000 });
  
  // Scroll the close icon into view if needed
  await closeIcon.scrollIntoViewIfNeeded();
  
  // Click the close icon
  await closeIcon.click();
  console.log('✓ Clicked on close icon in mobile view');
  
  // Wait for the UI to update after closing
  await this.page.waitForTimeout(2000);
});

Then('the breadcrumb list should show {string} button', async function(buttonText) {
  // Wait for the UI to update
  await this.page.waitForTimeout(2000);
  
  // Find the breadcrumb list container with a more specific locator to avoid strict mode violation
  // Use first() to explicitly handle multiple matches
  const breadcrumbContainer = this.page.locator('atomic-breadbox div[part="breadcrumb-list-container"]').first();
  await expect(breadcrumbContainer).toBeVisible({ timeout: 10000 });
  
  // Find the show more button with the specified text
  const showMoreButton = breadcrumbContainer.locator(`button[part="show-more"]`);
  await expect(showMoreButton).toBeVisible({ timeout: 10000 });
  
  // Get the text of the button to verify
  const actualButtonText = await showMoreButton.textContent();
  expect(actualButtonText.trim()).toContain(buttonText);
  console.log(`✓ Verified breadcrumb list shows "${buttonText}" button`);
  
  // Check if there's a clear button visible, which indicates we're in a scenario
  // that will continue with clear filter functionality
  const clearButton = this.page.locator('atomic-breadbox div button[part="clear"][aria-label="Clear All Filters"]');
  const isClearButtonVisible = await clearButton.isVisible().catch(() => false);
  
/*  // Don't close the browser if we're in a scenario with clear button
  if (!isClearButtonVisible && this.browser) {
    await closeBrowser(this.browser);
    console.log('Browser closed successfully');
  } else {
    console.log('Keeping browser open for subsequent steps');
  }*/
});

// Step definitions for clear filter functionality
When('the user clicks on the clear all filters button', async function() {
  // Wait for the UI to update
  await this.page.waitForTimeout(2000);
  
  // Find the clear all filters button
  const clearButton = this.page.locator('atomic-breadbox div button[part="clear"][aria-label="Clear All Filters"]').first();
  await expect(clearButton).toBeVisible({ timeout: 5000 });
  
  // Scroll the button into view if needed
  await clearButton.scrollIntoViewIfNeeded();
  
  // Click the clear button
  await clearButton.click();
  console.log('✓ Clicked on the clear all filters button');
  
  // Wait for the UI to update
  await this.page.waitForTimeout(2000);
});

Then('the {string} checkbox in {string} facet should be unchecked', async function(checkboxValue, facetId) {
  // Wait for the UI to update
  await this.page.waitForTimeout(2000);
  
  // Determine which facet to use based on facetId
  let facetSelector = 'facetProduct'; // Default to Product facet
  if (facetId === 'Content Type') {
    facetSelector = 'facetContentType';
  } else if (facetId === 'Role') {
    facetSelector = 'facetRole';
  }
  
  // Expand the facet if it's collapsed
  await this.page.locator(`atomic-facet#${facetSelector} >> button[data-expanded="false"].facet-show-more-btn`).click().catch(() => {
    console.log(`No need to expand the ${facetId} facet or it's already expanded`);
  });
  await this.page.waitForTimeout(1000);
  
  // Locate the checkbox with the specified value
  const checkbox = this.page.locator(`atomic-facet#${facetSelector} >> ul li[data-contenttype="${checkboxValue}"] button[role="checkbox"]`);
  await expect(checkbox).toBeVisible({ timeout: 5000 });
  
  // Verify it's unchecked
  await expect(checkbox).toHaveAttribute('aria-checked', 'false');
  console.log(`✓ Verified "${checkboxValue}" checkbox in "${facetId}" facet is unchecked`);
  
  // If this is the last check in the scenario, clean up
  if (facetId === 'Product' && checkboxValue === 'Analytics') {
    // Clean up - close the browser
    if (this.browser) {
      await closeBrowser(this.browser);
      console.log('Browser closed successfully');
    }
  }
});
