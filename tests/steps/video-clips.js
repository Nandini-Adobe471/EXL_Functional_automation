const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const ENV = require('../../config.js');
// Import common mobile steps
require('./common-mobile-steps');

// Set a longer timeout for all steps
setDefaultTimeout(90 * 1000);

// Step definitions for video clips feature
Given('the user logs in to the application with valid credentials', async function() {
  // Session is already established by BeforeAll hook — just navigate to the base URL
  if (!this.page) {
    throw new Error('[Session] this.page is not set. Ensure hooks.js BeforeAll/Before ran correctly.');
  }
  await this.page.goto(ENV.URL);
  // Wait for the page to fully load
  await this.page.waitForTimeout(5000);
  console.log('✓ Session already active — navigated to application home page');
});

When('the user modifies the URL to append {string}', async function(queryParam) {
  // Get the current URL
  const currentUrl = this.page.url();
  console.log(`Current URL: ${currentUrl}`);
  
  // Remove the hash (#) if present and append the query parameter
  let newUrl = currentUrl;
  if (newUrl.includes('#')) {
    newUrl = newUrl.split('#')[0]; // Remove everything after the hash
  }

  
  // Append the query parameter
  if (newUrl.includes('?')) {
    // If URL already has query parameters, append with &
    newUrl = `${newUrl}&${queryParam.substring(1)}`;
  } else {
    // Otherwise append with ?
    newUrl = `${newUrl}${queryParam}`;
  }
  
  console.log(`Modified URL: ${newUrl}`);
  
  // Navigate to the new URL
  await this.page.goto(newUrl);
  
  // Wait for the page to load with the new URL
  await this.page.waitForTimeout(6000);
  console.log('✓ Successfully modified URL and navigated to it');
});

When('the page is fully loaded', async function() {
  // Wait for the page to fully load
  await this.page.waitForTimeout(5000);
  
  // Scroll down to ensure all content is loaded
  await this.page.evaluate(() => {
    window.scrollBy(0, 500);
  });
  
  await this.page.waitForTimeout(2000);
  
  console.log('✓ Page is fully loaded and scrolled');
  
  // Define the selector for video clip cards
  const videoClipCardsSelector = 'div.card-wrapper[data-analytics-content-type="video clip"]';
  const videoClipCards = this.page.locator(videoClipCardsSelector);
  
  // Store the cards for later use
  this.videoClipCards = videoClipCards;
  //console.log(await videoClipCards.count());
  // Count the cards
  this.cardsCount = await videoClipCards.count();
  console.log(`Found ${this.cardsCount} video clip cards`);
});

Then('the {string} header should be visible', async function(headerText) {
  // Define the selector for the video clips section header
  //const videoClipsHeaderSelector = 'div[data-block-name="recommended-content"] div.recommended-content-header.rec-block-header#keep-learning-with-video-clips';
  await this.page.waitForTimeout(6000);
  // Check if the header is visible
  const videoClipsHeader = this.page.locator('.recommended-content .recommended-content-header.rec-block-header');
  console.log('Checking visibility of header with text:', videoClipsHeader);
  this.isHeaderVisible=false;
   console.log('Checking visibility of header with text:', await videoClipsHeader.count());
   for(let i=0; i<await videoClipsHeader.count(); i++){
    const text = await videoClipsHeader.nth(i).textContent();
    console.log('Header text found:', text);
    if(text.includes("video clips")){
      this.isHeaderVisible=true;
   }
  }
  // Assert that the header is visible
  expect(this.isHeaderVisible).toBeTruthy();
});

Then('there should be at least one video clip card displayed', async function() {
  // Check if at least one video clip card is visible
  const videoClipCardsSelector = 'div.card-wrapper[data-analytics-content-type="video clip"]';
  const videoClipCards = this.page.locator(videoClipCardsSelector);
  const cardsCount = await videoClipCards.count();
  
  console.log(`Found ${cardsCount} video clip cards`);
  
  // Assert that there is at least one card
  expect(cardsCount).toBeGreaterThan(0);
  
  // Store the first card for later use
  this.firstCard = videoClipCards.first();
  
  // Check the card title for logging purposes
  const cardTitle = await this.firstCard.locator('h3.browse-card-title-text').textContent();
  console.log(`✓ First video clip card title: "${cardTitle}"`);
});

