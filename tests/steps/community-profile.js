const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { performLogin } = require('../commonFunctions/login');
const ENV = require('../../config.js');

setDefaultTimeout(90 * 1000);

// Store community section visibility state
let communitySectionVisible = false;

Given('user logs in to Experience League for community profile', async function() {
  if (!this.page) {
    await performLogin(this);
    await this.page.waitForTimeout(15000);
  }
  const url = await this.page.url();
  console.log(`Current URL: ${url}`);
  console.log("✓ Successfully logged in to Experience League");
});

When('user hovers on the profile button', async function() {
  // Wait for the page to stabilize
  await this.page.waitForTimeout(2000);
  
  // Define possible selectors for the profile button
  const profileButtonSelectors = [
    '.profile-picture',
    'img.profile-picture',
    '.profile.profile-toggle',
    'button.profile-button',
    '[data-testid="profile-button"]',
    '.user-profile',
    '.profile-menu-trigger'
  ];
  
  // Try to find and hover on the profile button
  let profileButtonFound = false;
  
  for (const selector of profileButtonSelectors) {
    try {
      const profileButton = this.page.locator(selector).first();
      const isVisible = await profileButton.isVisible().catch(() => false);
      
      if (isVisible) {
        console.log(`Found profile button with selector: ${selector}`);
        
        // Hover on the profile button
        await profileButton.hover();
        console.log("✓ Hovered on profile button");
        
        profileButtonFound = true;
        this.profileButtonSelector = selector;
        break;
      }
    } catch (error) {
      console.log(`Profile button not found with selector: ${selector}`);
    }
  }
  
  // Assert that profile button was found and hovered
  expect(profileButtonFound).toBeTruthy();
  
  // Take a screenshot after hovering
  await this.page.screenshot({ path: 'screenshots/after-profile-hover.png' });
});

When('user waits for {int} seconds for community profile', async function(seconds) {
  const milliseconds = seconds * 1000;
  console.log(`Waiting for ${seconds} seconds...`);
  await this.page.waitForTimeout(milliseconds);
  console.log(`✓ Waited for ${seconds} seconds`);
});

Then('verify if community section is available in profile menu', async function() {
  // Wait for profile menu to be fully visible
  await this.page.waitForTimeout(1000);
  
  // Define possible selectors for the community section
  const communitySectionSelectors = [
    '.profile-menu-section:has-text("Community")',
    'div.profile-menu-section:has(h2:text("Community"))',
    '.profile-section:has-text("Community")',
    '[data-section="community"]',
    'section:has-text("Community")',
    'div:has(h2:text-is("Community"))'
  ];
  
  // Try to find the community section
  communitySectionVisible = false;
  
  for (const selector of communitySectionSelectors) {
    try {
      const communitySection = this.page.locator(selector).first();
      const isVisible = await communitySection.isVisible().catch(() => false);
      
      if (isVisible) {
        console.log(`Found community section with selector: ${selector}`);
        communitySectionVisible = true;
        this.communitySectionSelector = selector;
        
        // Take a screenshot showing the community section
        await this.page.screenshot({ path: 'screenshots/community-section-visible.png' });
        break;
      }
    } catch (error) {
      console.log(`Community section not found with selector: ${selector}`);
    }
  }
  
  if (communitySectionVisible) {
    console.log("✓ Community section is available in profile menu");
  } else {
    console.log("⚠ Community section is NOT available in profile menu");
    await this.page.screenshot({ path: 'screenshots/community-section-not-found.png' });
  }
  
  // Store the visibility state for later steps
  this.communitySectionVisible = communitySectionVisible;
});

Then('if community section is not visible print {string}', async function(message) {
  if (!this.communitySectionVisible) {
    console.log(`\n❌ ${message}\n`);
  }
});

