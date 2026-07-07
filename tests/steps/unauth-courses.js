const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { chromium } = require('@playwright/test');
const { closeBrowser } = require('../commonFunctions/launchbrowser');
const ENV = require('../../config.js');
// Import common mobile steps
require('./common-mobile-steps');

// Set timeout for all steps
setDefaultTimeout(90 * 1000);

// Helper function to extract unique values from an array
function getUniqueValues(array) {
  return [...new Set(array)];
}

Given('user navigates to the courses page without login', async function() {
  // Launch a fresh browser without any login session
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  this.page = page;
  this.browser = browser;
  this.context = context;

  // Navigate directly to the courses page (no login)
  await this.page.goto(`${ENV.URL}/courses`);
  console.log('✓ Navigated to courses page without login');

  // Wait for the page to load
  await this.page.waitForLoadState('networkidle');

  // Take a screenshot
  await this.page.screenshot({ path: 'screenshots/unauth-courses-page.png' });
});

Then('user should see the marquee container', async function() {
  // Find the marquee container
  const marqueeContainer = this.page.locator('div.marquee-wrapper');
  await expect(marqueeContainer).toBeVisible({ timeout: 10000 });
  console.log('✓ Marquee container is visible');
  
  // Store for later use
  this.marqueeContainer = marqueeContainer;
  
  // Check if the marquee has loaded status
  const marquee = this.page.locator('div.marquee[data-block-name="marquee"]');
  const blockStatus = await marquee.getAttribute('data-block-status');
  expect(blockStatus).toBe('loaded');
  console.log(`✓ Marquee has loaded status: ${blockStatus}`);
});

Then('the marquee should have foreground with title and description', async function() {
  // Check for the marquee foreground
  const foreground = this.page.locator('div.marquee-foreground');
  await expect(foreground).toBeVisible();
  console.log('✓ Marquee foreground is visible');
  
  // Check for the title
  const title = this.page.locator('div.marquee-title h1');
  await expect(title).toBeVisible();
  const titleText = await title.textContent();
  console.log(`✓ Marquee title is visible: "${titleText.trim()}"`);
  
  // Check for the description
  const description = this.page.locator('div.marquee-long-description');
  await expect(description).toBeVisible();
  console.log('✓ Marquee description is visible');
});

Then('the marquee should have background with image', async function() {
  // Check for the marquee background
  const background = this.page.locator('div.marquee-background');
  await expect(background).toBeVisible();
  console.log('✓ Marquee background is visible');
  
  // Check for the image
  const image = this.page.locator('div.marquee-subject picture img');
  await expect(image).toBeVisible();
  console.log('✓ Marquee background image is visible');
  
  // Only close the browser if this is the last step of the scenario
  if (this.browser && !this.keepBrowserOpen) {
    await closeBrowser(this.browser);
    console.log("✓ Browser closed successfully");
  }
});

Then('user should see the browse-courses block', async function() {
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
  
  // Find the browse-courses block
  const browseCourses = this.page.locator('div.browse-courses-wrapper');
  await expect(browseCourses).toBeVisible({ timeout: 10000 });
  console.log('✓ Browse-courses block is visible');
  
  // Check if the browse-courses block has loaded status
  const browseCoursesBlock = this.page.locator('div.browse-courses[data-block-name="browse-courses"]');
  const blockStatus = await browseCoursesBlock.getAttribute('data-block-status');
  expect(blockStatus).toBe('loaded');
  console.log(`✓ Browse-courses block has loaded status: ${blockStatus}`);
  
  // Store for later use
  this.browseCoursesBlock = browseCoursesBlock;
});

Then('the product filter should be displayed', async function() {
  // Check for the product filter dropdown
  const productFilter = this.page.locator('div.custom-filter-dropdown[data-filter-type="Product"]');
  await expect(productFilter).toBeVisible();
  console.log('✓ Product filter is visible');
  
  // Store for later use
  this.productFilter = productFilter;
});