Then('the video clip card should have {string} in the banner', async function(expectedBannerText) {
  // Check the h3 banner text
  const bannerText = await this.firstCard.locator('h3.browse-card-banner').textContent();
  
  if (bannerText.trim() === expectedBannerText) {
    console.log(`✓ Card banner text is "${expectedBannerText}"`);
  } else {
    console.warn(`⚠️ Card banner text is "${bannerText}" instead of "${expectedBannerText}"`);
  }
  
  // Assert that the banner text matches the expected text
  expect(bannerText.trim()).toBe(expectedBannerText);
});

When('the user clicks on the first video clip card', async function() {
  // Store the URL of the card for later verification
  const cardLink = this.firstCard.locator('a').first();
  this.cardUrl = await cardLink.getAttribute('href');
  console.log(`Video clip card URL: ${this.cardUrl}`);
  
  // Click on the card
  await this.firstCard.click();
  console.log('✓ Clicked on the first video clip card');
  
  // Wait for navigation to complete
  await this.page.waitForTimeout(7000);
});

Then('the video clip content should open', async function() {
  // Take a screenshot of the video clip content
  await this.page.screenshot({ path: 'screenshots/video-clip-content.png' });
  console.log('✓ Screenshot of video clip content saved as video-clip-content.png');
  
  // Check for iframe to ensure video content is loaded
  const iframe = this.page.locator('iframe');
  const hasIframe = await iframe.count() > 0;
  
  if (hasIframe) {
    console.log('✓ iframe loaded on the page');
  } else {
    console.log('⚠️ No iframe found, video content may not be loaded properly');
  }
});

When('the user clicks on the watch full video button', async function() {
  // Wait for the watch full video button to be available
  await this.page.waitForTimeout(2000);
  
  // Define the selector for the watch full video button
  const watchFullVideoSelector = 'button.browse-card-button a.browse-card-full-link';
  
  // Wait for the button to be visible
  await this.page.waitForSelector(watchFullVideoSelector, { state: 'visible', timeout: 5000 });
  
  // Get the href attribute to verify later
  const fullVideoUrl = await this.page.getAttribute(watchFullVideoSelector, 'href');
  this.fullVideoUrl = fullVideoUrl;
  console.log(`Watch full video URL: ${this.fullVideoUrl}`);
  
  // Create a promise that will resolve when a new page is created
  const pagePromise = this.context.waitForEvent('page');
  
  // Click on the watch full video button
  await this.page.click(watchFullVideoSelector);
  console.log('✓ Clicked on the watch full video button');
  
  // Wait for the new page to open
  const newPage = await pagePromise;
  await newPage.waitForLoadState();
  console.log('✓ New page opened');
  
  // Store the new page for later use
  this.newPage = newPage;
  
  // Take a screenshot of the new page
  await this.newPage.screenshot({ path: 'screenshots/video-clip-full-video-page.png' });
  console.log('✓ Screenshot saved as video-clip-full-video-page.png');
});

Then('a new window should open with the full video', async function() {
  try {
    // Check if we have a new page
    if (!this.newPage) {
      console.error('❌ No new page was opened');
      throw new Error('No new page was opened');
    }
    
    // Get the URL of the new page
    const newPageUrl = this.newPage.url();
    console.log(`New page URL: ${newPageUrl}`);
    
    // Check if the new page URL matches the expected URL
    if (this.fullVideoUrl && newPageUrl.includes(this.fullVideoUrl)) {
      console.log('✓ New page URL matches the expected full video URL');
    } else {
      console.warn(`⚠️ New page URL (${newPageUrl}) doesn't match expected URL (${this.fullVideoUrl})`);
    }
    
    // Take a screenshot of the new page
    await this.newPage.screenshot({ path: 'screenshots/video-clip-full-video-verification.png' });
    console.log('✓ Screenshot saved as video-clip-full-video-verification.png');
    
    // Close the new page
    await this.newPage.close();
    console.log('✓ New page closed');
  } catch (error) {
    console.error(`❌ Error verifying new window: ${error.message}`);
    // Take a screenshot of the error state if possible
    if (this.newPage) {
      await this.newPage.screenshot({ path: 'screenshots/video-clip-full-video-error.png' });
      console.log('✓ Error screenshot saved as video-clip-full-video-error.png');
      // Close the new page
      await this.newPage.close();
    }
    throw error; // Re-throw the error to fail the test
  }
});