Then('verify community section is visible in profile menu', async function() {
  // Wait for profile menu to be fully visible
  await this.page.waitForTimeout(1000);
  
  // Define possible selectors for the community section
  const communitySectionSelectors = [
    '.profile-menu-section:has-text("Community")',
    'div.profile-menu-section:has(h2:text("Community"))',
    '.profile-section:has-text("Community")',
    '[data-section="community"]',
    'section:has-text("Community")',
    'div:has(h2:text-is("Community"))'
  ];
  
  // Try to find the community section
  let communitySectionFound = false;
  
  for (const selector of communitySectionSelectors) {
    try {
      const communitySection = this.page.locator(selector).first();
      const isVisible = await communitySection.isVisible().catch(() => false);
      
      if (isVisible) {
        console.log(`Found community section with selector: ${selector}`);
        communitySectionFound = true;
        this.communitySectionSelector = selector;
        
        // Take a screenshot showing the community section
        await this.page.screenshot({ path: 'screenshots/community-section-visible.png' });
        break;
      }
    } catch (error) {
      console.log(`Community section not found with selector: ${selector}`);
    }
  }
  
  // Assert that community section is visible
  expect(communitySectionFound).toBeTruthy();
  console.log("✓ Community section is visible in profile menu");
  
  // Store the visibility state
  this.communitySectionVisible = communitySectionFound;
});

Then('verify {string} link is visible and clickable', async function(linkText) {
  // Find the link by text within the community section or profile menu
  const linkSelectors = [
    `a:has-text("${linkText}")`,
    `a[title="${linkText}"]`,
    `.profile-menu-links a:has-text("${linkText}")`,
    `.community-links a:has-text("${linkText}")`
  ];
  
  let linkFound = false;
  let linkElement = null;
  
  for (const selector of linkSelectors) {
    try {
      const link = this.page.locator(selector).first();
      const isVisible = await link.isVisible().catch(() => false);
      
      if (isVisible) {
        console.log(`Found link "${linkText}" with selector: ${selector}`);
        linkElement = link;
        linkFound = true;
        break;
      }
    } catch (error) {
      console.log(`Link "${linkText}" not found with selector: ${selector}`);
    }
  }
  
  // Assert that link is visible
  expect(linkFound).toBeTruthy();
  
  // Check if link is clickable (enabled)
  const isEnabled = await linkElement.isEnabled();
  expect(isEnabled).toBeTruthy();
  
  console.log(`✓ Link "${linkText}" is visible and clickable`);
  
  // Store the link element for navigation check
  if (!this.communityLinks) {
    this.communityLinks = {};
  }
  this.communityLinks[linkText] = linkElement;
});

Then('verify {string} link navigates to {string}', async function(linkText, expectedUrlPattern) {
  // Get the stored link element
  const linkElement = this.communityLinks[linkText];
  
  if (!linkElement) {
    throw new Error(`Link "${linkText}" was not found in previous step`);
  }
  
  // Get the href attribute
  const href = await linkElement.getAttribute('href');
  console.log(`Link "${linkText}" href: ${href}`);
  
  // Check if the href contains the expected URL pattern
  const containsPattern = href && href.includes(expectedUrlPattern);
  expect(containsPattern).toBeTruthy();
  
  console.log(`✓ Link "${linkText}" navigates to URL containing: ${expectedUrlPattern}`);
});

When('community section is visible', async function() {
  // This is a conditional step - check if community section is visible
  if (this.communitySectionVisible) {
    console.log("✓ Community section is visible - proceeding with validation");
  } else {
    console.log("⚠ Community section is not visible - skipping validation steps");
  }
});

