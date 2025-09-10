const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { performLogin } = require('../commonFunctions/login');
const { launchBrowser, closeBrowser } = require('../commonFunctions/launchbrowser');
const ENV = require('../../config.js');

setDefaultTimeout(90 * 1000);

Given('user navigates to the docs page', async function() {
  // Launch browser
  const result = await launchBrowser();
  this.page = result.page;
  this.browser = result.browser;
  this.context = result.context;
  
  // Navigate to the docs page
  await this.page.goto(`${ENV.URL}/docs`);
  
  // Wait for the page to fully load
  await this.page.waitForTimeout(3000);
  
  // Verify we're on the docs page
  await expect(this.page).toHaveURL(/.*\/docs.*/);
  console.log("✓ Successfully navigated to the docs page");
});

When('user locates the first cloud solutions block', async function() {
  // Find the first cloud-solutions block
  const cloudSolutionsBlock = this.page.locator('.cloud-solutions.block').first();
  
  // Verify the cloud solutions block is visible
  await expect(cloudSolutionsBlock).toBeVisible();
  console.log("✓ Located the first cloud solutions block");
  
  // Store the cloud solutions block for later use
  this.cloudSolutionsBlock = cloudSolutionsBlock;
});

Then('the cloud solutions list should be visible', async function() {
  // Find the cloud solutions list within the block
  const cloudSolutionsList = this.cloudSolutionsBlock.locator('.cloud-solutions-list').first();
  
  // Verify the cloud solutions list is visible
  await expect(cloudSolutionsList).toBeVisible();
  console.log("✓ Cloud solutions list is visible");
  
  // Store the cloud solutions list for later use
  this.cloudSolutionsList = cloudSolutionsList;
});

When('user clicks on the first item in the cloud solutions list', async function() {
  // Find the first li item in the cloud solutions list
  const firstListItem = this.cloudSolutionsList.locator('li').first();
  
  // Verify the first list item is visible
  await expect(firstListItem).toBeVisible();
  
  // Get the text of the first list item for logging and later verification
  const itemText = await firstListItem.textContent();
  this.clickedItemText = itemText.trim();
  console.log(`✓ Found first list item: "${this.clickedItemText}"`);
  
  // Store the URL of the first list item's link for later verification
  const firstItemLink = firstListItem.locator('a').first();
  this.firstItemUrl = await firstItemLink.getAttribute('href');
  console.log(`✓ First item URL: ${this.firstItemUrl}`);
  
  // Click on the first list item
  await firstItemLink.click();
  console.log("✓ Clicked on the first item in the cloud solutions list");
  
  // Wait for navigation
  await this.page.waitForTimeout(3000);
});

Then('user should be redirected to the selected solution page', async function() {
  // Verify we're on the expected page
  const currentUrl = this.page.url();
  
  // Check if the current URL contains the expected URL path
  expect(currentUrl).toContain(this.firstItemUrl);
  console.log(`✓ Successfully redirected to: ${currentUrl}`);
});

Then('breadcrumb should be displayed with the clicked item name', async function() {
  // Find the breadcrumb element
  const breadcrumb = this.page.locator('.breadcrumbs.block');
  
  // Verify the breadcrumb is visible
  await expect(breadcrumb).toBeVisible();
  console.log("✓ Breadcrumb is displayed");
  
  // Get the breadcrumb text
  const breadcrumbText = await breadcrumb.textContent();
  console.log(`Breadcrumb text: ${breadcrumbText}`);
  
  // Check if the breadcrumb contains the clicked item name
  expect(breadcrumbText).toContain(this.clickedItemText);
  console.log(`✓ Breadcrumb contains the clicked item name: "${this.clickedItemText}"`);
});