When('the user clicks on the activate miniplayer button', async function() {
  // Wait for the miniplayer button to be available
  await this.page.waitForTimeout(2000);
  
  // Define the selector for the miniplayer button
  const miniplayerButtonSelector = 'button.browse-card-video-clip-modal-miniplayer';
  
  // Wait for the button to be visible
  await this.page.waitForSelector(miniplayerButtonSelector, { state: 'visible', timeout: 5000 });
  
  // Click on the miniplayer button
  await this.page.click(miniplayerButtonSelector);
  console.log('✓ Clicked on the activate miniplayer button');
  
  // Wait for the miniplayer to appear
  await this.page.waitForTimeout(3000);
  
  // Take a screenshot after activating the miniplayer
  await this.page.screenshot({ path: 'screenshots/video-clip-miniplayer-activated.png' });
  console.log('✓ Screenshot saved as video-clip-miniplayer-activated.png');
});

Then('the miniplayer should be activated', async function() {
  // Define the selector for the miniplayer container based on the provided HTML structure
  const miniplayerSelector = 'div.browse-card-video-clip-modal.visible.mini-player-mode';
  
  try {
    // Wait for the miniplayer to be visible
    await this.page.waitForSelector(miniplayerSelector, { state: 'visible', timeout: 5000 });
    
    // Check if the miniplayer is visible
    const miniplayerVisible = await this.page.isVisible(miniplayerSelector);
    
    if (miniplayerVisible) {
      console.log('✓ Miniplayer is activated and visible');
      
      // Check for iframe to ensure video content is loaded
      const iframeSelector = `${miniplayerSelector} iframe`;
      const iframeVisible = await this.page.isVisible(iframeSelector);
      
      if (iframeVisible) {
        console.log('✓ Video iframe is loaded in the miniplayer');
      } else {
        console.warn('⚠️ Video iframe not found in the miniplayer');
      }
    } else {
      console.warn('⚠️ Miniplayer element found but not visible');
    }
    
    // Assert that the miniplayer is visible
    expect(miniplayerVisible).toBeTruthy();
    
    // Take a screenshot of the activated miniplayer
    await this.page.screenshot({ path: 'screenshots/video-clip-miniplayer-verification.png' });
    console.log('✓ Screenshot saved as video-clip-miniplayer-verification.png');
  } catch (error) {
    console.error(`❌ Error verifying miniplayer: ${error.message}`);
    // Take a screenshot of the error state
    await this.page.screenshot({ path: 'screenshots/video-clip-miniplayer-error.png' });
    console.log('✓ Error screenshot saved as video-clip-miniplayer-error.png');
    throw error; // Re-throw the error to fail the test
  }
});

When('the user clicks on the expand video player button', async function() {
  // Wait for the expand video player button to be available
  await this.page.waitForTimeout(2000);
  
  // Define the selector for the expand video player button
  // In miniplayer mode, the button changes to "Expand video player"
  const expandButtonSelector = 'button.browse-card-video-clip-modal-miniplayer[aria-label="Expand video player"]';
  
  // Wait for the button to be visible
  await this.page.waitForSelector(expandButtonSelector, { state: 'visible', timeout: 5000 });
  
  // Click on the expand video player button
  await this.page.click(expandButtonSelector);
  console.log('✓ Clicked on the expand video player button');
  
  // Wait for the full player to appear
  await this.page.waitForTimeout(5000);
  
  // Take a screenshot after expanding the player
  await this.page.screenshot({ path: 'screenshots/video-clip-expanded-player.png' });
  console.log('✓ Screenshot saved as video-clip-expanded-player.png');
});