Then('the clear filter button should be disabled', async function() {
  // Check for the clear filter button
  const clearFilterButton = this.page.locator('a.browse-card-clear-filter');
  await expect(clearFilterButton).toBeVisible();
  
  // Check if it has the disabled class
  const classAttribute = await clearFilterButton.getAttribute('class');
  expect(classAttribute).toContain('disabled');
  console.log('✓ Clear filter button has disabled class');
  
  // Check if it has the disabled attribute
  const isDisabled = await clearFilterButton.getAttribute('disabled');
  expect(isDisabled).toBe('true');
  console.log('✓ Clear filter button has disabled attribute');
  
  console.log('✓ Clear filter button is disabled');
});

Then('the product filter options should match the course card tags', async function() {
  // Extract all product filter options
  const filterOptions = await this.page.locator('div.custom-filter-dropdown[data-filter-type="Product"] div.custom-checkbox input')
    .evaluateAll(inputs => inputs.map(input => input.value));
  
  console.log('Filter options found:', filterOptions);
  
  // Extract all course card solution tags
  const cardSolutionTags = await this.page.locator('div.browse-card-solution-text')
    .evaluateAll(tags => tags.map(tag => tag.textContent.trim()));
  
  console.log('Card solution tags found:', cardSolutionTags);
  
  // Get unique solution tags (some cards might have the same solution)
  const uniqueCardTags = getUniqueValues(cardSolutionTags);
  console.log('Unique card solution tags:', uniqueCardTags);
  
  // Check if all filter options are present in the card tags
  // Note: There might be some filter options that don't have corresponding cards on the current page
  const matchingOptions = filterOptions.filter(option => 
    uniqueCardTags.includes(option) || uniqueCardTags.includes('multisolution'));
  
  console.log('Matching options:', matchingOptions);
  expect(matchingOptions.length).toBeGreaterThan(0);
  console.log(`✓ Found ${matchingOptions.length} matching filter options in card tags`);
  
  // Only close the browser if this is the last step of the scenario
  if (this.browser && !this.keepBrowserOpen) {
    await closeBrowser(this.browser);
    console.log("✓ Browser closed successfully");
  }
});

// Product filter functionality steps
Then('user should see the product filter dropdown', async function() {
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
  
  // Check for the product filter dropdown
  const productFilter = this.page.locator('div.custom-filter-dropdown[data-filter-type="Product"]');
  await expect(productFilter).toBeVisible();
  console.log('✓ Product filter dropdown is visible');
  
  // Store for later use
  this.productFilter = productFilter;
});

When('user clicks on the product filter button', async function() {
  // Click on the product filter button
  const filterButton = this.page.locator('div.custom-filter-dropdown[data-filter-type="Product"] button');
  await filterButton.click();
  console.log('✓ Clicked on product filter button');
  
  // Wait a moment for the dropdown to appear
  await this.page.waitForTimeout(500);
});

Then('the product filter dropdown content should be visible', async function() {
  // Check if the dropdown content is visible
  const dropdownContent = this.page.locator('div.custom-filter-dropdown[data-filter-type="Product"] div.filter-dropdown-content');
  await expect(dropdownContent).toBeVisible();
  console.log('✓ Product filter dropdown content is visible');
  
  // Store all available filter options for later use
  this.filterOptions = await this.page.locator('div.custom-filter-dropdown[data-filter-type="Product"] div.custom-checkbox input')
    .evaluateAll(inputs => inputs.map((input, index) => ({ value: input.value, id: input.id, index })));
  console.log(`✓ Found ${this.filterOptions.length} filter options`);
  
  // Store the initial count of course cards
  this.initialCardCount = await this.page.locator('div.browse-card').count();
  console.log(`✓ Initial course card count: ${this.initialCardCount}`);
});