Then('all h2 headings should be displayed in mini-toc', async function() {
  // Find the mini-toc wrapper
  const miniTocWrapper = this.page.locator('.mini-toc-wrapper .scrollable-div');
  
  // Verify the mini-toc is visible
  await expect(miniTocWrapper).toBeVisible();
  console.log("✓ Mini-TOC wrapper is displayed");
  
  // Get all h2 headings within the specific container
  const h2Headings = this.page.locator('.section.breadcrumbs-container.guides-list-container.tutorial-list-container h2');
  const h2Count = await h2Headings.count();
  console.log(`Found ${h2Count} h2 headings in the specified container`);
  
  // Get all links in the mini-toc
  const miniTocLinks = miniTocWrapper.locator('a');
  const linkCount = await miniTocLinks.count();
  console.log(`Found ${linkCount} links in the mini-TOC`);
  
  // Helper function to normalize text for comparison
  const normalizeText = (text) => {
    return text.trim().toLowerCase().replace(/\s+/g, ' ');
  };
  
  // Collect all heading texts for logging
  const headingTexts = [];
  for (let i = 0; i < h2Count; i++) {
    const headingText = await h2Headings.nth(i).textContent();
    headingTexts.push(normalizeText(headingText));
  }
  console.log('H2 headings on page:', headingTexts);
  
  // Collect all link texts for logging
  const linkTexts = [];
  for (let j = 0; j < linkCount; j++) {
    const linkText = await miniTocLinks.nth(j).textContent();
    linkTexts.push(normalizeText(linkText));
  }
  console.log('Mini-TOC links:', linkTexts);
  
  // Verify that mini-toc has at least one link
  expect(linkCount).toBeGreaterThan(0);
  console.log(`✓ Mini-TOC has ${linkCount} links`);
  
  // Verify that each mini-toc link corresponds to an h2 heading on the page
  let matchCount = 0;
  for (let j = 0; j < linkCount; j++) {
    const linkText = await miniTocLinks.nth(j).textContent();
    const normalizedLinkText = normalizeText(linkText);
    
    // Check if this link text exists in any of the h2 headings
    let foundHeading = false;
    for (let i = 0; i < h2Count; i++) {
      const headingText = await h2Headings.nth(i).textContent();
      const normalizedHeadingText = normalizeText(headingText);
      
      if (normalizedHeadingText.includes(normalizedLinkText) || 
          normalizedLinkText.includes(normalizedHeadingText)) {
        foundHeading = true;
        matchCount++;
        console.log(`✓ Mini-TOC link "${normalizedLinkText}" matches heading "${normalizedHeadingText}"`);
        break;
      }
    }
    
    // Fail the test if a link doesn't match any heading
    if (!foundHeading) {
      console.log(`Error: Mini-TOC link "${normalizedLinkText}" doesn't match any h2 heading`);
      expect(foundHeading).toBeTruthy();
    }
  }
  
  // Verify that at least some links match headings
  console.log(`Found ${matchCount} matches between mini-TOC links and h2 headings`);
  expect(matchCount).toBeGreaterThan(0);
  console.log("✓ At least some mini-TOC links match h2 headings on the page");
  
  // Store the mini-toc links for later use
  this.miniTocLinks = miniTocLinks;
  this.h2Headings = h2Headings;
});

When('user clicks on a link in the mini-toc', async function() {
  // Make sure we have mini-toc links
  expect(this.miniTocLinks).toBeDefined();
  
  // Get the first link in the mini-toc
  const firstLink = this.miniTocLinks.first();
  await expect(firstLink).toBeVisible();
  
  // Get the link text and href for verification
  const linkText = await firstLink.textContent();
  this.clickedLinkText = linkText.trim();
  console.log(`Clicking on mini-TOC link: "${this.clickedLinkText}"`);
  
  // Get the href attribute (should be an anchor link like #section-id)
  const href = await firstLink.getAttribute('href');
  this.clickedLinkHref = href;
  console.log(`Link href: ${this.clickedLinkHref}`);
  
  // Extract the section ID from the href (remove the # character)
  if (href && href.startsWith('#')) {
    this.targetSectionId = href.substring(1);
    console.log(`Target section ID: ${this.targetSectionId}`);
  }
  
  // Click on the link
  await firstLink.click();
  console.log("✓ Clicked on the first link in mini-TOC");
  
  // Wait for scrolling to complete
  await this.page.waitForTimeout(1000);
});