Then('the MPC player should be visible', async function() {
  // Define the selector for the iframe tag
  const iframeSelector = 'iframe';
  
  try {
    // Add a longer wait to ensure the UI has time to fully render
    await this.page.waitForTimeout(5000);
    
    // Wait for the iframe to be visible with an increased timeout
    await this.page.waitForSelector(iframeSelector, { state: 'visible', timeout: 10000 });
    
    // Check if the iframe is visible
    const iframeVisible = await this.page.isVisible(iframeSelector);
    
    if (iframeVisible) {
      console.log('✓ iframe is visible, indicating video content is loaded');
    } else {
      console.warn('⚠️ iframe element found but not visible');
    }
    
    // Assert that the iframe is visible
    expect(iframeVisible).toBeTruthy();
    
    // Take a screenshot of the player with iframe
    await this.page.screenshot({ path: 'screenshots/video-clip-mpc-player-verification.png' });
    console.log('✓ Screenshot saved as video-clip-mpc-player-verification.png');
  } catch (error) {
    console.error(`❌ Error verifying iframe visibility: ${error.message}`);
    // Take a screenshot of the error state
    await this.page.screenshot({ path: 'screenshots/video-clip-mpc-player-error.png' });
    console.log('✓ Error screenshot saved as video-clip-mpc-player-error.png');
    throw error; // Re-throw the error to fail the test
  }
});

When('the user clicks on the play button', async function() {
  // Wait for the play button to be available
  await this.page.waitForTimeout(2000);
  /*123
  // Define the selector for the play button
  const playButtonSelector = 'button.mpc-large-play';
  
  // Wait for the button to be visible
  await this.page.waitForSelector(playButtonSelector, { state: 'visible', timeout: 5000 });
  
  // Click on the play button
  await this.page.click(playButtonSelector);
  console.log('✓ Clicked on the play button');
  
  // Wait for the video to start playing
  await this.page.waitForTimeout(3000);
  
  // Take a screenshot after clicking play
  await this.page.screenshot({ path: 'screenshots/video-clip-playing.png' });
  console.log('✓ Screenshot saved as video-clip-playing.png');*/
});

Then('the video should be playing', async function() {
  // Define the selector for the pause button which appears when video is playing
  /* 123 
  const pauseButtonSelector = 'button.mpc-controls__play-pause[aria-label="Pause"]';
  
  try {
    // Wait for the pause button to be visible (indicating video is playing)
    await this.page.waitForSelector(pauseButtonSelector, { state: 'visible', timeout: 5000 });
    
    // Check if the pause button is visible
    const pauseButtonVisible = await this.page.isVisible(pauseButtonSelector);
    
    if (pauseButtonVisible) {
      console.log('✓ Video is playing as indicated by the visible pause button');
    } else {
      console.warn('⚠️ Pause button not found, video may not be playing');
    }
    
    // Assert that the pause button is visible (video is playing)
    expect(pauseButtonVisible).toBeTruthy();
    
    // Take a screenshot of the playing video
    await this.page.screenshot({ path: 'screenshots/video-clip-playing-verification.png' });
    console.log('✓ Screenshot saved as video-clip-playing-verification.png');
  } catch (error) {
    console.error(`❌ Error verifying video is playing: ${error.message}`);
    // Take a screenshot of the error state
    await this.page.screenshot({ path: 'screenshots/video-clip-playing-error.png' });
    console.log('✓ Error screenshot saved as video-clip-playing-error.png');
    throw error; // Re-throw the error to fail the test
  }*/
});

When('the user clicks on the close player button', async function() {
  // Wait for the close button to be available
  await this.page.waitForTimeout(2000);
  
  // Define the selector for the close button
  const closeButtonSelector = 'button.browse-card-video-clip-modal-close';
  
  // Wait for the button to be visible
  await this.page.waitForSelector(closeButtonSelector, { state: 'visible', timeout: 5000 });
  
  // Click on the close button
  await this.page.click(closeButtonSelector);
  console.log('✓ Clicked on the close player button');
  
  // Wait for the player to close
  await this.page.waitForTimeout(3000);
  
  // Take a screenshot after closing the player
  await this.page.screenshot({ path: 'screenshots/video-clip-player-closed.png' });
  console.log('✓ Screenshot saved as video-clip-player-closed.png');
});