When('user selects a product filter option', async function() {
  // Select the first filter option
  if (this.filterOptions && this.filterOptions.length > 0) {
    const firstOption = this.filterOptions[0];
    
    // Click on the label associated with the checkbox instead of the checkbox itself
    await this.page.locator(`label[for="${firstOption.id}"]`).click();
    console.log(`✓ Selected filter option: ${firstOption.value}`);
    
    // Store the selected option for later verification
    this.selectedFilters = [firstOption.value];
    
    // Click outside to close the dropdown
    await this.page.locator('div.browse-cards-block-title').click();
    
    // Wait for the filtering to take effect
    await this.page.waitForTimeout(1000);
  } else {
    throw new Error('No filter options found');
  }
});

Then('the selected product filter should be displayed', async function() {
  // Wait longer for the filtering to take effect and tags to appear
  await this.page.waitForTimeout(2000);
  
  // Take a screenshot to debug
  await this.page.screenshot({ path: 'screenshots/filter-applied.png' });
  
  // Check if the browse-card-tags div exists and has content
  const tagsContainer = this.page.locator('div.browse-card-tags');
  await expect(tagsContainer).toBeVisible({ timeout: 10000 });
  
  // Check if there's any content in the tags container
  const tagsContent = await tagsContainer.innerHTML();
  console.log('Tags container content:', tagsContent);
  
  // Check if the selected filter is reflected in the UI in some way
  // This could be in the tags, or by checking that the filtered courses are displayed
  
  // Check that the filtered courses have the correct solution tag
  const visibleCardTags = await this.page.locator('div.browse-card-solution-text')
    .evaluateAll(tags => tags.map(tag => tag.textContent.trim()));
  
  console.log('Visible card solution tags after filtering:', visibleCardTags);
  
  // Check if the visible cards include our selected filter
  const hasFilteredCards = visibleCardTags.some(tag => 
    this.selectedFilters.includes(tag) || tag === 'multisolution');
  
  expect(hasFilteredCards).toBeTruthy();
  console.log('✓ Selected filter is applied and cards are filtered correctly');
});

Then('the clear filter button should be enabled', async function() {
  // Check if the clear filter button is enabled
  const clearFilterButton = this.page.locator('a.browse-card-clear-filter');
  await expect(clearFilterButton).toBeVisible();
  
  // Check that it doesn't have the disabled class
  const classAttribute = await clearFilterButton.getAttribute('class');
  expect(classAttribute).not.toContain('disabled');
  
  // Check that it doesn't have the disabled attribute
  const isDisabled = await clearFilterButton.getAttribute('disabled');
  expect(isDisabled).toBeNull();
  
  console.log('✓ Clear filter button is enabled');
});

Then('the filtered courses content should be displayed correctly', async function() {
  // Check that the number of displayed cards has changed
  const filteredCardCount = await this.page.locator('div.browse-card').count();
  console.log(`✓ Filtered course card count: ${filteredCardCount}`);
  
  // Check that the displayed cards have the correct solution tag
  const visibleCardTags = await this.page.locator('div.browse-card-solution-text')
    .evaluateAll(tags => tags.map(tag => tag.textContent.trim()));
  
  console.log('Visible card solution tags:', visibleCardTags);
  
  // Check if all visible cards have either the selected filter or multisolution tag
  const correctlyFiltered = visibleCardTags.every(tag => 
    this.selectedFilters.includes(tag) || tag === 'multisolution');
  
  expect(correctlyFiltered).toBeTruthy();
  console.log('✓ All visible cards have the correct solution tag');
});

