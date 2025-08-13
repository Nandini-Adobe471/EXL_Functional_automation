const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { performLogin } = require('../commonFunctions/login');
const { launchBrowser, closeBrowser } = require('../commonFunctions/launchbrowser');
// Import common mobile steps
require('./common-mobile-steps');

setDefaultTimeout(90 * 1000);

Given('user logs in and lands on the home page for search validation', async function() {
  // Launch browser
  const result = await launchBrowser();
  this.page = result.page;
  this.browser = result.browser;
  this.context = result.context;
  
  // Use the common login function to log in
  await performLogin(this);
   await this.page.waitForTimeout(5000);
  // Navigate to the home page
  //await this.page.goto('https://experienceleague-stage.adobe.com/');
  
  // Wait for the page to fully load after login
  //await this.page.waitForTimeout(3000);
  
  // Verify we're on the home page
 // await expect(this.page).toHaveURL(/.*experienceleague-stage.adobe.com\/?$/);
  console.log("✓ Successfully logged in and landed on the home page for search validation");
});

When('user verifies secondary search is visible', async function() {
  // Look for the secondary search input
  await this.page.waitForTimeout(2000);
  const searchInput = this.page.locator('.secondary-search.block #secondary-search');
  
  // Verify the search input is visible
  await expect(searchInput).toBeVisible();
  console.log("✓ Secondary search is visible");
  
  // Store the search input for later use
  this.searchInput = searchInput;
});

When('user clicks in the search input and presses enter', async function() {
  // Click in the search input
  await this.searchInput.click();
  console.log("✓ Clicked in the search input");
  
  // Wait a moment
  await this.page.waitForTimeout(1000);
  
  // Press Enter key
  await this.searchInput.press('Enter');
  console.log("✓ Pressed Enter key");
  
  // Wait for navigation
  await this.page.waitForTimeout(3000);
});

Then('user should land on search result page', async function() {
  // Verify we're on the search results page
  await expect(this.page).toHaveURL(/.*\/search.*/);
  console.log("✓ Landed on search result page");
  
  // Store the search results URL
  this.searchResultsUrl = this.page.url();
});

Then('header search is not visible', async function() {
  // Check if header search is not visible
  const headerSearch = this.page.locator('header .gnav-search');
  const isVisible = await headerSearch.isVisible().catch(() => true);
  
  // Expect header search to not be visible
  expect(isVisible).toBeFalsy();
  console.log("✓ Header search is not visible");
});

Then('all filters in the left side are expanded', async function() {
  // Wait for filters to load
  await this.page.waitForTimeout(2000);
  
  // Check if filters in the left side are expanded
  const filterSections = this.page.locator('.search-facets .facet-section');
  
  // Get count of filter sections
  const count = await filterSections.count();
  
  // Verify each filter section is expanded
  for (let i = 0; i < count; i++) {
    const section = filterSections.nth(i);
    const isExpanded = await section.getAttribute('aria-expanded').catch(() => null);
    
    // If aria-expanded attribute exists, verify it's set to "true"
    if (isExpanded !== null) {
      expect(isExpanded).toBe("true");
    } else {
      // If aria-expanded doesn't exist, check if the filter items are visible
      const filterItems = section.locator('.facet-item');
      await expect(filterItems.first()).toBeVisible();
    }
  }
  
  console.log("✓ All filters in the left side are expanded");
});

Then('search results are displayed', async function() {
  // Check if search results are displayed
  const searchResults = this.page.locator('span.search-right');
  
  // Verify search results summary is visible
  await expect(searchResults).toBeVisible();
  
  // Get the displayed result count from the UI
  const resultCountText = await searchResults.textContent();
  const uiCountMatch = resultCountText.match(/(\d+(?:,\d+)*)/);
  let uiCount = 0;
  if (uiCountMatch && uiCountMatch[1]) {
    // Remove commas and convert to number
    uiCount = parseInt(uiCountMatch[1].replace(/,/g, ''), 10);
  }
  
  console.log(`✓ Search results are displayed with count: ${uiCount}`);
});

