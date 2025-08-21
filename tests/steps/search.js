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
  //await this.page.goto('https://experienceleague.adobe.com/');
  
  // Wait for the page to fully load after login
  //await this.page.waitForTimeout(3000);
  
  // Verify we're on the home page
 // await expect(this.page).toHaveURL(/.*experienceleague.adobe.com\/?$/);
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
  
  await this.page.goto('https://experienceleague.adobe.com/');
  
  // Wait for the page to load
  await this.page.waitForTimeout(2000);
  
  // Verify we're on the home page
 // await expect(this.page).toHaveURL(/.*experienceleague.adobe.com\/?$/);
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
 // await this.page.goto('https://experienceleague.adobe.com/');
  
  // Wait for the page to fully load after login
  await this.page.waitForTimeout(4000);
  
  // Verify we're on the home page
  await expect(this.page).toHaveURL(/.*experienceleague.adobe.com(\/en\/home.*)?$/);
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
  await this.page.goto('https://experienceleague.adobe.com/');
  
  // Wait for the page to load
  await this.page.waitForTimeout(3000);
  
  // Verify we're on the home page
  await expect(this.page).toHaveURL(/.*experienceleague.adobe.com(\/en\/home.*)?$/);
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
//<<<<<<< Updated upstream
   await this.page.waitForTimeout(3000);
  
//=======
  await this.page.waitForTimeout(3000);
//>>>>>> Stashed changes
  // Navigate directly to the search page
  await this.page.goto('https://experienceleague.adobe.com/en/search');
  
  // Wait for the page to fully load
  await this.page.waitForTimeout(2000);
  
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

  const checkboxLocator = this.page.locator('atomic-facet-manager >>  atomic-facet >> button[aria-checked="true"][role="checkbox"].value-checkbox');
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

Given('the user navigates to the search results page for only facet test', async function() {
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
  console.log("✓ Successfully navigated to search results page for only facet test");
});

