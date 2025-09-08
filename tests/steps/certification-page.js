const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { performLogin } = require('../commonFunctions/login');
const { launchBrowser, closeBrowser } = require('../commonFunctions/launchbrowser');
const ENV = require('../../config.js');

setDefaultTimeout(90 * 1000);


Given('user is logged in to Experience League for certification validation', async function() {
  // Use the common login function to log in
  const result = await performLogin(this);
  
  // Wait for the page to stabilize
  await this.page.waitForTimeout(4000);
  
  // Verify we're on the Experience League homepage
  console.log("✓ Successfully logged in to Experience League");
});

When('user navigates to certification home page', async function() {
  // Navigate to the certification home page
  await this.page.goto(`${ENV.URL}/certification-home`);
  
  // Wait for the page to load
  await this.page.waitForTimeout(5000);
  
  console.log("✓ Navigated to certification home page");
});

Then('user should see {string} text in the marquee eyebrow', async function(expectedText) {
  // Find the marquee eyebrow element
  const marqueeEyebrow = this.page.locator('div.marquee-eyebrow');
  
  // Verify the element is visible
  await expect(marqueeEyebrow).toBeVisible({ timeout: 10000 });
  console.log("✓ Marquee eyebrow element is visible");
  
  // Get the text content of the element
  const actualText = await marqueeEyebrow.textContent();
  
  // Verify the text matches the expected text
  expect(actualText.trim()).toBe(expectedText);
  console.log(`✓ Marquee eyebrow text is "${actualText.trim()}" as expected`);
  
  // Take a screenshot for verification
  await this.page.screenshot({ path: 'certification-page.png' });
  console.log("✓ Screenshot captured for verification");
  
  // Clean up - close the browser
  if (this.browser) {
    await closeBrowser(this.browser);
    console.log("✓ Browser closed successfully");
  }
});

When('user clicks on the marquee-cta button', async function() {
  // Find the marquee-cta button with title "Go to Adobe Certification Portal"
  const marqueeCta = this.page.locator('.marquee .marquee-cta a[title="Go to Adobe Certification Portal"]');
  await expect(marqueeCta).toBeVisible({ timeout: 10000 });
  console.log("✓ Marquee CTA button is visible");
  
  // Get the href attribute to verify the URL
  this.marqueeCtaHref = await marqueeCta.getAttribute('href');
  console.log(`✓ Marquee CTA button href: ${this.marqueeCtaHref}`);
});

Then('user should be redirected to certification.adobe.com', async function() {
  // Verify the href contains certification.adobe.com
  expect(this.marqueeCtaHref).toContain('certification.adobe.com');
  console.log("✓ Marquee CTA button href contains certification.adobe.com");
  
  // Take a screenshot for verification
  await this.page.screenshot({ path: 'certification-page-marquee-cta.png' });
  console.log("✓ Screenshot captured for verification");
});

When('user clicks on first media-wrapper cta button primary', async function() {
  // Find any button that links to certification.adobe.com/certifications
  const primaryButton = this.page.locator('a[href*="certification.adobe.com/certifications"]').first();
  await expect(primaryButton).toBeVisible({ timeout: 10000 });
  console.log("✓ Primary certification button is visible");
  
  // Get the href attribute to verify the URL
  this.primaryButtonHref = await primaryButton.getAttribute('href');
  console.log(`✓ Primary certification button href: ${this.primaryButtonHref}`);
});

Then('user is navigated to certification certifications page', async function() {
  // Verify the href contains certification.adobe.com/certifications
  expect(this.primaryButtonHref).toContain('certification.adobe.com/certifications');
  console.log("✓ Primary CTA button href contains certification.adobe.com/certifications");
  
  // Take a screenshot for verification
  await this.page.screenshot({ path: 'certification-page-primary-cta.png' });
  console.log("✓ Screenshot captured for verification");
});

When('user clicks on first media-wrapper cta button secondary', async function() {
  // Find any button that links to certification.adobe.com/courses
  const secondaryButton = this.page.locator('a[href*="certification.adobe.com/courses"]').first();
  await expect(secondaryButton).toBeVisible({ timeout: 10000 });
  console.log("✓ Secondary certification button is visible");
  
  // Get the href attribute to verify the URL
  this.secondaryButtonHref = await secondaryButton.getAttribute('href');
  console.log(`✓ Secondary certification button href: ${this.secondaryButtonHref}`);
});

Then('user is redirected to certification courses page', async function() {
  // Verify the href contains certification.adobe.com/courses
  expect(this.secondaryButtonHref).toContain('certification.adobe.com/courses');
  console.log("✓ Secondary CTA button href contains certification.adobe.com/courses");
  
  // Take a screenshot for verification
  await this.page.screenshot({ path: 'certification-page-secondary-cta.png' });
  console.log("✓ Screenshot captured for verification");
});