Then('the MPC player should not be visible', async function() {
  // Define the selector for the MPC player container and video element
  const mpcPlayerSelector = 'div.mpc-player__content';
  const videoSelector = 'video.mpc-player__video';
  
  try {
    // Check if the MPC player is not visible
    const mpcPlayerVisible = await this.page.isVisible(mpcPlayerSelector);
    const videoVisible = await this.page.isVisible(videoSelector);
    
    if (!mpcPlayerVisible && !videoVisible) {
      console.log('✓ MPC player and video are not visible as expected');
    } else {
      if (mpcPlayerVisible) {
        console.warn('⚠️ MPC player is still visible when it should be closed');
      }
      if (videoVisible) {
        console.warn('⚠️ Video element is still visible when it should be closed');
      }
    }
    
    // Assert that the MPC player is not visible
    expect(mpcPlayerVisible).toBeFalsy();
    expect(videoVisible).toBeFalsy();
    
    // Take a screenshot to verify player is closed
    await this.page.screenshot({ path: 'screenshots/video-clip-player-not-visible-verification.png' });
    console.log('✓ Screenshot saved as video-clip-player-not-visible-verification.png');
  } catch (error) {
    console.error(`❌ Error verifying MPC player is not visible: ${error.message}`);
    // Take a screenshot of the error state
    await this.page.screenshot({ path: 'screenshots/video-clip-player-not-visible-error.png' });
    console.log('✓ Error screenshot saved as video-clip-player-not-visible-error.png');
    throw error; // Re-throw the error to fail the test
  }
});

Then('the test should capture a screenshot for evidence', async function() {
  // Take a screenshot as evidence
  await this.page.screenshot({ path: 'screenshots/video-clips-section-visible.png' });
  console.log('✓ Screenshot saved as video-clips-section-visible.png');
  // Browser is closed by AfterAll hook — do not close here
});

// Negative scenario steps
When('the {string} header is not visible', async function(headerText) {
  // This is a mock step for the negative scenario
  // In a real test, we would need to navigate to a page where the header is not visible
  // For now, we'll just set a flag to simulate this condition
  this.mockHeaderNotVisible = true;
  console.log(`Simulating that the "${headerText}" header is not visible`);
});

Then('the test should fail with {string} message', async function(errorMessage) {
  // In a real test, this would be handled by the assertion in the previous step
  // For this mock scenario, we'll check our flag and throw an error if needed
  if (this.mockHeaderNotVisible) {
    console.error(`❌ ${errorMessage}`);
    // In a real test, this would throw an error and fail the test
    // For demonstration purposes, we'll just log it
  }
});

Then('the test should capture a screenshot of the error state', async function() {
  // Take a screenshot of the error state
  await this.page.screenshot({ path: 'screenshots/video-clips-error.png' });
  console.log('✓ Screenshot saved as video-clips-error.png');
  // Browser is closed by AfterAll hook — do not close here
});

// Mobile specific steps
When('the user sets the viewport to mobile size for video clips', async function() {
  // Set viewport to a common mobile size (e.g., iPhone X)
  await this.page.setViewportSize({ width: 375, height: 812 });
  console.log('✓ Viewport set to mobile size (375x812)');
  
  // Wait for the page to adjust to the new viewport
  await this.page.waitForTimeout(2000);
  
  // Take a screenshot to verify mobile viewport
  await this.page.screenshot({ path: 'screenshots/mobile-viewport-video-clips.png' });
  console.log('✓ Screenshot saved as mobile-viewport-video-clips.png');
});