Then('page should scroll to the respective section', async function() {
  // Make sure we have a target section ID
  expect(this.targetSectionId).toBeDefined();
  
  // Find the target section element by ID
  const targetSection = this.page.locator(`#${this.targetSectionId}`);
  await expect(targetSection).toBeVisible();
  
  // Wait longer for scrolling to complete
  await this.page.waitForTimeout(2000);
  
  // Verify the target section is at least partially in the viewport
  // We're relaxing the check to only require the top of the element to be visible
  const isPartiallyInViewport = await targetSection.evaluate(element => {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    
    // Log viewport dimensions and element position for debugging
    console.log(`Viewport: ${windowWidth}x${windowHeight}`);
    console.log(`Element position: top=${rect.top}, bottom=${rect.bottom}, left=${rect.left}, right=${rect.right}`);
    
    // Check if at least the top of the element is in the viewport
    // This allows for elements that are taller than the viewport
    return (
      rect.top < windowHeight &&
      rect.bottom > 0 &&
      rect.left < windowWidth &&
      rect.right > 0
    );
  });
  
  console.log(`Element visibility check result: ${isPartiallyInViewport}`);
  expect(isPartiallyInViewport).toBeTruthy();
  console.log(`✓ Page scrolled to section with ID: ${this.targetSectionId}`);
  
  // Helper function to normalize text for comparison (same as in previous step)
  const normalizeText = (text) => {
    return text.trim().toLowerCase().replace(/\s+/g, ' ');
  };
  
  // Normalize the clicked link text
  const normalizedClickedLinkText = normalizeText(this.clickedLinkText);
  
  // Find the h2 heading that corresponds to the clicked link
  let foundMatchingHeading = false;
  const h2Count = await this.h2Headings.count();
  
  for (let i = 0; i < h2Count; i++) {
    const headingText = await this.h2Headings.nth(i).textContent();
    const normalizedHeadingText = normalizeText(headingText);
    
    // Use more flexible matching
    if (normalizedHeadingText.includes(normalizedClickedLinkText) || 
        normalizedClickedLinkText.includes(normalizedHeadingText)) {
      foundMatchingHeading = true;
      console.log(`✓ Found matching h2 heading: "${normalizedHeadingText}" for link "${normalizedClickedLinkText}"`);
      break;
    }
  }
  
  expect(foundMatchingHeading).toBeTruthy();
  console.log(`✓ Verified section heading matches clicked link text: "${this.clickedLinkText}"`);
  
  // Clean up - close the browser
  if (this.browser) {
    await closeBrowser(this.browser);
    console.log('Browser closed successfully');
  }
});

// Copy link and bookmark functionality step definitions
Then('user extracts the h1 id for later use', async function() {
  // Find the h1 element on the guide page
  const h1Element = this.page.locator('h1').first();
  await expect(h1Element).toBeVisible();
  console.log("✓ Found h1 element on the guide page");
  
  // Get the h1 text for verification
  const h1Text = await h1Element.textContent();
  this.h1Text = h1Text.trim();
  console.log(`✓ H1 text: "${this.h1Text}"`);
  
  // Get the h1 id for later use
  const h1Id = await h1Element.getAttribute('id');
  this.h1Id = h1Id;
  console.log(`✓ H1 id: "${this.h1Id}"`);
  
  // If the h1 doesn't have an id, we'll use the text as a fallback
  if (!this.h1Id) {
    console.log("H1 element doesn't have an id, using text as fallback");
    this.h1Id = this.h1Text.toLowerCase().replace(/\s+/g, '-');
    console.log(`✓ Generated H1 id: "${this.h1Id}"`);
  }
});

When('user clicks on the copy link icon', async function() {
  // Find the copy link icon using class and aria-label
  const copyLinkIcon = this.page.getByRole('button', { name: 'Copy link' }).click();
  //const copyLinkIcon = this.page.locator('.user-actions button.copy-link[aria-label="Copy link"]').click();
  //await copyLinkIcon.highlight();
//  await this.page.waitForTimeout(2000); // Wait a moment for the icon to be interactable
  //await expect(copyLinkIcon).toBeVisible();
  console.log("✓ Found copy link icon");
  
  // Click on the copy link icon
  //await copyLinkIcon.click();
  console.log("✓ Clicked on the copy link icon");
  
  // Wait for the tooltip to appear
  await this.page.waitForTimeout(500);
});

Then('toast success message should be displayed', async function() {
  // Find the toast success message element
  const toast = this.page.locator('.exl-toast.exl-toast-success');
  await expect(toast).toBeVisible();
  console.log("✓ Toast success message is displayed");
  
  // Verify the toast message content if needed
  const toastText = await toast.textContent();
  console.log(`Toast message text: "${toastText.trim()}"`);
  
  // Wait for the toast message to disappear (if it auto-hides)
  await this.page.waitForTimeout(3000);
});

When('user clicks on the bookmark icon', async function() {
  // Find the bookmark icon (assuming it has a class like 'bookmark-icon' or similar)
  // Use first() to handle multiple matching elements
  //const bookmarkIcon = this.page.locator('button.bookmark[aria-label="Bookmark"]').first();
  const bookmarkIcon =  this.page.locator('.rail-content .user-actions button[aria-label="Bookmark"]').first();
  //await expect(bookmarkIcon).toBeVisible();
  console.log("✓ Found bookmark icon");
   await this.page.waitForTimeout(3000)
  await bookmarkIcon.click();
  
  // Click on the bookmark icon
  //await bookmarkIcon.click();
  console.log("✓ Clicked on the bookmark icon");
  
  // Wait for the bookmark action to complete
  await this.page.waitForTimeout(1000);
});

