const { When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { closeBrowser } = require('../commonFunctions/launchbrowser');
const ENV = require('../../config.js');

// Set a longer timeout for all steps
setDefaultTimeout(90 * 1000);


When('user waits for {int} seconds', async function(seconds) {
  // Wait for the specified number of seconds
  await this.page.waitForTimeout(seconds * 1000);
  console.log(`✓ Waited for ${seconds} seconds`);
});

Then('user should check if carousel block is visible', async function() {
  // Define the selector for the carousel block
  const carouselBlockSelector = 'div.carousel.block[data-block-name="carousel"][data-block-status="loaded"]';
  
  try {
    // Check if the carousel block is visible
    const carouselBlock = this.page.locator(carouselBlockSelector);
    const isVisible = await carouselBlock.isVisible().catch(() => false);
    
    if (isVisible) {
      console.log('✓ Carousel block is visible on the page');
      
      // Store the carousel block for later use
      this.carouselBlock = carouselBlock;
      
      // Take a screenshot of the carousel block
      await this.page.screenshot({ path: 'screenshots/certification-carousel-block.png' });
      console.log('✓ Screenshot saved as screenshots/certification-carousel-block.png');
    } else {
      console.log('❌ Carousel block is not visible on the page');
      
      // Print error message in bold red color
      await this.page.evaluate(() => {
        const errorDiv = document.createElement('div');
        errorDiv.style.color = 'red';
        errorDiv.style.fontWeight = 'bold';
        errorDiv.style.fontSize = '24px';
        errorDiv.style.padding = '20px';
        errorDiv.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
        errorDiv.style.border = '2px solid red';
        errorDiv.style.borderRadius = '5px';
        errorDiv.style.margin = '20px';
        errorDiv.textContent = 'block not available in the page';
        
        // Insert at the top of the body
        document.body.insertBefore(errorDiv, document.body.firstChild);
      });
      
      // Take a screenshot of the error message
      await this.page.screenshot({ path: 'screenshots/certification-carousel-block-not-found.png' });
      console.log('✓ Screenshot saved as screenshots/certification-carousel-block-not-found.png');
      
      // Fail the test
      expect(isVisible).toBeTruthy();
    }
  } catch (error) {
    console.error(`❌ Error checking carousel block visibility: ${error.message}`);
    
    // Take a screenshot of the error state
    await this.page.screenshot({ path: 'screenshots/certification-carousel-block-error.png' });
    console.log('✓ Error screenshot saved as screenshots/certification-carousel-block-error.png');
    
    throw error; // Re-throw the error to fail the test
  }
});

Then('user should verify carousel block is in full bleed with min-width {int}px', async function(minWidth) {
  // Skip this step if carousel block was not found
  if (!this.carouselBlock) {
    console.log('Carousel block was not found. Skipping min-width check.');
    return 'skipped';
  }
  
  try {
    // Get the computed style of the carousel block
    const width = await this.page.evaluate((selector) => {
      const element = document.querySelector(selector);
      if (!element) return null;
      
      const computedStyle = window.getComputedStyle(element);
      return {
        width: computedStyle.width,
        minWidth: computedStyle.minWidth,
        maxWidth: computedStyle.maxWidth,
        clientWidth: element.clientWidth,
        offsetWidth: element.offsetWidth
      };
    }, 'div.carousel.block[data-block-name="carousel"]');
    
    console.log('Carousel block width properties:', width);
    
    // Check if the carousel block has the required min-width
    const hasRequiredWidth = width && (
      (width.minWidth && parseInt(width.minWidth) >= minWidth) || 
      (width.width && parseInt(width.width) >= minWidth) ||
      (width.clientWidth && width.clientWidth >= minWidth) ||
      (width.offsetWidth && width.offsetWidth >= minWidth)
    );
    
    if (hasRequiredWidth) {
      console.log(`✓ Carousel block has full bleed with width >= ${minWidth}px`);
    } else {
      console.log(`❌ Carousel block does not have full bleed with width >= ${minWidth}px`);
      console.log(`Actual width properties: ${JSON.stringify(width)}`);
      
      // Print error message on the page
      await this.page.evaluate((minWidth) => {
        const errorDiv = document.createElement('div');
        errorDiv.style.color = 'red';
        errorDiv.style.fontWeight = 'bold';
        errorDiv.style.fontSize = '24px';
        errorDiv.style.padding = '20px';
        errorDiv.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
        errorDiv.style.border = '2px solid red';
        errorDiv.style.borderRadius = '5px';
        errorDiv.style.margin = '20px';
        errorDiv.textContent = `Carousel block width is less than ${minWidth}px`;
        
        // Insert at the top of the body
        document.body.insertBefore(errorDiv, document.body.firstChild);
      }, minWidth);
      
      // Take a screenshot of the error message
      await this.page.screenshot({ path: 'screenshots/certification-carousel-width-error.png' });
      console.log('✓ Screenshot saved as screenshots/certification-carousel-width-error.png');
      
      // Fail the test
      expect(hasRequiredWidth).toBeTruthy();
    }
    
    // Clean up - close the browser
    if (this.browser) {
      await closeBrowser(this.browser);
      console.log('Browser closed successfully');
    }
  } catch (error) {
    console.error(`❌ Error checking carousel block width: ${error.message}`);
    
    // Take a screenshot of the error state
    await this.page.screenshot({ path: 'screenshots/certification-carousel-width-check-error.png' });
    console.log('✓ Error screenshot saved as screenshots/certification-carousel-width-check-error.png');
    
    // Clean up - close the browser
    if (this.browser) {
      await closeBrowser(this.browser);
      console.log('Browser closed successfully');
    }
    
    throw error; // Re-throw the error to fail the test
  }
});

Then('user should verify number of panels matches number of navigation buttons', async function() {
  // Skip this step if carousel block was not found
  if (!this.carouselBlock) {
    console.log('Carousel block was not found. Skipping panel count check.');
    return 'skipped';
  }
  
  try {
    // Count the number of panels in the carousel
    const panelSelector = 'div.carousel.block[data-block-name="carousel"] div.panel-container > div[data-panel]';
    const panels = this.page.locator(panelSelector);
    const panelCount = await panels.count();
    console.log(`✓ Found ${panelCount} panels in the carousel`);
    
    // Count the number of navigation buttons
    const buttonSelector = 'div.carousel.block[data-block-name="carousel"] div.button-container > button';
    const buttons = this.page.locator(buttonSelector);
    const buttonCount = await buttons.count();
    console.log(`✓ Found ${buttonCount} navigation buttons in the carousel`);
    
    // Check if the counts match
    const countsMatch = panelCount === buttonCount;
    
    if (countsMatch) {
      console.log(`✓ Number of panels (${panelCount}) matches number of navigation buttons (${buttonCount})`);
      
      // Take a screenshot for verification
      await this.page.screenshot({ path: 'screenshots/certification-carousel-panel-count-match.png' });
      console.log('✓ Screenshot saved as screenshots/certification-carousel-panel-count-match.png');
    } else {
      console.log(`❌ Number of panels (${panelCount}) does not match number of navigation buttons (${buttonCount})`);
      
      // Print error message on the page
      await this.page.evaluate((panelCount, buttonCount) => {
        const errorDiv = document.createElement('div');
        errorDiv.style.color = 'red';
        errorDiv.style.fontWeight = 'bold';
        errorDiv.style.fontSize = '24px';
        errorDiv.style.padding = '20px';
        errorDiv.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
        errorDiv.style.border = '2px solid red';
        errorDiv.style.borderRadius = '5px';
        errorDiv.style.margin = '20px';
        errorDiv.textContent = `Panel count (${panelCount}) does not match button count (${buttonCount})`;
        
        // Insert at the top of the body
        document.body.insertBefore(errorDiv, document.body.firstChild);
      }, panelCount, buttonCount);
      
      // Take a screenshot of the error message
      await this.page.screenshot({ path: 'screenshots/certification-carousel-panel-count-mismatch.png' });
      console.log('✓ Screenshot saved as screenshots/certification-carousel-panel-count-mismatch.png');
      
      // Fail the test
      expect(countsMatch).toBeTruthy();
    }
    
    // Clean up - close the browser
    if (this.browser) {
      await closeBrowser(this.browser);
      console.log('Browser closed successfully');
    }
  } catch (error) {
    console.error(`❌ Error checking panel and button counts: ${error.message}`);
    
    // Take a screenshot of the error state
    await this.page.screenshot({ path: 'screenshots/certification-carousel-panel-count-error.png' });
    console.log('✓ Error screenshot saved as screenshots/certification-carousel-panel-count-error.png');
    
    // Clean up - close the browser
    if (this.browser) {
      await closeBrowser(this.browser);
      console.log('Browser closed successfully');
    }
    
    throw error; // Re-throw the error to fail the test
  }
});

Then('user should verify clicking each button loads the corresponding panel', async function() {
  // Skip this step if carousel block was not found
  if (!this.carouselBlock) {
    console.log('Carousel block was not found. Skipping navigation check.');
    return 'skipped';
  }
  
  try {
    // Find all navigation buttons
    const buttonSelector = 'div.carousel.block[data-block-name="carousel"] div.button-container > button';
    const buttons = this.page.locator(buttonSelector);
    const buttonCount = await buttons.count();
    console.log(`✓ Found ${buttonCount} navigation buttons in the carousel`);
    
    // Find all panels
    const panelSelector = 'div.carousel.block[data-block-name="carousel"] div.panel-container > div[data-panel]';
    const panels = this.page.locator(panelSelector);
    const panelCount = await panels.count();
    console.log(`✓ Found ${panelCount} panels in the carousel`);
    
    // Verify counts match before proceeding
    if (buttonCount !== panelCount) {
      console.log(`❌ Number of buttons (${buttonCount}) does not match number of panels (${panelCount}). Cannot proceed with navigation test.`);
      
      // Print error message on the page
      await this.page.evaluate((buttonCount, panelCount) => {
        const errorDiv = document.createElement('div');
        errorDiv.style.color = 'red';
        errorDiv.style.fontWeight = 'bold';
        errorDiv.style.fontSize = '24px';
        errorDiv.style.padding = '20px';
        errorDiv.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
        errorDiv.style.border = '2px solid red';
        errorDiv.style.borderRadius = '5px';
        errorDiv.style.margin = '20px';
        errorDiv.textContent = `Button count (${buttonCount}) does not match panel count (${panelCount}). Cannot proceed with navigation test.`;
        
        // Insert at the top of the body
        document.body.insertBefore(errorDiv, document.body.firstChild);
      }, buttonCount, panelCount);
      
      // Take a screenshot of the error message
      await this.page.screenshot({ path: 'screenshots/certification-carousel-navigation-count-mismatch.png' });
      console.log('✓ Screenshot saved as screenshots/certification-carousel-navigation-count-mismatch.png');
      
      // Fail the test
      expect(buttonCount).toBe(panelCount);
      return;
    }
    
    // Store panel content for verification
    const panelContents = [];
    for (let i = 0; i < panelCount; i++) {
      const panel = panels.nth(i);
      
      // Get panel ID
      const panelId = await panel.getAttribute('data-panel');
      
      // Get panel eyebrow text
      const eyebrowText = await panel.locator('div.eyebrow').textContent();
      
      // Get panel title text
      const titleText = await panel.locator('div.title h3').textContent();
      
      // Store panel content for later verification
      panelContents.push({
        id: panelId,
        eyebrow: eyebrowText.trim(),
        title: titleText.trim()
      });
      
      console.log(`✓ Panel ${i + 1} (${panelId}): Eyebrow="${eyebrowText.trim()}", Title="${titleText.trim()}"`);
    }
    
    // Click each button and verify the corresponding panel is displayed
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      
      // Get button title and data-panel attribute
      const buttonTitle = await button.getAttribute('title');
      const buttonPanelId = await button.getAttribute('data-panel');
      console.log(`✓ Clicking button ${i + 1}: ${buttonTitle} (data-panel="${buttonPanelId}")`);
      
      // Click the button
      await button.click();
      
      // Wait for the panel to be displayed
      await this.page.waitForTimeout(1000);
      
      // Take a screenshot after clicking the button
      await this.page.screenshot({ path: `screenshots/certification-carousel-button-${i + 1}-clicked.png` });
      console.log(`✓ Screenshot saved as screenshots/certification-carousel-button-${i + 1}-clicked.png`);
      
      // Verify the button has the "selected" class
      const buttonHasSelectedClass = await button.evaluate(el => el.classList.contains('selected'));
      expect(buttonHasSelectedClass).toBeTruthy();
      console.log(`✓ Button ${i + 1} has "selected" class: ${buttonHasSelectedClass}`);
      
      // Verify the corresponding panel is visible
      // The panel with the same data-panel value as the button should be visible
      const expectedPanelId = buttonPanelId;
      
      // Check if the panel with the expected ID is visible
      const panelWithExpectedId = this.page.locator(`div.carousel.block[data-block-name="carousel"] div.panel-container > div[data-panel="${expectedPanelId}"]`);
      const isPanelVisible = await panelWithExpectedId.isVisible();
      
      if (isPanelVisible) {
        console.log(`✓ Panel with ID "${expectedPanelId}" is visible as expected`);
        
        // Find the matching panel content from our stored array
        const matchingPanelContent = panelContents.find(panel => panel.id === expectedPanelId);
        
        if (matchingPanelContent) {
          // Verify the panel content matches what we stored earlier
          const currentEyebrowText = await panelWithExpectedId.locator('div.eyebrow').textContent();
          const currentTitleText = await panelWithExpectedId.locator('div.title h3').textContent();
          
          expect(currentEyebrowText.trim()).toBe(matchingPanelContent.eyebrow);
          expect(currentTitleText.trim()).toBe(matchingPanelContent.title);
          
          console.log(`✓ Panel content verified: Eyebrow="${currentEyebrowText.trim()}", Title="${currentTitleText.trim()}"`);
        } else {
          console.log(`❌ Could not find matching panel content for ID "${expectedPanelId}"`);
        }
      } else {
        console.log(`❌ Panel with ID "${expectedPanelId}" is not visible`);
        
        // Print error message on the page
        await this.page.evaluate((expectedPanelId) => {
          const errorDiv = document.createElement('div');
          errorDiv.style.color = 'red';
          errorDiv.style.fontWeight = 'bold';
          errorDiv.style.fontSize = '24px';
          errorDiv.style.padding = '20px';
          errorDiv.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
          errorDiv.style.border = '2px solid red';
          errorDiv.style.borderRadius = '5px';
          errorDiv.style.margin = '20px';
          errorDiv.textContent = `Panel with ID "${expectedPanelId}" is not visible after clicking the corresponding button`;
          
          // Insert at the top of the body
          document.body.insertBefore(errorDiv, document.body.firstChild);
        }, expectedPanelId);
        
        // Take a screenshot of the error message
        await this.page.screenshot({ path: `screenshots/certification-carousel-panel-${i + 1}-not-visible.png` });
        console.log(`✓ Screenshot saved as screenshots/certification-carousel-panel-${i + 1}-not-visible.png`);
        
        // Fail the test
        expect(isPanelVisible).toBeTruthy();
      }
      
      // Wait a moment before clicking the next button
      await this.page.waitForTimeout(1000);
    }
    
    console.log('✓ Successfully verified all carousel navigation buttons');
    
    // Clean up - close the browser
    if (this.browser) {
      await closeBrowser(this.browser);
      console.log('Browser closed successfully');
    }
  } catch (error) {
    console.error(`❌ Error verifying carousel navigation: ${error.message}`);
    
    // Take a screenshot of the error state
    await this.page.screenshot({ path: 'screenshots/certification-carousel-navigation-error.png' });
    console.log('✓ Error screenshot saved as screenshots/certification-carousel-navigation-error.png');
    
    // Clean up - close the browser
    if (this.browser) {
      await closeBrowser(this.browser);
      console.log('Browser closed successfully');
    }
    
    throw error; // Re-throw the error to fail the test
  }
});