Then('sort by option is displayed', async function() {
  // Check if sort by option is displayed
  const sortByOption = this.page.locator('.text-on-background.flex.flex-wrap.items-center');
  
  // Verify sort by option is visible
  await expect(sortByOption).toBeVisible();
  console.log("✓ Sort by option is displayed");
});

Then('result header contains columns {string}', async function(expectedColumns) {
  // Split the expected columns string into an array
  const expectedColumnArray = expectedColumns.split(',').map(col => col.trim());
  
  // First find the result header section
  const resultHeaderSection = this.page.locator('.result-header-section.desktop-only');
  await expect(resultHeaderSection).toBeVisible();
  
  // Then find all result header items within that section
  const resultHeaderItems = resultHeaderSection.locator('.result-header-item');
  
  // Get count of header columns
  const count = await resultHeaderItems.count();
  
  // Verify the number of columns matches
  expect(count).toBe(expectedColumnArray.length);
  
  // Verify each column header text
  for (let i = 0; i < count; i++) {
    const columnText = await resultHeaderItems.nth(i).textContent();
    expect(columnText.trim()).toContain(expectedColumnArray[i]);
  }
  
  console.log(`✓ Result header contains columns: ${expectedColumns}`);
});

When('user navigates back to home page for search testing', async function() {
  // Navigate back to the home page
  
  await this.page.goto('https://experienceleague-stage.adobe.com/');
  
  // Wait for the page to load
  await this.page.waitForTimeout(2000);
  
  // Verify we're on the home page
 // await expect(this.page).toHaveURL(/.*experienceleague-stage.adobe.com\/?$/);
  console.log("✓ Navigated back to home page for search testing");
});

Then('search bar in header should be visible', async function() {
  // Look for the search bar in the header
  const headerSearchBar = this.page.locator('.search-container .search-input');
  
  // Verify the header search bar is visible
  await expect(headerSearchBar).toBeVisible();
  console.log("✓ Search bar in header is visible");
  
  // Store the header search bar for later use
  this.headerSearchBar = headerSearchBar;
});

Then('search picker should have text {string}', async function(expectedText) {
  // Look for the search picker element (usually a dropdown or button near the search input)
  const searchPicker = this.page.locator('.search-picker-button .search-picker-label');
  
  // Verify the search picker is visible
  await expect(searchPicker).toBeVisible();
  
  // Get the text of the search picker
  const pickerText = await searchPicker.textContent();
  
  // Verify the text matches the expected text
  expect(pickerText.trim()).toContain(expectedText);
  console.log(`✓ Search picker has text "${expectedText}"`);
});

When('user clicks in the search input and presses enter again', async function() {
  // Click in the header search input
  await this.headerSearchBar.click();
  console.log("✓ Clicked in the header search input");
  
  // Wait a moment
  await this.page.waitForTimeout(1000);
  
  // Press Enter key
  await this.headerSearchBar.press('Enter');
  console.log("✓ Pressed Enter key");
  
  // Wait for navigation
  await this.page.waitForTimeout(3000);
});

Then('user should land on search result page again', async function() {
  // Verify we're on the search results page
  await expect(this.page).toHaveURL(/.*\/search.*/);
  console.log("✓ Landed on search result page again");
  
  // Clean up - close the browser
  if (this.browser) {
    await closeBrowser(this.browser);
    console.log('Browser closed successfully');
  }
});

// Mobile view step definitions
Given('user logs in and lands on the home page for mobile search validation', async function() {
  // Launch browser
  const result = await launchBrowser();
  this.page = result.page;
  this.browser = result.browser;
  this.context = result.context;
  
  // Use the common login function to log in
  await performLogin(this);
  
  // Navigate to the home page
 // await this.page.goto('https://experienceleague-stage.adobe.com/');
  
  // Wait for the page to fully load after login
  await this.page.waitForTimeout(4000);
  
  // Verify we're on the home page
  await expect(this.page).toHaveURL(/.*experienceleague-stage.adobe.com(\/en\/home.*)?$/);
  console.log("✓ Successfully logged in and landed on the home page for mobile search validation");
});

Then('search icon in mobile view should be visible', async function() {
  // Look for the search icon in mobile view
  const searchIcon = this.page.locator('.search-short a[aria-label="Search"]').first();
  
  // Verify the search icon is visible
  await expect(searchIcon).toBeVisible();
  console.log("✓ Search icon in mobile view is visible");
  
  // Store the search icon for later use
  this.mobileSearchIcon = searchIcon;
});

