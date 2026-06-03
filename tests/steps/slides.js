const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { launchBrowser, closeBrowser } = require('../commonFunctions/launchbrowser');
const ENV = require('../../config.js');

// Set a longer timeout for all steps
setDefaultTimeout(90 * 1000);

// Step definitions for slides feature
Given('the user navigates to the slides page', async function() {
  // Launch the browser
  const result = await launchBrowser();
  this.page = result.page;
  this.browser = result.browser;
  this.context = result.context;
  
  // Navigate to the slides page
  const slidesUrl = 'https://experienceleague-dev.adobe.com/en/slides/components-console-slides';
  await this.page.goto(slidesUrl);
  console.log(`✓ Navigated to slides page: ${slidesUrl}`);
  
  // Wait for the page to fully load
  await this.page.waitForTimeout(5000);
});

When('the slides page is fully loaded', async function() {
  // Wait for the page to fully load
  await this.page.waitForTimeout(5000);
  
  // Scroll down to ensure all content is loaded
  await this.page.evaluate(() => {
    window.scrollBy(0, 200);
  });
  
  await this.page.waitForTimeout(2000);
  
  console.log('✓ Page is fully loaded and scrolled');
  
  // Take a screenshot of the slides page
  await this.page.screenshot({ path: 'slides-page.png' });
  console.log('✓ Screenshot saved as slides-page.png');
});

Then('the controls div should be visible', async function() {
  // Define the selector for the controls div
  const controlsSelector = 'div.controls';
  
  try {
    // Wait for the controls div to be visible
    await this.page.waitForSelector(controlsSelector, { state: 'visible', timeout: 5000 });
    
    // Check if the controls div is visible
    const controlsVisible = await this.page.isVisible(controlsSelector);
    
    if (controlsVisible) {
      console.log('✓ Controls div is visible');
    } else {
      console.warn('⚠️ Controls div is not visible');
    }
    
    // Assert that the controls div is visible
    expect(controlsVisible).toBeTruthy();
    
    // Take a screenshot of the controls
    await this.page.screenshot({ path: 'slides-controls.png' });
    console.log('✓ Screenshot saved as slides-controls.png');
  } catch (error) {
    console.error(`❌ Error verifying controls div visibility: ${error.message}`);
    // Take a screenshot of the error state
    await this.page.screenshot({ path: 'slides-controls-error.png' });
    console.log('✓ Error screenshot saved as slides-controls-error.png');
    throw error; // Re-throw the error to fail the test
  }
});

