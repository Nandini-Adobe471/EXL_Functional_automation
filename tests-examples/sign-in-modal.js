const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { launchBrowser, closeBrowser } = require('../commonFunctions/launchbrowser');
const ENV = require('../../config.js');

setDefaultTimeout(90 * 1000);

Given('user navigates to Experience League homepage for signup validation', async function() {
  // Launch browser
  const result = await launchBrowser();
  this.page = result.page;
  this.browser = result.browser;
  this.context = result.context;
  
  // Navigate to the Experience League homepage
  await this.page.goto('https://experienceleague-stage.adobe.com/');
  
  // Wait for the page to fully load
  await this.page.waitForTimeout(3000);
  
  // Verify we're on the Experience League homepage
  await expect(this.page).toHaveURL(/.*experienceleague-stage\.adobe\.com.*/);
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
  await this.page.waitForTimeout(2000);
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
  // Make sure we have the create account link
  expect(this.createAccountLink).toBeDefined();
  
  // Click on the create account link
  await this.createAccountLink.click();
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
  const emailField = this.page.locator('input[aria-label="Email address"][id="Signup-EmailField"]');
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
  
  // Clean up - close the browser
  if (this.browser) {
    await closeBrowser(this.browser);
    console.log('Browser closed successfully');
  }
});