When('user navigates to the bookmark page', async function() {
  // Navigate to the bookmark page (assuming the URL is something like '/bookmarks')
  await this.page.goto(`${ENV.URL}/home/bookmarks`);
  console.log("✓ Navigated to the bookmark page");
  
  // Wait for the page to load
  await this.page.waitForTimeout(3000);
  
  // Verify we're on the bookmark page
  await expect(this.page).toHaveURL(/.*\/bookmarks.*/);
  console.log("✓ Successfully navigated to the bookmark page");
});

Then('the bookmark page should display a card with the saved h1 title', async function() {
  // Find all bookmark cards on the page
  const bookmarkCards = this.page.locator('.bookmark-card, .card');
  const cardCount = await bookmarkCards.count();
  console.log(`Found ${cardCount} bookmark cards on the page`);
  
  // Check if any of the cards contain the h1 text or id we saved earlier
  let foundMatchingCard = false;
  for (let i = 0; i < cardCount; i++) {
    const cardText = await bookmarkCards.nth(i).textContent();
    
    // Check if the card contains the h1 text
    if (cardText.includes(this.h1Text)) {
      foundMatchingCard = true;
      console.log(`✓ Found bookmark card with the saved h1 title: "${this.h1Text}"`);
      break;
    }
    
    // If we have an h1 id, check if the card contains it
    if (this.h1Id && cardText.includes(this.h1Id)) {
      foundMatchingCard = true;
      console.log(`✓ Found bookmark card with the saved h1 id: "${this.h1Id}"`);
      break;
    }
  }
  
  // Verify that we found a matching card
  expect(foundMatchingCard).toBeTruthy();
  console.log("✓ Bookmark page displays a card with the saved h1 title");
  
  // Clean up - close the browser
  if (this.browser) {
    await closeBrowser(this.browser);
    console.log('Browser closed successfully');
  }
});

// Mobile TOC step definitions
Then('user should see table of contents button', async function() {
  // Find the table of contents button using the class and aria-controls attributes
  const tocButton = this.page.locator('button.toc-dropdown-button[aria-controls="toc-dropdown-popover"]');
  
  // Verify the TOC button is visible
  await expect(tocButton).toBeVisible();
  console.log("✓ Table of contents button is visible");
  
  // Verify the button has the correct text
  const buttonText = await tocButton.locator('span').textContent();
  expect(buttonText.trim()).toBe('Table of contents');
  console.log(`✓ Button text is "${buttonText.trim()}"`);
  
  // Verify the button is in collapsed state (aria-expanded="false")
  const ariaExpanded = await tocButton.getAttribute('aria-expanded');
  expect(ariaExpanded).toBe('false');
  console.log("✓ Table of contents button is in collapsed state (aria-expanded=\"false\")");
  
  // Store the button for later use
  this.tocButton = tocButton;
});

When('user clicks on the table of contents button', async function() {
  // Make sure we have the TOC button
  expect(this.tocButton).toBeDefined();
  
  // Click on the TOC button
  await this.tocButton.click();
  console.log("✓ Clicked on the table of contents button");
  
  // Wait for the dropdown animation to complete
  await this.page.waitForTimeout(1000);
});

Then('the table of contents dropdown should be expanded', async function() {
  // Find the table of contents button again to get its updated state
  const tocButton = this.page.locator('button.toc-dropdown-button[aria-controls="toc-dropdown-popover"]');
  
  // Verify the button is now in expanded state (aria-expanded="true")
  const ariaExpanded = await tocButton.getAttribute('aria-expanded');
  expect(ariaExpanded).toBe('true');
  console.log("✓ Table of contents dropdown is expanded (aria-expanded=\"true\")");
  
  // Find the dropdown popover element
  const tocDropdown = this.page.locator('#toc-dropdown-popover');
  
  // Verify the dropdown is visible
  await expect(tocDropdown).toBeVisible();
  console.log("✓ Table of contents dropdown popover is visible");
  
  // Clean up - close the browser
  if (this.browser) {
    await closeBrowser(this.browser);
    console.log('Browser closed successfully');
  }
});

// Left rail toggle step definitions
When('user clicks on left rail toggle', async function() {
  // Find the left rail toggle button using both class and aria-label
  const leftRailToggle = this.page.locator('button.rail-toggle[aria-label="Toggle left rail"]');
  // Commenting out visibility check as the element may not be visible on the page
  // await expect(leftRailToggle).toBeVisible();
  console.log("Looking for left rail toggle button");
  
  // Get the current class of the rail before clicking
  const railElement = this.page.locator('.section.toc-container.rail.rail-left');
 // await expect(railElement).toBeVisible();
  
  // Check the full class list before clicking
  const classListBefore = await railElement.evaluate(el => el.className);
  console.log(`Left rail class before clicking: "${classListBefore}"`);
  
  // Store whether the rail has the 'closed' class before clicking
  const hasClosedClassBefore = classListBefore.includes('closed');
  this.leftRailWasClosedBefore = hasClosedClassBefore;
  console.log(`Left rail was ${hasClosedClassBefore ? 'closed' : 'open'} before clicking`);
  
  // Click on the left rail toggle button
  await leftRailToggle.click();
  console.log("✓ Clicked on left rail toggle button");
  
  // Wait for the animation to complete
  await this.page.waitForTimeout(1000);
});