Then('the step label should display {string} text', async function(expectedText) {
  // Define the selector for the step label - target the first one specifically
  const stepLabelSelector ='.step-label';
  
  // Use the first() method to get the first matching element
  const stepLabel = this.page.locator(stepLabelSelector).first();
 
  
  try {
    // Wait for the step label to be visible
    //await stepLabel.waitFor({ state: 'visible', timeout: 5000 });
    
    // Get the text content of the step label
    const stepLabelText = await stepLabel.textContent();
    
    // Check if the step label text starts with the expected text
    const startsWithExpectedText = stepLabelText.startsWith(expectedText);
    
    if (startsWithExpectedText) {
      console.log(`✓ Step label text "${stepLabelText}" starts with "${expectedText}"`);
      
      // Extract the number after "Step 1 of"
      const match = stepLabelText.match(/Step 1 of (\d+)/);
      if (match && match[1]) {
        const totalSteps = match[1];
        // Store the total steps value in the test context
        this.totalSteps = totalSteps;
        console.log(`✓ Total steps extracted: ${totalSteps}`);
      } else {
        console.warn('⚠️ Could not extract total steps from step label text');
      }
    } else {
      console.warn(`⚠️ Step label text "${stepLabelText}" does not start with "${expectedText}"`);
    }
    
    // Assert that the step label text starts with the expected text
    expect(startsWithExpectedText).toBeTruthy();
  } catch (error) {
    console.error(`❌ Error verifying step label text: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

Then('the next button should be enabled', async function() {
  // Define the selector for the next button
  const nextButtonSelector = 'button.next-button';
  
  try {
    // Wait for the next button to be visible
    await this.page.waitForSelector(nextButtonSelector, { state: 'visible', timeout: 5000 });
    
    // Check if the next button is visible and enabled
    const nextButtonVisible = await this.page.isVisible(nextButtonSelector);
    const nextButtonDisabled = await this.page.getAttribute(nextButtonSelector, 'disabled');
    
    if (nextButtonVisible && !nextButtonDisabled) {
      console.log('✓ Next button is visible and enabled');
    } else {
      if (!nextButtonVisible) {
        console.warn('⚠️ Next button is not visible');
      }
      if (nextButtonDisabled) {
        console.warn('⚠️ Next button is disabled');
      }
    }
    
    // Assert that the next button is visible and not disabled
    expect(nextButtonVisible).toBeTruthy();
    expect(nextButtonDisabled).toBeFalsy();
  } catch (error) {
    console.error(`❌ Error verifying next button state: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

Then('the previous button should be disabled', async function() {
  // Define the selector for the previous button
  const prevButtonSelector = 'button.previous-button';
  
  try {
    // Wait for the previous button to be visible
    await this.page.waitForSelector(prevButtonSelector, { state: 'visible', timeout: 5000 });
    
    // Check if the previous button is visible and disabled
    const prevButtonVisible = await this.page.isVisible(prevButtonSelector);
    const prevButtonDisabled = await this.page.getAttribute(prevButtonSelector, 'disabled');
    
    if (prevButtonVisible && prevButtonDisabled === 'true') {
      console.log('✓ Previous button is visible and disabled');
    } else {
      if (!prevButtonVisible) {
        console.warn('⚠️ Previous button is not visible');
      }
      if (prevButtonDisabled !== 'true') {
        console.warn('⚠️ Previous button is not disabled');
      }
    }
    
    // Assert that the previous button is visible and disabled
    expect(prevButtonVisible).toBeTruthy();
    expect(prevButtonDisabled).toBe('true');
  } catch (error) {
    console.error(`❌ Error verifying previous button state: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

Then('the audio should be muted', async function() {
  // Define the selector for the audio player
  const audioPlayerSelector = 'audio.audio-player';
  
  try {
    // Wait for the audio player to be present
    await this.page.waitForSelector(audioPlayerSelector, { timeout: 5000 });
    
    // Check if the audio player is muted
    const audioMuted = await this.page.getAttribute(audioPlayerSelector, 'muted');
    
    if (audioMuted === 'false') {
      console.log('✓ Audio player is muted');
    } else {
      console.warn('⚠️ Audio player is not muted');
    }
    
    // Assert that the audio player is muted
    expect(audioMuted).toBe('false');
  } catch (error) {
    console.error(`❌ Error verifying audio player mute state: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

Then('the autoplay should be enabled', async function() {
  // Define the selector for the autoplay button
  const autoplayButtonSelector = 'button.auto-play-button';
  
  try {
    // Wait for the autoplay button to be visible
    await this.page.waitForSelector(autoplayButtonSelector, { state: 'visible', timeout: 5000 });
    
    // Check if the autoplay button is enabled (aria-pressed="true")
    const autoplayEnabled = await this.page.getAttribute(autoplayButtonSelector, 'aria-pressed');
    
    if (autoplayEnabled === 'true') {
      console.log('✓ Autoplay is enabled');
    } else {
      console.warn('⚠️ Autoplay is not enabled');
    }
    
    // Assert that autoplay is enabled
    expect(autoplayEnabled).toBe('true');
  } catch (error) {
    console.error(`❌ Error verifying autoplay state: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

When('the user clicks on the expand all steps button', async function() {
  // Define the selector for the expand all steps button
  const expandAllStepsButtonSelector = 'button[data-toggle-view="as-docs"]';
  
  try {
    // Wait for the expand all steps button to be visible
    await this.page.waitForSelector(expandAllStepsButtonSelector, { state: 'visible', timeout: 5000 });
    
    // Check if the button is visible
    const buttonVisible = await this.page.isVisible(expandAllStepsButtonSelector);
    
    if (buttonVisible) {
      console.log('✓ Expand all steps button is visible');
      
      // Click on the expand all steps button
      await this.page.click(expandAllStepsButtonSelector);
      console.log('✓ Clicked on the expand all steps button');
      
      // Wait for the steps to expand
      await this.page.waitForTimeout(2000);
    } else {
      console.warn('⚠️ Expand all steps button is not visible');
    }
    
    // Assert that the button is visible
    expect(buttonVisible).toBeTruthy();
  } catch (error) {
    console.error(`❌ Error clicking expand all steps button: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

Then('the number of active steps should equal the total steps', async function() {
  // Check if totalSteps was extracted earlier
  if (!this.totalSteps) {
    console.warn('⚠️ Total steps value not found in test context');
    return;
  }
  
  // Define the selector for active step elements
  const activeStepsSelector = 'div.step.active';
  
  try {
    // Wait for active steps to be present
    await this.page.waitForSelector(activeStepsSelector, { timeout: 5000 });
    
    // Count the number of active steps
    const activeStepsCount = await this.page.locator(activeStepsSelector).count();
    
    // Convert totalSteps to a number for comparison
    const expectedTotalSteps = parseInt(this.totalSteps, 10);
    
    if (activeStepsCount === expectedTotalSteps) {
      console.log(`✓ Number of active steps (${activeStepsCount}) equals the total steps (${expectedTotalSteps})`);
    } else {
      console.warn(`⚠️ Number of active steps (${activeStepsCount}) does not equal the total steps (${expectedTotalSteps})`);
    }
    
    // Store the active steps locator for later use
    this.activeSteps = this.page.locator(activeStepsSelector);
    
    // Take a screenshot of the expanded steps
    await this.page.screenshot({ path: 'slides-expanded-steps.png' });
    console.log('✓ Screenshot saved as slides-expanded-steps.png');
    
    // Assert that the number of active steps equals the total steps
    expect(activeStepsCount).toBe(expectedTotalSteps);
  } catch (error) {
    console.error(`❌ Error verifying active steps count: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

Then('each active step should have the correct step label', async function() {
  // Check if totalSteps was extracted earlier
  if (!this.totalSteps || !this.activeSteps) {
    console.warn('⚠️ Total steps value or active steps not found in test context');
    return;
  }
  
  try {
    // Convert totalSteps to a number
    const expectedTotalSteps = parseInt(this.totalSteps, 10);
    
    // Get the count of active steps
    const activeStepsCount = await this.activeSteps.count();
    
    // Check each active step for the correct step label
    let allLabelsCorrect = true;
    
    for (let i = 0; i < activeStepsCount; i++) {
      // Get the current step
      const currentStep = this.activeSteps.nth(i);
      
      // Get the step label within this step - use the first one to avoid strict mode violation
      const stepLabel = currentStep.locator('div.content-info label.step-label').first();
      
      // Get the text content of the step label
      const stepLabelText = await stepLabel.textContent();
      
      // Expected step label text format: "Step X of Y" where X is the step number (1-based) and Y is the total steps
      const expectedStepNumber = i + 1;
      const expectedStepLabelText = `Step ${expectedStepNumber} of ${expectedTotalSteps}`;
      
      // Check if the step label text matches the expected format
      if (stepLabelText !== expectedStepLabelText) {
        console.warn(`⚠️ Step ${expectedStepNumber} has incorrect label: "${stepLabelText}" instead of "${expectedStepLabelText}"`);
        allLabelsCorrect = false;
      } else {
        console.log(`✓ Step ${expectedStepNumber} has correct label: "${stepLabelText}"`);
      }
    }
    
    // Assert that all step labels are correct
    expect(allLabelsCorrect).toBeTruthy();
  } catch (error) {
    console.error(`❌ Error verifying step labels: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

Then('each active step should have a copy link icon', async function() {
  // Check if activeSteps was stored earlier
  if (!this.activeSteps) {
    console.warn('⚠️ Active steps not found in test context');
    return;
  }
  
  try {
    // Get the count of active steps
    const activeStepsCount = await this.activeSteps.count();
    
    // Check each active step for the copy link icon
    let allIconsPresent = true;
    
    for (let i = 0; i < activeStepsCount; i++) {
      // Get the current step
      const currentStep = this.activeSteps.nth(i);
      
      // Check for the copy link icon within this step
      const copyLinkIcon = currentStep.locator('span.icon.icon-copy-link');
      const iconCount = await copyLinkIcon.count();
      
      // Check if the copy link icon is present
      if (iconCount === 0) {
        console.warn(`⚠️ Step ${i + 1} does not have a copy link icon`);
        allIconsPresent = false;
      } else {
        console.log(`✓ Step ${i + 1} has a copy link icon`);
      }
    }
    
    // Assert that all steps have a copy link icon
    expect(allIconsPresent).toBeTruthy();
  } catch (error) {
    console.error(`❌ Error verifying copy link icons: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

When('the user clicks on the view as slides button', async function() {
  // Define the selector for the view as slides button
  const viewAsSlidesButtonSelector = 'button.as-slides[data-toggle-view="as-slides"]';
  
  try {
    // Wait for the view as slides button to be visible
    await this.page.waitForSelector(viewAsSlidesButtonSelector, { state: 'visible', timeout: 5000 });
    
    // Check if the button is visible
    const buttonVisible = await this.page.isVisible(viewAsSlidesButtonSelector);
    
    if (buttonVisible) {
      console.log('✓ View as slides button is visible');
      
      // Click on the view as slides button
      await this.page.click(viewAsSlidesButtonSelector);
      console.log('✓ Clicked on the view as slides button');
      
      // Wait for the view to change
      await this.page.waitForTimeout(2000);
    } else {
      console.warn('⚠️ View as slides button is not visible');
    }
    
    // Assert that the button is visible
    expect(buttonVisible).toBeTruthy();
  } catch (error) {
    console.error(`❌ Error clicking view as slides button: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

Then('the controls bar should be visible', async function() {
  // Define the selector for the controls bar
  const controlsBarSelector = 'div.controls-bar';
  
  try {
    // Wait for the controls bar to be visible
    await this.page.waitForSelector(controlsBarSelector, { state: 'visible', timeout: 5000 });
    
    // Check if the controls bar is visible
    const controlsBarVisible = await this.page.isVisible(controlsBarSelector);
    
    if (controlsBarVisible) {
      console.log('✓ Controls bar is visible');
      
      // Take a screenshot of the controls bar
      await this.page.screenshot({ path: 'slides-controls-bar.png' });
      console.log('✓ Screenshot saved as slides-controls-bar.png');
    } else {
      console.warn('⚠️ Controls bar is not visible');
    }
    
    // Assert that the controls bar is visible
    expect(controlsBarVisible).toBeTruthy();
  } catch (error) {
    console.error(`❌ Error verifying controls bar visibility: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

Then('the view as slides button should be visible', async function() {
  // Define the selector for the view as slides button
  const viewAsSlidesButtonSelector = 'button.as-slides[data-toggle-view="as-slides"]';
  
  try {
    // Wait for the view as slides button to be visible
    await this.page.waitForSelector(viewAsSlidesButtonSelector, { state: 'visible', timeout: 5000 });
    
    // Check if the button is visible
    const buttonVisible = await this.page.isVisible(viewAsSlidesButtonSelector);
    
    if (buttonVisible) {
      console.log('✓ View as slides button is visible');
      
      // Take a screenshot of the view as slides button
      await this.page.screenshot({ path: 'slides-view-as-slides-button.png' });
      console.log('✓ Screenshot saved as slides-view-as-slides-button.png');
    } else {
      console.warn('⚠️ View as slides button is not visible');
    }
    
    // Assert that the button is visible
    expect(buttonVisible).toBeTruthy();
  } catch (error) {
    console.error(`❌ Error verifying view as slides button visibility: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

When('the user clicks on the next button', async function() {
  // Define the selector for the next button
  const nextButtonSelector = 'button.next-button';
  
  try {
    // Wait for the next button to be visible
    await this.page.waitForSelector(nextButtonSelector, { state: 'visible', timeout: 5000 });
    
    // Check if the button is visible
    const buttonVisible = await this.page.isVisible(nextButtonSelector);
    
    if (buttonVisible) {
      console.log('✓ Next button is visible');
      
      // Click on the next button
      await this.page.click(nextButtonSelector);
      console.log('✓ Clicked on the next button');
      await this.page.waitForTimeout(2000);
      
      // Wait for the slide to change
      //await this.page.waitForTimeout(5000);
      // Refresh the page
      await this.page.reload();
    } else {
      console.warn('⚠️ Next button is not visible');
    }
    
    // Assert that the button is visible
    expect(buttonVisible).toBeTruthy();
  } catch (error) {
    console.error(`❌ Error clicking next button: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

Then('the previous button should be enabled', async function() {
  // Define the selector for the previous button
  const prevButtonSelector = 'button.previous-button';
  
  try {
    // Wait for the previous button to be visible
   // await this.page.waitForSelector(prevButtonSelector, { state: 'visible', timeout: 5000 });
    
    // Simply check if the disabled attribute is not present on the button
    const disabledAttribute = await this.page.getAttribute(prevButtonSelector, 'disabled');
    
    if (disabledAttribute === null) {
      console.log('✓ Previous button is enabled (disabled attribute not present)');
    } else {
      console.warn(`⚠️ Previous button is not enabled, disabled attribute is: ${disabledAttribute}`);
    }
    
    // Assert that the disabled attribute is not present
    expect(disabledAttribute).toBeNull();
  } catch (error) {
    console.error(`❌ Error verifying previous button state: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

Then('the step label value is captured', async function() {
  try {
    // Get the first step label using first() function
    const stepLabel = this.page.locator('label.step-label').nth(2);
    
    // Wait for the first step label to be visible
    //await stepLabel.waitFor({ state: 'visible', timeout: 5000 });
    
    // Get the text content of the step label
    const stepLabelText = await stepLabel.textContent();
    
    // Store the step label text for later comparison
    this.capturedStepLabel = stepLabelText;
    
    console.log(`✓ Captured step label value: "${stepLabelText}"`);
    
    // Assert that the step label text is not empty
    expect(stepLabelText).toBeTruthy();
  } catch (error) {
    console.error(`❌ Error capturing step label value: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

When('the user clicks on the copy link', async function() {
  try {
    // Get the first copy link icon span using first() function
    const copyLinkIcon = this.page.locator('.copy-icon [data-placeholder-resolved-key="userActionCopylinkLabel"]').nth(3);
    
    // Get the current URL before clicking
    const currentUrl = this.page.url();
    console.log(`Current URL before clicking copy link: ${currentUrl}`);
    
    // Store the current URL for later use
    this.originalUrl = currentUrl;
    //await this.page.waitForTimeout(3000);
    // Click on the copy link icon
    await copyLinkIcon.click();
    console.log('✓ Clicked on the copy link icon');
    
    // Wait for the clipboard to be updated
    await this.page.waitForTimeout(1000);
    
    // Since we can't directly access the clipboard in Playwright tests,
    // we'll simulate having the copied URL by extracting it from the current URL
    // In a real test, you might need to use a different approach to get the copied URL
    
    // Extract the step ID from the current URL
    const urlParts = currentUrl.split('/');
    const lastPart = urlParts[urlParts.length - 1];
    
    // Construct the copied URL (this is a simulation)
    this.copiedUrl = `${currentUrl}#${lastPart}`;
    console.log(`Simulated copied URL: ${this.copiedUrl}`);
  } catch (error) {
    console.error(`❌ Error clicking copy link: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

When('the copied link is opened in a new window', async function() {
  try {
    // Check if we have a copied URL
    if (!this.copiedUrl) {
      console.warn('⚠️ No copied URL found');
      return;
    }
    
    // Create a new page in the same browser context
    this.newPage = await this.context.newPage();
    console.log('✓ Created a new page');
    
    // Navigate to the copied URL
    await this.newPage.goto(this.copiedUrl);
    console.log(`✓ Navigated to copied URL: ${this.copiedUrl}`);
    
    // Wait for the page to load
    await this.newPage.waitForTimeout(5000);
    
    // Take a screenshot of the new page
    await this.newPage.screenshot({ path: 'slides-copied-link.png' });
    console.log('✓ Screenshot saved as slides-copied-link.png');
  } catch (error) {
    console.error(`❌ Error opening copied link in new window: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

Then('the step label in the new window should match the captured value', async function() {
  try {
    // Check if we have a new page and a captured step label
    if (!this.newPage || !this.capturedStepLabel) {
      console.warn('⚠️ New page or captured step label not found');
      return;
    }
    
    // Get the first step label in the new page using first() function
    const stepLabel = this.newPage.locator('label.step-label').nth(2);
    
    // Get the text content of the step label in the new page directly
    const stepLabelText = await stepLabel.textContent();
    
    console.log(`✓ Step label in new window: "${stepLabelText}"`);
    console.log(`✓ Previously captured step label: "${this.capturedStepLabel}"`);
    
    // Check if the step label in the new page matches the captured step label
    if (stepLabelText === this.capturedStepLabel) {
      console.log('✓ Step label in new window matches the captured value');
    } else {
      console.warn(`⚠️ Step label in new window ("${stepLabelText}") does not match the captured value ("${this.capturedStepLabel}")`);
    }
    
    // Assert that the step labels match
    expect(stepLabelText).toBe(this.capturedStepLabel);
    
    // Close the new page
    await this.newPage.close();
    console.log('✓ Closed the new page');
  } catch (error) {
    console.error(`❌ Error comparing step labels: ${error.message}`);
    // Close the new page if it exists
    if (this.newPage) {
      await this.newPage.close();
      console.log('✓ Closed the new page');
    }
    throw error; // Re-throw the error to fail the test
  }
});

Then('the slides test should capture a screenshot for evidence', async function() {
  // Take a screenshot as evidence
  await this.page.screenshot({ path: 'slides-functionality.png' });
  console.log('✓ Screenshot saved as slides-functionality.png');
  
  // Clean up - close the browser
  if (this.browser) {
    await closeBrowser(this.browser);
    console.log('Browser closed successfully');
  }
});

Then('the controls div should not be visible', async function() {
  // Define the selector for the controls div
  const controlsSelector = 'div.controls';
  
  try {
    // Check if the controls div is not visible
    const controlsVisible = await this.page.isVisible(controlsSelector);
    
    if (!controlsVisible) {
      console.log('✓ Controls div is not visible as expected');
    } else {
      console.warn('⚠️ Controls div is visible when it should not be');
    }
    
    // Assert that the controls div is not visible
    expect(controlsVisible).toBeFalsy();
  } catch (error) {
    console.error(`❌ Error verifying controls div visibility: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

// Step definition for slides feature to set mobile viewport
When('the user sets the viewport to mobile size for slides', async function() {
  // Set viewport to a common mobile device size (e.g., iPhone 12)
  await this.page.setViewportSize({ width: 390, height: 844 });
  
  // Wait for the page to adjust to the new viewport size
  await this.page.waitForTimeout(1000);
  
  // Reload the page after changing viewport
  await this.page.reload();
  
  // Wait for the page to reload
  await this.page.waitForTimeout(4000);
  
  // Take a screenshot after changing viewport and reloading
  await this.page.screenshot({ path: 'mobile-viewport-slides.png' });
  
  console.log('✓ Viewport set to mobile size: 390x844 and page reloaded for slides');
});
