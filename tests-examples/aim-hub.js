const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { launchBrowser, closeBrowser } = require('../commonFunctions/launchbrowser');
const ENV = require('../../config.js');

setDefaultTimeout(90 * 1000);

Given('user launches the EXLM application', async function() {
  // Launch browser
  const result = await launchBrowser();
  this.page = result.page;
  this.browser = result.browser;
  this.context = result.context;
  
  // Navigate to EXLM application
  await this.page.goto(ENV.URL);
  await this.page.waitForTimeout(3000);
  
  console.log("✓ Successfully launched EXLM application");
});

When('user creates a new account and completes sign up', async function() {
  // Click on sign in button in marquee
  const signInButton = this.page.locator('.marquee .marquee-cta a');
  await expect(signInButton).toBeVisible();
  await signInButton.click();
  console.log("✓ Clicked on sign in button");
  
  await this.page.waitForTimeout(3000);
  
  // Click on create account link
  const createAccountLink = this.page.locator('span[data-id="EmailPage-CreateAccountLink"]');
  await expect(createAccountLink).toBeVisible();
  await createAccountLink.click();
  console.log("✓ Clicked on create account link");
  
  await this.page.waitForTimeout(3000);
  
  // Generate unique email and password
  const timestamp = Date.now();
  const email = `user${timestamp}@adobetest.com`;
  const password = `Pass${timestamp}!`;
  
  // Enter email
  const emailField = this.page.locator('input[data-id="Signup-EmailField"]');
  await expect(emailField).toBeVisible();
  await emailField.fill(email);
  console.log(`✓ Entered email: ${email}`);
  
  await this.page.waitForTimeout(1000);
  
  // Enter password
  const passwordField = this.page.locator('input[data-id="Signup-PasswordField"]');
  await expect(passwordField).toBeVisible();
  await passwordField.fill(password);
  console.log(`✓ Entered password: ${password}`);
  
  await this.page.waitForTimeout(1000);
  
  // Click continue button
  const continueButton = this.page.locator('button[data-id="Signup-CreateAccountBtn"]');
  await expect(continueButton).toBeVisible();
  await continueButton.click();
  console.log("✓ Clicked on continue button");
  
  await this.page.waitForTimeout(3000);
  
  // Fill personal information
  const firstNameField = this.page.locator('input[data-id="Signup-FirstNameField"]');
  await expect(firstNameField).toBeVisible();
  await firstNameField.fill('Test');
  console.log("✓ Entered first name");
  
  const lastNameField = this.page.locator('input[data-id="Signup-LastNameField"]');
  await lastNameField.fill('User');
  console.log("✓ Entered last name");
  
  // Select birth month
  const monthDropdown = this.page.locator('button[data-id="DateOfBirthChooser-Month"] svg.wBx8DG_spectrum-Icon');
  await monthDropdown.click();
  await this.page.waitForTimeout(1000);
  
  const monthOption = this.page.locator('div[role="option"] .gO9Mdq_spectrum-Menu-itemLabel:text("January")').first();
  await monthOption.click();
  console.log("✓ Selected birth month");
  
  await this.page.waitForTimeout(1000);
  
  // Enter birth year
  const yearField = this.page.locator('input[data-id="DateOfBirthChooser-Year"]');
  await yearField.fill('1990');
  console.log("✓ Entered birth year");
  
  await this.page.waitForTimeout(1000);
  
  // Click create account button
  const createAccountButton = this.page.locator('button[data-id="Signup-CreateAccountBtn"]');
  await createAccountButton.click();
  console.log("✓ Clicked on create account button");
  
  // Wait for account creation and role selection
  await this.page.waitForTimeout(15000);
  
  // Check if we're on role selection page or already on product interests page
  const productInterestsWrapper = await this.page.locator('.product-interests-wrapper').isVisible().catch(() => false);
  
  if (!productInterestsWrapper) {
    // We're on role selection page, click next button
    const nextButton = this.page.locator('button.next-btn');
    const isNextButtonVisible = await nextButton.isVisible().catch(() => false);
    
    if (isNextButtonVisible) {
      await nextButton.click();
      console.log("✓ Clicked next button in role selection");
      await this.page.waitForTimeout(3000);
    } else {
      console.log("Next button not found, checking for complete button");
      
      // Try complete button instead
      const completeButton = this.page.locator('button.complete-btn');
      const isCompleteButtonVisible = await completeButton.isVisible().catch(() => false);
      
      if (isCompleteButtonVisible) {
        await completeButton.click();
        console.log("✓ Clicked complete button");
        await this.page.waitForTimeout(3000);
      } else {
        console.log("Neither next nor complete button found, proceeding anyway");
      }
    }
  } else {
    console.log("Already on product interests page");
  }
  
  console.log("✓ User sign up completed");
});

Then('user should be on the product interests page', async function() {
  // Wait for product interests page to load
  await this.page.waitForTimeout(3000);
  
  // Verify product interests form is visible
  const interestsForm = this.page.locator('form.product-interests-form');
  await expect(interestsForm).toBeVisible({ timeout: 10000 });
  console.log("✓ User is on product interests page");
});