Then('verify all community profile links are present:', async function(dataTable) {
  // This step only runs if community section is visible
  if (!this.communitySectionVisible) {
    console.log("⚠ Skipping link verification - community section not visible");
    return;
  }
  
  // Get the data table rows
  const rows = dataTable.hashes();
  
  // Initialize storage for links
  this.communityLinksValidation = [];
  
  for (const row of rows) {
    const linkName = row['Link Name'];
    const expectedUrl = row['Expected URL Pattern'];
    
    console.log(`\nChecking link: ${linkName}`);
    
    // Find the link
    const linkSelectors = [
      `a:has-text("${linkName}")`,
      `a[title="${linkName}"]`,
      `.profile-menu-links a:has-text("${linkName}")`,
      `.community-links a:has-text("${linkName}")`
    ];
    
    let linkFound = false;
    let linkElement = null;
    let linkHref = null;
    
    for (const selector of linkSelectors) {
      try {
        const link = this.page.locator(selector).first();
        const isVisible = await link.isVisible().catch(() => false);
        
        if (isVisible) {
          linkElement = link;
          linkHref = await link.getAttribute('href');
          linkFound = true;
          console.log(`  ✓ Found link with href: ${linkHref}`);
          break;
        }
      } catch (error) {
        // Continue to next selector
      }
    }
    
    // Store the validation result
    this.communityLinksValidation.push({
      name: linkName,
      found: linkFound,
      element: linkElement,
      href: linkHref,
      expectedUrl: expectedUrl
    });
    
    if (linkFound) {
      console.log(`  ✓ Link "${linkName}" is present`);
    } else {
      console.log(`  ✗ Link "${linkName}" is NOT present`);
    }
  }
  
  // Take a screenshot of the profile menu
  await this.page.screenshot({ path: 'screenshots/community-links-validation.png' });
  
  // Check if any links were found
  const allLinksFound = this.communityLinksValidation.every(link => link.found);
  const anyLinksFound = this.communityLinksValidation.some(link => link.found);
  
  if (!anyLinksFound) {
    // No links found at all - community profile is not created
    console.log("\n" + "=".repeat(80));
    console.log("❌ COMMUNITY PROFILE IS NOT CREATED FOR NEWLY SIGNED UP USER");
    console.log("❌ COMMUNITY SECTION IS NOT VISIBLE");
    console.log("=".repeat(80) + "\n");
    
    // Update the community section visibility flag
    this.communitySectionVisible = false;
  } else if (!allLinksFound) {
    // Some links found but not all
    console.log("\n⚠ Some community links are missing");
  } else {
    console.log("\n✓ All community profile links are present");
  }
});

Then('verify each link is visible and clickable', async function() {
  // This step only runs if community section is visible
  if (!this.communitySectionVisible) {
    console.log("⚠ Skipping visibility/clickability check - community section not visible");
    return;
  }
  
  // Check each link from the validation results
  for (const link of this.communityLinksValidation) {
    if (link.found && link.element) {
      // Check visibility
      const isVisible = await link.element.isVisible();
      expect(isVisible).toBeTruthy();
      
      // Check if clickable (enabled)
      const isEnabled = await link.element.isEnabled();
      expect(isEnabled).toBeTruthy();
      
      console.log(`✓ Link "${link.name}" is visible and clickable`);
    } else {
      console.log(`✗ Link "${link.name}" was not found - skipping visibility check`);
    }
  }
  
  console.log("\n✓ All found links are visible and clickable");
});