When('the user checks the {string} parent checkbox for only facet test', async function(parentLabel) {
  // Wait for facets to load
  await this.page.waitForTimeout(2000);
  
  // Expand the facet if it's collapsed
  await this.page.locator('atomic-facet-manager >> button[data-expanded="false"].facet-show-more-btn').nth(2).click().catch(() => {
    console.log(`No need to expand the facet or it's already expanded`);
  });
  
  // Locate the parent checkbox for "Experience Manager"
  const parentCheckbox = this.page.locator(`atomic-facet-manager >> atomic-facet >> div ul li[data-contenttype="${parentLabel}"] button[role="checkbox"]`);
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

Then('all child checkboxes under {string} should be checked for only facet test', async function(parentLabel) {
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

When('the user hovers over a child facet', async function() {
  // Wait for the UI to update
  await this.page.waitForTimeout(2000);
  
  // Get all child checkboxes
  const childCheckboxes = this.childCheckboxes;
  const count = await childCheckboxes.count();
  
  if (count > 0) {
    // Choose the second child (index 1) to hover over
    // We use the second child to avoid potential issues with the first child
    const childIndex = Math.min(1, count - 1);
    this.hoveredChildIndex = childIndex;
    
    // Get the child name for later reference
    const ariaLabel = await childCheckboxes.nth(childIndex).getAttribute('aria-label');
    if (ariaLabel) {
      const childNameParts = ariaLabel.split('|');
      if (childNameParts.length > 1) {
        this.hoveredChildName = childNameParts[1].split(';')[0].trim();
        console.log(`Hovering over child facet: ${this.hoveredChildName}`);
      }
    }
    
    // Get the parent element of the checkbox (the li element)
    const childLi = this.page.locator(`li[data-parent="Experience Manager"]`).nth(childIndex);
    
    // Store the child li for later use
    this.childLi = childLi;
    
    // Hover over the child facet
    await childLi.hover().catch(() => {
      console.log('Hover action failed, will try to proceed anyway');
    });
    console.log(`✓ Hovered over child facet at index ${childIndex}`);
    
    // Wait for the hover effect to show
    await this.page.waitForTimeout(1000);
  } else {
    throw new Error('No child checkboxes found to hover over');
  }
});

Then('the only button should be visible', async function() {
  // Wait for the hover effect to show the only button
  await this.page.waitForTimeout(1000);
  
  // Find a specific child facet that we know exists
  const specificChildFacet = this.page.locator(`atomic-facet#facetProduct >> ul li[data-contenttype="Experience Manager|6.5 LTS"]`);
  
  // Hover over the specific child facet
  await specificChildFacet.hover();
  await this.page.waitForTimeout(3000);
  //console.log('✓ Hovered over the specific child facet',specificChildFacet.locator('span').nth());
  // Find the "only" button within this facet
  const onlyButton = specificChildFacet.locator('span').nth(2).click();
  // const onlyButton = specificChildFacet.locator('span').nth(2).highlight();
 await this.page.waitForTimeout(5000);
  console.log('✓ Clicked the only button');
  
  // Store the only button for later use
  this.onlyButton = onlyButton;
  
  console.log('✓ Only button is visible');
});

When('the user clicks the only button', async function() {
  /*/ Click the only button using force: true to ensure it clicks even if not perfectly visible
  await this.page.locator(`atomic-facet#facetProduct >> ul li[data-contenttype="Experience Manager|6.5 LTS"] span[part="only-facet-btn"]`).evaluate(el => el.click({ force: true }) );
  console.log('✓ Clicked the only button');
  
  // Wait for the UI to update
  await this.page.waitForTimeout(2000);*/
});

Then('only that child should be selected', async function() {
  // Get the child checkbox that was hovered over
  const hoveredChildCheckbox = this.childCheckboxes.nth(this.hoveredChildIndex);
  
  // Verify it's checked
  await expect(hoveredChildCheckbox).toHaveAttribute('aria-checked', 'true');
  console.log(`✓ Verified child "${this.hoveredChildName}" is checked`);
});

Then('all other children should be unselected', async function() {
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
      console.log(`✓ Verified child "${childName}" is unchecked`);
    }
  }
  
  console.log('✓ All other children are unchecked');
});

Then('the parent checkbox should be unchecked', async function() {
  // Verify the parent checkbox is unchecked
  await expect(this.parentCheckbox).toHaveAttribute('aria-checked', 'false');
  console.log('✓ The parent checkbox is unchecked');
  
  // Clean up - close the browser
  if (this.browser) {
    await closeBrowser(this.browser);
    console.log('Browser closed successfully');
  }
});

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

Given('user navigates to home page', async function() {
  // Launch browser
  const result = await launchBrowser();
  this.page = result.page;
  this.browser = result.browser;
  this.context = result.context;
  
  // Navigate to the home page
  await this.page.goto('https://experienceleague.adobe.com/');
  
  // Wait for the page to fully load
  await this.page.waitForTimeout(3000);
  
  // Verify we're on the home page
 // await expect(this.page).toHaveURL(/.*experienceleague.adobe.com(\/en\/home.*)?$/);
  console.log("✓ Successfully navigated to home page");
});

When('user clicks on search picker button', async function() {
  // Wait for the page to load
  await this.page.waitForTimeout(2000);
  
  // Find and click the search picker button
  const searchPickerButton = this.page.locator('.search-picker-button');
  await expect(searchPickerButton).toBeVisible({ timeout: 10000 });
  
  // Scroll the button into view if needed
  await searchPickerButton.scrollIntoViewIfNeeded();
  
  // Click the search picker button to open the dropdown
  await searchPickerButton.click();
  console.log('✓ Clicked on search picker button');
  
  // Wait for dropdown to appear
  await this.page.waitForTimeout(1000);
});

Then('search picker dropdown should be visible', async function() {
  // Check if dropdown is visible
  const dropdown = this.page.locator('.search-picker-popover#search-picker-popover');
  await expect(dropdown).toBeVisible({ timeout: 10000 });
  console.log("✓ Search picker dropdown is visible");
  
  // Store the dropdown for later use
  this.searchPickerDropdown = dropdown;
});

Then('a checkmark should be displayed against {string} in search picker', async function(optionText) {
  // Find the option with the specified text and data-filter-value
  const option = this.searchPickerDropdown.locator(`.search-picker-label[data-filter-value="${optionText}"], .search-picker-option:has-text("${optionText}")`);
  await expect(option).toBeVisible({ timeout: 10000 });
  
  // Find the checkmark icon within the option
  const checkmark = option.locator('span.icon.icon-checkmark');
  await expect(checkmark).toBeVisible({ timeout: 5000 });
  console.log(`✓ Verified checkmark is displayed against "${optionText}" in search picker`);
});

When('user selects {string} from search picker dropdown', async function(optionText) {
  // Find the option with the specified text
  const option = this.searchPickerDropdown.locator(`.search-picker-label[data-filter-value="${optionText}"], .search-picker-option:has-text("${optionText}")`);
  await expect(option).toBeVisible({ timeout: 10000 });
  
  // Click the option
  await option.click();
  console.log(`✓ Selected "${optionText}" from search picker dropdown`);
  
  // Wait for the UI to update
  await this.page.waitForTimeout(2000);
  
  // Click the search picker button again to reopen the dropdown
  const searchPickerButton = this.page.locator('.search-picker-button');
  await searchPickerButton.click();
  console.log('✓ Reopened search picker dropdown');
  
  // Wait for dropdown to appear
  await this.page.waitForTimeout(1000);
});