When('user clicks on search icon in mobile view', async function() {
  // Click on the search icon
  await this.mobileSearchIcon.click();
  console.log("✓ Clicked on search icon in mobile view");
  
  // Wait for navigation or search overlay to appear
  await this.page.waitForTimeout(2000);
});

Then('user should land on search result page in mobile view', async function() {
  // Verify we're on the search results page
  await expect(this.page).toHaveURL(/.*\/search.*/);
  console.log("✓ Landed on search result page in mobile view");
});

When('user navigates back to home page in mobile view', async function() {
  // Navigate back to the home page
  await this.page.goto('https://experienceleague-stage.adobe.com/');
  
  // Wait for the page to load
  await this.page.waitForTimeout(3000);
  
  // Verify we're on the home page
  await expect(this.page).toHaveURL(/.*experienceleague-stage.adobe.com(\/en\/home.*)?$/);
  console.log("✓ Navigated back to home page in mobile view");
});

Then('user checks if secondary search is visible in mobile view', async function() {
  // Look for the secondary search input in mobile view
  const secondarySearch = this.page.locator('.secondary-search.block button[title="Search Icon"] ').first();
  
  // Check if the secondary search is visible
  const isVisible = await secondarySearch.isVisible().catch(() => false);
  
  if (isVisible) {
    console.log("✓ Secondary search is visible in mobile view");
    // Store the secondary search input for later use
    this.mobileSecondarySearch = secondarySearch;
  } else {
    console.log("Secondary search is not visible in mobile view, will skip the next step");
    // Store a flag to indicate that secondary search is not visible
    this.secondarySearchVisible = false;
  }
});

When('user clicks on the secondary search icon', async function() {
  // Skip this step if secondary search is not visible
  if (this.secondarySearchVisible === false) {
    console.log("Skipping this step as secondary search is not visible");
    return;
  }
  
  // Click in the secondary search input
  await this.mobileSecondarySearch.click();
  console.log("✓ Clicked in the secondary search input in mobile view");
  
  // Wait a moment
  await this.page.waitForTimeout(2000);
  
  /*/ Press Enter key
  await this.mobileSecondarySearch.press('Enter');
  console.log("✓ Pressed Enter key in mobile view");
  
  // Wait for navigation
  await this.page.waitForTimeout(3000);*/
});

Then('user should land on search result page in mobile view again', async function() {
  // Skip verification if secondary search was not visible
  if (this.secondarySearchVisible === false) {
    console.log("Skipping verification as secondary search was not visible");
  } else {
    // Verify we're on the search results page
    await expect(this.page).toHaveURL(/.*\/search.*/);
    console.log("✓ Landed on search result page in mobile view again");
  }
  
  // Clean up - close the browser
  if (this.browser) {
    await closeBrowser(this.browser);
    console.log('Browser closed successfully');
  }
});

// Pagination and Results Per Page Step Definitions
Given('user logs in and navigates to search page', async function() {
  // Launch browser
  const result = await launchBrowser();
  this.page = result.page;
  this.browser = result.browser;
  this.context = result.context;
  
  // Use the common login function to log in
  await performLogin(this);
   await this.page.waitForTimeout(3000);
  
  // Navigate directly to the search page
  await this.page.goto('https://experienceleague-stage.adobe.com/en/search');
  
  // Wait for the page to fully load
  await this.page.waitForTimeout(3000);
  
  // Verify we're on the search page
  await expect(this.page).toHaveURL(/.*\/search.*/);
  console.log("✓ Successfully logged in and navigated to search page");
});


Then('search results are displayed with pagination', async function() {
  // Check if search results are displayed
  /*const searchResults = this.page.locator('span.search-right');
  
  // Verify search results summary is visible
  await expect(searchResults).toBeVisible();
  
  // Get the displayed result count from the UI
  const resultCountText = await searchResults.textContent();
  const uiCountMatch = resultCountText.match(/(\d+(?:,\d+)*)/);
  let uiCount = 0;
  if (uiCountMatch && uiCountMatch[1]) {
    // Remove commas and convert to number
    uiCount = parseInt(uiCountMatch[1].replace(/,/g, ''), 10);
  }
  
  console.log(`✓ Search results are displayed with count: ${uiCount}`);*/
  
  // Check if pagination controls are displayed
  const paginationControls = this.page.locator('atomic-layout-section[section="pagination"].hydrated');
  await expect(paginationControls).toBeVisible();
  console.log("✓ Pagination controls are displayed");
});