Then('verify each link navigates to the correct target URL', async function() {
  // This step only runs if community section is visible
  if (!this.communitySectionVisible) {
    console.log("⚠ Skipping URL validation - community section not visible");
    return;
  }
  
  // Check each link's URL from the validation results
  let allUrlsValid = true;
  const failedLinks = [];
  
  for (const link of this.communityLinksValidation) {
    if (link.found && link.href) {
      // Check if the href contains the expected URL pattern - pass if URL contains the base pattern
      const containsPattern = link.href.includes(link.expectedUrl);
      
      if (containsPattern) {
        console.log(`✓ Link "${link.name}" contains expected pattern: ${link.expectedUrl}`);
        console.log(`  Full URL: ${link.href}`);
      } else {
        console.log(`✗ Link "${link.name}" URL validation FAILED:`);
        console.log(`  Expected pattern: ${link.expectedUrl}`);
        console.log(`  Actual URL: ${link.href}`);
        console.log(`  URL type: ${typeof link.href}`);
        allUrlsValid = false;
        failedLinks.push({
          name: link.name,
          expected: link.expectedUrl,
          actual: link.href
        });
      }
    } else if (link.found && !link.href) {
      console.log(`✗ Link "${link.name}" was found but href is missing or null`);
      allUrlsValid = false;
      failedLinks.push({
        name: link.name,
        expected: link.expectedUrl,
        actual: 'null or undefined'
      });
    } else {
      console.log(`⚠ Link "${link.name}" was not found - skipping URL validation`);
    }
  }
  
  if (!allUrlsValid) {
    console.log("\n❌ URL validation failed for the following links:");
    failedLinks.forEach(link => {
      console.log(`  - ${link.name}: Expected "${link.expected}", Got "${link.actual}"`);
    });
    throw new Error(`URL validation failed for ${failedLinks.length} link(s)`);
  }
  
  console.log("\n✓ All found links navigate to correct target URLs");
});

When('community section is not visible', async function() {
  // This is a conditional step - check if community section is not visible
  if (!this.communitySectionVisible) {
    console.log("\n" + "=".repeat(80));
    console.log("❌ COMMUNITY SECTION IS NOT VISIBLE");
    console.log("=".repeat(80));
  }
  // If community section is visible, this step does nothing (no confusing messages)
});

Then('print {string}', async function(message) {
  // Only print if community section is not visible
  if (!this.communitySectionVisible) {
    console.log(`❌ ${message}`);
    console.log("=".repeat(80) + "\n");
  }
});

// Network monitoring step definitions
Given('user starts monitoring network requests for profile menu', async function() {
  // Store the flag to enable monitoring
  this.monitorProfileMenuList = true;
  
  // Store all network requests
  this.networkRequests = [];
  this.profileMenuListRequest = null;
  
  console.log("✓ Network monitoring flag enabled - will start monitoring when page is available");
});

// Modified login step that includes network monitoring
Given('user logs in to Experience League for community profile with network monitoring', async function() {
  if (!this.page) {
    await performLogin(this);
  }
  
  // Now that page exists, set up network monitoring if flag is set
  if (this.monitorProfileMenuList) {
    console.log("✓ Setting up network monitoring listeners on page...");
    
    // Create a promise to capture the profile-menu-list request
    this.profileMenuListPromise = new Promise((resolve) => {
      this.resolveProfileMenuList = resolve;
    });
    
    // Listen to all network responses - this captures like DevTools Network tab
    this.page.on('response', async (response) => {
      const url = response.url();
      const status = response.status();
      
      if (url.includes('profile-menu-list')) {
        console.log(`\n✓ FOUND profile-menu-list API call!`);
        console.log(`   URL: ${url}`);
        console.log(`   Method: ${response.request().method()}`);
        console.log(`   Status Code: ${status}`);
        console.log(`   Status Text: ${response.statusText()}`);
        
        // Get response headers (like DevTools Headers tab)
        const headers = response.headers();
        console.log(`   Response Headers:`);
        Object.keys(headers).forEach(key => {
          console.log(`     ${key}: ${headers[key]}`);
        });
        
        // Store the complete request information
        const requestInfo = {
          url: url,
          method: response.request().method(),
          status: status,
          statusText: response.statusText(),
          headers: headers,
          timestamp: new Date().toISOString()
        };
        
        // Try to get response body
        try {
          const contentType = headers['content-type'] || '';
          if (contentType.includes('application/json')) {
            const body = await response.json();
            requestInfo.responseBody = body;
            console.log(`   Response Body: ${JSON.stringify(body).substring(0, 200)}...`);
          }
        } catch (e) {
          console.log('   Could not parse response body');
        }
        
        this.profileMenuListRequest = requestInfo;
        
        // Resolve the promise
        if (this.resolveProfileMenuList) {
          this.resolveProfileMenuList(requestInfo);
        }
      }
    });
    
    console.log("✓ Network monitoring listeners attached - will capture profile-menu-list API like DevTools Network tab");
  }
  
  // Wait for the page to load completely
  await this.page.waitForTimeout(15000);
  
  // Verify we're on the Experience League page
  const url = await this.page.url();
  console.log(`Current URL: ${url}`);
  console.log("✓ Successfully logged in to Experience League");
});

