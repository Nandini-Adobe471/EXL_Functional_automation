const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { performLogin } = require('../commonFunctions/login');
const ENV = require('../../config.js');

// Set timeout for all steps
setDefaultTimeout(60 * 1000);

// Note: Many step definitions are reused from Auth-course.js
// This file only contains the additional step definitions needed for the Course-End-to-End.feature

Then('user should check if redirected to certificate page', async function() {
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
  
  // Check if the course-completion-container is visible
  const completionContainer = this.page.locator('div.course-completion-container');
  const isCertificatePage = await completionContainer.isVisible().catch(() => false);
  
  // Store the result for later use
  this.isCertificatePage = isCertificatePage;
  
  if (isCertificatePage) {
    console.log('✓ User is on the certificate page');
  } else {
    console.log('✓ User is not on the certificate page yet, will continue to next modules');
  }
  
  // Take a screenshot of the current page
  await this.page.screenshot({ path: 'screenshots/after-next-button-click.png' });
});

Then('user should continue to next modules if certificate page is not shown', async function() {
  // Skip this step if already on certificate page
  if (this.isCertificatePage) {
    console.log('✓ Already on certificate page, skipping this step');
    return;
  }
  
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
  
  // Initialize a counter for the modules
  let moduleCount = 0;
  let certificateFound = false;
  
  // Keep navigating through modules until we find the certificate page or reach a limit
  while (!certificateFound && moduleCount < 10) { // Safety limit of 10 modules
    console.log(`Attempting module ${moduleCount + 1}`);
    
    // Check if we're on a module page with a step filter dropdown
    const stepFilterDropdown = this.page.locator('div.custom-filter-dropdown[data-variant="anchor-menu"]');
    const hasStepFilter = await stepFilterDropdown.isVisible().catch(() => false);
    
    if (hasStepFilter) {
      console.log('✓ Found step filter dropdown');
      
      // Click on the dropdown button to see the options
      const dropdownButton = stepFilterDropdown.locator('button');
      await dropdownButton.click();
      console.log('✓ Clicked on step filter dropdown button');
      
      // Wait for the dropdown content to be visible
      const dropdownContent = stepFilterDropdown.locator('div.filter-dropdown-content');
      await expect(dropdownContent).toBeVisible();
      
      // Look for "Module Quiz" option
      const filterOptions = dropdownContent.locator('div.custom-checkbox');
      const optionsCount = await filterOptions.count();
      console.log(`✓ Found ${optionsCount} filter options`);
      
      let quizOptionFound = false;
      
      // Look for Module Quiz option
      for (let i = 0; i < optionsCount; i++) {
        const option = filterOptions.nth(i);
        const optionLink = option.locator('label a.title');
        const optionText = await optionLink.textContent().catch(() => '');
        
        if (optionText.includes('Module Quiz')) {
          console.log(`✓ Found "Module Quiz" option at index ${i}`);
          
          // Click on the Module Quiz option
          await optionLink.click();
          console.log('✓ Clicked on Module Quiz option');
          
          // Wait for navigation to complete
          await this.page.waitForLoadState('networkidle');
          console.log('✓ Navigation completed');
          
          // Additional wait to ensure everything is loaded
          await this.page.waitForTimeout(3000);
          
          quizOptionFound = true;
          break;
        }
      }
      
      if (!quizOptionFound) {
        console.log('✗ Module Quiz option not found, looking for Recap or Key Takeaways');
        
        // Look for Recap or Key Takeaways option as an alternative
        for (let i = 0; i < optionsCount; i++) {
          const option = filterOptions.nth(i);
          const optionLink = option.locator('label a.title');
          const optionText = await optionLink.textContent().catch(() => '');
          
          if (optionText.includes('Recap') || optionText.includes('Key Takeaways')) {
            console.log(`✓ Found "Recap/Key Takeaways" option at index ${i}`);
            
            // Click on the option
            await optionLink.click();
            console.log('✓ Clicked on Recap/Key Takeaways option');
            
            // Wait for navigation to complete
            await this.page.waitForLoadState('networkidle');
            console.log('✓ Navigation completed');
            
            // Additional wait to ensure everything is loaded
            await this.page.waitForTimeout(3000);
            
            quizOptionFound = true;
            break;
          }
        }
      }
      
      if (!quizOptionFound) {
        console.log('✗ No Quiz or Recap options found, will try to click Next button');
      }
    } else {
      console.log('✗ No step filter dropdown found on this page');
    }
    
    // Look for Take Quiz button
    const takeQuizButton = this.page.locator('a.module-nav-button:has-text("Take quiz")');
    const hasTakeQuizButton = await takeQuizButton.isVisible().catch(() => false);
    
    if (hasTakeQuizButton) {
      console.log('✓ Found Take Quiz button');
      
      // Click on the Take Quiz button
      await takeQuizButton.click();
      console.log('✓ Clicked on Take Quiz button');
      
      // Wait for navigation to complete
      await this.page.waitForLoadState('networkidle');
      console.log('✓ Navigation completed');
      
      // Additional wait to ensure everything is loaded
      await this.page.waitForTimeout(3000);
      
      // Check for quiz scorecard
      const quizScorecard = this.page.locator('div.quiz-scorecard');
      const hasQuizScorecard = await quizScorecard.isVisible().catch(() => false);
      
      if (hasQuizScorecard) {
        console.log('✓ Found quiz scorecard');
        
        // Look for Next button
        const nextButton = this.page.locator('a.module-nav-button.module-nav-next');
        const hasNextButton = await nextButton.isVisible().catch(() => false);
        
        if (hasNextButton) {
          console.log('✓ Found Next button');
          
          // Click on the Next button
          await nextButton.click();
          console.log('✓ Clicked on Next button');
          
          // Wait for navigation to complete
          await this.page.waitForLoadState('networkidle');
          console.log('✓ Navigation completed');
          
          // Additional wait to ensure everything is loaded
          await this.page.waitForTimeout(3000);
        }
      }
    } else {
      // If no Take Quiz button, look for Next button
      const nextButton = this.page.locator('a.module-nav-button.module-nav-next');
      const hasNextButton = await nextButton.isVisible().catch(() => false);
      
      if (hasNextButton) {
        console.log('✓ Found Next button');
        
        // Click on the Next button
        await nextButton.click();
        console.log('✓ Clicked on Next button');
        
        // Wait for navigation to complete
        await this.page.waitForLoadState('networkidle');
        console.log('✓ Navigation completed');
        
        // Additional wait to ensure everything is loaded
        await this.page.waitForTimeout(3000);
      } else {
        console.log('✗ No Next button found, will check for certificate page');
      }
    }
    
    // Check if we're now on the certificate page
    const completionContainer = this.page.locator('div.course-completion-container');
    certificateFound = await completionContainer.isVisible().catch(() => false);
    
    if (certificateFound) {
      console.log('✓ Certificate page found!');
      this.isCertificatePage = true;
      break;
    }
    
    // Increment the module counter
    moduleCount++;
    
    // Take a screenshot of the current state
    await this.page.screenshot({ path: `screenshots/module-navigation-${moduleCount}.png` });
  }
  
  if (!certificateFound) {
    console.log(`✗ Certificate page not found after trying ${moduleCount} modules`);
  } else {
    console.log(`✓ Certificate page found after navigating through ${moduleCount} modules`);
  }
});