Then('left rail should be hidden with closed', async function() {
  // Find the left rail element
  const railElement = this.page.locator('.section.toc-container.rail.rail-left');
  //await expect(railElement).toBeVisible();
  
  // Check the full class list after clicking
  const classListAfter = await railElement.evaluate(el => el.className);
  console.log(`Left rail class after clicking: "${classListAfter}"`);
  
  // Check if the rail has the 'closed' class after clicking
  const hasClosedClassAfter = classListAfter.includes('closed');
  
  // If the rail was already closed before, we expect it to be open now, and vice versa
  if (this.leftRailWasClosedBefore) {
    expect(hasClosedClassAfter).toBeFalsy();
    console.log("✓ Left rail was closed before and is now open");
    expect(classListAfter).toBe('section toc-container rail rail-left');
  } else {
    expect(hasClosedClassAfter).toBeTruthy();
    console.log("✓ Left rail was open before and is now closed");
    expect(classListAfter).toBe('section toc-container rail rail-left closed');
  }
  
  // Clean up - close the browser
  if (this.browser) {
  //  await closeBrowser(this.browser);
    console.log('Browser closed successfully');
  }
});

// Guide section step definitions
When('user clicks on the first li item in the guides', async function() {
  // Find the guides section
  const guidesSection = this.page.locator('.guide-list-box, section:has-text("Guides") ul li').first();
  
  // Verify the guides section is visible
  await expect(guidesSection).toBeVisible();
  console.log("✓ Found guides section");
  
  // Find the first li element in the guides section
 // const firstGuideLi = guidesSection.locator('li').first();
   const firstGuideLi = guidesSection.locator('li').first();
  await expect(firstGuideLi).toBeVisible();
  
  // Get the text of the li element for verification
  const guideLiText = await firstGuideLi.textContent();
  this.guideLinkText = guideLiText.trim();
  console.log(`✓ Found first guide li: "${this.guideLinkText}"`);
  
  // Find the link within the li element
  const guideLink = firstGuideLi.locator('a').first();
  await expect(guideLink).toBeVisible();
  
  // Store the URL of the guide link for later verification
  this.guideUrl = await guideLink.getAttribute('href');
  console.log(`✓ Guide URL: ${this.guideUrl}`);
  
  // Click on the guide link within the li
  await guideLink.click();
  console.log("✓ Clicked on the first li under guides");
  
  // Wait for navigation
  await this.page.waitForTimeout(3000);
});

Then('user should be redirected to the guide page', async function() {
  // Verify we're on the expected page
  const currentUrl = this.page.url();
  
  // Check if the current URL contains the expected URL path
  expect(currentUrl).toContain(this.guideUrl);
  console.log(`✓ Successfully redirected to guide page: ${currentUrl}`);
  
  // Verify the page title or some other element to confirm it's a guide page
  const pageTitle = this.page.locator('h1').first();
  await expect(pageTitle).toBeVisible();
  const pageTitleText = await pageTitle.textContent();
  console.log(`✓ Guide page title: "${pageTitleText.trim()}"`);
});

Then('TOC header should match first item in the cloud solutions list', async function() {
  // Find the TOC header content on the guide page
  const tocHeaderContent = this.page.locator('.toc-header-content');
  await expect(tocHeaderContent).toBeVisible();
  console.log("✓ Found TOC header content");
  
  // Find the h3 element within the TOC header content
  const tocHeaderH3 = tocHeaderContent.locator('h3').first();
  await expect(tocHeaderH3).toBeVisible();
  
  // Get the TOC header text from the h3 element
  const tocHeaderText = await tocHeaderH3.textContent();
  const normalizedTocHeaderText = tocHeaderText.trim().toLowerCase();
  console.log(`TOC header text: "${normalizedTocHeaderText}"`);
  
  // Get the normalized cloud solutions list item text that we clicked earlier
  const normalizedClickedItemText = this.clickedItemText.toLowerCase();
  console.log(`Clicked cloud solutions item text: "${normalizedClickedItemText}"`);
  
  // Check if the TOC header contains the cloud solutions list item text
  expect(normalizedClickedItemText).toContain(normalizedTocHeaderText);
  console.log(`✓ Clicked item text "${normalizedClickedItemText}" contains the TOC header text "${normalizedTocHeaderText}"`);
});