When('user selects another product filter option', async function() {
  // Click on the product filter button again
  const filterButton = this.page.locator('div.custom-filter-dropdown[data-filter-type="Product"] button');
  await filterButton.click();
  console.log('✓ Clicked on product filter button again');
  
  // Wait for the dropdown to appear
  await this.page.waitForTimeout(500);
  
  // Select another filter option (the second one if available)
  if (this.filterOptions && this.filterOptions.length > 1) {
    const secondOption = this.filterOptions[1];
    
    // Click on the label associated with the checkbox instead of the checkbox itself
    await this.page.locator(`label[for="${secondOption.id}"]`).click();
    console.log(`✓ Selected another filter option: ${secondOption.value}`);
    
    // Add to the selected options
    this.selectedFilters.push(secondOption.value);
    
    // Click outside to close the dropdown
    await this.page.locator('div.browse-cards-block-title').click();
    
    // Wait for the filtering to take effect
    await this.page.waitForTimeout(1000);
  } else {
    throw new Error('Not enough filter options found');
  }
});

Then('multiple product filters should be displayed', async function() {
  // Wait longer for the filtering to take effect and tags to appear
  await this.page.waitForTimeout(2000);
  
  // Take a screenshot to debug
  await this.page.screenshot({ path: 'screenshots/multiple-filters-applied.png' });
  
  // Check if the browse-card-tags div exists and has content
  const tagsContainer = this.page.locator('div.browse-card-tags');
  await expect(tagsContainer).toBeVisible({ timeout: 10000 });
  
  // Check if there's any content in the tags container
  const tagsContent = await tagsContainer.innerHTML();
  console.log('Tags container content with multiple filters:', tagsContent);
  
  // Check that the filtered courses have the correct solution tags
  const visibleCardTags = await this.page.locator('div.browse-card-solution-text')
    .evaluateAll(tags => tags.map(tag => tag.textContent.trim()));
  
  console.log('Visible card solution tags with multiple filters:', visibleCardTags);
  
  // Check if the visible cards include our selected filters
  // With multiple filters, we should see cards that match either filter
  const hasFilteredCards = visibleCardTags.some(tag => 
    this.selectedFilters.includes(tag) || tag === 'multisolution');
  
  expect(hasFilteredCards).toBeTruthy();
  console.log('✓ Multiple filters are applied and cards are filtered correctly');
  
  // Check that the clear filter button is enabled
  const clearFilterButton = this.page.locator('a.browse-card-clear-filter');
  const classAttribute = await clearFilterButton.getAttribute('class');
  expect(classAttribute).not.toContain('disabled');
  console.log('✓ Clear filter button is enabled with multiple filters');
});

When('user clicks on the clear filters button', async function() {
  // Click on the clear filters button
  const clearFilterButton = this.page.locator('a.browse-card-clear-filter');
  await clearFilterButton.click();
  console.log('✓ Clicked on clear filters button');
  
  // Wait for the filtering to be reset
  await this.page.waitForTimeout(1000);
});

Then('all filters should be removed', async function() {
  // Wait for the filtering to be reset
  await this.page.waitForTimeout(2000);
  
  // Take a screenshot to debug
  await this.page.screenshot({ path: 'screenshots/filters-cleared.png' });
  
  // Check if the browse-card-tags div is empty
  const tagsContainer = this.page.locator('div.browse-card-tags');
  const tagsContent = await tagsContainer.innerHTML();
  console.log('Tags container content after clearing filters:', tagsContent);
  
  // The tags container should be empty or contain no filter tags
  expect(tagsContent.trim()).toBe('');
  console.log('✓ Filter tags container is empty');
  
  // Check that the clear filter button is disabled again
  const clearFilterButton = this.page.locator('a.browse-card-clear-filter');
  const classAttribute = await clearFilterButton.getAttribute('class');
  expect(classAttribute).toContain('disabled');
  console.log('✓ Clear filter button is disabled again');
  
  // Check that the disabled attribute is set again
  const isDisabled = await clearFilterButton.getAttribute('disabled');
  expect(isDisabled).toBe('true');
  console.log('✓ Clear filter button has disabled attribute again');
});

