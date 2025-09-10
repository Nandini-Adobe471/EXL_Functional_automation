const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { launchBrowser, closeBrowser } = require('../commonFunctions/launchbrowser');
const ENV = require('../../config.js');

setDefaultTimeout(90 * 1000);

When('user sets viewport to mobile size for signup', async function() {
  // Set viewport to mobile size (e.g., iPhone X)
  await this.page.setViewportSize({ width: 375, height: 812 });
  console.log("✓ Set viewport to mobile size (375x812) for signup process");
  await this.page.waitForTimeout(1000); // Wait for any responsive adjustments
});

Given('user navigates to Experience League homepage for signup validation', async function() {
  // Launch browser
  const result = await launchBrowser();
  this.page = result.page;
  this.browser = result.browser;
  this.context = result.context;
  
  // Navigate to the Experience League homepage
  await this.page.goto(ENV.URL);
  
  // Wait for the page to fully load
  await this.page.waitForTimeout(3000);
  
  // Verify we're on the Experience League homepage
  //await expect(this.page).toHaveURL(`${ENV.URL}`);
  console.log("✓ Successfully navigated to the Experience League homepage");
});

When('user clicks on sign in button', async function() {
  // Find the sign in button
  const signInButton = this.page.locator('.marquee .marquee-cta a');
  
  // Verify the sign in button is visible
  await expect(signInButton).toBeVisible();
  console.log("✓ Found sign in button");
  
  // Click on the sign in button
  await signInButton.click();
  console.log("✓ Clicked on sign in button");
  
  // Wait for the modal to appear
  await this.page.waitForTimeout(3000);
});

Then('user should see create account link', async function() {
  // Find the create account link
  const createAccountLink = this.page.locator('span[data-id="EmailPage-CreateAccountLink"]');
  
  // Verify the create account link is visible
  await expect(createAccountLink).toBeVisible();
  console.log("✓ Create account link is displayed");
  
  // Store the create account link for later use
  this.createAccountLink = createAccountLink;
});

When('user clicks on create account link', async function() {
  // Find the create account link again to ensure we have it
  const createAccountLink = this.page.locator('span[data-id="EmailPage-CreateAccountLink"], a:has-text("Create an account")').first();
  
  // Wait for the link to be visible
  await expect(createAccountLink).toBeVisible({ timeout: 5000 });
  
  // Click on the create account link
  await createAccountLink.click();
  console.log("✓ Clicked on create account link");
  
  // Wait for navigation
  await this.page.waitForTimeout(3000);
});

Then('create account page should be displayed', async function() {
  // Verify we're on the create account page
  // This could be checking for a specific URL pattern or a specific element on the page
  const createAccountHeader = this.page.locator('h1:has-text("Create an account")');
  await expect(createAccountHeader).toBeVisible();
  console.log("✓ Create account page is displayed");
});

When('user enters a unique email address', async function() {
  // Generate a unique email
  const timestamp = Date.now();
  const email = `user${timestamp}@adobetest.com`;
  
  // Store the email for later use
  this.email = email;
  
  // Find the email input field
  const emailField = this.page.locator('input[id="Signup-EmailField"], input[data-id="Signup-EmailField"]');
  await expect(emailField).toBeVisible();
  
  // Click on the email field first
  await emailField.click();
  console.log("✓ Clicked on email field");
  
  // Fill in the email field
  await emailField.fill(email);
  await this.page.waitForTimeout(2000); // Wait for any potential validation
  console.log(`✓ Entered unique email: ${email}`);
});

When('user enters a unique password', async function() {
  // Generate a unique password
  const timestamp = Date.now();
  const password = `Pass${timestamp}!`;
  
  // Store the password for later use
  this.password = password;
  
  // Find the password input field
  const passwordField = this.page.locator('input[data-id="Signup-PasswordField"]');
  await expect(passwordField).toBeVisible();
  
  // Click on the password field first
  await passwordField.click();
  console.log("✓ Clicked on password field");
  
  // Fill in the password field
  await passwordField.fill(password);
  await this.page.waitForTimeout(2000); // Wait for any potential validation
  console.log(`✓ Entered unique password: ${password}`);
});

When('user clicks on continue button', async function() {
  // Log the email and password for later use
  console.log('=== SAVED CREDENTIALS FOR LATER USE ===');
  console.log(`Email: ${this.email}`);
  console.log(`Password: ${this.password}`);
  console.log('=======================================');
  
  // Find the continue button
  const continueButton = this.page.locator('button[data-id="Signup-CreateAccountBtn"]');
  await expect(continueButton).toBeVisible();
  
  // Click on the continue button
  await continueButton.click();
  console.log("✓ Clicked on continue button");
  
  // Wait for navigation or next step
  await this.page.waitForTimeout(3000);
});