Then('user should be redirected to the certificate-of-completion page', async function() {
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
  
  // Check if the URL has changed to a certificate-of-completion page
  const currentUrl = this.page.url();
  console.log(`Current URL: ${currentUrl}`);
  
  // Wait for the course-completion-container to be visible
  const completionContainer = this.page.locator('div.course-completion-container');
  await expect(completionContainer).toBeVisible({ timeout: 10000 });
  console.log('✓ Certificate of completion page is visible');
  
  // Check if the completion container has loaded status
  const blockStatus = await completionContainer.getAttribute('data-section-status');
  expect(blockStatus).toBe('loaded');
  console.log(`✓ Certificate of completion container has loaded status: ${blockStatus}`);
  
  // Take a screenshot of the certificate page
  await this.page.screenshot({ path: 'screenshots/certificate-of-completion-page.png' });
});

Then('user should see the certificate displayed on the page', async function() {
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
  
  // Check for the certificate canvas
  const certificateCanvas = this.page.locator('canvas.course-completion-certificate');
  await expect(certificateCanvas).toBeVisible({ timeout: 10000 });
  console.log('✓ Certificate canvas is visible');
  
  // Check for the confetti canvas
  const confettiCanvas = this.page.locator('canvas.course-completion-confetti-canvas');
  await expect(confettiCanvas).toBeVisible();
  console.log('✓ Confetti canvas is visible');
  
  // Take a screenshot of the certificate
  await this.page.screenshot({ path: 'screenshots/certificate-display.png' });
});

Then('user should see the {string} button', async function(buttonText) {
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
  
  // Find the button container
  const buttonContainer = this.page.locator('div.course-completion-button-container');
  await expect(buttonContainer).toBeVisible();
  console.log('✓ Button container is visible');
  
  // Find the specific button
  let buttonSelector;
  if (buttonText === "Share with your network") {
    buttonSelector = 'button.linkedin-share';
  } else if (buttonText === "Download") {
    buttonSelector = 'button.download-certificate';
  } else {
    buttonSelector = `button:has-text("${buttonText}")`;
  }
  
  const button = buttonContainer.locator(buttonSelector);
  await expect(button).toBeVisible();
  console.log(`✓ "${buttonText}" button is visible`);
  
  // Store the button for later use
  if (buttonText === "Download") {
    this.downloadButton = button;
  } else if (buttonText === "Share with your network") {
    this.shareButton = button;
  }
  
  // Take a screenshot showing the button
  await this.page.screenshot({ path: `screenshots/certificate-${buttonText.toLowerCase().replace(/\s+/g, '-')}-button.png` });
});

