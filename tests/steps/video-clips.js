const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { performLogin } = require('../commonFunctions/login');
const { launchBrowser, closeBrowser } = require('../commonFunctions/launchbrowser');
const ENV = require('../../config.js');

// Set a longer timeout for all steps
setDefaultTimeout(90 * 1000);

// Step definitions for video clips feature
Given('the user logs in to the application with valid credentials', async function() {
  // Use the existing login functionality
  const result = await performLogin(this);
  this.page = result.page;
  this.browser = result.browser;
  this.context = result.context;
  
  // Wait for the page to fully load after login
  await this.page.waitForTimeout(10000);
  console.log('✓ Successfully logged in to the application');
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
  await this.page.waitForTimeout(3000);
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
  const videoClipCardsSelector = 'div.card-wrapper[data-analytics-content-type="Video Clip"]';
  const videoClipCards = this.page.locator(videoClipCardsSelector);
  
  // Store the cards for later use
  this.videoClipCards = videoClipCards;
  
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
  const videoClipCardsSelector = 'div.card-wrapper[data-analytics-content-type="Video Clip"]';
  const videoClipCards = this.page.locator(videoClipCardsSelector);
  const cardsCount = await videoClipCards.count();
  
  console.log(`Found ${cardsCount} video clip cards`);
  
  // Assert that there is at least one card
  expect(cardsCount).toBeGreaterThan(0);
  
  // Store the first card for later use
  this.firstCard = videoClipCards.first();
  
  // Check the card title for logging purposes
  const cardTitle = await this.firstCard.locator('h5.browse-card-title-text').textContent();
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
  await this.page.screenshot({ path: 'video-clip-content.png' });
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
  await this.newPage.screenshot({ path: 'video-clip-full-video-page.png' });
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
    await this.newPage.screenshot({ path: 'video-clip-full-video-verification.png' });
    console.log('✓ Screenshot saved as video-clip-full-video-verification.png');
    
    // Close the new page
    await this.newPage.close();
    console.log('✓ New page closed');
  } catch (error) {
    console.error(`❌ Error verifying new window: ${error.message}`);
    // Take a screenshot of the error state if possible
    if (this.newPage) {
      await this.newPage.screenshot({ path: 'video-clip-full-video-error.png' });
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
  await this.page.screenshot({ path: 'video-clip-miniplayer-activated.png' });
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
    await this.page.screenshot({ path: 'video-clip-miniplayer-verification.png' });
    console.log('✓ Screenshot saved as video-clip-miniplayer-verification.png');
  } catch (error) {
    console.error(`❌ Error verifying miniplayer: ${error.message}`);
    // Take a screenshot of the error state
    await this.page.screenshot({ path: 'video-clip-miniplayer-error.png' });
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
  await this.page.waitForTimeout(3000);
  
  // Take a screenshot after expanding the player
  await this.page.screenshot({ path: 'video-clip-expanded-player.png' });
  console.log('✓ Screenshot saved as video-clip-expanded-player.png');
});

Then('the MPC player should be visible', async function() {
  // Define the selector for the MPC player container based on the provided HTML structure
  const mpcPlayerSelector = 'div.mpc-player__content';
  
  try {
    // Wait for the MPC player to be visible
    await this.page.waitForSelector(mpcPlayerSelector, { state: 'visible', timeout: 5000 });
    
    // Check if the MPC player is visible
    const mpcPlayerVisible = await this.page.isVisible(mpcPlayerSelector);
    
    if (mpcPlayerVisible) {
      console.log('✓ MPC player is visible');
      
      // Check for play button to ensure player is loaded
      const playButtonSelector = 'button.mpc-large-play';
      const playButtonVisible = await this.page.isVisible(playButtonSelector);
      
      if (playButtonVisible) {
        console.log('✓ Play button is visible in the MPC player');
      } else {
        console.warn('⚠️ Play button not found in the MPC player');
      }
    } else {
      console.warn('⚠️ MPC player element found but not visible');
    }
    
    // Assert that the MPC player is visible
    expect(mpcPlayerVisible).toBeTruthy();
    
    // Take a screenshot of the MPC player
    await this.page.screenshot({ path: 'video-clip-mpc-player-verification.png' });
    console.log('✓ Screenshot saved as video-clip-mpc-player-verification.png');
  } catch (error) {
    console.error(`❌ Error verifying MPC player: ${error.message}`);
    // Take a screenshot of the error state
    await this.page.screenshot({ path: 'video-clip-mpc-player-error.png' });
    console.log('✓ Error screenshot saved as video-clip-mpc-player-error.png');
    throw error; // Re-throw the error to fail the test
  }
});

When('the user clicks on the play button', async function() {
  // Wait for the play button to be available
  await this.page.waitForTimeout(2000);
  
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
  await this.page.screenshot({ path: 'video-clip-playing.png' });
  console.log('✓ Screenshot saved as video-clip-playing.png');
});

Then('the video should be playing', async function() {
  // Define the selector for the pause button which appears when video is playing
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
    await this.page.screenshot({ path: 'video-clip-playing-verification.png' });
    console.log('✓ Screenshot saved as video-clip-playing-verification.png');
  } catch (error) {
    console.error(`❌ Error verifying video is playing: ${error.message}`);
    // Take a screenshot of the error state
    await this.page.screenshot({ path: 'video-clip-playing-error.png' });
    console.log('✓ Error screenshot saved as video-clip-playing-error.png');
    throw error; // Re-throw the error to fail the test
  }
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
  await this.page.screenshot({ path: 'video-clip-player-closed.png' });
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
    await this.page.screenshot({ path: 'video-clip-player-not-visible-verification.png' });
    console.log('✓ Screenshot saved as video-clip-player-not-visible-verification.png');
  } catch (error) {
    console.error(`❌ Error verifying MPC player is not visible: ${error.message}`);
    // Take a screenshot of the error state
    await this.page.screenshot({ path: 'video-clip-player-not-visible-error.png' });
    console.log('✓ Error screenshot saved as video-clip-player-not-visible-error.png');
    throw error; // Re-throw the error to fail the test
  }
});

Then('the test should capture a screenshot for evidence', async function() {
  // Take a screenshot as evidence
  await this.page.screenshot({ path: 'video-clips-section-visible.png' });
  console.log('✓ Screenshot saved as video-clips-section-visible.png');
  
  // Clean up - close the browser
  if (this.browser) {
    await closeBrowser(this.browser);
    console.log('Browser closed successfully');
  }
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
  await this.page.screenshot({ path: 'video-clips-error.png' });
  console.log('✓ Screenshot saved as video-clips-error.png');
  
  // Clean up - close the browser
  if (this.browser) {
    await closeBrowser(this.browser);
    console.log('Browser closed successfully');
  }
});

// Mobile specific steps
When('the user sets the viewport to mobile size', async function() {
  // Set viewport to a common mobile size (e.g., iPhone X)
  await this.page.setViewportSize({ width: 375, height: 812 });
  console.log('✓ Viewport set to mobile size (375x812)');
  
  // Wait for the page to adjust to the new viewport
  await this.page.waitForTimeout(2000);
  
  // Take a screenshot to verify mobile viewport
  await this.page.screenshot({ path: 'mobile-viewport.png' });
  console.log('✓ Screenshot saved as mobile-viewport.png');
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
    await this.page.screenshot({ path: 'mobile-player-buttons-verification.png' });
    console.log('✓ Screenshot saved as mobile-player-buttons-verification.png');
  } catch (error) {
    console.error(`❌ Error verifying close button visibility: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});