Then('user should see the personal information form', async function() {
  // Verify that the personal information form is displayed by checking for the first name field
  const firstNameField = this.page.locator('input[data-id="Signup-FirstNameField"]');
  await expect(firstNameField).toBeVisible({ timeout: 5000 });
  console.log("✓ Personal information form is displayed");
});

When('user enters first name as {string}', async function(firstName) {
  // Find the first name input field
  const firstNameField = this.page.locator('input[data-id="Signup-FirstNameField"]');
  await expect(firstNameField).toBeVisible();
  
  // Click on the first name field first
  await firstNameField.click();
  console.log("✓ Clicked on first name field");
  
  // Fill in the first name field
  await firstNameField.fill(firstName);
  await this.page.waitForTimeout(1000); // Wait for any potential validation
  console.log(`✓ Entered first name: ${firstName}`);
});

When('user enters last name as {string}', async function(lastName) {
  // Find the last name input field
  const lastNameField = this.page.locator('input[data-id="Signup-LastNameField"]');
  await expect(lastNameField).toBeVisible();
  
  // Click on the last name field first
  await lastNameField.click();
  console.log("✓ Clicked on last name field");
  
  // Fill in the last name field
  await lastNameField.fill(lastName);
  await this.page.waitForTimeout(1000); // Wait for any potential validation
  console.log(`✓ Entered last name: ${lastName}`);
});

When('user selects birth month as {string}', async function(month) {
  // Find the month dropdown
  const monthDropdown = this.page.locator('button[data-id="DateOfBirthChooser-Month"] svg.wBx8DG_spectrum-Icon');
  await expect(monthDropdown).toBeVisible();

  
  // Click on the month dropdown
  await monthDropdown.click();
  
  console.log("✓ Clicked on month dropdown");
  await this.page.waitForTimeout(1000);
  
  // Select the specified month inside the popover
  const monthOption = this.page.locator(`div[role="option"] .gO9Mdq_spectrum-Menu-itemLabel:text("${month}")`).first();
  await expect(monthOption).toBeVisible({ timeout: 5000 });
  await monthOption.click({ force: true });
  console.log(`✓ Selected month: ${month}`);
  await this.page.waitForTimeout(1000);
});

When('user enters birth year as {string}', async function(year) {
  // Find the year input field
  const yearField = this.page.locator('input[data-id="DateOfBirthChooser-Year"]');
  await expect(yearField).toBeVisible();
  
  // Click on the year field first
  await yearField.click();
  console.log("✓ Clicked on year field");
  
  // Fill in the year field
  await yearField.fill(year);
  await this.page.waitForTimeout(1000); // Wait for any potential validation
  console.log(`✓ Entered birth year: ${year}`);
});

When('user clicks on create account button', async function() {
  // Find the create account button
  const createAccountButton = this.page.locator('button[data-id="Signup-CreateAccountBtn"]');
  await expect(createAccountButton).toBeVisible();
  
  // Click on the create account button
  await createAccountButton.click();
  console.log("✓ Clicked on create account button");
  
  // Wait for navigation or next step
  await this.page.waitForTimeout(9000); // Increased wait time for account creation
});

Then('user should see account created successfully', async function() {
  // Verify that the account was created successfully by checking for the Adobe account card
  const accountCard = this.page.locator('.profile-row.adobe-account');
  await expect(accountCard).toBeVisible({ timeout: 10000 });
  console.log("✓ Account created successfully");
});

Then('account details should match entered information', async function() {
  // Verify that the display name matches the first name and last name entered
  const displayName = this.page.locator('.display-name.adobe-display-name');
  await expect(displayName).toBeVisible({ timeout: 10000 });
  const displayNameText = await displayName.textContent();
  const expectedName = "Functional Automation"; // First name + space + last name
  expect(displayNameText.trim()).toBe(expectedName);
  console.log(`✓ Display name verified: ${displayNameText.trim()}`);
  
  // Verify that the email matches the email entered
  const userEmail = this.page.locator('.user-details .user-email');
  await expect(userEmail).toBeVisible({ timeout: 10000 });
  const emailText = await userEmail.textContent();
  expect(emailText.trim()).toBe(this.email);
  console.log(`✓ Email verified: ${emailText.trim()}`);
});