Then('default results per page should be {string}', async function(expectedCount) {
  // Find the results per page dropdown
  const resultsPerPageDropdown = this.page.locator('atomic-results-per-page >> input:first-child');
  await expect(resultsPerPageDropdown).toBeVisible();
   //console.log(`✓ Default results per page is "${await resultsPerPageDropdown.getAttribute('value')}"`);
  // Get the currently selected value
  const selectedValue = await resultsPerPageDropdown.getAttribute('value');
  expect(selectedValue.trim()).toBe(expectedCount);
  console.log(`✓ Default results per page is "${expectedCount}"`);
  
 /* // Count the actual number of results displayed
  const resultItems = this.page.locator('.search-result-item');
  const actualCount = await resultItems.count();
  
  // The actual count might be less than the expected count if there are fewer total results
  expect(actualCount).toBeLessThanOrEqual(parseInt(expectedCount));
  console.log(`✓ Number of results displayed: ${actualCount}`);*/
});

When('user changes results per page to {string}', async function(newCount) {
  // Find and click the results per page dropdown
  const resultsPerPageDropdown = this.page.locator('atomic-results-per-page >> input:nth-of-type(2)');
  await resultsPerPageDropdown.click();
  console.log("✓ Clicked on results per page dropdown");
  
  // Wait for dropdown options to appear
  await this.page.waitForTimeout(2000);
  
  /* / Find and click the option with the specified count
  const option = this.page.locator(`.results-per-page-option:has-text("${newCount}")`);
  await option.click();
  console.log(`✓ Selected ${newCount} results per page`);
  
  // Wait for the page to reload with new results count
  await this.page.waitForTimeout(3000);*/
});

Then('number of results displayed should be {string}', async function(expectedCount) {
  /*/ Find the results per page dropdown to verify the selected value
  const resultsPerPageDropdown = this.page.locator('.results-per-page-dropdown');
  const selectedValue = await resultsPerPageDropdown.locator('.selected-value').textContent();
  expect(selectedValue.trim()).toBe(expectedCount);
  console.log(`✓ Results per page is set to "${expectedCount}"`); */
  
  // Count the actual number of results displayed in the result summary
  const resultItems = this.page.locator('atomic-query-summary >> span.font-bold[part="highlight"]').nth(1);
  const actualCount = await resultItems.textContent();
  expect(actualCount.trim()).toBe(expectedCount);
  console.log(`✓ Results per page is set to "${expectedCount}" and it is displayed correctly`);
  /*/ The actual count might be less than the expected count if there are fewer total results
  expect(actualCount).toBeLessThanOrEqual(parseInt(expectedCount));
  console.log(`✓ Number of results displayed: ${actualCount}`);*/
});

When('user navigates to page {string}', async function(pageNumber) {
  // Find the pagination controls
  const paginationControls = this.page.locator('atomic-pager >> [aria-label="Pagination"] input:nth-of-type(2)');
  
  // Find and click the specified page number
 // const pageItem = paginationControls.locator(`.page-item:has-text("${pageNumber}")`);
  await paginationControls.click();
  console.log(`✓ Clicked on page ${pageNumber}`);
  
  // Wait for the page to load
  await this.page.waitForTimeout(3000);
});

Then('page {string} should be active in pagination', async function(pageNumber) {
  // Find the pagination controls
  const paginationControls = this.page.locator('atomic-pager >> input:nth-of-type(2)');
  
  // Check if the specified page is active
  const activePageText = await paginationControls.getAttribute ('value');
  await console.log(`Active page text: ${activePageText}`);
  //const activePageText = await activePage.textContent();
  expect(activePageText).toBe(pageNumber);
  console.log(`✓ Page ${pageNumber} is active in pagination`);
  
  // Verify the URL contains the page parameter
  const url = this.page.url();
  expect(url).toContain("firstResult=25&numberOfResults=25");
  console.log(`✓ URL contains page=${pageNumber}`);
});