Then('verify profile-menu-list API status code and determine profile status', async function() {
  // Wait a moment to ensure all network calls are captured
  await this.page.waitForTimeout(2000);
  
  if (!this.profileMenuListRequest) {
    console.log("⚠ No profile-menu-list API call was detected");
    console.log("This might mean the API call didn't happen or uses a different URL pattern");
    return;
  }
  
  const statusCode = this.profileMenuListRequest.status;
  console.log(`\nProfile-menu-list API Status Code: ${statusCode}`);
  console.log(`API URL: ${this.profileMenuListRequest.url}`);
  console.log(`Status Text: ${this.profileMenuListRequest.statusText}`);
  
  // Check status code and determine profile status
  if (statusCode === 404) {
    console.log("❌ Status 404: Profile not created");
    this.profileStatus = "Profile not created";
  } else if (statusCode === 200) {
    console.log("✓ Status 200: Profile is present");
    this.profileStatus = "Profile is present";
  } else if (statusCode === 500) {
    console.log("❌ Status 500: API failed");
    this.profileStatus = "API failed";
    // Fail the test case
    throw new Error("API failed with status code 500");
  } else {
    console.log(`⚠ Unexpected status code: ${statusCode}`);
    this.profileStatus = `Unexpected status: ${statusCode}`;
  }
  
  // Take a screenshot
  await this.page.screenshot({ path: 'screenshots/profile-menu-list-api-check.png' });
});

Then('log the profile status result', async function() {
  if (this.profileStatus) {
    console.log(`\n=== PROFILE STATUS RESULT ===`);
    console.log(`${this.profileStatus}`);
    console.log(`============================\n`);
  } else {
    console.log("\n⚠ No profile status determined\n");
  }
});

// Language selector step definitions
When('user clicks on language selector button', async function() {
  // Wait for the page to stabilize
  await this.page.waitForTimeout(2000);
  
  // Find and click the language selector button
  const languageButton = this.page.locator('button.language-selector-button');
  
  await expect(languageButton).toBeVisible({ timeout: 10000 });
  await languageButton.click();
  
  console.log("✓ Clicked on language selector button");
  
  // Wait for the language picker popover to be visible
  await this.page.waitForTimeout(1000);
  
  // Take a screenshot
  await this.page.screenshot({ path: 'screenshots/language-selector-opened.png' });
});

When('user selects {string} from language list', async function(language) {
  // Map language names to data-value attributes
  const languageMap = {
    'Español': 'es',
    'English': 'en',
    'Deutsch': 'de',
    'Français': 'fr',
    'Italiano': 'it',
    'Nederlands': 'nl',
    'Português': 'pt-br',
    'Svenska': 'sv',
    '中文 (简体)': 'zh-hans',
    '中文 (繁體)': 'zh-hant',
    '日本語': 'ja',
    '한국어': 'ko'
  };
  
  const languageValue = languageMap[language];
  
  if (!languageValue) {
    throw new Error(`Language "${language}" not found in language map`);
  }
  
  // Find and click the language option
  const languageOption = this.page.locator(`span.language-selector-label[data-value="${languageValue}"]`);
  
  await expect(languageOption).toBeVisible({ timeout: 5000 });
  await languageOption.click();
  
  console.log(`✓ Selected ${language} from language list`);
  
  // Wait for page to reload/update with new language
  await this.page.waitForTimeout(3000);
  
  // Store the selected language for later verification
  this.selectedLanguage = language;
  this.selectedLanguageCode = languageValue;
  
  // Take a screenshot after language change
  await this.page.screenshot({ path: `screenshots/after-language-change-${languageValue}.png` });
});