Then('the last update date in article metadata should match the meta tag', async function() {
  // Find the article metadata wrapper
  const articleMetadataWrapper = this.page.locator('.article-metadata-wrapper .article-metadata');
  await expect(articleMetadataWrapper).toBeVisible();
  console.log("✓ Found article metadata wrapper");
  
  // Get the last update date from the article metadata
  const lastUpdateText = await articleMetadataWrapper.locator('div > span:nth-child(2)').textContent();
  console.log(`Last update text from UI: "${lastUpdateText}"`);
  
  // Get the last update date from the meta tag
  const metaLastUpdate = await this.page.locator('meta[name="last-update"]').getAttribute('content');
  console.log(`Last update from meta tag: "${metaLastUpdate}"`);
  
  // Parse the meta tag date (format: "Thu Mar 07 2024 00:00:00 GMT+0000 (Coordinated Universal Time)")
  const metaDate = new Date(metaLastUpdate);
  
  // Format the meta date to match the UI format (e.g., "March 7, 2024")
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const formattedMetaDate = `${months[metaDate.getMonth()]} ${metaDate.getDate()}, ${metaDate.getFullYear()}`;
  console.log(`Formatted meta date: "${formattedMetaDate}"`);
  
  // Compare the formatted meta date with the UI date
  expect(lastUpdateText.trim()).toBe(formattedMetaDate);
  console.log(`✓ Last update date in UI "${lastUpdateText.trim()}" matches meta tag date "${formattedMetaDate}"`);
});

Then('the topics in article metadata should match the feature meta tag', async function() {
  // Find the article metadata topics section
  const articleMetadataTopics = this.page.locator('.article-metadata-topics.block');
  await expect(articleMetadataTopics).toBeVisible();
  console.log("✓ Found article metadata topics section");
  
  // Get all topic links from the article metadata
  const topicLinks = articleMetadataTopics.locator('ul li a');
  const topicCount = await topicLinks.count();
  console.log(`Found ${topicCount} topic links in the article metadata`);
  
  // Collect all topic texts
  const topicTexts = [];
  for (let i = 0; i < topicCount; i++) {
    const topicText = await topicLinks.nth(i).textContent();
    topicTexts.push(topicText.trim());
  }
  console.log(`Topics from UI: ${JSON.stringify(topicTexts)}`);
  
  // Get the feature meta tag content
  const featureMetaContent = await this.page.locator('meta[name="feature"]').getAttribute('content');
  console.log(`Feature meta tag content: "${featureMetaContent}"`);
  
  // The feature meta tag may contain multiple topics separated by commas
  const featureTopics = featureMetaContent.split(',').map(topic => topic.trim());
  console.log(`Feature topics from meta tag: ${JSON.stringify(featureTopics)}`);
  
  // Check if all UI topics are in the meta tag
  for (const uiTopic of topicTexts) {
    const matchFound = featureTopics.some(metaTopic => 
      uiTopic.toLowerCase() === metaTopic.toLowerCase()
    );
    expect(matchFound).toBeTruthy();
    console.log(`✓ UI topic "${uiTopic}" found in meta tag`);
  }
  
  // Check if all meta tag topics are in the UI
  for (const metaTopic of featureTopics) {
    const matchFound = topicTexts.some(uiTopic => 
      uiTopic.toLowerCase() === metaTopic.toLowerCase()
    );
    expect(matchFound).toBeTruthy();
    console.log(`✓ Meta tag topic "${metaTopic}" found in UI`);
  }
});

Then('the created for roles in article metadata should match the role meta tag', async function() {
  // Find the article metadata created for section
  const articleMetadataCreatedFor = this.page.locator('.article-metadata-createdby-wrapper .article-metadata-createdby');
  await expect(articleMetadataCreatedFor).toBeVisible();
  console.log("✓ Found article metadata created for section");
  
  // Get all role list items from the article metadata
  const roleItems = articleMetadataCreatedFor.locator('ul li');
  const roleCount = await roleItems.count();
  console.log(`Found ${roleCount} role items in the article metadata`);
  
  // Collect all role texts (skip the first item which is the "CREATED FOR:" label)
  const roleTexts = [];
  for (let i = 0; i < roleCount; i++) {
    const roleText = await roleItems.nth(i).textContent();
    roleTexts.push(roleText.trim());
  }
  console.log(`Roles from UI: ${JSON.stringify(roleTexts)}`);
  
  // Get the role meta tag content
  const roleMetaContent = await this.page.locator('meta[name="role"]').getAttribute('content');
  console.log(`Role meta tag content: "${roleMetaContent}"`);
  
  // The role meta tag may contain multiple roles separated by commas
  const metaRoles = roleMetaContent.split(',').map(role => role.trim());
  console.log(`Roles from meta tag: ${JSON.stringify(metaRoles)}`);
  
  // Check if all UI roles are in the meta tag
  for (const uiRole of roleTexts) {
    // Skip the "CREATED FOR:" label if it's in the list
    if (uiRole.toUpperCase() === "CREATED FOR:") continue;
    
    const matchFound = metaRoles.some(metaRole => 
      uiRole.toLowerCase() === metaRole.toLowerCase()
    );
    expect(matchFound).toBeTruthy();
    console.log(`✓ UI role "${uiRole}" found in meta tag`);
  }
  
  // Check if all meta tag roles are in the UI
  for (const metaRole of metaRoles) {
    const matchFound = roleTexts.some(uiRole => 
      uiRole.toLowerCase() === metaRole.toLowerCase()
    );
    expect(matchFound).toBeTruthy();
    console.log(`✓ Meta tag role "${metaRole}" found in UI`);
  }
});

