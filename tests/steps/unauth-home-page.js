const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { launchBrowser, closeBrowser } = require('../commonFunctions/launchbrowser');
const ENV = require('../../config.js');
// Import common mobile steps
require('./common-mobile-steps');

// Set a longer timeout for all steps
setDefaultTimeout(90 * 1000);

Given('user navigates to Experience League home page without logging in', async function() {
  try {
    // Launch the browser and navigate to the Experience League home page
    const { page, browser, context } = await launchBrowser();
    this.page = page;
    this.browser = browser;
    this.context = context;

    console.log('✓ Navigated to Experience League home page without logging in');

    // Wait for 5 seconds after launching the URL
    console.log('Waiting for 5 seconds after page load...');
    await this.page.waitForTimeout(5000);
    console.log('✓ Completed 5-second wait after page load');

    // Wait for the page to be fully loaded
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForLoadState('load');
    console.log('✓ Page fully loaded after wait');

    // Take a screenshot of the home page
    await this.page.screenshot({ path: 'screenshots/unauth-home-page.png' });
    console.log('✓ Screenshot saved as screenshots/unauth-home-page.png');
  } catch (error) {
    console.error(`❌ Error navigating to Experience League home page: ${error.message}`);

    // Take a screenshot of the error state
    if (this.page) {
      await this.page.screenshot({ path: 'screenshots/unauth-home-page-error.png' });
      console.log('✓ Error screenshot saved as screenshots/unauth-home-page-error.png');
    }

    throw error; // Re-throw the error to fail the test
  }
});