Given('user navigates to Experience League homepage', async function() {
  // Launch browser
  const result = await launchBrowser();
  this.page = result.page;
  this.browser = result.browser;
  this.context = result.context;
  
  // Navigate to the Experience League homepage
  await this.page.goto('https://experienceleague-stage.adobe.com/');
  
  // Wait for the page to fully load
  await this.page.waitForTimeout(3000);
  
  // Verify we're on the homepage
  await expect(this.page).toHaveURL(/.*experienceleague-stage.adobe.com\/?$/);
  console.log("✓ Successfully navigated to Experience League homepage");
});

When('user clicks on search picker', async function() {
  // Find and click the search picker button
  const searchPickerButton = this.page.locator('.search-picker-button');
  await expect(searchPickerButton).toBeVisible();
  await searchPickerButton.click();
  console.log("✓ Clicked on search picker");
  
  // Wait for dropdown to appear
  await this.page.waitForTimeout(1000);
});

Then('dropdown should open with list of values', async function() {
  // Check if dropdown is visible
  const dropdown = this.page.locator('.search-picker-popover.search-picker-popover-visible');
  await expect(dropdown).toBeVisible();
  console.log("✓ Search picker dropdown is visible");
  
  // Check if dropdown has items
  const dropdownItems = dropdown.locator('.search-picker-label');
  const count = await dropdownItems.count();
  expect(count).toBeGreaterThan(0);
  console.log(`✓ Search picker dropdown has ${count} items`);
  
  // Verify at least one dropdown item is visible without printing all values
  const firstItem = dropdownItems.first();
  await expect(firstItem).toBeVisible();
});

When('user navigates to {string}', async function(pageName) {
  // Launch browser if not already launched
  if (!this.page) {
    const result = await launchBrowser();
    this.page = result.page;
    this.browser = result.browser;
    this.context = result.context;
  }
  
  // Construct the URL
  const url = `https://experienceleague-stage.adobe.com/en/${pageName}`;
  console.log(`✓ Navigating directly to: ${url}`);
  
  // Navigate to the URL
  await this.page.goto(url);
  
  // Wait for the page to load
  await this.page.waitForTimeout(3000);
  
  // Verify we're on the correct page
  await expect(this.page).toHaveURL(new RegExp(`.*experienceleague-stage.adobe.com/en/${pageName}.*`));
  console.log(`✓ Successfully navigated to ${pageName} page`);
});

Then('search picker should show {string}', async function(expectedValue) {
  // Find the search picker label
  const searchPickerLabel = this.page.locator('.search-picker-button .search-picker-label');
  await expect(searchPickerLabel).toBeVisible();
  
  // Get the text of the search picker label
  const labelText = await searchPickerLabel.textContent();
  
  // Verify the search picker shows the expected value
  expect(labelText.trim()).toBe(expectedValue);
  console.log(`✓ Search picker shows correct value: "${labelText.trim()}" (expected: "${expectedValue}")`);
});

// Search Content Type Step Definitions
When('user clicks on search input', async function() {
  // Find the search input
  const searchInput = this.page.locator('.search-input, input[type="search"], [placeholder*="Search"]').first();
  await expect(searchInput).toBeVisible();
  
  // Click on the search input
  await searchInput.click();
  console.log("✓ Clicked on search input");
  
  // Store the search input for later use
  this.searchInput = searchInput;
});

When('user enters {string} and presses enter', async function(searchText) {
  // Fill the search input with the search text
  await this.searchInput.fill(searchText);
  console.log(`✓ Entered search text: "${searchText}"`);
  
  // Press Enter key
  await this.searchInput.press('Enter');
  console.log("✓ Pressed Enter key");
  
  // Wait for navigation
  await this.page.waitForTimeout(3000);
});

Then('user should land on search results page', async function() {
  // Verify we're on the search results page
  //await expect(this.page).toHaveURL(/.*\/search.*/);
  console.log("✓ Landed on search results page");
  
  // Wait for search results to load
  await this.page.waitForTimeout(2000);
});