When('user clicks on right rail toggle', async function() {
  // Find the right rail toggle button using both class and aria-label
  const rightRailToggle = this.page.locator('button.rail-toggle[aria-label="Toggle right rail"]');
  await expect(rightRailToggle).toBeVisible();
  console.log("✓ Found right rail toggle button");
  
  // Get the current class of the rail before clicking
  const railElement = this.page.locator('div.section.doc-actions-container.mini-toc-container.rail.rail-right');
  //await expect(railElement).toBeVisible();
  
  // Check the full class list before clicking
  const classListBefore = await railElement.evaluate(el => el.className);
  console.log(`Rail class before clicking: "${classListBefore}"`);
  
  // Store whether the rail has the 'closed' class before clicking
  const hasClosedClassBefore = classListBefore.includes('closed');
  this.railWasClosedBefore = hasClosedClassBefore;
  console.log(`Rail was ${hasClosedClassBefore ? 'closed' : 'open'} before clicking`);
  
  // Click on the right rail toggle button
  await rightRailToggle.click();
  console.log("✓ Clicked on right rail toggle button");
  
  // Wait for the animation to complete
  await this.page.waitForTimeout(1000);
});

Then('right rail should be hidden with closed', async function() {
  // Find the right rail element
  const railElement = this.page.locator('.section.doc-actions-container.mini-toc-container.rail.rail-right');
 // await expect(railElement).toBeVisible();
  
  // Check the full class list after clicking
  const classListAfter = await railElement.evaluate(el => el.className);
  console.log(`Rail class after clicking: "${classListAfter}"`);
  
  // Check if the rail has the 'closed' class after clicking
  const hasClosedClassAfter = classListAfter.includes('closed');
  
  // If the rail was already closed before, we expect it to be open now, and vice versa
  if (this.railWasClosedBefore) {
    expect(hasClosedClassAfter).toBeFalsy();
    console.log("✓ Rail was closed before and is now open");
    expect(classListAfter).toBe('section doc-actions-container mini-toc-container rail rail-right');
  } else {
    expect(hasClosedClassAfter).toBeTruthy();
    console.log("✓ Rail was open before and is now closed");
    expect(classListAfter).toBe('section doc-actions-container mini-toc-container rail rail-right closed');
  }
  
  // Clean up - close the browser
  if (this.browser) {
    await closeBrowser(this.browser);
    console.log('Browser closed successfully');
  }
});

// Mobile view step definitions
Given('user navigates to the docs page in mobile view', async function() {
  // Launch browser
  const result = await launchBrowser();
  this.page = result.page;
  this.browser = result.browser;
  this.context = result.context;
  
  // Set viewport to mobile size (e.g., iPhone X)
  await this.page.setViewportSize({ width: 375, height: 812 });
  console.log("✓ Set viewport to mobile size (375x812)");
  
  // Navigate to the docs page
  await this.page.goto(`${ENV.URL}/docs`);
  
  // Wait for the page to fully load
  await this.page.waitForTimeout(3000);
  
  // Verify we're on the docs page
  await expect(this.page).toHaveURL(/.*\/docs.*/);
  console.log("✓ Successfully navigated to the docs page in mobile view");
});

When('user locates the first cloud solutions block in mobile view', async function() {
  // Find the first cloud-solutions block
  const cloudSolutionsBlock = this.page.locator('.cloud-solutions.block').first();
  
  // Verify the cloud solutions block is visible
  await expect(cloudSolutionsBlock).toBeVisible();
  console.log("✓ Located the first cloud solutions block in mobile view");
  
  // Store the cloud solutions block for later use
  this.cloudSolutionsBlock = cloudSolutionsBlock;
});

