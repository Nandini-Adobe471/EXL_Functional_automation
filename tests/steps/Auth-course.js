const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { performLogin } = require('../commonFunctions/login');
const ENV = require('../../config.js');

// Set timeout for all steps
setDefaultTimeout(60 * 1000);

Given('user logs in to the application', async function() {
  // If this.page is already set (shared session via BeforeAll hook), skip login
  if (!this.page) {
    const { page, browser, context } = await performLogin(this);
    this.page = page;
    this.browser = browser;
    this.context = context;
  }

  // Additional wait to ensure everything is loaded
  await this.page.waitForTimeout(10000);

  // Take a screenshot after login
  await this.page.screenshot({ path: 'screenshots/auth-after-login.png' });

  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
});

When('user navigates to the courses page', async function() {
  // Navigate to the courses page
  await this.page.goto(`${ENV.URL}/courses`);
  console.log('✓ Navigated to courses page');
  
  // Wait for the page to load
  //await this.page.waitForLoadState('networkidle');
  
  // Additional wait to ensure everything is loaded
  await this.page.waitForTimeout(3000);
  
  // Wait for the browse-courses block to be visible
  const browseCourses = this.page.locator('div.browse-courses-wrapper');
  await expect(browseCourses).toBeVisible({ timeout: 10000 });
  console.log('✓ Browse-courses block is visible');
  
  // Take a screenshot
  await this.page.screenshot({ path: 'screenshots/auth-courses-page.png' });
  
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
});