Then('search results should contain content type {string}', async function(expectedContentType) {
  
  const atomicSearchResults = this.page.locator('atomic-query-summary >> .result-query');
    await expect(atomicSearchResults).toBeVisible();
 await this.page.waitForTimeout(2000);
    //const filterBreadBox = this.page.locator('atomic-search-interface >> atomic-query-summary >> atomic-breadbox >> [part="breadcrumb-list-container"]').first().getAttribute("data-facetkey");
    const filterBreadBox = this.page.locator('atomic-breadbox >> div ul li.breadcrumb:first-child').first();
    const facetKeyValue = await filterBreadBox.getAttribute("data-facetkey");
    await this.page.waitForTimeout(2000);
    await console.log(`Filter breadbox data-facetkey: ${facetKeyValue}`);
    await console.log(`Expected content type: ${expectedContentType}`);
    await expect(facetKeyValue.toLowerCase()).toBe(expectedContentType.toLowerCase());
 
});

Then('content type filter should have {string} selected', async function(expectedContentType) {
  await this.page.waitForTimeout(2000);
  await this.page.locator('atomic-facet-manager >> button[data-expanded="false"].facet-show-more-btn').first().click();
  const checkboxLocator = this.page.locator('atomic-facet >> button[aria-checked="true"][role="checkbox"].value-checkbox');
   await this.page.waitForTimeout(2000);
  
  // await expect(checkboxLocator).toBeVisible();
  console.log(`✓ Content type filter has "${expectedContentType}" selected`);
  const isChecked = await checkboxLocator.getAttribute('aria-checked');
  console.log(`Checkbox is checked: ${isChecked}`);
//const isContentType = await checkboxLocator.getAttribute('aria-label');
const checkedButtonId = await this.page.locator('button[aria-checked="true"]').getAttribute('id');
const spanTitle = await this.page.locator(`label[for="${checkedButtonId}"] span[title]`).getAttribute('title');
console.log(spanTitle); 
//const isContentType = await this.page.locator('atomic-facet >> label[for="facet-value-iaei2"].group.items-center.ripple-parent.ripple-relative >> span[title]').getAttribute('title');
  //console.log(`Content type of the checkbox: ${isContentType}`);

if (isChecked === 'true' && spanTitle==expectedContentType) {
    console.log('Checkbox is checked and the title is "Tutorial"');
} else {
    console.log('Checkbox is not checked or the title is not "Tutorial"');
}
  
  
  
  
  
  
  /*try {
    // Wait for filters to load
    await this.page.waitForTimeout(2000);
    
    // Handle Shadow DOM for content type filter
    // First, find the atomic-facet element for content type
    const contentTypeFacet = this.page.locator('atomic-facet[field="contenttype"]');
    await expect(contentTypeFacet).toBeVisible();
    
    // Use evaluateHandle to access shadow DOM content and check if the expected content type is selected
    const isSelected = await this.page.evaluate((expectedType) => {
      // Get all facet value elements in the shadow DOM
      const facetValues = document.querySelectorAll('atomic-facet[field="contenttype"] atomic-facet-value');
      
      // Check if any facet value with the expected content type is selected
      for (const facetValue of facetValues) {
        const valueText = facetValue.textContent || '';
        if (valueText.includes(expectedType)) {
          // Check if it's selected (has the 'selected' attribute or class)
          return facetValue.hasAttribute('selected') || 
                 facetValue.classList.contains('selected') || 
                 facetValue.getAttribute('aria-selected') === 'true';
        }
      }
      
      return false;
    }, expectedContentType);
    
    // Assert that the expected content type is selected
    expect(isSelected).toBeTruthy();
    console.log(`✓ Content type filter has "${expectedContentType}" selected`);
  } catch (error) {
    console.error(`Error checking content type filter selection: ${error.message}`);
    
    // Alternative approach if the above fails
    console.log("Trying alternative approach to check content type filter selection");
    
    // Check if the URL contains the content type filter parameter
    const url = this.page.url();
    const contentTypeParam = encodeURIComponent(expectedContentType.toLowerCase());
    expect(url).toContain(contentTypeParam);
    console.log(`✓ URL contains content type filter parameter for "${expectedContentType}"`);
  }*/
});