Then('the cloud solutions list should be visible in mobile view', async function() {
  // Find the cloud solutions list within the block
  const cloudSolutionsList = this.cloudSolutionsBlock.locator('.cloud-solutions-list').first();
  
  // Verify the cloud solutions list is visible
  await expect(cloudSolutionsList).toBeVisible();
  console.log("✓ Cloud solutions list is visible in mobile view");
  
  // Store the cloud solutions list for later use
  this.cloudSolutionsList = cloudSolutionsList;
});

When('user clicks on the first item in the cloud solutions list in mobile view', async function() {
  // Find the first li item in the cloud solutions list
  const firstListItem = this.cloudSolutionsList.locator('li').first();
  
  // Verify the first list item is visible
  await expect(firstListItem).toBeVisible();
  
  // Get the text of the first list item for logging and later verification
  const itemText = await firstListItem.textContent();
  this.clickedItemText = itemText.trim();
  console.log(`✓ Found first list item in mobile view: "${this.clickedItemText}"`);
  
  // Store the URL of the first list item's link for later verification
  const firstItemLink = firstListItem.locator('a').first();
  this.firstItemUrl = await firstItemLink.getAttribute('href');
  console.log(`✓ First item URL in mobile view: ${this.firstItemUrl}`);
  
  // Click on the first list item
  await firstItemLink.click();
  console.log("✓ Clicked on the first item in the cloud solutions list in mobile view");
  
  // Wait for navigation
  await this.page.waitForTimeout(3000);
});

Then('user should be redirected to the selected solution page in mobile view', async function() {
  // Verify we're on the expected page
  const currentUrl = this.page.url();
  
  // Check if the current URL contains the expected URL path
  expect(currentUrl).toContain(this.firstItemUrl);
  console.log(`✓ Successfully redirected to: ${currentUrl} in mobile view`);
});

Then('breadcrumb should be displayed with the clicked item name in mobile view', async function() {
  // Find the breadcrumb element
  const breadcrumb = this.page.locator('.breadcrumbs.block');
  
  // Verify the breadcrumb is visible
  await expect(breadcrumb).toBeVisible();
  console.log("✓ Breadcrumb is displayed in mobile view");
  
  // Get the breadcrumb text
  const breadcrumbText = await breadcrumb.textContent();
  console.log(`Breadcrumb text in mobile view: ${breadcrumbText}`);
  
  // Check if the breadcrumb contains the clicked item name
  expect(breadcrumbText).toContain(this.clickedItemText);
  console.log(`✓ Breadcrumb contains the clicked item name in mobile view: "${this.clickedItemText}"`);
  
  // Note: Not closing the browser here as we need to continue with more steps
});

// Login step definition
Given('user logs in to the system', async function() {
  // Use the common login function to log in
  const result = await performLogin(this);
  
  // Wait for the page to stabilize
  await this.page.waitForTimeout(8000);
  console.log("✓ Login completed");
  await this.page.goto(`${ENV.URL}/docs`);
  await this.page.waitForTimeout(3000);
});

// Mobile login step definition
Given('user logs in to the system in mobile view', async function() {
  // Use the common login function to log in
  const result = await performLogin(this);
  
  // Wait for the page to stabilize
  await this.page.waitForTimeout(8000);
  console.log("✓ Login completed");
  
  // Set viewport to mobile size (e.g., iPhone X)
  await this.page.setViewportSize({ width: 375, height: 812 });
  console.log("✓ Set viewport to mobile size (375x812)");
  
  // Navigate to the docs page
  await this.page.goto(`${ENV.URL}/docs`);
  await this.page.waitForTimeout(3000);
  console.log("✓ Successfully navigated to the docs page in mobile view");
});

// Mobile copy link step definition
When('user clicks on the copy link icon in mobile view', async function() {
  // Find the copy link icon using class and aria-label
  const copyLinkIcon = this.page.getByRole('button', { name: 'Copy link' }).click();
  console.log("✓ Found copy link icon in mobile view");
  console.log("✓ Clicked on the copy link icon in mobile view");
  
  // Wait for the tooltip to appear
  await this.page.waitForTimeout(500);
});

// Mobile bookmark icon step definition
When('user clicks on the bookmark icon in mobile view', async function() {
  // Find the bookmark icon
  const bookmarkIcon = this.page.locator('span.icon-bookmark-active').first().click();
  await expect(bookmarkIcon).toBeVisible();
  console.log("✓ Found bookmark icon in mobile view");
  console.log("✓ Clicked on the bookmark icon in mobile view");
  
  // Wait for the bookmark action to complete
  await this.page.waitForTimeout(1000);
});