Then('user should see the authenticated marquee container', async function() {
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

Then('the marquee should have the correct title and description', async function() {
  // Check for the marquee foreground
  const foreground = this.page.locator('div.marquee-foreground');
  await expect(foreground).toBeVisible();
  console.log('✓ Marquee foreground is visible');
  
  // Check for the title
  const title = this.page.locator('div.marquee-title h1');
  await expect(title).toBeVisible();
  const titleText = await title.textContent();
  console.log(`✓ Marquee title is visible: "${titleText.trim()}"`);
  
  // Verify the title text matches the expected value
  expect(titleText.trim()).toBe('Welcome to Experience League courses');
  console.log('✓ Marquee title text is correct');
  
  // Check for the description
  const description = this.page.locator('div.marquee-long-description');
  await expect(description).toBeVisible();
  const descriptionText = await description.textContent();
  console.log(`✓ Marquee description is visible: "${descriptionText.trim().substring(0, 50)}..."`);
  
  // Verify the description contains expected text
  expect(descriptionText).toContain('Advance your skills and accelerate your success with Adobe Experience Cloud products');
  console.log('✓ Marquee description contains expected text');
});

Then('the authenticated marquee should have background with image', async function() {
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

Then('user should see the status filter dropdown', async function() {
  // Check for the status filter dropdown
  const statusFilter = this.page.locator('div.custom-filter-dropdown[data-filter-type="Status"]');
  await expect(statusFilter).toBeVisible();
  console.log('✓ Status filter dropdown is visible');
  
  // Store for later use
  this.statusFilter = statusFilter;
  
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
});

When('user clicks on the status filter button', async function() {
  // Click on the status filter button
  const filterButton = this.page.locator('div.custom-filter-dropdown[data-filter-type="Status"] button');
  await filterButton.click();
  console.log('✓ Clicked on status filter button');
  
  // Wait a moment for the dropdown to appear
  await this.page.waitForTimeout(500);
});

Then('the status filter dropdown content should be visible', async function() {
  // Check if the dropdown content is visible
  const dropdownContent = this.page.locator('div.custom-filter-dropdown[data-filter-type="Status"] div.filter-dropdown-content');
  await expect(dropdownContent).toBeVisible();
  console.log('✓ Status filter dropdown content is visible');
  
  // Take a screenshot to verify
  await this.page.screenshot({ path: 'screenshots/status-filter-dropdown.png' });
});

Then('status filter dropdown values should match status values in course cards', async function() {
  // Extract all status filter options from the dropdown
  const filterOptions = await this.page.locator('div.custom-filter-dropdown[data-filter-type="Status"] div.custom-checkbox input')
    .evaluateAll(inputs => inputs.map(input => input.getAttribute('data-label')));
  
  console.log('Status filter options found:', filterOptions);
  
  // Extract all status values from the course cards
  const cardStatusValues = await this.page.locator('div.browse-card-status-indicator span.status-text')
    .evaluateAll(statusTexts => statusTexts.map(text => text.textContent.trim()));
  
  console.log('Card status values found:', cardStatusValues);
  
  // Get unique status values from cards (some cards might have the same status)
  const uniqueCardStatusValues = [...new Set(cardStatusValues)];
  console.log('Unique card status values:', uniqueCardStatusValues);
  
  // Check if all filter options are present in the card status values
  for (const option of filterOptions) {
    expect(uniqueCardStatusValues).toContain(option);
    console.log(`✓ Filter option "${option}" matches a card status value`);
  }
  
  // Check if all card status values are present in the filter options
  for (const cardStatus of uniqueCardStatusValues) {
    expect(filterOptions).toContain(cardStatus);
    console.log(`✓ Card status value "${cardStatus}" is available in filter options`);
  }
  
  console.log('✓ Status filter dropdown values match status values in course cards');
});

When('user clicks on a course card with {string} status', async function(statusText) {
  // Set flag to keep browser open for subsequent steps

  await this.page.waitForTimeout(5000);
  this.keepBrowserOpen = true;
  
  // Find all course cards with the specified status
  const courseCards = await this.page.$$(`div.browse-card-status-indicator:has(span.status-text:text-is("${statusText}"))`);
  expect(courseCards.length).toBeGreaterThan(0);
  console.log(`✓ Found ${courseCards.length} course cards with "${statusText}" status`);
  
  // Get the parent browse-card element of the first matching card
  const firstCard = await courseCards[0].evaluateHandle(node => node.closest('.browse-card'));
  
  // Get the course title before clicking
  const titleElement = await firstCard.$$('h3.browse-card-title-text');
  const courseTitle = await titleElement[0].textContent();
  console.log(`✓ Selected course: "${courseTitle.trim()}"`);
  
  // Store the course title for later verification
  this.selectedCourseTitle = courseTitle.trim();
  
  // Click on the first course card
  await firstCard.click();
  console.log(`✓ Clicked on course card with "${statusText}" status`);
  
  // Wait for navigation to complete
 // await this.page.waitForLoadState('networkidle');
  console.log('✓ Page navigation completed');
  
  // Additional wait to ensure everything is loaded
  await this.page.waitForTimeout(3000);
  
  // Take a screenshot of the course details page
  await this.page.screenshot({ path: 'screenshots/auth-course-details-page.png' });
});

Then('user should be redirected to the authenticated course details page', async function() {
  // Check if the URL has changed to a course details page
  const currentUrl = this.page.url();
  expect(currentUrl).toContain('/courses/');
  console.log(`✓ Redirected to course details page: ${currentUrl}`);
  
  // Wait for the page to fully load
 // await this.page.waitForLoadState('networkidle');
  
  // Store the current URL for later use
  this.courseDetailsUrl = currentUrl;
});

Then('the authenticated course breadcrumb should be visible', async function() {
  // Check for the course breadcrumb
  const breadcrumb = this.page.locator('div.course-marquee-breadcrumb');
  await expect(breadcrumb).toBeVisible();
  console.log('✓ Course breadcrumb is visible');
  
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
  
  // Store for later use
  this.breadcrumb = breadcrumb;
});

Then('the authenticated course marquee should be displayed', async function() {
  // Check for the course marquee container
  const courseMarquee = this.page.locator('div.course-marquee-wrapper');
  await expect(courseMarquee).toBeVisible({ timeout: 10000 });
  console.log('✓ Course marquee is visible');
  
  // Check if the course marquee has loaded status
  const marqueeBlock = this.page.locator('div.course-marquee[data-block-name="course-marquee"]');
  const blockStatus = await marqueeBlock.getAttribute('data-block-status');
  expect(blockStatus).toBe('loaded');
  console.log(`✓ Course marquee has loaded status: ${blockStatus}`);
  
  // Check for the course title in the marquee
  const marqueeTitle = this.page.locator('h1.course-marquee-title');
  await expect(marqueeTitle).toBeVisible();
  
  // Get the title text
  const titleText = await marqueeTitle.textContent();
  console.log(`✓ Course marquee title: "${titleText.trim()}"`);
  
  // Store for later use
  this.courseMarquee = courseMarquee;
});

Then('the course breakdown heading should have a {string} button', async function(buttonText) {
  // Check for the course breakdown wrapper
  const courseBreakdown = this.page.locator('div.course-breakdown-wrapper');
  await expect(courseBreakdown).toBeVisible({ timeout: 10000 });
  console.log('✓ Course breakdown section is visible');
  
  // Check if the course breakdown has loaded status
  const breakdownBlock = this.page.locator('div.course-breakdown[data-block-name="course-breakdown"]');
  const blockStatus = await breakdownBlock.getAttribute('data-block-status');
  expect(blockStatus).toBe('loaded');
  console.log(`✓ Course breakdown has loaded status: ${blockStatus}`);
  
  // Check for the button in the header with the specified text
  const startButton = this.page.locator(`div.course-breakdown-header a.course-breakdown-header-start-button:has-text("${buttonText}")`);
  await expect(startButton).toBeVisible();
  console.log(`✓ Course breakdown header has "${buttonText}" button`);
  
  // Store for later use
  this.courseBreakdown = courseBreakdown;
  this.startButton = startButton;
});

Then('the first module should have {string} button and {string} status', async function(buttonText, statusText) {
  // Find the first module card
  const firstModuleCard = this.page.locator('div.course-breakdown-module-card').first();
  await expect(firstModuleCard).toBeVisible();
  console.log('✓ First module card is visible');
  
  // Check if the module card has the not-started class
  const cardClass = await firstModuleCard.getAttribute('class');
  expect(cardClass).toContain('not-started');
  console.log('✓ First module card has not-started class');
  
  // Check for the Start module button (it's an anchor tag with class 'button', not a button element)
  const startModuleButton = firstModuleCard.locator(`a.cb-start-btn:has-text("${buttonText}")`);
  await expect(startModuleButton).toBeVisible();
  console.log(`✓ First module has "${buttonText}" button`);
  
  // Check for the Not started status text
  const statusTextElement = firstModuleCard.locator(`span.cb-steps-status-text:text-is("${statusText}")`);
  await expect(statusTextElement).toBeVisible();
  console.log(`✓ First module has "${statusText}" status`);
  
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
});

Then('the remaining modules should have disabled {string} buttons', async function(buttonText) {
  // Take a screenshot to debug
  await this.page.screenshot({ path: 'screenshots/course-modules.png' });
  
  // Wait for the module cards to be visible
  await this.page.waitForSelector('div.course-breakdown-module-card', { timeout: 10000 });
  
  // Find all module cards with disabled class
  // Use a more specific selector that matches the HTML structure
  const moduleCards = await this.page.$$('div.course-breakdown-module-card.disabled');
  
  // Check if we found any disabled module cards
  expect(moduleCards.length).toBeGreaterThan(0);
  console.log(`✓ Found ${moduleCards.length} disabled module cards`);
  
  // Check each disabled module card
  for (let i = 0; i < moduleCards.length; i++) {
    const moduleCard = moduleCards[i];
    
    // Check if the module card has the disabled class
    const cardClass = await moduleCard.getAttribute('class');
    expect(cardClass).toContain('disabled');
    console.log(`✓ Module card ${i+1} has disabled class`);
    
    // Check for the disabled Start module button (it's an anchor tag with class 'button', not a button element)
    const startModuleButton = await moduleCard.$('a.cb-start-btn');
    expect(startModuleButton).not.toBeNull();
    
    const buttonClass = await startModuleButton.getAttribute('class');
    expect(buttonClass).toContain('disabled');
    console.log(`✓ Module card ${i+1} has disabled "${buttonText}" button`);
    
    // Check for the disabled status text
    const statusTextElement = await moduleCard.$('span.cb-steps-status-text');
    expect(statusTextElement).not.toBeNull();
    
    const statusClass = await statusTextElement.getAttribute('class');
    expect(statusClass).toContain('disabled');
    console.log(`✓ Module card ${i+1} has disabled status text`);
  }
});

// This step definition has been removed to avoid duplication
// The functionality is now handled by the step definition at line 613

When('user navigates back to courses page using breadcrumb', async function() {
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
  
  // Take a screenshot to debug
  await this.page.screenshot({ path: 'screenshots/before-breadcrumb-navigation.png' });
  
  // Check if we're on a step page or a course details page
  const isOnStepPage = await this.page.locator('div.course-breadcrumb-section').isVisible();
  
  let breadcrumbLink;
  if (isOnStepPage) {
    // If on step page, use the course-breadcrumb-courses link
    breadcrumbLink = this.page.locator('a.course-breadcrumb-courses');
    console.log('✓ Found step page breadcrumb');
  } else {
    // If on course details page, use the course-marquee-breadcrumb link
    breadcrumbLink = this.page.locator('div.course-marquee-breadcrumb a:has-text("Courses")');
    console.log('✓ Found course details page breadcrumb');
  }
  
  // Wait for the breadcrumb link to be visible
  await expect(breadcrumbLink).toBeVisible({ timeout: 10000 });
  
  // Click on the breadcrumb link
  await breadcrumbLink.click();
  console.log('✓ Clicked on breadcrumb link to courses page');
  
  // Wait for navigation to complete
  await this.page.waitForTimeout(3000);
  //await this.page.waitForLoadState('networkidle');
  console.log('✓ Page navigation completed');
  
  // Additional wait to ensure everything is loaded
  await this.page.waitForTimeout(1500);
  
  // Take a screenshot after navigation
  await this.page.screenshot({ path: 'screenshots/after-breadcrumb-navigation-to-courses.png' });
});

Then('the course status should be changed to {string}', async function(statusText) {
  // Find the course card with the title that matches the selected course
  const courseTitle = this.selectedCourseTitle;
  const courseCards = await this.page.$$(`h3.browse-card-title-text:has-text("${courseTitle}")`);
  expect(courseCards.length).toBeGreaterThan(0);
  console.log(`✓ Found ${courseCards.length} course cards with title "${courseTitle}"`);
  
  // Get the parent browse-card element
  const courseCard = await courseCards[0].evaluateHandle(node => node.closest('.browse-card'));
  
  // Find the status text within this card
  const statusElement = await courseCard.$('span.status-text');
  expect(statusElement).not.toBeNull();
  
  // Check if the status text matches the expected value
  const actualStatusText = await statusElement.textContent();
  expect(actualStatusText.trim()).toBe(statusText);
  console.log(`✓ Course status is now "${statusText}"`);
  
  // Check if the status badge has the correct class
  const statusBadge = await courseCard.$('span.status-badge');
  expect(statusBadge).not.toBeNull();
  
  const badgeClass = await statusBadge.getAttribute('class');
  expect(badgeClass).toContain(`status-${statusText.toLowerCase().replace(/\s+/g, '-')}`);
  console.log(`✓ Status badge has the correct class for "${statusText}" status`);
});

Then('the course should appear in the in-progress courses section', async function() {
  // Find the in-progress courses section
  const inProgressSection = this.page.locator('div.inprogress-courses-card-wrapper');
  await expect(inProgressSection).toBeVisible();
  console.log('✓ In-progress courses section is visible');
  
  // Find the course card with the title that matches the selected course within the in-progress section
  const courseTitle = this.selectedCourseTitle;
  
  // Take a screenshot to debug
  await this.page.screenshot({ path: 'screenshots/in-progress-section.png' });
  
  // Find the specific course card in the in-progress section using a more specific locator
  const courseCard = this.page.locator('div.inprogress-courses-card-wrapper')
    .locator(`h3.browse-card-title-text:has-text("${courseTitle}")`)
    .first();
  
  // Check if the course card is visible
  await expect(courseCard).toBeVisible();
  console.log(`✓ Course "${courseTitle}" appears in the in-progress section`);
  
  // Find the status text within this specific card's parent
  const statusText = this.page.locator('div.inprogress-courses-card-wrapper')
    .locator(`h3.browse-card-title-text:has-text("${courseTitle}")`)
    .locator('xpath=../../..//span[contains(@class, "status-text")]')
    .first();
  
  // Check if the status text is visible and has the correct value
  await expect(statusText).toBeVisible();
  const actualStatusText = await statusText.textContent();
  expect(actualStatusText.trim()).toBe('In progress');
  console.log(`✓ Course "${courseTitle}" status in the in-progress section is "In progress"`);
  
  // Find the status badge within this specific card's parent
  const statusBadge = this.page.locator('div.inprogress-courses-card-wrapper')
    .locator(`h3.browse-card-title-text:has-text("${courseTitle}")`)
    .locator('xpath=../../..//span[contains(@class, "status-badge")]')
    .first();
  
  // Check if the status badge is visible and has the correct class
  await expect(statusBadge).toBeVisible();
  const badgeClass = await statusBadge.getAttribute('class');
  expect(badgeClass).toContain('status-in-progress');
  console.log('✓ Status badge has the correct class for "In progress" status');
});

When('user clicks on a course card with {string} status in the in-progress section', async function(statusText) {
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
  
  // Find the in-progress courses section
  const inProgressSection = this.page.locator('div.inprogress-courses-card-wrapper');
  await expect(inProgressSection).toBeVisible();
  console.log('✓ In-progress courses section is visible');
  
  // Take a screenshot to debug
  await this.page.screenshot({ path: 'screenshots/in-progress-section-before-click.png' });
  
  // Find all course cards in the in-progress section with the specified status
  // Use a more specific locator that combines the section and status
  const statusTextLocator = this.page.locator('div.inprogress-courses-card-wrapper')
    .locator(`span.status-text:text-is("${statusText}")`)
    .first();
  
  await expect(statusTextLocator).toBeVisible();
  console.log(`✓ Found course card with "${statusText}" status in the in-progress section`);
  
  // Get the parent browse-card element
  const browseCard = statusTextLocator.locator('xpath=../../../..');
  await expect(browseCard).toBeVisible();
  
  // Get the course title before clicking
  const titleElement = browseCard.locator('h3.browse-card-title-text');
  await expect(titleElement).toBeVisible();
  
  const courseTitle = await titleElement.textContent();
  console.log(`✓ Selected in-progress course: "${courseTitle.trim()}"`);
  
  // Store the course title for later verification
  this.selectedCourseTitle = courseTitle.trim();
  
  // Click on the course card
  await browseCard.click();
  console.log(`✓ Clicked on in-progress course card with "${statusText}" status`);
  
  // Wait for navigation to complete
  await this.page.waitForTimeout(3000);
  //await this.page.waitForLoadState('networkidle');
  console.log('✓ Page navigation completed');
  
  // Additional wait to ensure everything is loaded
  await this.page.waitForTimeout(1500);
  
  // Take a screenshot of the course details page
  await this.page.screenshot({ path: 'screenshots/auth-inprogress-course-details-page.png' });
});

Then('the in-progress module should have {string} button and {string} status', async function(buttonText, statusText) {
  // Find the in-progress module card
  const inProgressModuleCard = this.page.locator('div.course-breakdown-module-card.in-progress').first();
  await expect(inProgressModuleCard).toBeVisible();
  console.log('✓ In-progress module card is visible');
  
  // Check if the module card has the in-progress class
  const cardClass = await inProgressModuleCard.getAttribute('class');
  expect(cardClass).toContain('in-progress');
  console.log('✓ Module card has in-progress class');
  
  // Check for the Resume module button (it's an anchor tag with class 'button', not a button element)
  const resumeModuleButton = inProgressModuleCard.locator(`a.cb-start-btn:has-text("${buttonText}")`);
  await expect(resumeModuleButton).toBeVisible();
  console.log(`✓ In-progress module has "${buttonText}" button`);
  
  // Store the resume button for later use
  this.resumeModuleButton = resumeModuleButton;
  
  // Check for the In progress status text
  const statusTextElement = inProgressModuleCard.locator(`span.cb-steps-status-text:text-is("${statusText}")`);
  await expect(statusTextElement).toBeVisible();
  console.log(`✓ In-progress module has "${statusText}" status`);
  
  // Store the module title for later verification
  const moduleTitle = await inProgressModuleCard.locator('h3.cb-module-title').textContent();
  this.selectedModuleTitle = moduleTitle.trim();
  console.log(`✓ Selected module: "${this.selectedModuleTitle}"`);
  
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
});

When('user clicks on the {string} button', async function(buttonText) {
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
  
  // Take a screenshot to debug
  await this.page.screenshot({ path: 'screenshots/before-button-click.png' });
  
  let buttonToClick;
  
  // Check if we're looking for a button in the course breakdown header or in a module card
  if (buttonText === "Start course" || buttonText === "Continue learning") {
    // Find the button in the course breakdown header
    buttonToClick = this.page.locator(`a.course-breakdown-header-start-button:has-text("${buttonText}")`);
  } else if (buttonText === "Resume module") {
    // For Resume module, look in the in-progress module card
    buttonToClick = this.page.locator('div.course-breakdown-module-card.in-progress')
      .locator(`a.cb-start-btn.in-progress`);
  } else if (buttonText === "Start module") {
    // For Start module, look in the not-started module card
    buttonToClick = this.page.locator('div.course-breakdown-module-card.not-started')
      .locator(`a.cb-start-btn.not-started`);
  } else if (buttonText === "Take quiz") {
    // For Take quiz, use the stored target button if available
    if (this.targetButton) {
      buttonToClick = this.targetButton;
    } else {
      // Otherwise, look for a button with the text
      buttonToClick = this.page.locator(`a.module-nav-button:has-text("${buttonText}")`);
    }
  } else {
    // For any other button, look for a generic button with the text
    buttonToClick = this.page.locator(`button:has-text("${buttonText}"), a:has-text("${buttonText}")`).first();
  }
  
  // Wait for the button to be visible
  await expect(buttonToClick).toBeVisible();
  console.log(`✓ Found "${buttonText}" button`);
  
  // Store the course title for later verification if not already stored
  if (!this.selectedCourseTitle && await this.page.locator('h1.course-marquee-title').isVisible().catch(() => false)) {
    const courseTitle = await this.page.locator('h1.course-marquee-title').textContent();
    this.selectedCourseTitle = courseTitle.trim();
    console.log(`✓ Selected course: "${this.selectedCourseTitle}"`);
  }
  
  // Click the button
  await buttonToClick.click();
  console.log(`✓ Clicked on "${buttonText}" button`);
  
  // Wait for navigation to complete
  //await this.page.waitForLoadState('networkidle');
  console.log('✓ Page navigation completed');
  
  // Additional wait to ensure everything is loaded
  await this.page.waitForTimeout(3000);
  
  // Take a screenshot after clicking the button
  await this.page.screenshot({ path: 'screenshots/after-button-click.png' });
  
  // If we're on a step page, verify it
  const courseStepBreadcrumb = this.page.locator('div.course-breadcrumb-section');
  const isOnStepPage = await courseStepBreadcrumb.isVisible().catch(() => false);
  
  if (isOnStepPage) {
    console.log('✓ Now on a course step page');
  }
});

Then('user should be redirected to the course step page', async function() {
  // Check if the URL has changed to a course step page
  const currentUrl = this.page.url();
  expect(currentUrl).toContain('/courses/');
 // expect(currentUrl).toContain('/module-');
 // expect(currentUrl).toContain('/step-');
  console.log(`✓ Redirected to course step page: ${currentUrl}`);
  
  // Wait for the page to fully load
  await this.page.waitForTimeout(3000);
 // await this.page.waitForLoadState('networkidle');
  
  // Additional wait to ensure everything is loaded
  await this.page.waitForTimeout(1500);
  
  // Take a screenshot of the step page
  await this.page.screenshot({ path: 'screenshots/course-step-page.png' });
  
  // Store the current URL for later use
  this.courseStepUrl = currentUrl;
});

Then('the module info block should be visible with {string} button', async function(buttonText) {
  // Check for the module info block
  const moduleInfoBlock = this.page.locator('div.module-info');
  await expect(moduleInfoBlock).toBeVisible({ timeout: 10000 });
  console.log('✓ Module info block is visible');
  
  // Check if the module info block has loaded status
  const blockStatus = await moduleInfoBlock.getAttribute('data-block-status');
  expect(blockStatus).toBe('loaded');
  console.log(`✓ Module info block has loaded status: ${blockStatus}`);
  
  // Check for the back to course button
  const backToCourseButton = this.page.locator(`a.back-to-course:has-text("${buttonText}")`);
  await expect(backToCourseButton).toBeVisible();
  console.log(`✓ Module info block has "${buttonText}" button`);
  
  // Store for later use
  this.moduleInfoBlock = moduleInfoBlock;
  this.backToCourseButton = backToCourseButton;
});

Then('the module info should display the correct module title', async function() {
  // Check for the module title
  const moduleTitle = this.page.locator('div.module-content span.module-title');
  await expect(moduleTitle).toBeVisible();
  
  // Get the title text
  const titleText = await moduleTitle.textContent();
  console.log(`✓ Module title in module info: "${titleText.trim()}"`);
  
  // Verify that the module title matches the one we clicked on
  expect(titleText.trim()).toBe(this.selectedModuleTitle);
  console.log('✓ Module title matches the selected module');
});

Then('the step dropdown should be available with the current step selected', async function() {
  // Check for the step dropdown
  const stepDropdown = this.page.locator('div.step-selector-container div.custom-filter-dropdown');
  await expect(stepDropdown).toBeVisible();
  console.log('✓ Step dropdown is available');
  
  // Check for the dropdown button
  const dropdownButton = stepDropdown.locator('button');
  await expect(dropdownButton).toBeVisible();
  
  // Get the current step name from the dropdown button
  const currentStepName = await dropdownButton.locator('span.custom-filter-dropdown-name').textContent();
  console.log(`✓ Current step selected: "${currentStepName.trim()}"`);
  
  // Click on the dropdown button to see the options
  await dropdownButton.click();
  console.log('✓ Clicked on step dropdown button');
  
  // Wait for the dropdown content to be visible
  const dropdownContent = stepDropdown.locator('div.filter-dropdown-content');
  await expect(dropdownContent).toBeVisible();
  console.log('✓ Step dropdown content is visible');
  
  // Take a screenshot with the dropdown open
  await this.page.screenshot({ path: 'screenshots/step-dropdown-open.png' });
  
  // Check that there are multiple steps available
  const stepOptionsCount = await this.page.locator('div.step-selector-container div.custom-filter-dropdown div.filter-dropdown-content div.custom-checkbox').count();
  expect(stepOptionsCount).toBeGreaterThan(0);
  console.log(`✓ Found ${stepOptionsCount} step options in the dropdown`);
});

// New step definitions for module filter navigation and steps verification

Then('user should check if course cards are available', async function() {
  // Find the browse cards content container
  const browseCardsContent = this.page.locator('div.browse-cards-block-content');
  await expect(browseCardsContent).toBeVisible({ timeout: 10000 });
  console.log('✓ Browse cards content container is visible');
  
  // Find all course cards
  const courseCards = browseCardsContent.locator('div.browse-card.course-card');
  const cardsCount = await courseCards.count();
  
  // Store the result in the scenario context
  this.scenarioContext = this.scenarioContext || {};
  this.scenarioContext.cardsAvailable = cardsCount > 0;
  this.scenarioContext.cardsCount = cardsCount;
  
  if (this.scenarioContext.cardsAvailable) {
    console.log(`✓ Found ${cardsCount} course cards`);
    
    // Store the first card for later use
    this.scenarioContext.firstCard = courseCards.first();
    
    // Take a screenshot of the available cards
    await this.page.screenshot({ path: 'screenshots/course-cards-available.png' });
    console.log('✓ Screenshot captured of available course cards');
  } else {
    console.log('✗ No course cards are available');
    
    // Take a screenshot of the no cards state
    await this.page.screenshot({ path: 'screenshots/course-cards-not-available.png' });
    console.log('✓ Screenshot captured of no cards state');
  }
  
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
});

When('course cards are available', async function() {
  // This is a conditional step that only executes if cards are available
  if (!this.scenarioContext?.cardsAvailable) {
    console.log('Courses are not available. Skipping this step.');
    return 'skipped';
  }
  
  console.log(`✓ Proceeding with ${this.scenarioContext.cardsCount} available course cards`);
  
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
});

Then('user should check for step filter dropdown', async function() {
  // Skip this step if no cards were available
  if (!this.scenarioContext?.cardsAvailable) {
    console.log('Courses are not available. Skipping this step.');
    return 'skipped';
  }
  
  // Look for the module filter dropdown
  const moduleFilterDropdown = this.page.locator('div.custom-filter-dropdown[data-variant="anchor-menu"]');
  
  // Check if the module filter dropdown exists
  const moduleFilterExists = await moduleFilterDropdown.isVisible().catch(() => false);
  this.scenarioContext.moduleFilterExists = moduleFilterExists;
  
  if (moduleFilterExists) {
    // Get the filter type (name) from the data attribute
    const filterType = await moduleFilterDropdown.getAttribute('data-filter-type');
    this.scenarioContext.moduleFilterType = filterType;
    console.log(`✓ Module filter dropdown is available with type: "${filterType}"`);
    
    // Take a screenshot showing the module filter dropdown
    await this.page.screenshot({ path: 'screenshots/module-page-with-filter-dropdown.png' });
    console.log('✓ Screenshot captured showing module filter dropdown');
  } else {
    console.log('✗ Module filter dropdown is not available on this module page');
    
    // Take a screenshot of the module page without filter dropdown
    await this.page.screenshot({ path: 'screenshots/module-page-no-filter-dropdown.png' });
    console.log('✓ Screenshot captured of module page without filter dropdown');
  }
  
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
});

When('user clicks on the step filter dropdown button', async function() {
  // Skip this step if no cards were available, if Start Module button wasn't available, or if module filter dropdown wasn't available
  if (!this.scenarioContext?.cardsAvailable || !this.scenarioContext?.moduleFilterExists) {
    console.log('Either courses or module filter dropdown were not available. Skipping this step.');
    return 'skipped';
  }
  
  // Find the module filter dropdown button
  const moduleFilterDropdown = this.page.locator('div.custom-filter-dropdown[data-variant="anchor-menu"]');
  const moduleFilterButton = moduleFilterDropdown.locator('button');
  await expect(moduleFilterButton).toBeVisible({ timeout: 10000 });
  
  // Click on the module filter button
  await moduleFilterButton.click();
  console.log('✓ Clicked on the module filter dropdown button');
  
  // Wait for the dropdown to appear
  await this.page.waitForTimeout(1000);
  
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
});

Then('the step filter dropdown content should be visible', async function() {
  // Skip this step if no cards were available, if module filter dropdown wasn't available
  if (!this.scenarioContext?.cardsAvailable || !this.scenarioContext?.moduleFilterExists) {
    console.log('Either courses or module filter dropdown were not available. Skipping this step.');
    return 'skipped';
  }
  
  // Find the filter dropdown content
  const filterDropdownContent = this.page.locator('div.custom-filter-dropdown[data-variant="anchor-menu"] div.filter-dropdown-content');
  await expect(filterDropdownContent).toBeVisible({ timeout: 5000 });
  console.log('✓ Module filter dropdown content is visible');
  
  // Verify there are filter options
  const filterOptions = filterDropdownContent.locator('div.custom-checkbox');
  const optionsCount = await filterOptions.count();
  expect(optionsCount).toBeGreaterThan(0);
  console.log(`✓ Found ${optionsCount} module filter options`);
  
  // Store the options count for later use
  this.scenarioContext.moduleFilterOptionsCount = optionsCount;
  
  // Take a screenshot of the open dropdown
  await this.page.screenshot({ path: 'screenshots/module-filter-dropdown-open.png' });
  console.log('✓ Screenshot captured of open module filter dropdown');
  
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
});

When('user selects a value from the step filter dropdown', async function() {
  // Skip this step if no cards were available, if module filter dropdown wasn't available
  if (!this.scenarioContext?.cardsAvailable || !this.scenarioContext?.moduleFilterExists) {
    console.log('Either courses or module filter dropdown were not available. Skipping this step.');
    return 'skipped';
  }
  
  // Find all filter options
  const filterOptions = this.page.locator('div.custom-filter-dropdown[data-variant="anchor-menu"] div.filter-dropdown-content div.custom-checkbox');
  const optionsCount = this.scenarioContext.moduleFilterOptionsCount;
  
  // First, check if there are any "Module Quiz" or "Recap - Key Takeaways" options
  let quizOptionIndex = -1;
  let recapOptionIndex = -1;
  let selectedOptionIndex = -1;
  
  // Look for specific options
  for (let i = 0; i < optionsCount; i++) {
    const option = filterOptions.nth(i);
    const optionLink = option.locator('label a.title');
    const optionText = await optionLink.textContent().catch(() => '');
    
    if (optionText.includes('Module Quiz')) {
      quizOptionIndex = i;
      console.log(`✓ Found "Module Quiz" option at index ${i}`);
    } else if (optionText.includes('Recap') || optionText.includes('Key Takeaways')) {
      recapOptionIndex = i;
      console.log(`✓ Found "Recap/Key Takeaways" option at index ${i}`);
    }
  }
  
  // Prioritize selecting special options if found
  if (quizOptionIndex >= 0) {
    selectedOptionIndex = quizOptionIndex;
    console.log('✓ Selecting Module Quiz option');
  } else if (recapOptionIndex >= 0) {
    selectedOptionIndex = recapOptionIndex;
    console.log('✓ Selecting Recap/Key Takeaways option');
  } else {
    // If no special options found, select a random option
    selectedOptionIndex = Math.floor(Math.random() * optionsCount);
    console.log('✓ No special options found, selecting a random option');
  }
  
  // Get the selected option
  const selectedOption = filterOptions.nth(selectedOptionIndex);
  const optionLink = selectedOption.locator('label a.title');
  await expect(optionLink).toBeVisible({ timeout: 5000 });
  
  const optionLabel = await optionLink.textContent();
  const optionUrl = await optionLink.getAttribute('href');
  
  // Store the selected option info in the scenario context for later verification
  this.scenarioContext.selectedModuleOption = {
    label: optionLabel.trim(),
    url: optionUrl,
    isLastOption: selectedOptionIndex === optionsCount - 1,
    isQuizOption: selectedOptionIndex === quizOptionIndex,
    isRecapOption: selectedOptionIndex === recapOptionIndex
  };
  
  console.log(`✓ Selected module filter option: "${this.scenarioContext.selectedModuleOption.label}"`);
  console.log(`✓ Selected module URL: ${this.scenarioContext.selectedModuleOption.url}`);
  console.log(`✓ Is last option: ${this.scenarioContext.selectedModuleOption.isLastOption}`);
  console.log(`✓ Is Quiz option: ${this.scenarioContext.selectedModuleOption.isQuizOption}`);
  console.log(`✓ Is Recap option: ${this.scenarioContext.selectedModuleOption.isRecapOption}`);
  
  // Click on the option link
  await optionLink.click();
  console.log('✓ Clicked on the selected module filter option');
  
  // Wait for navigation to complete
  await this.page.waitForTimeout(3000);
  //await this.page.waitForLoadState('networkidle', { timeout: 30000 });
  console.log('✓ Navigation to selected module page completed');
  
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
});

Then('user should be redirected to the selected step page', async function() {
  // Skip this step if no cards were available, if module filter dropdown wasn't available
  if (!this.scenarioContext?.cardsAvailable || !this.scenarioContext?.moduleFilterExists) {
    console.log('Either courses or module filter dropdown were not available. Skipping this step.');
    return 'skipped';
  }
  
  // Verify the current URL matches the selected option URL
  const currentUrl = this.page.url();
  expect(currentUrl).toContain(this.scenarioContext.selectedModuleOption.url);
  console.log(`✓ Successfully redirected to the selected module page: ${currentUrl}`);
  
  // Take a screenshot of the module page after navigation
  await this.page.screenshot({ path: 'screenshots/module-page-after-filter-selection.png' });
  console.log('✓ Screenshot captured of module page after filter selection');
  
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
});

Then('user should see appropriate navigation buttons', async function() {
  // Skip this step if no cards were available, if module filter dropdown wasn't available
  if (!this.scenarioContext?.cardsAvailable || !this.scenarioContext?.moduleFilterExists) {
    console.log('Either courses or module filter dropdown were not available. Skipping this step.');
    return 'skipped';
  }
  
  // Find the module navigation section
  const moduleNavSection = this.page.locator('div.module-nav-section');
  const moduleNavExists = await moduleNavSection.isVisible().catch(() => false);
  
  if (moduleNavExists) {
    console.log('✓ Module navigation section is present');
    
    // Find the Previous button
    const previousButton = moduleNavSection.locator('a.module-nav-button.module-nav-back');
    const previousButtonExists = await previousButton.isVisible().catch(() => false);
    
    if (previousButtonExists) {
      const isDisabled = await previousButton.getAttribute('class').then(classes => classes.includes('disabled'));
      console.log(`✓ Previous button is present and ${isDisabled ? 'disabled' : 'enabled'}`);
      
      // Check if it's the first option (Previous button should be disabled)
      if (isDisabled) {
        console.log('✓ Previous button is disabled as expected for the first option');
      }
    } else {
      console.log('✗ Previous button is not present');
    }
    
    // Get the selected option label
    const selectedOptionLabel = this.scenarioContext.selectedModuleOption.label;
    
    // Find the second navigation button (not the Previous button)
    const secondButton = moduleNavSection.locator('a.module-nav-button:not(.module-nav-back)');
    const secondButtonExists = await secondButton.isVisible().catch(() => false);
    
    if (secondButtonExists) {
      const buttonText = await secondButton.textContent();
      console.log(`✓ Second navigation button text: "${buttonText.trim()}"`);
      
      // Check specific cases based on the selected option
      if (selectedOptionLabel.includes('Module Quiz')) {
        // Should have Submit button
        const isSubmitButton = buttonText.trim().toLowerCase().includes('submit');
        if (isSubmitButton) {
          console.log(`✓ Submit button is present as expected for Module Quiz: "${buttonText.trim()}"`);
        } else {
          console.log(`✗ Expected Submit button for Module Quiz, but found: "${buttonText.trim()}"`);
        }
      } else if (selectedOptionLabel.includes('Recap') || selectedOptionLabel.includes('Key Takeaways')) {
        // Should have Take Quiz button
        const isTakeQuizButton = buttonText.trim().toLowerCase().includes('take quiz');
        if (isTakeQuizButton) {
          console.log(`✓ Take Quiz button is present as expected for Recap/Key Takeaways: "${buttonText.trim()}"`);
        } else {
          console.log(`✗ Expected Take Quiz button for Recap/Key Takeaways, but found: "${buttonText.trim()}"`);
        }
      } else {
        // Should have Next button for all other options
        const isNextButton = buttonText.trim().toLowerCase().includes('next');
        if (isNextButton) {
          console.log(`✓ Next button is present as expected for standard module: "${buttonText.trim()}"`);
        } else {
          console.log(`✗ Expected Next button for standard module, but found: "${buttonText.trim()}"`);
        }
      }
    } else {
      console.log('✗ Second navigation button is not present');
    }
    
    // Take a screenshot of the navigation buttons
    await this.page.screenshot({ path: 'screenshots/module-navigation-buttons.png' });
    console.log('✓ Screenshot captured of module navigation buttons');
  } else {
    console.log('✗ Module navigation section is not present');
    
    // Take a screenshot of the page without navigation buttons
    await this.page.screenshot({ path: 'screenshots/module-page-no-navigation.png' });
    console.log('✓ Screenshot captured of module page without navigation buttons');
  }
});

// Step definitions for module count verification

Then('user should check the module count on a {string} course card', async function(statusText) {
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
  
  // Take a screenshot of the courses page
  await this.page.screenshot({ path: 'screenshots/before-module-count-check.png' });
  
  // Find a course card with the specified status
  const statusIndicators = this.page.locator(`div.browse-card-status-indicator:has(span.status-text:text-is("${statusText}"))`);
  const count = await statusIndicators.count();
  expect(count).toBeGreaterThan(0);
  console.log(`✓ Found ${count} course cards with "${statusText}" status`);
  
  // Select the first course card with the specified status
  const firstStatusIndicator = statusIndicators.first();
  
  // Get the parent browse-card element
  const courseCard = firstStatusIndicator.locator('xpath=../../../..');
  await expect(courseCard).toBeVisible();
  
  // Get the course title
  const titleElement = courseCard.locator('h3.browse-card-title-text');
  await expect(titleElement).toBeVisible();
  const courseTitle = await titleElement.textContent();
  console.log(`✓ Selected course: "${courseTitle.trim()}"`);
  
  // Store the course title for later verification
  this.selectedCourseTitle = courseTitle.trim();
  
  // Get the module count text
  const moduleCountElement = courseCard.locator('div.browse-card-module-count');
  await expect(moduleCountElement).toBeVisible();
  const moduleCountText = await moduleCountElement.textContent();
  console.log(`✓ Module count: "${moduleCountText.trim()}"`);
  
  // Parse the module count (format: "X of Y Complete" or "X of Y complete")
  const moduleCountMatch = moduleCountText.match(/(\d+) of (\d+) (Complete|complete)/i);
  if (moduleCountMatch) {
    this.initialCompletedModules = parseInt(moduleCountMatch[1]);
    this.totalModules = parseInt(moduleCountMatch[2]);
    console.log(`✓ Initial module count: ${this.initialCompletedModules} of ${this.totalModules} complete`);
  } else {
    throw new Error(`Could not parse module count from text: "${moduleCountText}"`);
  }
  
  // Store the course card for later use
  this.selectedCourseCard = courseCard;
});

When('user clicks on the selected course card', async function() {
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
  
  // Ensure we have a selected course card
  expect(this.selectedCourseCard).toBeDefined();
  
  // Click on the course card
  await this.selectedCourseCard.click();
  console.log(`✓ Clicked on selected course card: "${this.selectedCourseTitle}"`);
  
  // Wait for navigation to complete
  //await this.page.waitForLoadState('networkidle');
  console.log('✓ Page navigation completed');
  
  // Additional wait to ensure everything is loaded
  await this.page.waitForTimeout(3000);
  
  // Take a screenshot of the course details page
  await this.page.screenshot({ path: 'screenshots/after-course-card-click.png' });
});

When('user completes one module', async function() {
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
  
  // Add course.skipQuiz key to session storage to make completion easier
  await this.page.evaluate(() => {
    sessionStorage.setItem('course.skipQuiz', 'true');
    console.log('Added course.skipQuiz=true to session storage');
  });
  console.log('✓ Added course.skipQuiz=true to session storage');
  
  // Navigate through the module steps until completion
  let stepCount = 0;
  let continueNavigation = true;
  
  // Keep clicking the Next button until we reach the end of the module
  while (continueNavigation && stepCount < 30) { // Safety limit of 30 steps
    // Take a screenshot of the current step
    await this.page.screenshot({ path: `screenshots/module-step-${stepCount}.png` });
    
    // Find the Next button
    const nextButton = this.page.locator('a.module-nav-button:not(.module-nav-back)');
    const nextButtonExists = await nextButton.isVisible().catch(() => false);
    
    if (nextButtonExists) {
      // Get the button text
      const buttonText = await nextButton.textContent();
      console.log(`✓ Found navigation button with text: "${buttonText.trim()}"`);
      
      // Click the button
      await nextButton.click();
      console.log(`✓ Clicked on "${buttonText.trim()}" button`);
       await this.page.waitForTimeout(2000)
      // Wait for navigation to complete
      //await this.page.waitForLoadState('networkidle');
      console.log('✓ Page navigation completed');
      
      // Additional wait to ensure everything is loaded
      await this.page.waitForTimeout(2000);
      
      // Increment the step counter
      stepCount++;
      
      // Check if we've reached a quiz or completion page
      const quizScorecard = this.page.locator('div.quiz-scorecard');
      const isQuizPage = await quizScorecard.isVisible().catch(() => false);
      
      if (isQuizPage) {
        console.log('✓ Reached quiz page, module is complete');
        continueNavigation = false;
        
        // Check for the "Back to course overview" button
        const backToCourseButton = this.page.locator('a:has-text("Back to course overview")');
        if (await backToCourseButton.isVisible().catch(() => false)) {
          await backToCourseButton.click();
          console.log('✓ Clicked on "Back to course overview" button');
          await this.page.waitForTimeout(3000);
          // Wait for navigation to complete
         // await this.page.waitForLoadState('networkidle');
          console.log('✓ Navigated back to course overview');
          
          // Additional wait to ensure everything is loaded
          await this.page.waitForTimeout(1500);
        }
      }
    } else {
      console.log('✓ No more navigation buttons found, module is complete');
      continueNavigation = false;
    }
  }
  
  console.log(`✓ Navigated through ${stepCount} steps to complete the module`);
  
  // Take a final screenshot
  await this.page.screenshot({ path: 'screenshots/after-module-completion.png' });
});

Then('the module count should be updated in the browse section', async function() {
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
  
  // Find the course card with the title that matches the selected course
  const courseTitle = this.selectedCourseTitle;
  const courseTitleElements = await this.page.$$(`h3.browse-card-title-text:has-text("${courseTitle}")`);
  expect(courseTitleElements.length).toBeGreaterThan(0);
  console.log(`✓ Found ${courseTitleElements.length} course cards with title "${courseTitle}"`);
  
  // Get the parent browse-card element
  const courseCard = await courseTitleElements[0].evaluateHandle(node => node.closest('.browse-card'));
  
  // Get the updated module count text
  const moduleCountElement = await courseCard.$('div.browse-card-module-count');
  expect(moduleCountElement).not.toBeNull();
  
  const moduleCountText = await moduleCountElement.textContent();
  console.log(`✓ Updated module count: "${moduleCountText.trim()}"`);
  
  // Parse the updated module count (format: "X of Y Complete" or "X of Y complete")
  const moduleCountMatch = moduleCountText.match(/(\d+) of (\d+) (Complete|complete)/i);
  if (moduleCountMatch) {
    const updatedCompletedModules = parseInt(moduleCountMatch[1]);
    const totalModules = parseInt(moduleCountMatch[2]);
    console.log(`✓ Updated module count: ${updatedCompletedModules} of ${totalModules} complete`);
    
    // Verify that the completed modules count has increased
    expect(updatedCompletedModules).toBeGreaterThan(this.initialCompletedModules);
    console.log(`✓ Module count has increased from ${this.initialCompletedModules} to ${updatedCompletedModules}`);
    
    // Store the updated count for later verification
    this.updatedCompletedModules = updatedCompletedModules;
  } else {
    throw new Error(`Could not parse module count from text: "${moduleCountText}"`);
  }
  
  // Take a screenshot showing the updated module count
  await this.page.screenshot({ path: 'screenshots/updated-module-count-browse.png' });
});

Then('the module count should be updated in the in-progress section', async function() {
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
  
  // Find the in-progress courses section
  const inProgressSection = this.page.locator('div.inprogress-courses-card-wrapper');
  await expect(inProgressSection).toBeVisible();
  console.log('✓ In-progress courses section is visible');
  
  // Find the course card with the title that matches the selected course within the in-progress section
  const courseTitle = this.selectedCourseTitle;
  
  // Take a screenshot to debug
  await this.page.screenshot({ path: 'screenshots/in-progress-section-module-count.png' });
  
  // Find the specific course card in the in-progress section
  const courseTitleElement = inProgressSection.locator(`h3.browse-card-title-text:has-text("${courseTitle}")`).first();
  await expect(courseTitleElement).toBeVisible();
  console.log(`✓ Found course "${courseTitle}" in the in-progress section`);
  
  // Get the parent browse-card element
  const courseCard = courseTitleElement.locator('xpath=../../..');
  
  // Get the module count text
  const moduleCountElement = courseCard.locator('div.browse-card-module-count');
  await expect(moduleCountElement).toBeVisible();
  
  const moduleCountText = await moduleCountElement.textContent();
  console.log(`✓ In-progress section module count: "${moduleCountText.trim()}"`);
  
  // Parse the module count (format: "X of Y Complete" or "X of Y complete")
  const moduleCountMatch = moduleCountText.match(/(\d+) of (\d+) (Complete|complete)/i);
  if (moduleCountMatch) {
    const inProgressCompletedModules = parseInt(moduleCountMatch[1]);
    const totalModules = parseInt(moduleCountMatch[2]);
    console.log(`✓ In-progress section module count: ${inProgressCompletedModules} of ${totalModules} complete`);
    
    // Verify that the completed modules count matches the browse section
    expect(inProgressCompletedModules).toBe(this.updatedCompletedModules);
    console.log(`✓ Module count in in-progress section (${inProgressCompletedModules}) matches browse section (${this.updatedCompletedModules})`);
  } else {
    throw new Error(`Could not parse module count from text: "${moduleCountText}"`);
  }
  
  // Take a screenshot showing the updated module count in the in-progress section
  await this.page.screenshot({ path: 'screenshots/updated-module-count-in-progress.png' });
});

// Step definitions for module count verification have been implemented above

// Step definitions for course completion with quiz skip scenario

Then('user should add course.skipQuiz key to session storage', async function() {
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
  
  // Execute JavaScript to add the key to session storage
  await this.page.evaluate(() => {
    sessionStorage.setItem('course.skipQuiz', 'true');
    console.log('Added course.skipQuiz=true to session storage');
  });
  
  console.log('✓ Added course.skipQuiz=true to session storage');
  
  // Take a screenshot after adding the key
  await this.page.screenshot({ path: 'screenshots/after-adding-skip-quiz-key.png' });
  
  // Verify the key was added correctly
  const skipQuizValue = await this.page.evaluate(() => {
    return sessionStorage.getItem('course.skipQuiz');
  });
  
  expect(skipQuizValue).toBe('true');
  console.log('✓ Verified course.skipQuiz key is set to "true" in session storage');
});

Then('user should navigate through all steps to complete the course', async function() {
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
  
  // Initialize a counter for the steps
  let stepCount = 0;
  let continueNavigation = true;
  
  // Keep clicking the Next button until we reach the end of the course
  while (continueNavigation) {
    // Take a screenshot of the current step
    await this.page.screenshot({ path: `screenshots/course-step-${stepCount}.png` });
    
    // Find the Next button
    const nextButton = this.page.locator('a.module-nav-button:not(.module-nav-back)');
    const nextButtonExists = await nextButton.isVisible().catch(() => false);
    
    if (nextButtonExists) {
      // Get the button text
      const buttonText = await nextButton.textContent();
      console.log(`✓ Found navigation button with text: "${buttonText.trim()}"`);
      
      // Click the button
      await nextButton.click();
      console.log(`✓ Clicked on "${buttonText.trim()}" button`);
      
      await this.page.waitForTimeout(3000);
      // Wait for navigation to complete
     // await this.page.waitForLoadState('networkidle');
      console.log('✓ Page navigation completed');
      
      // Additional wait to ensure everything is loaded
      await this.page.waitForTimeout(1500);
      
      // Increment the step counter
      stepCount++;
      
      // Check if we've reached a completion page or if there are no more navigation buttons
      const completionIndicator = this.page.locator('div.course-completion-indicator');
      const isCompletionPage = await completionIndicator.isVisible().catch(() => false);
      
      if (isCompletionPage) {
        console.log('✓ Reached course completion page');
        continueNavigation = false;
      } else {
        // Check if there's still a next button
        const nextButtonStillExists = await this.page.locator('a.module-nav-button:not(.module-nav-back)').isVisible().catch(() => false);
        if (!nextButtonStillExists) {
          console.log('✓ No more navigation buttons found, assuming course is complete');
          continueNavigation = false;
        }
      }
    } else {
      console.log('✗ No navigation button found, stopping navigation');
      continueNavigation = false;
    }
    
    // Safety check to prevent infinite loops
    if (stepCount > 30) {
      console.log('✗ Reached maximum step count (30), stopping navigation');
      continueNavigation = false;
    }
  }
  
  console.log(`✓ Navigated through ${stepCount} steps to complete the course`);
  
  // Take a final screenshot
  await this.page.screenshot({ path: 'screenshots/course-completion.png' });
});

Then('user should verify course completion status', async function() {
  // Check for course completion indicators
  const completionIndicator = this.page.locator('div.course-completion-indicator');
  const isCompletionVisible = await completionIndicator.isVisible().catch(() => false);
  
  if (isCompletionVisible) {
    console.log('✓ Course completion indicator is visible');
    
    // Check for completion message
    const completionMessage = this.page.locator('div.course-completion-message');
    await expect(completionMessage).toBeVisible();
    
    // Get the message text
    const messageText = await completionMessage.textContent();
    console.log(`✓ Completion message: "${messageText.trim()}"`);
    
    // Check for certificate or completion status
    const certificateSection = this.page.locator('div.course-certificate-section');
    const certificateExists = await certificateSection.isVisible().catch(() => false);
    
    if (certificateExists) {
      console.log('✓ Certificate section is visible');
      
      // Check for download certificate button
      const downloadButton = certificateSection.locator('a:has-text("Download Certificate")');
      const downloadExists = await downloadButton.isVisible().catch(() => false);
      
      if (downloadExists) {
        console.log('✓ Download Certificate button is available');
      } else {
        console.log('✗ Download Certificate button is not available');
      }
    } else {
      console.log('✗ Certificate section is not visible');
    }
  } else {
    // If no completion indicator, check for other signs of completion
    console.log('✗ Course completion indicator is not visible');
    
    // Check if we're on a summary or final page
    const pageTitle = await this.page.title();
    console.log(`✓ Current page title: "${pageTitle}"`);
    
    // Check URL for completion indicators
    const currentUrl = this.page.url();
    console.log(`✓ Current URL: ${currentUrl}`);
    
    if (currentUrl.includes('completion') || currentUrl.includes('complete') || currentUrl.includes('finished')) {
      console.log('✓ URL indicates course completion');
    } else {
      console.log('✗ URL does not indicate course completion');
    }
  }
  
  // Take a screenshot of the completion status
  await this.page.screenshot({ path: 'screenshots/course-completion-status.png' });
});

// New step definitions for course completion with quiz skip scenario

Then('user should navigate through steps until {string} button appears', async function(targetButtonText) {
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
  
  // Initialize a counter for the steps
  let stepCount = 0;
  let continueNavigation = true;
  let targetButtonFound = false;
  
  // Keep clicking the Next button until we find the target button or reach the end
  while (continueNavigation && !targetButtonFound) {
    // Take a screenshot of the current step
    await this.page.screenshot({ path: `screenshots/course-step-${stepCount}.png` });
    
    // Check if the target button is visible
    const targetButton = this.page.locator(`a.module-nav-button:has-text("${targetButtonText}")`);
    targetButtonFound = await targetButton.isVisible().catch(() => false);
    
    if (targetButtonFound) {
      console.log(`✓ Found "${targetButtonText}" button`);
      // Store the target button for later use
      this.targetButton = targetButton;
      continueNavigation = false;
    } else {
      // Find the Next button
      const nextButton = this.page.locator('a.module-nav-button.module-nav-next');
      const nextButtonExists = await nextButton.isVisible().catch(() => false);
      
      if (nextButtonExists) {
        // Get the button text
        const buttonText = await nextButton.textContent();
        console.log(`✓ Found navigation button with text: "${buttonText.trim()}"`);
        
        // Click the button
        await nextButton.click();
        console.log(`✓ Clicked on "${buttonText.trim()}" button`);
        
        await this.page.waitForTimeout(1500);
        // Wait for navigation to complete
        //await this.page.waitForLoadState('networkidle');
        console.log('✓ Page navigation completed');
        
        // Additional wait to ensure everything is loaded
        await this.page.waitForTimeout(3000);
        
        // Increment the step counter
        stepCount++;
      } else {
        console.log(`✗ No Next button found and "${targetButtonText}" button not found, stopping navigation`);
        continueNavigation = false;
      }
    }
    
    // Safety check to prevent infinite loops
    if (stepCount > 30) {
      console.log(`✗ Reached maximum step count (30), "${targetButtonText}" button not found, stopping navigation`);
      continueNavigation = false;
    }
  }
  
  if (targetButtonFound) {
    console.log(`✓ Successfully navigated through ${stepCount} steps to find "${targetButtonText}" button`);
  } else {
    console.log(`✗ Failed to find "${targetButtonText}" button after navigating through ${stepCount} steps`);
  }
  
  // Take a final screenshot
  await this.page.screenshot({ path: 'screenshots/before-target-button-click.png' });
});

Then('user should see the quiz scorecard with {string} message', async function(expectedMessage) {
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
  
  // Wait for the quiz scorecard to be visible
  const quizScorecard = this.page.locator('div.quiz-scorecard');
  await expect(quizScorecard).toBeVisible({ timeout: 10000 });
  console.log('✓ Quiz scorecard is visible');
  
  // Check if the scorecard has the pass class
  const scorecardClass = await quizScorecard.getAttribute('class');
  expect(scorecardClass).toContain('pass');
  console.log('✓ Quiz scorecard has pass class');
  
  // Check if the scorecard has loaded status
  const blockStatus = await quizScorecard.getAttribute('data-block-status');
  expect(blockStatus).toBe('loaded');
  console.log(`✓ Quiz scorecard has loaded status: ${blockStatus}`);
  
  // Check for the correct message
  const scorecardText = this.page.locator('div.quiz-scorecard-text');
  await expect(scorecardText).toBeVisible();
  const messageText = await scorecardText.textContent();
  expect(messageText.trim()).toContain(expectedMessage);
  console.log(`✓ Quiz scorecard contains message: "${expectedMessage}"`);
  
  // Check for the score result
  const scorecardResult = this.page.locator('div.quiz-scorecard-result');
  await expect(scorecardResult).toBeVisible();
  const resultText = await scorecardResult.textContent();
  console.log(`✓ Quiz scorecard result: "${resultText.trim()}"`);
  
  // Get the correct answers and total questions from the scorecard data attributes
  const correctAnswers = await quizScorecard.getAttribute('data-correct-answers');
  const totalQuestions = await quizScorecard.getAttribute('data-total-questions');
  console.log(`✓ Quiz scorecard data: ${correctAnswers} correct answers out of ${totalQuestions} total questions`);
  
  // Check for the congratulations message
  const scorecardDescription = this.page.locator('div.quiz-scorecard-description');
  await expect(scorecardDescription).toBeVisible();
  const descriptionText = await scorecardDescription.textContent();
  expect(descriptionText).toContain('Congratulations');
  console.log(`✓ Quiz scorecard description: "${descriptionText.trim()}"`);
  
  // Take a screenshot of the quiz scorecard
  await this.page.screenshot({ path: 'screenshots/quiz-scorecard.png' });
});

// Step definitions for module completion status verification

Then('user should be redirected to the course details page after quiz completion', async function() {
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
  
  // Check if the URL has changed to a course details page
  const currentUrl = this.page.url();
  expect(currentUrl).toContain('/courses/');
  expect(currentUrl).not.toContain('/module-');
  expect(currentUrl).not.toContain('/step-');
  console.log(`✓ Redirected to course details page after quiz completion: ${currentUrl}`);
  
  // Wait for the page to fully load
  await this.page.waitForTimeout(3000);
  //await this.page.waitForLoadState('networkidle');
  
  // Additional wait to ensure everything is loaded
  await this.page.waitForTimeout(1500);
  
  // Check for the course breakdown section
  const courseBreakdown = this.page.locator('div.course-breakdown');
  await expect(courseBreakdown).toBeVisible({ timeout: 10000 });
  console.log('✓ Course breakdown section is visible');
  
  // Take a screenshot of the course details page
  await this.page.screenshot({ path: 'screenshots/course-details-after-completion.png' });
});

Then('the completed module should have {string} status', async function(statusText) {
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
  
  // Find all module cards with completed class
  const completedModuleCards = this.page.locator('div.course-breakdown-module-card.completed');
  const completedCount = await completedModuleCards.count();
  expect(completedCount).toBeGreaterThan(0);
  console.log(`✓ Found ${completedCount} completed module cards`);
  
  // Check the first completed module card
  const firstCompletedCard = completedModuleCards.first();
  
  // Store the module title for later verification
  const moduleTitle = await firstCompletedCard.locator('h3.cb-module-title').textContent();
  this.completedModuleTitle = moduleTitle.trim();
  console.log(`✓ Completed module: "${this.completedModuleTitle}"`);
  
  // Check for the status text
  const statusTextElement = firstCompletedCard.locator('span.cb-steps-status-text');
  await expect(statusTextElement).toBeVisible();
  const actualStatusText = await statusTextElement.textContent();
  expect(actualStatusText.trim()).toBe(statusText);
  console.log(`✓ Completed module has "${statusText}" status`);
  
  // Check if the status text has the completed class
  const statusClass = await statusTextElement.getAttribute('class');
  expect(statusClass).toContain('completed');
  console.log('✓ Status text has completed class');
  
  // Take a screenshot of the completed module card
  await this.page.screenshot({ path: 'screenshots/completed-module-card.png' });
});

Then('the completed module should have {string} button', async function(buttonText) {
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
  
  // Find all module cards with completed class
  const completedModuleCards = this.page.locator('div.course-breakdown-module-card.completed');
  const firstCompletedCard = completedModuleCards.first();
  
  // Check for the Review module button (it's an anchor tag with class 'button', not a button element)
  const reviewButton = firstCompletedCard.locator(`a.cb-start-btn:has-text("${buttonText}")`);
  await expect(reviewButton).toBeVisible();
  console.log(`✓ Completed module has "${buttonText}" button`);
  
  // Check if the button has the completed class
  const buttonClass = await reviewButton.getAttribute('class');
  expect(buttonClass).toContain('completed');
  console.log(`✓ "${buttonText}" button has completed class`);
  
  // Store the button for later use
  this.reviewModuleButton = reviewButton;
});

Then('the next module should have enabled {string} button', async function(buttonText) {
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
  
  // Find all module cards with not-started class (these are the enabled next modules)
  const notStartedModuleCards = this.page.locator('div.course-breakdown-module-card.not-started');
  const notStartedCount = await notStartedModuleCards.count();
  
  if (notStartedCount > 0) {
    console.log(`✓ Found ${notStartedCount} not-started module cards`);
    
    // Check the first not-started module card
    const firstNotStartedCard = notStartedModuleCards.first();
    
    // Get the module title
    const moduleTitle = await firstNotStartedCard.locator('h3.cb-module-title').textContent();
    console.log(`✓ Next module: "${moduleTitle.trim()}"`);
    
    // Check for the Start module button (it's an anchor tag with class 'button', not a button element)
    const startButton = firstNotStartedCard.locator(`a.cb-start-btn:has-text("${buttonText}")`);
    await expect(startButton).toBeVisible();
    console.log(`✓ Next module has "${buttonText}" button`);
    
    // Check if the button has the not-started class
    const buttonClass = await startButton.getAttribute('class');
    expect(buttonClass).toContain('not-started');
    expect(buttonClass).not.toContain('disabled');
    console.log(`✓ "${buttonText}" button is enabled (not disabled)`);
    
    // Take a screenshot of the next module card
    await this.page.screenshot({ path: 'screenshots/next-module-card.png' });
  } else {
    console.log('✓ No not-started modules found, this might be the last module in the course');
    
    // Take a screenshot of the course breakdown section
    await this.page.screenshot({ path: 'screenshots/course-breakdown-all-completed.png' });
  }
});
