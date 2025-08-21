const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { launchBrowser, closeBrowser } = require('../commonFunctions/launchbrowser');

setDefaultTimeout(90 * 1000);

Given('user navigates to search page', async function() {
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
  //await expect(this.page).toHaveURL(/.*\/search.*/);
  console.log("✓ Successfully navigated to search page");
  
  // Initialize a map to store parent checkboxes
  this.parentCheckboxes = {};
  
  // Initialize a map to store child checkboxes
  this.childCheckboxesMap = {};
  
  // Set default viewport size for desktop
  await this.page.setViewportSize({ width: 1280, height: 800 });
});

Given('user navigates to search page in mobile view', async function() {
  // Launch browser
  const result = await launchBrowser();
  this.page = result.page;
  this.browser = result.browser;
  this.context = result.context;
  
  // Set viewport size for mobile
  await this.page.setViewportSize({ width: 375, height: 667 });
  console.log("✓ Set viewport to mobile size");
  
  // Navigate directly to the search page
  await this.page.goto('https://experienceleague.adobe.com/en/search');
  
  // Wait for the page to fully load
  await this.page.waitForTimeout(3000);
  
  // Verify we're on the search page
  //await expect(this.page).toHaveURL(/.*\/search.*/);
  console.log("✓ Successfully navigated to search page in mobile view");
  
  // Click on search filter icon to open the filter panel
  const filterButton = this.page.locator('button#mobile-filter-btn:has(span.icon-atomic-search-filter)');
  await expect(filterButton).toBeVisible({ timeout: 10000 });
  await filterButton.click();
  console.log('✓ Clicked mobile filter button to show facets');
  
  // Wait for the facet panel to appear
  await this.page.waitForTimeout(2000);
  
  // Initialize a map to store parent checkboxes
  this.parentCheckboxes = {};
  
  // Initialize a map to store child checkboxes
  this.childCheckboxesMap = {};
});

When('user selects {string} from {string} facet', async function(facetValue, facetId) {
  // Wait for facets to load
  await this.page.waitForTimeout(3000);
  
  // Initialize selected facets if not already done
  if (!this.selectedFacets) {
    this.selectedFacets = [];
  }
  
  // Map facet display names to their IDs
  const facetMapping = {
    'Product': 'facetProduct',
    'Content Type': 'facetContentType',
    'Role': 'facetRole'
  };
  
  const facetTechnicalId = facetMapping[facetId] || facetId;
  console.log(`Looking for facet with ID: ${facetTechnicalId}`);
  
  // Find the specific facet section
  const facetSection = this.page.locator(`atomic-facet-manager >> atomic-facet[id="${facetTechnicalId}"]`);
  await expect(facetSection).toBeVisible({ timeout: 10000 });
  
  // Expand the facet if it's collapsed (using the original selector)
  await this.page.locator('atomic-facet-manager >> button[data-expanded="false"].facet-show-more-btn').nth(2).click().catch(() => {
    console.log(`No need to expand the ${facetId} facet or it's already expanded`);
  });
  await this.page.waitForTimeout(1000);
  
  // Locate the parent checkbox using the original selector
  const parentCheckbox = this.page.locator(`atomic-facet-manager >> atomic-facet >> div ul li[data-contenttype="${facetValue}"] button[role="checkbox"]`);
  
  // Scroll the checkbox into view and ensure it's visible
  await parentCheckbox.scrollIntoViewIfNeeded();
  await expect(parentCheckbox).toBeVisible({ timeout: 10000 });
  
  // Click to check the parent
  await parentCheckbox.click();
  console.log(`✓ Selected "${facetValue}" from ${facetId}`);
  
  // Verify it's checked
  await expect(parentCheckbox).toHaveAttribute('aria-checked', 'true');
  
  // Store the selected facet
  this.selectedFacets.push({
    facetId,
    value: facetValue,
    element: parentCheckbox
  });
  
  // Wait for the UI to update
  await this.page.waitForTimeout(2000);
});

Then('all selected facets should appear in the breadcrumb list', async function() {
  // Wait for the UI to update
  await this.page.waitForTimeout(2000);
  
  // Get all breadcrumb buttons
  const breadcrumbButtons = this.page.locator('atomic-breadbox button');
  const buttonCount = await breadcrumbButtons.count();
  console.log(`Found ${buttonCount} breadcrumb buttons`);
  
  // Get all breadcrumb button texts
  const breadcrumbTexts = await breadcrumbButtons.allTextContents();
  console.log('Breadcrumb texts:', breadcrumbTexts);
  
  // Check that all selected facets appear in the breadcrumb
  if (this.selectedFacets && this.selectedFacets.length > 0) {
    for (const facet of this.selectedFacets) {
      // Check if the facet value appears in any breadcrumb button
      const facetInBreadcrumb = breadcrumbTexts.some(text => text.includes(facet.value));
      expect(facetInBreadcrumb).toBeTruthy();
      console.log(`✓ Selected facet "${facet.value}" from ${facet.facetId} appears in breadcrumb`);
    }
  } else {
    console.log('No facets were selected');
  }
  
  console.log('✓ All selected facets appear in the breadcrumb list');
  
  // Clean up - close the browser
  if (this.browser) {
    await closeBrowser(this.browser);
    console.log('Browser closed successfully');
  }
});

When('user clicks on close icon', async function() {
  // Wait for the UI to update after facet selection
  await this.page.waitForTimeout(2000);
  
  // Find and click the close icon
  const closeIcon = this.page.locator('button:has(img[data-icon-name="close"])');
  
  // Make sure the close icon is visible
  await expect(closeIcon).toBeVisible({ timeout: 10000 });
  
  // Scroll the close icon into view if needed
  await closeIcon.scrollIntoViewIfNeeded();
  
  // Click the close icon
  await closeIcon.click();
  console.log('✓ Clicked on close icon');
  
  // Wait for the UI to update after closing
  await this.page.waitForTimeout(2000);
});

Then('facet items in {string} should be alphabetically ordered', async function(facetId) {
 // try {
    // Wait for facets to load
    await this.page.waitForTimeout(2000);
    
    // Find the facet element by ID
  
    let facetElementLocator = await this.page.locator(`atomic-facet[id="${facetId}"] > div > fieldset > ul > li:not([data-childfacet="true"])`);
    facetElementLocator= await facetElementLocator.all();
    const facetElement = await Promise.all(facetElementLocator.map(async element => {
     return await element.getAttribute('data-contenttype');
    }));
    
    //await expect(facetElement).toBeVisible();
    console.log(`✓ Found facet with ID: ${facetId}`);
      await this.page.waitForTimeout(2000);
    console.log(facetElement);
console.log([...facetElement].sort((a, b) => {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();
    
    // If one string is a prefix of another, shorter one comes first
    if (aLower.startsWith(bLower)) return 1;  // b comes first
    if (bLower.startsWith(aLower)) return -1; // a comes first
    
    // Otherwise, normal alphabetical sorting
    return aLower.localeCompare(bLower);
  }));
  expect(facetElement).toEqual([...facetElement].sort((a, b) => {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();
    
    // If one string is a prefix of another, shorter one comes first
    if (aLower.startsWith(bLower)) return 1;  // b comes first
    if (bLower.startsWith(aLower)) return -1; // a comes first
    
    // Otherwise, normal alphabetical sorting
    return aLower.localeCompare(bLower);
  }));
    
});