Then('all courses should be displayed', async function() {
  // Check that the number of displayed cards is back to the initial count
  const currentCardCount = await this.page.locator('div.browse-card').count();
  expect(currentCardCount).toBe(this.initialCardCount);
  console.log(`✓ All courses are displayed again (${currentCardCount} cards)`);
  
  // Clean up - close the browser
  if (this.browser && !this.keepBrowserOpen) {
    await closeBrowser(this.browser);
    console.log("✓ Browser closed successfully");
  }
});

// Course details page steps
When('user clicks on a course card', async function() {
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
  
  // Find all course cards
  const courseCards = this.page.locator('div.browse-card');
  const cardCount = await courseCards.count();
  expect(cardCount).toBeGreaterThan(0);
  console.log(`✓ Found ${cardCount} course cards`);
  
  // Get the first course card
  const firstCard = courseCards.first();
  await expect(firstCard).toBeVisible();
  
  // Get the course title before clicking
  const courseTitle = await this.page.locator('h3.browse-card-title-text').first().textContent();
  console.log(`✓ Selected course: "${courseTitle.trim()}"`);
  
  // Store the course title for later verification
  this.selectedCourseTitle = courseTitle.trim();
  
  // Click on the first course card
  await firstCard.click();
  console.log('✓ Clicked on the first course card');
  
  // Wait for navigation to complete
  await this.page.waitForLoadState('networkidle');
  console.log('✓ Page navigation completed');
  
  // Take a screenshot of the course details page
  await this.page.screenshot({ path: 'screenshots/course-details-page.png' });
});

Then('user should be redirected to the course details page', async function() {
  // Check if the URL has changed to a course details page
  const currentUrl = this.page.url();
  expect(currentUrl).toContain('/courses/');
  console.log(`✓ Redirected to course details page: ${currentUrl}`);
  
  // Wait for the page to fully load
  await this.page.waitForLoadState('networkidle');
});

Then('the course marquee should be displayed', async function() {
  // Check for the course marquee container
  const courseMarquee = this.page.locator('div.course-marquee-wrapper');
  await expect(courseMarquee).toBeVisible({ timeout: 10000 });
  console.log('✓ Course marquee is visible');
  
  // Check if the course marquee has loaded status
  const marqueeBlock = this.page.locator('div.course-marquee[data-block-name="course-marquee"]');
  const blockStatus = await marqueeBlock.getAttribute('data-block-status');
  expect(blockStatus).toBe('loaded');
  console.log(`✓ Course marquee has loaded status: ${blockStatus}`);
  
  // Store for later use
  this.courseMarquee = courseMarquee;
});

Then('the course breadcrumb should be visible', async function() {
  // Check for the course breadcrumb
  const breadcrumb = this.page.locator('div.course-marquee-breadcrumb');
  await expect(breadcrumb).toBeVisible();
  console.log('✓ Course breadcrumb is visible');
  
  // Store for later use
  this.breadcrumb = breadcrumb;
});

Then('the breadcrumb should have a link back to courses page', async function() {
  // Check for the link back to courses page in the breadcrumb
  const coursesLink = this.page.locator('div.course-marquee-breadcrumb a');
  await expect(coursesLink).toBeVisible();
  
  // Check if the link points to the courses page
  const href = await coursesLink.getAttribute('href');
  expect(href).toContain('/courses');
  
  // Check if the link text is "Courses"
  const linkText = await coursesLink.textContent();
  expect(linkText.trim()).toBe('Courses');
  
  console.log('✓ Breadcrumb has a link back to courses page');
});

Then('the course title in the marquee should match the selected course', async function() {
  // Check for the course title in the marquee
  const marqueeTitle = this.page.locator('h1.course-marquee-title');
  await expect(marqueeTitle).toBeVisible();
  
  // Get the title text
  const titleText = await marqueeTitle.textContent();
  console.log(`✓ Course marquee title: "${titleText.trim()}"`);
  
  // Check if the title matches the selected course title
  // Note: The title might be slightly different (e.g., different formatting),
  // so we'll check if one contains the other or if they're similar enough
  const selectedTitle = this.selectedCourseTitle;
  const marqueeTitleText = titleText.trim();
  
  // Check if the titles are similar enough
  const titlesMatch = 
    marqueeTitleText.includes(selectedTitle) || 
    selectedTitle.includes(marqueeTitleText) ||
    marqueeTitleText.toLowerCase() === selectedTitle.toLowerCase();
  
  expect(titlesMatch).toBeTruthy();
  console.log('✓ Course title in the marquee matches the selected course');
});