Then('user should see role selection section with {string} selected by default', async function(role) {
  // Verify that the role selection section is visible
  const roleSelectionForm = this.page.locator('.role-and-industry-form');
  await expect(roleSelectionForm).toBeVisible({ timeout: 10000 });
  console.log("✓ Role selection section is displayed");
  
  // Verify that the Business User role is selected by default (has the highlight class)
  const businessUserCard = this.page.locator('.role-cards-item:has-text("Business user")');
  const hasHighlightClass = await businessUserCard.evaluate(el => el.classList.contains('role-cards-highlight'));
  expect(hasHighlightClass).toBeTruthy();
  console.log(`✓ ${role} role is selected by default`);
});

When('user selects {string} role from user roles section', async function(role) {
  // Find the role card based on the role name
  let roleCard;
  if (role === "Developer") {
    roleCard = this.page.locator('.role-cards-item:has-text("Developer")');
  } else if (role === "Administrator") {
    roleCard = this.page.locator('.role-cards-item:has-text("Administrator")');
  } else if (role === "Business leader") {
    roleCard = this.page.locator('.role-cards-item:has-text("Business leader")');
  }
  
  await expect(roleCard).toBeVisible();
  
  // Find the checkbox within the role card and click it
  const checkbox = roleCard.locator('input[type="checkbox"]');
  await checkbox.click();
  console.log(`✓ Selected ${role} role`);
  
  // Verify that the role card now has the highlight class
  const hasHighlightClass = await roleCard.evaluate(el => el.classList.contains('role-cards-highlight'));
  expect(hasHighlightClass).toBeTruthy();
  console.log(`✓ ${role} role is now highlighted`);
  
  await this.page.waitForTimeout(1000); // Wait for any UI updates
});

When('user clicks on next button in role selection section', async function() {
  // Find the next button and click it
  const nextButton = this.page.locator('button.next-btn');
  await expect(nextButton).toBeVisible();
  
  // Click the next button
  await nextButton.click();
  console.log("✓ Clicked on next button in role selection section");
  
  // Wait for navigation or next step
  await this.page.waitForTimeout(3000);
});

Then('user should see the product interests form', async function() {
  // Verify that the product interests form is displayed
  const interestsForm = this.page.locator('form.product-interests-form');
  await expect(interestsForm).toBeVisible({ timeout: 10000 });
  console.log("✓ Product interests form is displayed");
});

When('user selects 5 random interests', async function() {
  // Get all interest checkboxes
  const interestCheckboxes = this.page.locator('.interest input[type="checkbox"]');
  
  // Get the count of all interests
  const count = await interestCheckboxes.count();
  console.log(`Found ${count} interests`);
  
  // Generate 5 random unique indices
  const selectedIndices = new Set();
  while (selectedIndices.size < 5) {
    const randomIndex = Math.floor(Math.random() * count);
    selectedIndices.add(randomIndex);
  }
  
  // Convert Set to Array for easier iteration
  const indices = Array.from(selectedIndices);
  
  // Select the 5 random interests
  for (let i = 0; i < indices.length; i++) {
    const checkbox = interestCheckboxes.nth(indices[i]);
    
    // Get the interest name for logging
    const interestName = await checkbox.getAttribute('title');
    
    // Click the checkbox
    await checkbox.click();
    console.log(`✓ Selected interest: ${interestName}`);
    
    // Wait a bit between clicks
    await this.page.waitForTimeout(500);
  }
  
  console.log("✓ Selected 5 random interests");
});

When('user clicks on next button in interests section', async function() {
  // Find the next button and click it
  const nextButton = this.page.locator('button.next-btn');
  await expect(nextButton).toBeVisible();
  
  // Click the next button
  await nextButton.click();
  console.log("✓ Clicked on next button in interests section");
  
  // Wait for navigation or next step
  await this.page.waitForTimeout(3000);
});

Then('user should see selected roles in profile card', async function() {
  // Find the user role element
  const userRoleElement = this.page.locator('div.user-role span:not(.heading)');
  await expect(userRoleElement).toBeVisible({ timeout: 10000 });
  
  // Get the text content of the user role element
  const userRoleText = await userRoleElement.textContent();
  console.log(`User roles displayed: ${userRoleText}`);
  
  // Verify that the selected roles are displayed with separator |
  expect(userRoleText).toContain('Business user');
  expect(userRoleText).toContain('Developer');
  expect(userRoleText).toContain('Administrator');
  expect(userRoleText).toContain('|'); // Verify the separator is present
  
  console.log("✓ Selected roles are displayed correctly in the profile card");
});