Then('verify community section header is displayed in Spanish as {string}', async function(expectedHeader) {
  // Wait for profile menu to be fully visible
  await this.page.waitForTimeout(1000);
  
  // Find the community section header
  const communityHeader = this.page.locator('.profile-menu-section h2:has-text("Comunidad")');
  
  const isVisible = await communityHeader.isVisible().catch(() => false);
  
  if (isVisible) {
    const headerText = await communityHeader.textContent();
    console.log(`✓ Community section header: "${headerText}"`);
    expect(headerText.trim()).toBe(expectedHeader);
    console.log(`✓ Community section header is correctly displayed in Spanish as "${expectedHeader}"`);
  } else {
    throw new Error('Community section header not found');
  }
});

Then('verify all community links are displayed in Spanish:', async function(dataTable) {
  // Get the expected Spanish link names
  const rows = dataTable.hashes();
  
  // Initialize storage for Spanish links validation
  this.spanishLinksValidation = [];
  
  for (const row of rows) {
    const spanishLinkName = row['Spanish Link Name'];
    const expectedUrlPattern = row['Expected URL Pattern'];
    
    console.log(`\nChecking Spanish link: ${spanishLinkName}`);
    
    // Find the link in the community section
    const linkSelectors = [
      `a:has-text("${spanishLinkName}")`,
      `a[title="${spanishLinkName}"]`,
      `.profile-menu-links a:has-text("${spanishLinkName}")`
    ];
    
    let linkFound = false;
    let linkElement = null;
    let linkHref = null;
    
    for (const selector of linkSelectors) {
      try {
        const link = this.page.locator(selector).first();
        const isVisible = await link.isVisible().catch(() => false);
        
        if (isVisible) {
          linkElement = link;
          linkHref = await link.getAttribute('href');
          linkFound = true;
          console.log(`  ✓ Found Spanish link with href: ${linkHref}`);
          break;
        }
      } catch (error) {
        // Continue to next selector
      }
    }
    
    // Verify the link contains lang=es parameter
    if (linkFound && linkHref) {
      const hasSpanishParam = linkHref.includes('lang=es');
      if (hasSpanishParam) {
        console.log(`  ✓ Link contains Spanish language parameter (lang=es)`);
      } else {
        console.log(`  ⚠ Link does NOT contain Spanish language parameter`);
      }
    }
    
    // Store the validation result
    this.spanishLinksValidation.push({
      name: spanishLinkName,
      found: linkFound,
      element: linkElement,
      href: linkHref,
      expectedUrl: expectedUrlPattern
    });
    
    if (linkFound) {
      console.log(`  ✓ Spanish link "${spanishLinkName}" is present`);
      
      // Verify URL pattern - pass if URL contains the base pattern
      if (linkHref && linkHref.includes(expectedUrlPattern)) {
        console.log(`  ✓ Link URL contains expected pattern: ${expectedUrlPattern}`);
        console.log(`  ✓ Full URL: ${linkHref}`);
      } else {
        console.log(`  ✗ Link URL does not contain expected pattern`);
        console.log(`    Expected pattern: ${expectedUrlPattern}`);
        console.log(`    Actual URL: ${linkHref}`);
      }
    } else {
      console.log(`  ✗ Spanish link "${spanishLinkName}" is NOT present`);
    }
  }
  
  // Take a screenshot of the Spanish community section
  await this.page.screenshot({ path: 'screenshots/spanish-community-links.png' });
  
  // Assert that all links were found
  const allLinksFound = this.spanishLinksValidation.every(link => link.found);
  expect(allLinksFound).toBeTruthy();
  
  console.log("\n✓ All community links are correctly displayed in Spanish");
});