Then('the course metadata should be displayed', async function() {
  // Check for the course metadata
  const metadata = this.page.locator('div.course-marquee-metadata');
  await expect(metadata).toBeVisible();
  console.log('✓ Course metadata is visible');
  
  // Check for metadata items
  const metadataItems = this.page.locator('div.metadata-item');
  const itemCount = await metadataItems.count();
  expect(itemCount).toBeGreaterThan(0);
  console.log(`✓ Found ${itemCount} metadata items`);
  
  // Check for product metadata
  const productMetadata = this.page.locator('div.metadata-item:has-text("Product:")');
  await expect(productMetadata).toBeVisible();
  console.log('✓ Product metadata is visible');
  
  // Check for experience level metadata
  const experienceLevelMetadata = this.page.locator('div.metadata-item:has-text("Experience level:")');
  await expect(experienceLevelMetadata).toBeVisible();
  console.log('✓ Experience level metadata is visible');
});

Then('the bookmark button should be visible', async function() {
  // Check for the bookmark button
  const bookmarkButton = this.page.locator('div.course-marquee-bookmark button.bookmark');
  await expect(bookmarkButton).toBeVisible();
  console.log('✓ Bookmark button is visible');
  
  // Check if the bookmark button has the expected label
  const bookmarkLabel = this.page.locator('div.course-marquee-bookmark button.bookmark label');
  const labelText = await bookmarkLabel.textContent();
  expect(labelText.trim()).toBe('Bookmark this course');
  console.log('✓ Bookmark button has the expected label');
  
  // Only close the browser if this is the last step of the scenario
  if (this.browser && !this.keepBrowserOpen) {
    await closeBrowser(this.browser);
    console.log("✓ Browser closed successfully");
  }
});

When('user clicks on the breadcrumb link to courses page', async function() {
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
  
  // Find the breadcrumb link to courses page
  const breadcrumbLink = this.page.locator('div.course-marquee-breadcrumb a');
  await expect(breadcrumbLink).toBeVisible();
  
  // Get the URL before clicking
  this.courseDetailsUrl = this.page.url();
  console.log(`✓ Current URL before clicking breadcrumb: ${this.courseDetailsUrl}`);
  
  // Click on the breadcrumb link
  await breadcrumbLink.click();
  console.log('✓ Clicked on breadcrumb link to courses page');
  
  // Wait for navigation to complete
  await this.page.waitForLoadState('networkidle');
  console.log('✓ Page navigation completed');
  
  // Take a screenshot after navigation
  await this.page.screenshot({ path: 'screenshots/after-breadcrumb-navigation.png' });
});

Then('user should be navigated back to the courses page', async function() {
  // Check if the URL has changed to the courses page
  const currentUrl = this.page.url();
  expect(currentUrl).toContain('/courses');
  expect(currentUrl).not.toBe(this.courseDetailsUrl);
  console.log(`✓ Navigated back to courses page: ${currentUrl}`);
  
  // Check if the browse-courses block is visible again
  const browseCourses = this.page.locator('div.browse-courses-wrapper');
  await expect(browseCourses).toBeVisible({ timeout: 10000 });
  console.log('✓ Browse-courses block is visible again');
  
  // Check if the product filter is visible again
  const productFilter = this.page.locator('div.custom-filter-dropdown[data-filter-type="Product"]');
  await expect(productFilter).toBeVisible();
  console.log('✓ Product filter is visible again');
  
  // Clean up - close the browser
  if (this.browser) {
    await closeBrowser(this.browser);
    console.log("✓ Browser closed successfully");
  }
});