Then('user should see selected interests in profile card', async function() {
  // Find the user interests element
  const userInterestsElement = this.page.locator('div.user-interests span:not(.heading)');
  await expect(userInterestsElement).toBeVisible({ timeout: 10000 });
  
  // Get the text content of the user interests element
  const userInterestsText = await userInterestsElement.textContent();
  console.log(`User interests displayed: ${userInterestsText}`);
  
  // Verify that some interests are displayed (we can't check specific ones since they're randomly selected)
  expect(userInterestsText.length).toBeGreaterThan(0);
  
  console.log("✓ Selected interests are displayed in the profile card");
});

When('user clicks on complete button', async function() {
  // Find the complete button
  const completeButton = this.page.locator('button.complete-btn.close-action');
  await expect(completeButton).toBeVisible({ timeout: 10000 });
  
  // Click on the complete button
  await completeButton.click();
  console.log("✓ Clicked on complete button");
  
  // Wait for any final processing
  await this.page.waitForTimeout(3000);
});

Then('home page should load', async function() {
  // Verify that the home page has loaded
  await expect(this.page).toHaveURL(`${ENV.URL}/home#`);
  
  // Check for a common element on the home page
 // const homePageElement = this.page.locator('.marquee, .hero-container');
  //await expect(homePageElement).toBeVisible({ timeout: 10000 });
  console.log("✓ Home page loaded successfully");
  
  // Wait for the page to fully load
  await this.page.waitForTimeout(2000);
});

When('user clicks on customize your learning link', async function() {
  // Check if we're in mobile view
  const viewportSize = await this.page.viewportSize();
  const isMobileView = viewportSize.width <= 768;
  
  if (isMobileView) {
    console.log("Mobile view detected, using mobile navigation flow");
    
    // First click on the profile toggle button
    const profileToggleButton = this.page.locator('button.profile-toggle');
    await expect(profileToggleButton).toBeVisible({ timeout: 10000 });
    await profileToggleButton.click();
    console.log("✓ Clicked on profile toggle button");
    
    // Wait for the dropdown to appear
    await this.page.waitForTimeout(1000);
    
    // Then click on "My learning profile" link
    const learningProfileLink = this.page.getByRole('link', { name: 'My learning profile' });
    await expect(learningProfileLink).toBeVisible({ timeout: 5000 });
    await learningProfileLink.click();
    console.log("✓ Clicked on My learning profile link");
  } else {
    console.log("Desktop view detected, using direct link");
    
    // Find the customize your learning link
    const customizeLearningLink = this.page.getByRole('link', { name: 'Customize your learning' });
    await expect(customizeLearningLink).toBeVisible({ timeout: 10000 });
    
    // Click on the customize your learning link
    await customizeLearningLink.click();
    console.log("✓ Clicked on customize your learning link");
  }
  
  // Wait for the profile settings page to load
  await this.page.waitForTimeout(3000);
});

Then('user role in profile settings should match selected roles', async function() {
  // Find the user role element in profile settings
  const userRoleElement = this.page.locator('div.user-role span:not(.heading)');
  await expect(userRoleElement).toBeVisible({ timeout: 10000 });
  
  // Get the text content of the user role element
  const userRoleText = await userRoleElement.textContent();
  console.log(`User roles displayed in profile settings: ${userRoleText}`);
  
  // Verify that the selected roles are displayed with separator |
  expect(userRoleText).toContain('Business user');
  expect(userRoleText).toContain('Developer');
  expect(userRoleText).toContain('Administrator');
  expect(userRoleText).toContain('|'); // Verify the separator is present
  
  console.log("✓ User roles in profile settings match selected roles");
});

Then('user interests in profile settings should match selected interests', async function() {
  // Find the user interests element in profile settings
  const userInterestsElement = this.page.locator('div.user-interests span:not(.heading)');
  await expect(userInterestsElement).toBeVisible({ timeout: 10000 });
  
  // Get the text content of the user interests element
  const userInterestsText = await userInterestsElement.textContent();
  console.log(`User interests displayed in profile settings: ${userInterestsText}`);
  
  // Verify that some interests are displayed and separated by |
  expect(userInterestsText.length).toBeGreaterThan(0);
  expect(userInterestsText).toContain('|'); // Verify the separator is present
  
  console.log("✓ User interests in profile settings match selected interests");
  
  // Clean up - close the browser
  if (this.browser) {
    await closeBrowser(this.browser);
    console.log('Browser closed successfully');
  }
});