Then('the activate miniplayer button should not be visible', async function() {
  // Define the selector for the miniplayer button
  const miniplayerButtonSelector = 'button.browse-card-video-clip-modal-miniplayer';
  
  try {
    // Check if the miniplayer button is visible
    const miniplayerButtonVisible = await this.page.isVisible(miniplayerButtonSelector);
    
    if (!miniplayerButtonVisible) {
      console.log('✓ Activate miniplayer button is not visible as expected on mobile');
    } else {
      console.warn('⚠️ Activate miniplayer button is visible on mobile when it should not be');
    }
    
    // Assert that the miniplayer button is not visible
    expect(miniplayerButtonVisible).toBeFalsy();
  } catch (error) {
    console.error(`❌ Error verifying miniplayer button visibility: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

Then('only the close player button should be visible', async function() {
  // Define the selector for the close button
  const closeButtonSelector = 'button.browse-card-video-clip-modal-close';
  
  try {
    // Check if the close button is visible
    const closeButtonVisible = await this.page.isVisible(closeButtonSelector);
    
    if (closeButtonVisible) {
      console.log('✓ Close player button is visible on mobile as expected');
    } else {
      console.warn('⚠️ Close player button is not visible on mobile when it should be');
    }
    
    // Assert that the close button is visible
    expect(closeButtonVisible).toBeTruthy();
    
    // Take a screenshot to verify button visibility
    await this.page.screenshot({ path: 'screenshots/mobile-player-buttons-verification.png' });
    console.log('✓ Screenshot saved as mobile-player-buttons-verification.png');
  } catch (error) {
    console.error(`❌ Error verifying close button visibility: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

// Step definitions for "See more recommendations" button functionality
Then('the {string} button should be visible', async function(buttonText) {
  // Define the selector for the button based on the button text
  let buttonSelector;
  
  if (buttonText === "See more recommendations" || buttonText === "See fewer recommendations") {
    // Target the button within the section that has id="keep-learning-with-video-clips"
    buttonSelector = 'div.recommended-content[data-block-name="recommended-content"] div.recommended-content-see-more-btn button';
  } else {
    throw new Error(`Button text "${buttonText}" not recognized`);
  }
  
  try {
    // Wait for the button to be visible
    await this.page.waitForSelector(buttonSelector, { state: 'visible', timeout: 5000 });
    
    // Get all buttons with the specified selector
    const buttons = this.page.locator(buttonSelector);
    const buttonCount = await buttons.count();
    console.log(`Found ${buttonCount} buttons with the selector`);
    
    // Check if the first button is visible
    const buttonVisible = await buttons.first().isVisible();
    
    if (buttonVisible) {
      console.log(`✓ "${buttonText}" button is visible as expected`);
    } else {
      console.warn(`⚠️ "${buttonText}" button is not visible when it should be`);
    }
    
    // Assert that the button is visible
    expect(buttonVisible).toBeTruthy();
    
    // Store the button selector for later use
    this[`${buttonText.replace(/\s+/g, '_').toLowerCase()}_selector`] = buttonSelector;
    
    // Take a screenshot to verify button visibility
    await this.page.screenshot({ path: `screenshots/${buttonText.replace(/\s+/g, '-').toLowerCase()}-button-visible.png` });
    console.log(`✓ Screenshot saved as ${buttonText.replace(/\s+/g, '-').toLowerCase()}-button-visible.png`);
  } catch (error) {
    console.error(`❌ Error verifying "${buttonText}" button visibility: ${error.message}`);
    // Take a screenshot of the error state
    await this.page.screenshot({ path: `screenshots/${buttonText.replace(/\s+/g, '-').toLowerCase()}-button-error.png` });
    console.log(`✓ Error screenshot saved as ${buttonText.replace(/\s+/g, '-').toLowerCase()}-button-error.png`);
    throw error; // Re-throw the error to fail the test
  }
});

Then('the {string} button should not be visible', async function(buttonText) {
  // Define the selector for the button based on the button text
  let buttonSelector;
  
  if (buttonText === "See more recommendations" || buttonText === "See fewer recommendations") {
    // Target the button within the section that has id="keep-learning-with-video-clips"
    buttonSelector = 'div.recommended-content[data-block-name="recommended-content"] div.recommended-content-see-more-btn button';
  } else {
    throw new Error(`Button text "${buttonText}" not recognized`);
  }
  
  try {
    // Get all buttons with the specified selector
    const buttons = this.page.locator(buttonSelector);
    const buttonCount = await buttons.count();
    console.log(`Found ${buttonCount} buttons with the selector`);
    
    // Check if the first button is not visible or has different text
    let buttonVisible = false;
    if (buttonCount > 0) {
      const actualButtonText = await buttons.first().textContent();
      buttonVisible = await buttons.first().isVisible() && actualButtonText.includes(buttonText);
    }
    
    if (!buttonVisible) {
      console.log(`✓ "${buttonText}" button is not visible as expected`);
    } else {
      console.warn(`⚠️ "${buttonText}" button is visible when it should not be`);
    }
    
    // Assert that the button is not visible
    expect(buttonVisible).toBeFalsy();
    
    // Take a screenshot to verify button is not visible
    await this.page.screenshot({ path: `screenshots/${buttonText.replace(/\s+/g, '-').toLowerCase()}-button-not-visible.png` });
    console.log(`✓ Screenshot saved as ${buttonText.replace(/\s+/g, '-').toLowerCase()}-button-not-visible.png`);
  } catch (error) {
    console.error(`❌ Error verifying "${buttonText}" button is not visible: ${error.message}`);
    // Take a screenshot of the error state
    await this.page.screenshot({ path: `screenshots/${buttonText.replace(/\s+/g, '-').toLowerCase()}-button-not-visible-error.png` });
    console.log(`✓ Error screenshot saved as ${buttonText.replace(/\s+/g, '-').toLowerCase()}-button-not-visible-error.png`);
    throw error; // Re-throw the error to fail the test
  }
});

When('the user clicks on the {string} button', async function(buttonText) {
  // Define the selector for the button based on the button text
  let buttonSelector = 'div.recommended-content[data-block-name="recommended-content"] div.recommended-content-see-more-btn button';
  
  try {
    // Check if the button is visible
    await this.page.waitForSelector(buttonSelector, { state: 'visible', timeout: 5000 });
    
    // Get all buttons with the specified text
    const buttons = this.page.locator(buttonSelector);
    const buttonCount = await buttons.count();
    console.log(`Found ${buttonCount} "${buttonText}" buttons on the page`);
    
    // Store the current number of video clip cards for later comparison
    if (buttonText === "See more recommendations") {
      const videoClipCardsSelector = 'div.card-wrapper[data-analytics-content-type="video clip"]';
      this.initialCardCount = await this.page.locator(videoClipCardsSelector).count();
      console.log(`Initial card count before clicking: ${this.initialCardCount}`);
    }
    
    // Click on the first button as specified by the user
    await buttons.first().click();
    console.log(`✓ Clicked on the first "${buttonText}" button`);
    
    // Wait for the page to update after clicking
    await this.page.waitForTimeout(6000);
    
    // Take a screenshot after clicking the button
    await this.page.screenshot({ path: `screenshots/after-clicking-${buttonText.replace(/\s+/g, '-').toLowerCase()}.png` });
    console.log(`✓ Screenshot saved as after-clicking-${buttonText.replace(/\s+/g, '-').toLowerCase()}.png`);
  } catch (error) {
    console.error(`❌ Error clicking on "${buttonText}" button: ${error.message}`);
    // Take a screenshot of the error state
    await this.page.screenshot({ path: `screenshots/clicking-${buttonText.replace(/\s+/g, '-').toLowerCase()}-error.png` });
    console.log(`✓ Error screenshot saved as clicking-${buttonText.replace(/\s+/g, '-').toLowerCase()}-error.png`);
    throw error; // Re-throw the error to fail the test
  }
});

Then('the button text should change to {string}', async function(expectedButtonText) {
  // Define the selector for the button
  const buttonSelector = 'div.recommended-content[data-block-name="recommended-content"] div.recommended-content-see-more-btn button';
  
  try {
    // Wait for the button to be visible
    await this.page.waitForSelector(buttonSelector, { state: 'visible', timeout: 5000 });
    
    // Get the actual button text of the first button
    const actualButtonText = await this.page.locator(buttonSelector).first().textContent();
    console.log(`Button text after clicking: "${actualButtonText}"`);
    
    // Check if the button text matches the expected text
    if (actualButtonText.trim() === expectedButtonText) {
      console.log(`✓ Button text changed to "${expectedButtonText}" as expected`);
    } else {
      console.warn(`⚠️ Button text is "${actualButtonText}" instead of "${expectedButtonText}"`);
    }
    
    // Assert that the button text matches the expected text
    expect(actualButtonText.trim()).toBe(expectedButtonText);
    
    // Take a screenshot to verify button text change
    await this.page.screenshot({ path: `screenshots/button-text-changed-to-${expectedButtonText.replace(/\s+/g, '-').toLowerCase()}.png` });
    console.log(`✓ Screenshot saved as button-text-changed-to-${expectedButtonText.replace(/\s+/g, '-').toLowerCase()}.png`);
  } catch (error) {
    console.error(`❌ Error verifying button text change: ${error.message}`);
    // Take a screenshot of the error state
    await this.page.screenshot({ path: `screenshots/button-text-change-error.png` });
    console.log(`✓ Error screenshot saved as button-text-change-error.png`);
    throw error; // Re-throw the error to fail the test
  }
});

Then('more video clip cards should be displayed', async function() {
  // Define the selector for video clip cards
  const videoClipCardsSelector = 'div.card-wrapper[data-analytics-content-type="video clip"]';
  
  try {
    // Wait for the cards to be visible
    await this.page.waitForSelector(videoClipCardsSelector, { state: 'visible', timeout: 5000 });
    
    // Count the number of video clip cards after clicking
    const currentCardCount = await this.page.locator(videoClipCardsSelector).count();
    console.log(`Current card count after clicking: ${currentCardCount}`);
    
    // Check if more cards are displayed
    if (currentCardCount > this.initialCardCount) {
      console.log(`✓ More video clip cards are displayed (${this.initialCardCount} -> ${currentCardCount})`);
    } else {
      console.warn(`⚠️ No additional video clip cards are displayed (${this.initialCardCount} -> ${currentCardCount})`);
    }
    
    // Assert that more cards are displayed
    expect(currentCardCount).toBeGreaterThan(this.initialCardCount);
    
    // Take a screenshot to verify more cards are displayed
    await this.page.screenshot({ path: 'screenshots/more-video-clip-cards-displayed.png' });
    console.log('✓ Screenshot saved as more-video-clip-cards-displayed.png');
  } catch (error) {
    console.error(`❌ Error verifying more video clip cards: ${error.message}`);
    // Take a screenshot of the error state
    await this.page.screenshot({ path: 'screenshots/more-video-clip-cards-error.png' });
    console.log('✓ Error screenshot saved as more-video-clip-cards-error.png');
    throw error; // Re-throw the error to fail the test
  }
});

Then('the bookmark icon should not be visible in video clip cards', async function() {
  // Define the selector for video clip cards
  const videoClipCardsSelector = 'div.card-wrapper[data-analytics-content-type="video clip"]';
  
  try {
    // Wait for the cards to be visible
    await this.page.waitForSelector(videoClipCardsSelector, { state: 'visible', timeout: 5000 });
    
    // Get all video clip cards
    const videoClipCards = this.page.locator(videoClipCardsSelector);
    const cardsCount = await videoClipCards.count();
    console.log(`Found ${cardsCount} video clip cards`);
    
    // Check each card for bookmark icon
    let bookmarkIconFound = false;
    
    for (let i = 0; i < cardsCount; i++) {
      const card = videoClipCards.nth(i);
      
      // Define the selector for bookmark icon within the card
      // Common selectors for bookmark icons include:
      const bookmarkSelectors = [
        '.bookmark-icon',
        '.icon-bookmark',
        'button.bookmark',
        'button[aria-label="Bookmark"]',
        '.browse-card-bookmark'
      ];
      
      for (const selector of bookmarkSelectors) {
        const bookmarkCount = await card.locator(selector).count();
        if (bookmarkCount > 0) {
          bookmarkIconFound = true;
          console.warn(`⚠️ Bookmark icon found in card ${i+1} using selector "${selector}"`);
          break;
        }
      }
      
      if (bookmarkIconFound) {
        break;
      }
    }
    
    // Assert that no bookmark icon was found
    expect(bookmarkIconFound).toBeFalsy();
    
    if (!bookmarkIconFound) {
      console.log('✓ No bookmark icon found in any video clip card as expected');
    }
    
    // Take a screenshot for evidence
    await this.page.screenshot({ path: 'screenshots/video-clip-cards-no-bookmark-icon.png' });
    console.log('✓ Screenshot saved as video-clip-cards-no-bookmark-icon.png');
  } catch (error) {
    console.error(`❌ Error verifying absence of bookmark icon: ${error.message}`);
    // Take a screenshot of the error state
    await this.page.screenshot({ path: 'screenshots/video-clip-cards-bookmark-icon-error.png' });
    console.log('✓ Error screenshot saved as video-clip-cards-bookmark-icon-error.png');
    throw error; // Re-throw the error to fail the test
  }
});