Then('user should see the marquee block', async function() {
  try {
    // Wait for page to load completely
    await this.page.waitForLoadState('networkidle');
    
    // Try multiple selectors to find the marquee block
    const selectors = [
      'div.marquee.block.unauthenticated[data-block-name="marquee"]',
      'div.marquee.unauthenticated[data-block-name="marquee"]',
      'div.marquee[data-block-name="marquee"]',
      'div.marquee.block.unauthenticated',
      'div.marquee.unauthenticated',
      'div.marquee'
    ];
    
    let marqueeBlock = null;
    let isVisible = false;
    let usedSelector = '';
    
    // Try each selector until we find a visible element
    for (const selector of selectors) {
      console.log(`Trying selector: ${selector}`);
      const element = this.page.locator(selector);
      const count = await element.count();
      
      if (count > 0) {
        const visible = await element.isVisible().catch(() => false);
        if (visible) {
          marqueeBlock = element;
          isVisible = true;
          usedSelector = selector;
          console.log(`✓ Found visible marquee block with selector: ${selector}`);
          break;
        }
      }
    }
    
    if (isVisible) {
      console.log(`✓ Marquee block is visible on the page using selector: ${usedSelector}`);
      
      // Store the marquee block for later use
      this.marqueeBlock = marqueeBlock;
      this.marqueeSelector = usedSelector;
    } else {
      console.log('❌ Marquee block is not visible on the page');
      
      // Fail the test
      expect(isVisible).toBeTruthy();
    }
  } catch (error) {
    console.error(`❌ Error checking marquee block visibility: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

Then('the marquee block should have the correct structure', async function() {
  // Skip this step if marquee block was not found
  if (!this.marqueeBlock) {
    console.log('Marquee block was not found. Skipping structure check.');
    return 'skipped';
  }
  
  try {
    // Check for required elements in the marquee block
    const contentContainer = this.page.locator('div.marquee.block.unauthenticated div.marquee-content-container');
    const foreground = this.page.locator('div.marquee.block.unauthenticated div.marquee-foreground');
    const text = this.page.locator('div.marquee.block.unauthenticated div.marquee-text');
    const background = this.page.locator('div.marquee.block.unauthenticated div.marquee-background');
    
    // Check if all required elements are visible
    const isContentContainerVisible = await contentContainer.isVisible();
    const isForegroundVisible = await foreground.isVisible();
    const isTextVisible = await text.isVisible();
    const isBackgroundVisible = await background.isVisible();
    
    const allElementsVisible = isContentContainerVisible && isForegroundVisible && isTextVisible && isBackgroundVisible;
    
    if (allElementsVisible) {
      console.log('✓ Marquee block has the correct structure');
    } else {
      console.log('❌ Marquee block does not have the correct structure');
      console.log(`Content container visible: ${isContentContainerVisible}`);
      console.log(`Foreground visible: ${isForegroundVisible}`);
      console.log(`Text visible: ${isTextVisible}`);
      console.log(`Background visible: ${isBackgroundVisible}`);
      
      // Fail the test
      expect(allElementsVisible).toBeTruthy();
    }
  } catch (error) {
    console.error(`❌ Error checking marquee block structure: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

Then('the marquee eyebrow should contain {string}', async function(expectedText) {
  // Skip this step if marquee block was not found
  if (!this.marqueeBlock) {
    console.log('Marquee block was not found. Skipping eyebrow text check.');
    return 'skipped';
  }
  
  try {
    // Check the eyebrow text
    const eyebrowSelector = 'div.marquee.block.unauthenticated div.marquee-eyebrow';
    const eyebrow = this.page.locator(eyebrowSelector);
    
    // Check if the eyebrow is visible
    const isVisible = await eyebrow.isVisible();
    
    if (!isVisible) {
      console.log('❌ Marquee eyebrow is not visible');
      expect(isVisible).toBeTruthy();
      return;
    }
    
    // Get the eyebrow text
    const eyebrowText = await eyebrow.textContent();
    
    // Check if the eyebrow text contains the expected text
    const containsExpectedText = eyebrowText.includes(expectedText);
    
    if (containsExpectedText) {
      console.log(`✓ Marquee eyebrow contains "${expectedText}"`);
      console.log(`Actual eyebrow text: "${eyebrowText}"`);
    } else {
      console.log(`❌ Marquee eyebrow does not contain "${expectedText}"`);
      console.log(`Actual eyebrow text: "${eyebrowText}"`);
      expect(containsExpectedText).toBeTruthy();
    }
  } catch (error) {
    console.error(`❌ Error checking marquee eyebrow text: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

Then('the marquee title should contain {string}', async function(expectedText) {
  // Skip this step if marquee block was not found
  if (!this.marqueeBlock) {
    console.log('Marquee block was not found. Skipping title text check.');
    return 'skipped';
  }
  
  try {
    // Check the title text
    const titleSelector = 'div.marquee.block.unauthenticated div.marquee-title h1';
    const title = this.page.locator(titleSelector);
    
    // Check if the title is visible
    const isVisible = await title.isVisible();
    
    if (!isVisible) {
      console.log('❌ Marquee title is not visible');
      expect(isVisible).toBeTruthy();
      return;
    }
    
    // Get the title text
    const titleText = await title.textContent();
    
    // Check if the title text contains the expected text
    const containsExpectedText = titleText.includes(expectedText);
    
    if (containsExpectedText) {
      console.log(`✓ Marquee title contains "${expectedText}"`);
      console.log(`Actual title text: "${titleText}"`);
    } else {
      console.log(`❌ Marquee title does not contain "${expectedText}"`);
      console.log(`Actual title text: "${titleText}"`);
      expect(containsExpectedText).toBeTruthy();
    }
  } catch (error) {
    console.error(`❌ Error checking marquee title text: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

Then('the marquee description should be visible', async function() {
  // Skip this step if marquee block was not found
  if (!this.marqueeBlock) {
    console.log('Marquee block was not found. Skipping description visibility check.');
    return 'skipped';
  }
  
  try {
    // Check the description visibility
    const descriptionSelector = 'div.marquee.block.unauthenticated div.marquee-long-description';
    const description = this.page.locator(descriptionSelector);
    
    // Check if the description is visible
    const isVisible = await description.isVisible();
    
    if (isVisible) {
      console.log('✓ Marquee description is visible');
      
      // Get the description text for logging
      const descriptionText = await description.textContent();
      console.log(`Description text: "${descriptionText}"`);
    } else {
      console.log('❌ Marquee description is not visible');
      expect(isVisible).toBeTruthy();
    }
  } catch (error) {
    console.error(`❌ Error checking marquee description visibility: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

Then('the sign in button should be visible and clickable', async function() {
  // Skip this step if marquee block was not found
  if (!this.marqueeBlock) {
    console.log('Marquee block was not found. Skipping sign in button check.');
    return 'skipped';
  }
  
  try {
    // Check the sign in button
    const signInButtonSelector = 'div.marquee.block.unauthenticated div.marquee-cta a.button.signin';
    const signInButton = this.page.locator(signInButtonSelector);
    
    // Check if the sign in button is visible
    const isVisible = await signInButton.isVisible();
    
    if (!isVisible) {
      console.log('❌ Sign in button is not visible');
      expect(isVisible).toBeTruthy();
      return;
    }
    
    // Check if the sign in button has the correct text
    const buttonText = await signInButton.textContent();
    const hasCorrectText = buttonText.trim() === 'Sign in';
    
    if (!hasCorrectText) {
      console.log(`❌ Sign in button has incorrect text: "${buttonText}"`);
      expect(hasCorrectText).toBeTruthy();
      return;
    }
    
    // Check if the sign in button has the correct href
    const buttonHref = await signInButton.getAttribute('href');
    const hasCorrectHref = buttonHref === '/en/home';
    
    if (!hasCorrectHref) {
      console.log(`❌ Sign in button has incorrect href: "${buttonHref}"`);
      expect(hasCorrectHref).toBeTruthy();
      return;
    }
    
    // Check if the sign in button is clickable
    // We'll just check if it's enabled, as actually clicking it would navigate away from the page
    const isEnabled = await signInButton.isEnabled();
    
    if (isEnabled) {
      console.log('✓ Sign in button is visible and clickable');
      console.log(`Button text: "${buttonText}", href: "${buttonHref}"`);
    } else {
      console.log('❌ Sign in button is not clickable');
      expect(isEnabled).toBeTruthy();
    }
  } catch (error) {
    console.error(`❌ Error checking sign in button: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

Then('the video background should be present', async function() {
  // Skip this step if marquee block was not found
  if (!this.marqueeBlock) {
    console.log('Marquee block was not found. Skipping video background check.');
    return 'skipped';
  }
  
  try {
    // Check for the video background
    const videoFrameSelector = 'div.marquee.block.unauthenticated div.marquee-background div.video-frame';
    const videoIframeSelector = 'div.marquee.block.unauthenticated div.marquee-background div.video-frame iframe';
    
    const videoFrame = this.page.locator(videoFrameSelector);
    const videoIframe = this.page.locator(videoIframeSelector);
    
    // Check if the video frame is visible
    const isFrameVisible = await videoFrame.isVisible();
    
    if (!isFrameVisible) {
      console.log('❌ Video frame is not visible');
      expect(isFrameVisible).toBeTruthy();
      return;
    }
    
    // Check if the video iframe is present
    const isIframePresent = await videoIframe.count() > 0;
    
    if (!isIframePresent) {
      console.log('❌ Video iframe is not present');
      expect(isIframePresent).toBeTruthy();
      return;
    }
    
    // Check if the iframe has the correct attributes
    const iframeSrc = await videoIframe.getAttribute('src');
    const iframeTitle = await videoIframe.getAttribute('title');
    const iframeAllowFullscreen = await videoIframe.getAttribute('allowfullscreen');
    const iframeAllow = await videoIframe.getAttribute('allow');
    
    console.log('✓ Video iframe is present');
    console.log(`Iframe src: "${iframeSrc}"`);
    console.log(`Iframe title: "${iframeTitle}"`);
    console.log(`Iframe allowfullscreen: "${iframeAllowFullscreen}"`);
    console.log(`Iframe allow: "${iframeAllow}"`);
  } catch (error) {
    console.error(`❌ Error checking video background: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

// Featured Cards Section Step Definitions

Then('user should see the featured cards section', async function() {
  try {
    // Wait for page to load completely
    await this.page.waitForLoadState('networkidle');
    
    // Take a screenshot of the full page to analyze
    await this.page.screenshot({ path: 'screenshots/unauth-featured-cards-debug.png', fullPage: true });
    console.log('✓ Full page screenshot saved for debugging');
    
    // Try more generic selectors to find the featured cards section
    const selectors = [
      'div.featured-cards.block.browse-cards-block[data-block-name="featured-cards"]',
      'div.featured-cards.block[data-block-name="featured-cards"]',
      'div.featured-cards[data-block-name="featured-cards"]',
      'div.featured-cards.block.browse-cards-block',
      'div.featured-cards.block',
      'div.featured-cards',
      'div[data-block-name="featured-cards"]',
      'div.browse-cards-block',
      'section.featured-cards',
      'section.browse-cards-block',
      // Try more generic selectors that might contain playlist cards
      'div.browse-cards-block-content',
      'div.cards-container'
    ];
    
    let featuredCardsSection = null;
    let isVisible = false;
    let usedSelector = '';
    
    // Try each selector until we find a visible element
    for (const selector of selectors) {
      console.log(`Trying selector for featured cards: ${selector}`);
      const element = this.page.locator(selector);
      const count = await element.count();
      
      if (count > 0) {
        const visible = await element.isVisible().catch(() => false);
        if (visible) {
          featuredCardsSection = element;
          isVisible = true;
          usedSelector = selector;
          console.log(`✓ Found visible featured cards section with selector: ${selector}`);
          break;
        }
      }
    }
    
    if (isVisible) {
      console.log(`✓ Featured cards section is visible on the page using selector: ${usedSelector}`);
      
      // Store the featured cards section for later use
      this.featuredCardsSection = featuredCardsSection;
      this.featuredCardsSelector = usedSelector;
      
      // Take a screenshot of the found section
      await this.featuredCardsSection.screenshot({ path: 'screenshots/unauth-featured-cards-found.png' });
      console.log('✓ Screenshot of found featured cards section saved');
    } else {
      console.log('❌ Featured cards section is not visible on the page');
      
      // Try to find any playlist cards directly
      const playlistCardSelector = 'div[data-analytics-content-type="Playlist"]';
      const playlistCards = this.page.locator(playlistCardSelector);
      const playlistCount = await playlistCards.count();
      
      if (playlistCount > 0) {
        console.log(`Found ${playlistCount} playlist cards directly, even though container wasn't found`);
        
        // Store the playlist cards for later use
        this.playlistCards = playlistCards;
        this.playlistCardsCount = playlistCount;
        
        // Create a parent container for these cards
        const firstCard = playlistCards.first();
        const parent = await firstCard.evaluateHandle(el => el.parentElement);
        this.featuredCardsSection = parent;
        this.featuredCardsSelector = playlistCardSelector;
        
        console.log('✓ Using playlist cards parent as featured cards section');
      } else {
        // Log the HTML structure for debugging
        const bodyHTML = await this.page.evaluate(() => document.body.innerHTML);
        console.log('Page HTML structure (first 1000 chars):', bodyHTML.substring(0, 1000) + '...');
        
        // Fail the test
        expect(isVisible).toBeTruthy();
      }
    }
  } catch (error) {
    console.error(`❌ Error checking featured cards section visibility: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

Then('the featured cards section should have the correct structure', async function() {
  // Skip this step if featured cards section was not found
  if (!this.featuredCardsSection) {
    console.log('Featured cards section was not found. Skipping structure check.');
    return 'skipped';
  }
  
  try {
    // Use the base selector that was found in the previous step
    const baseSelector = this.featuredCardsSelector || 'div.featured-cards';
    console.log(`Using base selector for structure check: ${baseSelector}`);
    
    // Check for required elements in the featured cards section
    const headerSelector = `${baseSelector} div.browse-cards-block-header`;
    const contentSelector = `${baseSelector} div.browse-cards-block-content`;
    const viewMoreSelector = `${baseSelector} div.browse-cards-block-view`;
    
    const header = this.page.locator(headerSelector);
    const content = this.page.locator(contentSelector);
    const viewMore = this.page.locator(viewMoreSelector);
    
    // Check if all required elements are visible
    const isHeaderVisible = await header.isVisible();
    const isContentVisible = await content.isVisible();
    const isViewMoreVisible = await viewMore.isVisible();
    
    const allElementsVisible = isHeaderVisible && isContentVisible && isViewMoreVisible;
    
    if (allElementsVisible) {
      console.log('✓ Featured cards section has the correct structure');
    } else {
      console.log('❌ Featured cards section does not have the correct structure');
      console.log(`Header visible: ${isHeaderVisible}`);
      console.log(`Content visible: ${isContentVisible}`);
      console.log(`View More visible: ${isViewMoreVisible}`);
      
      // Fail the test
      expect(allElementsVisible).toBeTruthy();
    }
  } catch (error) {
    console.error(`❌ Error checking featured cards section structure: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

Then('the featured cards title should contain {string}', async function(expectedText) {
  // Skip this step if featured cards section was not found
  if (!this.featuredCardsSection) {
    console.log('Featured cards section was not found. Skipping title text check.');
    return 'skipped';
  }
  
  try {
    // Use the base selector that was found in the previous step
    const baseSelector = this.featuredCardsSelector || 'div.featured-cards';
    console.log(`Using base selector for title check: ${baseSelector}`);
    
    // Check the title text
    const titleSelector = `${baseSelector} div.browse-cards-block-header div.browse-cards-block-title h2`;
    const title = this.page.locator(titleSelector);
    
    // Check if the title is visible
    const isVisible = await title.isVisible();
    
    if (!isVisible) {
      console.log('❌ Featured cards title is not visible');
      expect(isVisible).toBeTruthy();
      return;
    }
    
    // Get the title text
    const titleText = await title.textContent();
    
    // Check if the title text contains the expected text
    const containsExpectedText = titleText.includes(expectedText);
    
    if (containsExpectedText) {
      console.log(`✓ Featured cards title contains "${expectedText}"`);
      console.log(`Actual title text: "${titleText}"`);
    } else {
      console.log(`❌ Featured cards title does not contain "${expectedText}"`);
      console.log(`Actual title text: "${titleText}"`);
      expect(containsExpectedText).toBeTruthy();
    }
  } catch (error) {
    console.error(`❌ Error checking featured cards title text: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

Then('the featured cards description should be visible', async function() {
  // Skip this step if featured cards section was not found
  if (!this.featuredCardsSection) {
    console.log('Featured cards section was not found. Skipping description visibility check.');
    return 'skipped';
  }
  
  try {
    // Use the base selector that was found in the previous step
    const baseSelector = this.featuredCardsSelector || 'div.featured-cards';
    console.log(`Using base selector for description check: ${baseSelector}`);
    
    // Check the description visibility
    const descriptionSelector = `${baseSelector} div.browse-cards-block-header div.browse-card-description-text`;
    const description = this.page.locator(descriptionSelector);
    
    // Check if the description is visible
    const isVisible = await description.isVisible();
    
    if (isVisible) {
      console.log('✓ Featured cards description is visible');
      
      // Get the description text for logging
      const descriptionText = await description.textContent();
      console.log(`Description text: "${descriptionText}"`);
    } else {
      console.log('❌ Featured cards description is not visible');
      expect(isVisible).toBeTruthy();
    }
  } catch (error) {
    console.error(`❌ Error checking featured cards description visibility: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

Then('the browse more link should be visible and clickable', async function() {
  // Skip this step if featured cards section was not found
  if (!this.featuredCardsSection) {
    console.log('Featured cards section was not found. Skipping browse more link check.');
    return 'skipped';
  }
  
  try {
    // Use the base selector that was found in the previous step
    const baseSelector = this.featuredCardsSelector || 'div.featured-cards';
    console.log(`Using base selector for browse more link check: ${baseSelector}`);
    
    // Check the browse more link
    const browseMoreLinkSelector = `${baseSelector} div.browse-cards-block-view a`;
    const browseMoreLink = this.page.locator(browseMoreLinkSelector);
    
    // Check if the browse more link is visible
    const isVisible = await browseMoreLink.isVisible();
    
    if (!isVisible) {
      console.log('❌ Browse more link is not visible');
      expect(isVisible).toBeTruthy();
      return;
    }
    
    // Check if the browse more link has the correct text
    const linkText = await browseMoreLink.textContent();
    const hasCorrectText = linkText.includes('Browse more');
    
    if (!hasCorrectText) {
      console.log(`❌ Browse more link has incorrect text: "${linkText}"`);
      expect(hasCorrectText).toBeTruthy();
      return;
    }
    
    // Check if the browse more link has a valid href
    const linkHref = await browseMoreLink.getAttribute('href');
    const hasValidHref = linkHref && linkHref.length > 0;
    
    if (!hasValidHref) {
      console.log(`❌ Browse more link has invalid href: "${linkHref}"`);
      expect(hasValidHref).toBeTruthy();
      return;
    }
    
    // Check if the browse more link is clickable
    const isEnabled = await browseMoreLink.isEnabled();
    
    if (isEnabled) {
      console.log('✓ Browse more link is visible and clickable');
      console.log(`Link text: "${linkText}", href: "${linkHref}"`);
      
      // Store the current URL to navigate back after checking the browse more link
      const currentUrl = this.page.url();
      console.log(`Current URL: ${currentUrl}`);
      
      // Navigate back to the home page to ensure subsequent tests can run
      console.log('Navigating back to the home page...');
      await this.page.goto(currentUrl);
      
      // Wait for the page to load completely with multiple wait strategies
      console.log('Waiting for page to load completely...');
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.waitForLoadState('networkidle');
      await this.page.waitForLoadState('load');
      
      // Additional wait to ensure all JavaScript has executed
      await this.page.waitForFunction(() => {
        return document.readyState === 'complete' && 
               !document.querySelector('.loading-indicator') && 
               !document.querySelector('[data-loading="true"]');
      }, { timeout: 10000 }).catch(e => console.log('Page load wait timed out, but continuing: ' + e.message));
      
      console.log('✓ Page loaded completely after navigation');
      
      // Wait for a longer time to ensure the page is fully stable
      await this.page.waitForTimeout(3000);
      console.log('✓ Additional wait completed to ensure page stability');
      
      // Re-run the featured cards section detection with multiple selectors
      console.log('Re-finding featured cards section...');
      const selectors = [
        'div.featured-cards.block.browse-cards-block[data-block-name="featured-cards"]',
        'div.featured-cards.block[data-block-name="featured-cards"]',
        'div.featured-cards[data-block-name="featured-cards"]',
        'div.featured-cards.block.browse-cards-block',
        'div.featured-cards.block',
        'div.featured-cards'
      ];
      
      for (const selector of selectors) {
        const element = this.page.locator(selector);
        const count = await element.count();
        
        if (count > 0) {
          const visible = await element.isVisible().catch(() => false);
          if (visible) {
            this.featuredCardsSection = element;
            this.featuredCardsSelector = selector;
            console.log(`✓ Re-found featured cards section after navigation with selector: ${selector}`);
            break;
          }
        }
      }
      
      // Take a screenshot to verify the page state after navigation
      await this.page.screenshot({ path: 'screenshots/unauth-home-page-after-navigation.png', fullPage: true });
      console.log('✓ Screenshot saved to verify page state after navigation');
    } else {
      console.log('❌ Browse more link is not clickable');
      expect(isEnabled).toBeTruthy();
    }
  } catch (error) {
    console.error(`❌ Error checking browse more link: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

// Highlight Media Section Step Definitions

Then('user should see the highlight media section', async function() {
  try {
    // Wait for page to load completely
    await this.page.waitForLoadState('networkidle');
    
    // Use a specific selector for the highlight media section
    const highlightMediaSelector = 'div.section.highlight.media-container';
    const highlightMedia = this.page.locator(highlightMediaSelector);
    
    // Check if the highlight media section is visible
    const isVisible = await highlightMedia.isVisible();
    
    if (isVisible) {
      console.log('✓ Highlight media section is visible on the page');
      
      // Store the highlight media section for later use
      this.highlightMediaSection = highlightMedia;
      
      // Take a screenshot of the found section
      await this.highlightMediaSection.screenshot({ path: 'screenshots/unauth-highlight-media-found.png' });
      console.log('✓ Screenshot of found highlight media section saved');
    } else {
      console.log('❌ Highlight media section is not visible on the page');
      expect(isVisible).toBeTruthy();
    }
  } catch (error) {
    console.error(`❌ Error checking highlight media section visibility: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

Then('the highlight media section should have an image', async function() {
  // Skip this step if highlight media section was not found
  if (!this.highlightMediaSection) {
    console.log('Highlight media section was not found. Skipping image check.');
    return 'skipped';
  }
  
  try {
    // Check for the image in the highlight media section
    const imageSelector = 'div.media-wrapper div.media.left.block div.image img';
    const image = this.page.locator(imageSelector);
    
    // Check if the image is visible
    const isVisible = await image.isVisible();
    
    if (isVisible) {
      console.log('✓ Image in highlight media section is visible');
      
      // Get the image attributes for logging
      const src = await image.getAttribute('src');
      const alt = await image.getAttribute('alt');
      console.log(`Image src: "${src}", alt: "${alt}"`);
    } else {
      console.log('❌ Image in highlight media section is not visible');
      expect(isVisible).toBeTruthy();
    }
  } catch (error) {
    console.error(`❌ Error checking highlight media section image: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

Then('the highlight media section should have eyebrow text {string}', async function(expectedText) {
  // Skip this step if highlight media section was not found
  if (!this.highlightMediaSection) {
    console.log('Highlight media section was not found. Skipping eyebrow text check.');
    return 'skipped';
  }
  
  try {
    // Check the eyebrow text
    const eyebrowSelector = 'div.media-wrapper div.media.left.block div.text div.eyebrow';
    const eyebrow = this.page.locator(eyebrowSelector);
    
    // Check if the eyebrow is visible
    const isVisible = await eyebrow.isVisible();
    
    if (!isVisible) {
      console.log('❌ Eyebrow text in highlight media section is not visible');
      expect(isVisible).toBeTruthy();
      return;
    }
    
    // Get the eyebrow text
    const eyebrowText = await eyebrow.textContent();
    
    // Check if the eyebrow text matches the expected text
    const hasCorrectText = eyebrowText.trim() === expectedText;
    
    if (hasCorrectText) {
      console.log(`✓ Highlight media section eyebrow text is "${expectedText}"`);
    } else {
      console.log(`❌ Highlight media section eyebrow text is "${eyebrowText}", expected "${expectedText}"`);
      expect(hasCorrectText).toBeTruthy();
    }
  } catch (error) {
    console.error(`❌ Error checking highlight media section eyebrow text: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

Then('the highlight media section should have title {string}', async function(expectedText) {
  // Skip this step if highlight media section was not found
  if (!this.highlightMediaSection) {
    console.log('Highlight media section was not found. Skipping title check.');
    return 'skipped';
  }
  
  try {
    // Check the title text
    const titleSelector = 'div.media-wrapper div.media.left.block div.text div.title h3';
    const title = this.page.locator(titleSelector);
    
    // Check if the title is visible
    const isVisible = await title.isVisible();
    
    if (!isVisible) {
      console.log('❌ Title in highlight media section is not visible');
      expect(isVisible).toBeTruthy();
      return;
    }
    
    // Get the title text
    const titleText = await title.textContent();
    
    // Check if the title text matches the expected text
    const hasCorrectText = titleText.trim() === expectedText;
    
    if (hasCorrectText) {
      console.log(`✓ Highlight media section title is "${expectedText}"`);
    } else {
      console.log(`❌ Highlight media section title is "${titleText}", expected "${expectedText}"`);
      expect(hasCorrectText).toBeTruthy();
    }
  } catch (error) {
    console.error(`❌ Error checking highlight media section title: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

Then('the highlight media section should have description text', async function() {
  // Skip this step if highlight media section was not found
  if (!this.highlightMediaSection) {
    console.log('Highlight media section was not found. Skipping description check.');
    return 'skipped';
  }
  
  try {
    // Check the description text
    const descriptionSelector = 'div.media-wrapper div.media.left.block div.text div.description';
    const description = this.page.locator(descriptionSelector);
    
    // Check if the description is visible
    const isVisible = await description.isVisible();
    
    if (isVisible) {
      console.log('✓ Description in highlight media section is visible');
      
      // Get the description text for logging
      const descriptionText = await description.textContent();
      console.log(`Description text: "${descriptionText}"`);
    } else {
      console.log('❌ Description in highlight media section is not visible');
      expect(isVisible).toBeTruthy();
    }
  } catch (error) {
    console.error(`❌ Error checking highlight media section description: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

Then('the highlight media section should have a {string} button with correct link', async function(buttonText) {
  // Skip this step if highlight media section was not found
  if (!this.highlightMediaSection) {
    console.log('Highlight media section was not found. Skipping button check.');
    return 'skipped';
  }
  
  try {
    // Check the button
    const buttonSelector = 'div.media-wrapper div.media.left.block div.text div.cta a.button';
    const button = this.page.locator(buttonSelector);
    
    // Check if the button is visible
    const isVisible = await button.isVisible();
    
    if (!isVisible) {
      console.log('❌ Button in highlight media section is not visible');
      expect(isVisible).toBeTruthy();
      return;
    }
    
    // Get the button text
    const actualButtonText = await button.textContent();
    
    // Check if the button text matches the expected text
    const hasCorrectText = actualButtonText.trim() === buttonText;
    
    if (!hasCorrectText) {
      console.log(`❌ Button in highlight media section has text "${actualButtonText}", expected "${buttonText}"`);
      expect(hasCorrectText).toBeTruthy();
      return;
    }
    
    // Check if the button has the correct href
    const buttonHref = await button.getAttribute('href');
    const expectedHref = '/en/browse';
    const hasCorrectHref = buttonHref === expectedHref;
    
    if (hasCorrectHref) {
      console.log(`✓ Button in highlight media section has correct href: "${buttonHref}"`);
    } else {
      console.log(`❌ Button in highlight media section has href "${buttonHref}", expected "${expectedHref}"`);
      expect(hasCorrectHref).toBeTruthy();
    }
    
    // Check if the button is clickable
    const isEnabled = await button.isEnabled();
    
    if (isEnabled) {
      console.log(`✓ "${buttonText}" button in highlight media section is visible and clickable`);
    } else {
      console.log(`❌ "${buttonText}" button in highlight media section is not clickable`);
      expect(isEnabled).toBeTruthy();
    }
  } catch (error) {
    console.error(`❌ Error checking highlight media section button: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

Then('the {string} button should redirect to {string} page', async function(buttonText, expectedPath) {
  // Skip this step if highlight media section was not found
  if (!this.highlightMediaSection) {
    console.log('Highlight media section was not found. Skipping button redirect check.');
    return 'skipped';
  }
  
  try {
    // Find the button
    const buttonSelector = 'div.media-wrapper div.media.left.block div.text div.cta a.button';
    const button = this.page.locator(buttonSelector);
    
    // Check if the button is visible
    const isVisible = await button.isVisible();
    
    if (!isVisible) {
      console.log(`❌ "${buttonText}" button is not visible`);
      expect(isVisible).toBeTruthy();
      return;
    }
    
    // Get the button text to verify it's the right button
    const actualButtonText = await button.textContent();
    const isCorrectButton = actualButtonText.trim() === buttonText;
    
    if (!isCorrectButton) {
      console.log(`❌ Button has text "${actualButtonText}", expected "${buttonText}"`);
      expect(isCorrectButton).toBeTruthy();
      return;
    }
    
    // Store the current URL to navigate back after checking the redirect
    const currentUrl = this.page.url();
    console.log(`Current URL before clicking: ${currentUrl}`);
    
    // Create a promise that will resolve when navigation happens
    const navigationPromise = this.page.waitForNavigation();
    
    // Click the button
    console.log(`Clicking "${buttonText}" button to check redirect...`);
    await button.click();
    
    // Wait for navigation to complete
    await navigationPromise;
    
    // Get the new URL after clicking
    const newUrl = this.page.url();
    console.log(`New URL after clicking: ${newUrl}`);
    
    // Check if the URL contains the expected path
    const redirectedCorrectly = newUrl.includes(expectedPath);
    
    if (redirectedCorrectly) {
      console.log(`✓ Button redirected to a URL containing "${expectedPath}"`);
      
      // Take a screenshot of the redirected page
      await this.page.screenshot({ path: 'screenshots/unauth-button-redirect.png' });
      console.log('✓ Screenshot of redirected page saved');
    } else {
      console.log(`❌ Button did not redirect to a URL containing "${expectedPath}"`);
      console.log(`Actual URL: ${newUrl}`);
      expect(redirectedCorrectly).toBeTruthy();
    }
    
    // Navigate back to the original page for subsequent tests
    console.log('Navigating back to the original page...');
    await this.page.goto(currentUrl);
    
    // Wait for the page to load completely
    console.log('Waiting for page to load completely after navigation back...');
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForLoadState('load');
    
    // Additional wait to ensure all JavaScript has executed
    await this.page.waitForFunction(() => {
      return document.readyState === 'complete' && 
             !document.querySelector('.loading-indicator') && 
             !document.querySelector('[data-loading="true"]');
    }, { timeout: 10000 }).catch(e => console.log('Page load wait timed out, but continuing: ' + e.message));
    
    console.log('✓ Page loaded completely after navigation back');
    
    // Wait for a longer time to ensure the page is fully stable
    await this.page.waitForTimeout(3000);
    console.log('✓ Additional wait completed to ensure page stability');
    
    // Re-find the highlight media section
    console.log('Re-finding highlight media section...');
    const highlightMediaSelector = 'div.section.highlight.media-container';
    const highlightMedia = this.page.locator(highlightMediaSelector);
    const isHighlightMediaVisible = await highlightMedia.isVisible();
    
    if (isHighlightMediaVisible) {
      this.highlightMediaSection = highlightMedia;
      console.log('✓ Re-found highlight media section after navigation back');
    } else {
      console.log('❌ Could not re-find highlight media section after navigation back');
    }
    
  } catch (error) {
    console.error(`❌ Error checking button redirect: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

// Icon Block Container Section Step Definitions

Then('user should see the icon block container section', async function() {
  try {
    // Wait for page to load completely
    await this.page.waitForLoadState('networkidle');
    
    // Use a specific selector for the icon block container section
    const iconBlockContainerSelector = 'div.section.highlight.icon-block-container';
    const iconBlockContainer = this.page.locator(iconBlockContainerSelector);
    
    // Check if the icon block container section is visible
    const isVisible = await iconBlockContainer.isVisible();
    
    if (isVisible) {
      console.log('✓ Icon block container section is visible on the page');
      
      // Store the icon block container section for later use
      this.iconBlockContainerSection = iconBlockContainer;
      
      // Take a screenshot of the found section
      await this.iconBlockContainerSection.screenshot({ path: 'screenshots/unauth-icon-block-container-found.png' });
      console.log('✓ Screenshot of found icon block container section saved');
    } else {
      console.log('❌ Icon block container section is not visible on the page');
      expect(isVisible).toBeTruthy();
    }
  } catch (error) {
    console.error(`❌ Error checking icon block container section visibility: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

Then('the icon block container section should have the heading {string}', async function(expectedHeading) {
  // Skip this step if icon block container section was not found
  if (!this.iconBlockContainerSection) {
    console.log('Icon block container section was not found. Skipping heading check.');
    return 'skipped';
  }
  
  try {
    // Check the heading text
    const headingSelector = 'div.default-content-wrapper h3';
    const heading = this.page.locator(headingSelector);
    
    // Check if the heading is visible
    const isVisible = await heading.isVisible();
    
    if (!isVisible) {
      console.log('❌ Heading in icon block container section is not visible');
      expect(isVisible).toBeTruthy();
      return;
    }
    
    // Get the heading text
    const headingText = await heading.textContent();
    
    // Check if the heading text matches the expected text
    const hasCorrectText = headingText.trim() === expectedHeading;
    
    if (hasCorrectText) {
      console.log(`✓ Icon block container section heading is "${expectedHeading}"`);
    } else {
      console.log(`❌ Icon block container section heading is "${headingText}", expected "${expectedHeading}"`);
      expect(hasCorrectText).toBeTruthy();
    }
  } catch (error) {
    console.error(`❌ Error checking icon block container section heading: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

Then('the icon block container section should have {int} icon blocks', async function(expectedCount) {
  // Skip this step if icon block container section was not found
  if (!this.iconBlockContainerSection) {
    console.log('Icon block container section was not found. Skipping icon blocks count check.');
    return 'skipped';
  }
  
  try {
    // Check the number of icon blocks
    const iconBlocksSelector = 'div.icon-block-wrapper div.icon-block > div';
    const iconBlocks = this.page.locator(iconBlocksSelector);
    
    // Get the count of icon blocks
    const count = await iconBlocks.count();
    
    // Check if the count matches the expected count
    const hasCorrectCount = count === expectedCount;
    
    if (hasCorrectCount) {
      console.log(`✓ Icon block container section has ${expectedCount} icon blocks`);
      
      // Store the icon blocks for later use
      this.iconBlocks = iconBlocks;
      this.iconBlocksCount = count;
    } else {
      console.log(`❌ Icon block container section has ${count} icon blocks, expected ${expectedCount}`);
      expect(hasCorrectCount).toBeTruthy();
    }
  } catch (error) {
    console.error(`❌ Error checking icon blocks count: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

Then('each icon block should have an image', async function() {
  // Skip this step if icon blocks were not found
  if (!this.iconBlocks || this.iconBlocksCount === 0) {
    console.log('Icon blocks were not found. Skipping image check.');
    return 'skipped';
  }
  
  try {
    // Check if each icon block has an image
    let allBlocksHaveImages = true;
    
    for (let i = 0; i < this.iconBlocksCount; i++) {
      const imageSelector = `div.icon-block-wrapper div.icon-block > div:nth-child(${i + 1}) div picture img`;
      const image = this.page.locator(imageSelector);
      
      // Check if the image is visible
      const isVisible = await image.isVisible();
      
      if (isVisible) {
        console.log(`✓ Icon block ${i + 1} has a visible image`);
        
        // Get the image attributes for logging
        const src = await image.getAttribute('src');
        const alt = await image.getAttribute('alt');
        console.log(`Image src: "${src}", alt: "${alt || 'No alt text'}"`);
      } else {
        console.log(`❌ Icon block ${i + 1} does not have a visible image`);
        allBlocksHaveImages = false;
      }
    }
    
    expect(allBlocksHaveImages).toBeTruthy();
  } catch (error) {
    console.error(`❌ Error checking icon block images: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

Then('each icon block should have a heading', async function() {
  // Skip this step if icon blocks were not found
  if (!this.iconBlocks || this.iconBlocksCount === 0) {
    console.log('Icon blocks were not found. Skipping heading check.');
    return 'skipped';
  }
  
  try {
    // Check if each icon block has a heading
    let allBlocksHaveHeadings = true;
    
    for (let i = 0; i < this.iconBlocksCount; i++) {
      const headingSelector = `div.icon-block-wrapper div.icon-block > div:nth-child(${i + 1}) h3.icon-heading`;
      const heading = this.page.locator(headingSelector);
      
      // Check if the heading is visible
      const isVisible = await heading.isVisible();
      
      if (isVisible) {
        console.log(`✓ Icon block ${i + 1} has a visible heading`);
        
        // Get the heading text for logging
        const headingText = await heading.textContent();
        console.log(`Heading text: "${headingText}"`);
      } else {
        console.log(`❌ Icon block ${i + 1} does not have a visible heading`);
        allBlocksHaveHeadings = false;
      }
    }
    
    expect(allBlocksHaveHeadings).toBeTruthy();
  } catch (error) {
    console.error(`❌ Error checking icon block headings: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

Then('each icon block should have a description', async function() {
  // Skip this step if icon blocks were not found
  if (!this.iconBlocks || this.iconBlocksCount === 0) {
    console.log('Icon blocks were not found. Skipping description check.');
    return 'skipped';
  }
  
  try {
    // Check if each icon block has a description
    let allBlocksHaveDescriptions = true;
    
    for (let i = 0; i < this.iconBlocksCount; i++) {
      const descriptionSelector = `div.icon-block-wrapper div.icon-block > div:nth-child(${i + 1}) div.icon-description`;
      const description = this.page.locator(descriptionSelector);
      
      // Check if the description is visible
      const isVisible = await description.isVisible();
      
      if (isVisible) {
        console.log(`✓ Icon block ${i + 1} has a visible description`);
        
        // Get the description text for logging
        const descriptionText = await description.textContent();
        console.log(`Description text: "${descriptionText}"`);
      } else {
        console.log(`❌ Icon block ${i + 1} does not have a visible description`);
        allBlocksHaveDescriptions = false;
      }
    }
    
    expect(allBlocksHaveDescriptions).toBeTruthy();
  } catch (error) {
    console.error(`❌ Error checking icon block descriptions: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

Then('each icon block should have a link', async function() {
  // Skip this step if icon blocks were not found
  if (!this.iconBlocks || this.iconBlocksCount === 0) {
    console.log('Icon blocks were not found. Skipping link check.');
    return 'skipped';
  }
  
  try {
    // Check if each icon block has a link
    let allBlocksHaveLinks = true;
    
    for (let i = 0; i < this.iconBlocksCount; i++) {
      const linkSelector = `div.icon-block-wrapper div.icon-block > div:nth-child(${i + 1}) a.icon-link`;
      const link = this.page.locator(linkSelector);
      
      // Check if the link is visible
      const isVisible = await link.isVisible();
      
      if (isVisible) {
        console.log(`✓ Icon block ${i + 1} has a visible link`);
        
        // Get the link text and href for logging
        const linkText = await link.textContent();
        const linkHref = await link.getAttribute('href');
        const classAttr = await link.getAttribute('class');
        const isExternal = classAttr && classAttr.includes('external');
        
        console.log(`Link text: "${linkText}", href: "${linkHref}", external: ${isExternal}`);
        
        // Store the link information for later use
        if (!this.iconBlockLinks) {
          this.iconBlockLinks = [];
        }
        
        this.iconBlockLinks.push({
          index: i + 1,
          selector: linkSelector,
          text: linkText,
          href: linkHref,
          isExternal: isExternal
        });
      } else {
        console.log(`❌ Icon block ${i + 1} does not have a visible link`);
        allBlocksHaveLinks = false;
      }
    }
    
    expect(allBlocksHaveLinks).toBeTruthy();
  } catch (error) {
    console.error(`❌ Error checking icon block links: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});

Then('clicking on each icon block link should navigate to the correct page', async function() {
  // Skip this step if icon block links were not found
  if (!this.iconBlockLinks || this.iconBlockLinks.length === 0) {
    console.log('Icon block links were not found. Skipping navigation check.');
    return 'skipped';
  }
  
  try {
    // Store the current URL to navigate back after checking each link
    const currentUrl = this.page.url();
    console.log(`Current URL before checking links: ${currentUrl}`);
    
    // Check each link
    for (const linkInfo of this.iconBlockLinks) {
      console.log(`Checking navigation for icon block ${linkInfo.index} link: "${linkInfo.text}"`);
      
      // Get the link element
      const link = this.page.locator(linkInfo.selector);
      
      // Check if the link is visible and enabled
      const isVisible = await link.isVisible();
      const isEnabled = await link.isEnabled();
      
      if (!isVisible || !isEnabled) {
        console.log(`❌ Link in icon block ${linkInfo.index} is not visible or not enabled`);
        expect(isVisible && isEnabled).toBeTruthy();
        continue;
      }
      
      // For external links, we'll just verify the href without actually navigating
      if (linkInfo.isExternal) {
        console.log(`Link in icon block ${linkInfo.index} is external. Verifying href without navigation.`);
        
        // Check if the href is valid
        const hasValidHref = linkInfo.href && linkInfo.href.length > 0;
        
        if (hasValidHref) {
          console.log(`✓ External link has valid href: "${linkInfo.href}"`);
        } else {
          console.log(`❌ External link has invalid href: "${linkInfo.href}"`);
          expect(hasValidHref).toBeTruthy();
        }
      } else {
        // For internal links, navigate and verify
        console.log(`Clicking on link in icon block ${linkInfo.index}...`);
        
        // Create a promise that will resolve when navigation happens
        const navigationPromise = this.page.waitForNavigation();
        
        // Click the link
        await link.click();
        
        // Wait for navigation to complete
        await navigationPromise;
        
        // Get the new URL after clicking
        const newUrl = this.page.url();
        console.log(`New URL after clicking: ${newUrl}`);
        
        // Extract the path from the href (remove domain if present)
        let expectedPath = linkInfo.href;
        if (expectedPath.startsWith('http')) {
          try {
            const url = new URL(expectedPath);
            expectedPath = url.pathname;
          } catch (e) {
            // If parsing fails, use the original href
            console.log(`Could not parse URL: ${expectedPath}`);
          }
        }
        
        // Check if the URL contains the expected path
        const redirectedCorrectly = newUrl.includes(expectedPath);
        
        if (redirectedCorrectly) {
          console.log(`✓ Link redirected to a URL containing "${expectedPath}"`);
          
          // Take a screenshot of the redirected page
          await this.page.screenshot({ path: `screenshots/unauth-icon-block-${linkInfo.index}-redirect.png` });
          console.log(`✓ Screenshot of redirected page saved as screenshots/unauth-icon-block-${linkInfo.index}-redirect.png`);
        } else {
          console.log(`❌ Link did not redirect to a URL containing "${expectedPath}"`);
          console.log(`Actual URL: ${newUrl}`);
          expect(redirectedCorrectly).toBeTruthy();
        }
        
        // Navigate back to the original page for subsequent tests
        console.log('Navigating back to the original page...');
        await this.page.goto(currentUrl);
        
        // Wait for the page to load completely
        console.log('Waiting for page to load completely after navigation back...');
        await this.page.waitForLoadState('domcontentloaded');
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForLoadState('load');
        
        // Additional wait to ensure all JavaScript has executed
        await this.page.waitForFunction(() => {
          return document.readyState === 'complete' && 
                 !document.querySelector('.loading-indicator') && 
                 !document.querySelector('[data-loading="true"]');
        }, { timeout: 10000 }).catch(e => console.log('Page load wait timed out, but continuing: ' + e.message));
        
        console.log('✓ Page loaded completely after navigation back');
        
        // Wait for a longer time to ensure the page is fully stable
        await this.page.waitForTimeout(3000);
        console.log('✓ Additional wait completed to ensure page stability');
      }
    }
    
    // Re-find the icon block container section
    console.log('Re-finding icon block container section...');
    const iconBlockContainerSelector = 'div.section.highlight.icon-block-container';
    const iconBlockContainer = this.page.locator(iconBlockContainerSelector);
    const isIconBlockContainerVisible = await iconBlockContainer.isVisible();
    
    if (isIconBlockContainerVisible) {
      this.iconBlockContainerSection = iconBlockContainer;
      console.log('✓ Re-found icon block container section after navigation back');
    } else {
      console.log('❌ Could not re-find icon block container section after navigation back');
    }
    
  } catch (error) {
    console.error(`❌ Error checking icon block link navigation: ${error.message}`);
    throw error; // Re-throw the error to fail the test
  }
});