Then('the certificate should be downloaded successfully', async function() {
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
  
  // Create a download promise before clicking the button
  const downloadPromise = this.page.waitForEvent('download');
  
  // Click the download button
  await this.downloadButton.click();
  console.log('✓ Clicked on the Download button');
  
  // Wait for the download to start
  const download = await downloadPromise;
  console.log(`✓ Download started: ${download.suggestedFilename()}`);
  
  // Wait for the download to complete
  const path = await download.path();
  console.log(`✓ Certificate downloaded to: ${path}`);
  
  // Take a screenshot after download
  await this.page.screenshot({ path: 'screenshots/after-certificate-download.png' });
  
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
});

When('user navigates back to the home page', async function() {
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
  
  // Navigate to the home page
  await this.page.goto(`${ENV.URL}/home`);
  console.log('✓ Navigated back to the home page');
  
  // Wait for the page to load
  await this.page.waitForLoadState('networkidle');
  console.log('✓ Home page loaded');
  
  // Take a screenshot of the home page
  await this.page.screenshot({ path: 'screenshots/unauth-home-page-after-navigation.png' });
});

When('user clicks on {string} link', async function(linkText) {
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
  
  // Find and click on the Achievements and Awards link from the profile rail block (excluding hidden overlay)
  const awardsLink = this.page.locator('div.profile-rail.block a[href="/en/home/awards"]');
  await expect(awardsLink).toBeVisible();
  console.log(`✓ Found "${linkText}" link`);
  
  // Click on the link
  await awardsLink.click();
  console.log(`✓ Clicked on "${linkText}" link`);
  
  // Wait for navigation to complete
  await this.page.waitForLoadState('networkidle');
  console.log('✓ Navigation completed');
  
  // Take a screenshot after clicking the link
  await this.page.screenshot({ path: 'screenshots/after-awards-link-click.png' });
});

Then('user should be navigated to awards page', async function() {
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
  
  // Check if the URL has changed to the awards page
  const currentUrl = this.page.url();
  console.log(`Current URL: ${currentUrl}`);
  expect(currentUrl).toContain('/en/home/awards');
  console.log('✓ URL contains /en/home/awards');
  
  // Wait for the course-awards block to be visible
  const courseAwardsBlock = this.page.locator('div.course-awards');
  await expect(courseAwardsBlock).toBeVisible({ timeout: 10000 });
  console.log('✓ Awards page is visible');
  
  // Take a screenshot of the awards page
  await this.page.screenshot({ path: 'screenshots/awards-page.png' });
});

Then('user should see the completed course displayed in awards', async function() {
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
  
  // Check for the course-awards-wrapper
  const courseAwardsWrapper = this.page.locator('div.course-awards-wrapper');
  await expect(courseAwardsWrapper).toBeVisible();
  console.log('✓ Course awards wrapper is visible');
  
  // Check for course-awards-card elements
  const courseAwardsCards = this.page.locator('div.course-awards-card');
  const cardsCount = await courseAwardsCards.count();
  expect(cardsCount).toBeGreaterThan(0);
  console.log(`✓ Found ${cardsCount} course award cards`);
  
  // Store the course title from the first card for later verification
  const firstCardTitle = await courseAwardsCards.first().locator('h4.course-awards-card-title').textContent();
  this.completedCourseTitle = firstCardTitle.trim();
  console.log(`✓ First course award card title: ${this.completedCourseTitle}`);
  
  // Take a screenshot showing the course awards
  await this.page.screenshot({ path: 'screenshots/course-awards-cards.png' });
});

Then('user should see the completion date on the course card', async function() {
  // Set flag to keep browser open for subsequent steps
  this.keepBrowserOpen = true;
  
  // Check for the timestamp on the first course card
  const firstCard = this.page.locator('div.course-awards-card').first();
  const timestampElement = firstCard.locator('div.course-awards-card-timestamp');
  await expect(timestampElement).toBeVisible();
  
  // Get the timestamp text
  const timestampText = await timestampElement.textContent();
  expect(timestampText).toContain('Completed');
  console.log(`✓ Completion date found: ${timestampText}`);
  
  // Take a screenshot showing the completion date
  await this.page.screenshot({ path: 'screenshots/course-completion-date.png' });
  
});