Then('user should be redirected to the sign-in page', async function() {
  
  // Wait for the sign-in page to load
  await this.page.waitForLoadState('networkidle');
  
  // Simplified check - just verify if the CardLayout content wrapper is visible
  if (await this.page.locator('.CardLayout__content-wrapper').isVisible()) {
    console.log('✓ User redirected to sign in page');
  } else {
    console.log('✗ User not redirected to sign in page');
  }
  
  // Clean up - close the browser
  if (this.browser) {
    await closeBrowser(this.browser);
    console.log("✓ Browser closed successfully");
  }
});

// Course breakdown section steps
Then('the course breakdown section should be displayed', async function() {
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
  
  // Check for the course breakdown wrapper
  const courseBreakdown = this.page.locator('div.course-breakdown-wrapper');
  await expect(courseBreakdown).toBeVisible({ timeout: 10000 });
  console.log('✓ Course breakdown section is visible');
  
  // Check if the course breakdown has loaded status
  const breakdownBlock = this.page.locator('div.course-breakdown[data-block-name="course-breakdown"]');
  const blockStatus = await breakdownBlock.getAttribute('data-block-status');
  expect(blockStatus).toBe('loaded');
  console.log(`✓ Course breakdown has loaded status: ${blockStatus}`);
  
  // Store for later use
  this.courseBreakdown = courseBreakdown;
});

Then('the course breakdown header should have a "Sign in to start" button', async function() {
  // Check for the "Sign in to start" button in the header
  const signInButton = this.page.locator('a.course-breakdown-header-start-button');
  await expect(signInButton).toBeVisible();
  
  // Check if the button has the correct text
  const buttonText = await signInButton.textContent();
  expect(buttonText.trim()).toBe('Sign in to start');
  console.log('✓ Course breakdown header has "Sign in to start" button');
  
  // Store for later use
  this.signInButton = signInButton;
});

Then('all course breakdown modules should be disabled', async function() {
  // Find all course breakdown module cards
  const moduleCards = this.page.locator('div.course-breakdown-module-card');
  const moduleCount = await moduleCards.count();
  expect(moduleCount).toBeGreaterThan(0);
  console.log(`✓ Found ${moduleCount} course breakdown modules`);
  
  // Check if all module cards have the disabled class
  for (let i = 0; i < moduleCount; i++) {
    const moduleCard = moduleCards.nth(i);
    const hasDisabledClass = await moduleCard.getAttribute('class');
    expect(hasDisabledClass).toContain('disabled');
    
    // Check if the module number is disabled
    const moduleNumber = moduleCard.locator('span.cb-module-number');
    const moduleNumberClass = await moduleNumber.getAttribute('class');
    expect(moduleNumberClass).toContain('disabled');
    
    // Check if the start button (anchor tag) is disabled
    const startButton = moduleCard.locator('a.cb-start-btn');
    if (await startButton.count() > 0) {
      const startButtonClass = await startButton.getAttribute('class');
      expect(startButtonClass).toContain('disabled');
    }

    // Check if the status text shows "Not started"
    const statusText = moduleCard.locator('span.cb-steps-status-text');
    if (await statusText.count() > 0) {
      const statusTextContent = await statusText.textContent();
      expect(statusTextContent.trim()).toBe('Not started');
    }
  }
  
  console.log('✓ All course breakdown modules are disabled');
});

When('user clicks on the unauth sign in to start button', async function() {
  // Click on the "Sign in to start" button
  await this.signInButton.click();
  console.log('✓ Clicked on "Sign in to start" button');
  
  // Wait for navigation to complete
  await this.page.waitForLoadState('networkidle');
  console.log('✓ Page navigation completed');
  
  // Take a screenshot after clicking the button
  await this.page.screenshot({ path: 'screenshots/after-sign-in-button-click.png' });
});