Then('"AI Training" checkbox should not be checked in product interests wrapper', async function() {
  // Get all interest checkboxes
  const interestCheckboxes = this.page.locator('.interest input[type="checkbox"]');
  const count = await interestCheckboxes.count();
  console.log(`Found ${count} interest checkboxes`);
  
  // Find AI Training checkbox by title attribute
  let aiTrainingCheckbox = null;
  for (let i = 0; i < count; i++) {
    const checkbox = interestCheckboxes.nth(i);
    const title = await checkbox.getAttribute('title');
    if (title === 'AI Training') {
      aiTrainingCheckbox = checkbox;
      break;
    }
  }
  
  expect(aiTrainingCheckbox).not.toBeNull();
  console.log("✓ Found AI Training checkbox");
  
  // Verify checkbox is not checked
  const isChecked = await aiTrainingCheckbox.isChecked();
  expect(isChecked).toBe(false);
  
  console.log("✓ AI Training checkbox is not checked in product interests wrapper");
});

When('user navigates to the browse courses page', async function() {
  // Navigate to courses page
  await this.page.goto(`${ENV.URL}/courses`);
  await this.page.waitForTimeout(3000);
  
  console.log("✓ Navigated to browse courses page");
});

Then('the browse courses block should be visible', async function() {
  // Find browse courses block
  const browseCoursesBlock = this.page.locator('.browse-courses.block');
  await expect(browseCoursesBlock).toBeVisible();
  
  console.log("✓ Browse courses block is visible");
});

When('user opens the Product filter dropdown', async function() {
  // Find and click on Product filter dropdown
  const productDropdown = this.page.locator('.product-dropdown-container .custom-filter-dropdown button');
  await expect(productDropdown).toBeVisible();
  
  await productDropdown.click();
  await this.page.waitForTimeout(1000);
  
  console.log("✓ Opened Product filter dropdown");
});

When('user selects "AI Training" from product dropdown', async function() {
  // Find AI Training label in the dropdown (checkbox is hidden, so click on label)
  const aiTrainingLabel = this.page.locator('label[for="option-product-dropdown-4"]');
  await expect(aiTrainingLabel).toBeVisible();
  
  // Click on the label
  await aiTrainingLabel.click();
  await this.page.waitForTimeout(1000);
  
  console.log("✓ Selected AI Training from product dropdown");
  
  // Close the dropdown by clicking elsewhere or on the button again
  const productDropdown = this.page.locator('.product-dropdown-container .custom-filter-dropdown button');
  await productDropdown.click();
  await this.page.waitForTimeout(1000);
});

Then('"AI Training" filter should be applied', async function() {
  // Wait for filter to be applied
  await this.page.waitForTimeout(2000);
  
  // Take a screenshot for debugging
  await this.page.screenshot({ path: 'screenshots/ai-training-filter-applied.png' });
  
  // Check the visible card solution tags after filtering
  const visibleCardTags = await this.page.locator('div.browse-card-solution-text')
    .evaluateAll(tags => tags.map(tag => tag.textContent.trim()));
  
  console.log('Visible card solution tags after filtering:', visibleCardTags);
  
  // Check if the visible cards include AI Training or multisolution
  const hasFilteredCards = visibleCardTags.some(tag => 
    tag === 'AI Training' || tag === 'multisolution');
  
  expect(hasFilteredCards).toBeTruthy();
  console.log("✓ AI Training filter is applied - cards show correct solution tags");
});

When('user clicks on the profile toggle button', async function() {
  // Find and click profile toggle button
  const profileToggle = this.page.locator('.profile-toggle, button[aria-label*="profile"], .profile-button').first();
  await expect(profileToggle).toBeVisible();
  
  await profileToggle.click();
  await this.page.waitForTimeout(1000);
  
  console.log("✓ Clicked on profile toggle button");
});

When('user selects "My Learning profile" from dropdown', async function() {
  // Find and click on My Learning profile option
  const myLearningProfile = this.page.locator('text=My Learning profile, a[href*="profile"]').first();
  await expect(myLearningProfile).toBeVisible();
  
  await myLearningProfile.click();
  await this.page.waitForTimeout(3000);
  
  console.log("✓ Selected My Learning profile from dropdown");
});

Then('user should be on My Learning profile page', async function() {
  // Verify URL contains profile
  const currentUrl = this.page.url();
  expect(currentUrl).toContain('profile');
  
  console.log("✓ User is on My Learning profile page");
});

When('user navigates to profile interests section', async function() {
  // Find profile interests section
  const profileInterests = this.page.locator('.profile-interests, .product-interests, [class*="interest"]').first();
  
  // Scroll to interests section if needed
  await profileInterests.scrollIntoViewIfNeeded();
  await this.page.waitForTimeout(1000);
  
  console.log("✓ Navigated to profile interests section");
});

Then('"AI Training" should be checked in profile interests', async function() {
  // Get all interest checkboxes in profile
  const interestCheckboxes = this.page.locator('.interest input[type="checkbox"]');
  const count = await interestCheckboxes.count();
  console.log(`Found ${count} interest checkboxes in profile`);
  
  // Find AI Training checkbox by title attribute
  let aiTrainingCheckbox = null;
  for (let i = 0; i < count; i++) {
    const checkbox = interestCheckboxes.nth(i);
    const title = await checkbox.getAttribute('title');
    if (title === 'AI Training') {
      aiTrainingCheckbox = checkbox;
      break;
    }
  }
  
  expect(aiTrainingCheckbox).not.toBeNull();
  console.log("✓ Found AI Training checkbox in profile interests");
  
  // Verify checkbox is checked
  const isChecked = await aiTrainingCheckbox.isChecked();
  expect(isChecked).toBe(true);
  
  console.log("✓ AI Training is checked in profile interests");
  
  // Clean up - close the browser
  if (this.browser) {
    await closeBrowser(this.browser);
    console.log('Browser closed successfully');
  }
});
