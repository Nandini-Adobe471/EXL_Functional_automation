const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { performLogin } = require('../commonFunctions/login');
const { launchBrowser, closeBrowser } = require('../commonFunctions/launchbrowser');

setDefaultTimeout(90 * 1000);

Given('user logs in and lands on the home page for footer validation', async function() {
  // Launch browser
  const result = await launchBrowser();
  this.page = result.page;
  this.browser = result.browser;
  this.context = result.context;
  
  // Use the common login function to log in
  await performLogin(this);
  
  // Navigate to the home page
  await this.page.goto('https://experienceleague-stage.adobe.com/');
  
  // Wait for the page to fully load after login
  await this.page.waitForTimeout(2000);
  
  // Verify we're on the home page
  await expect(this.page).toHaveURL(/.*experienceleague-stage.adobe.com\/?$/);
  console.log("✓ Successfully logged in and landed on the home page for footer validation");
});

When('user sets viewport to mobile size for footer validation', async function() {
  try {
    console.log('Setting viewport to mobile size for footer validation');
    
    // Get the current URL before changing viewport
    const currentUrl = this.page.url();
    console.log(`Current URL before changing viewport: ${currentUrl}`);
    
    // Set viewport to a common mobile device size (e.g., iPhone 12)
    await this.page.setViewportSize({ width: 390, height: 844 });
    
    // Wait for the page to adjust to the new viewport size
    await this.page.waitForTimeout(1000);
    
    // Take a screenshot after changing viewport
    await this.page.screenshot({ path: 'mobile-viewport-changed.png' });
    
    console.log('Viewport set to mobile size for footer validation: 390x844');
    console.log(`Staying on the current page: ${this.page.url()}`);
    
  } catch (error) {
    console.error(`Error setting viewport to mobile size: ${error.message}`);
    await this.page.screenshot({ path: 'mobile-viewport-error.png' });
    throw error;
  }
});

Then('user should see the same footer elements on main site in mobile view', async function() {
  try {
    console.log('Checking for footer elements on main site in mobile view');
    
    // Scroll to the bottom of the page to ensure the footer is in view
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await this.page.waitForTimeout(1000);
    
    // Take a screenshot of the footer on the main site in mobile view
    await this.page.screenshot({ path: 'main-site-footer-mobile.png' });
    
    // Check for footer breadcrumb
    const footerBreadcrumb = this.page.locator('.footer-breadcrumb, .breadcrumb, nav[aria-label="Breadcrumb"]');
    const isFooterBreadcrumbVisible = await footerBreadcrumb.isVisible().catch(() => false);
    
    if (isFooterBreadcrumbVisible) {
      console.log("✓ Footer breadcrumb is visible on main site in mobile view");
    } else {
      console.log("✗ Footer breadcrumb is not visible on main site in mobile view");
    }
    
    // Check for footer h2 tags
    const footerH2Tags = this.page.locator('footer h2, .footer h2, .experienceleague-footer h2');
    const footerH2Count = await footerH2Tags.count();
    
    if (footerH2Count > 0) {
      console.log(`✓ Found ${footerH2Count} h2 tags in the footer on main site in mobile view`);
      
      // Log the h2 tag texts
      const mobileH2Texts = [];
      for (let i = 0; i < footerH2Count; i++) {
        const h2Text = await footerH2Tags.nth(i).textContent();
        mobileH2Texts.push(h2Text.trim());
        console.log(`Mobile footer h2 #${i+1}: ${h2Text.trim()}`);
      }
    } else {
      console.log("✗ No h2 tags found in the footer on main site in mobile view");
    }
    
    // Check for language selector
    const languageSelectors = [
      '.language-selector',
      '.language-navigation',
      '.language-selection',
      'select[aria-label*="language"]',
      'div[aria-label*="language"]',
      '.footer-language'
    ];
    
    let languageSelectorFound = false;
    
    for (const selector of languageSelectors) {
      const element = this.page.locator(selector);
      if (await element.isVisible().catch(() => false)) {
        languageSelectorFound = true;
        console.log(`Found language selector on main site in mobile view with selector: ${selector}`);
        break;
      }
    }
    
    if (languageSelectorFound) {
      console.log("✓ Language selector is visible on main site in mobile view");
    } else {
      console.log("✗ Language selector is not visible on main site in mobile view");
    }
    
    // Check for social media links
    const socialMediaSelectors = [
      '.social-links',
      '.social-media',
      '.footer-social',
      'a[href*="facebook"], a[href*="twitter"], a[href*="linkedin"], a[href*="instagram"]'
    ];
    
    let socialMediaFound = false;
    
    for (const selector of socialMediaSelectors) {
      const element = this.page.locator(selector);
      if (await element.isVisible().catch(() => false)) {
        socialMediaFound = true;
        console.log(`Found social media links on main site in mobile view with selector: ${selector}`);
        break;
      }
    }
    
    if (socialMediaFound) {
      console.log("✓ Social media links are visible on main site in mobile view");
    } else {
      console.log("✗ Social media links are not visible on main site in mobile view");
    }
    
    // Check for copyright section
    const copyrightSelectors = [
      '.copyright',
      '.footer-copyright',
      '.legal-copyright',
      'p:has-text("Copyright")',
      'div:has-text("© Adobe")'
    ];
    
    let copyrightFound = false;
    
    for (const selector of copyrightSelectors) {
      const element = this.page.locator(selector);
      if (await element.isVisible().catch(() => false)) {
        copyrightFound = true;
        console.log(`Found copyright section on main site in mobile view with selector: ${selector}`);
        break;
      }
    }
    
    if (copyrightFound) {
      console.log("✓ Footer copyright section is visible on main site in mobile view");
    } else {
      console.log("✗ Footer copyright section is not visible on main site in mobile view");
    }
    
    // Overall validation
    const allElementsPresent = isFooterBreadcrumbVisible && footerH2Count > 0 && 
                              languageSelectorFound && socialMediaFound && copyrightFound;
    
    if (allElementsPresent) {
      console.log("✓ All footer elements from fragment page are present on main site in mobile view");
    } else {
      console.log("✗ Some footer elements from fragment page are not present on main site in mobile view");
    }
    
    // Clean up - close the browser
    if (this.browser) {
      await closeBrowser(this.browser);
      console.log('Browser closed successfully');
    }
    
  } catch (error) {
    console.error(`Error checking footer elements on main site in mobile view: ${error.message}`);
    await this.page.screenshot({ path: 'main-site-footer-mobile-error.png' });
    
    // Clean up even if there's an error
    if (this.browser) {
      await closeBrowser(this.browser);
    }
    
    throw error;
  }
});


Then('user should see footer breadcrumb', async function() {
  try {
    console.log('Checking for footer breadcrumb');
    
    // Look for breadcrumb in the footer fragment
    const footerBreadcrumb = this.page.locator('.footer-breadcrumb, .breadcrumb, nav[aria-label="Breadcrumb"]');
    const isFooterBreadcrumbVisible = await footerBreadcrumb.isVisible().catch(() => false);
    
    expect(isFooterBreadcrumbVisible).toBeTruthy();
    console.log("✓ Footer breadcrumb is visible");
    
    // Store the breadcrumb text for later comparison
    if (isFooterBreadcrumbVisible) {
      this.footerBreadcrumbText = await footerBreadcrumb.textContent();
      console.log(`Footer breadcrumb text: ${this.footerBreadcrumbText.trim()}`);
    }
    
  } catch (error) {
    console.error(`Error checking footer breadcrumb: ${error.message}`);
    await this.page.screenshot({ path: 'footer-breadcrumb-error.png' });
    throw error;
  }
});

Then('user should see footer item h2 tag texts', async function() {
  try {
    console.log('Checking for footer item h2 tag texts');
    
    // Look for h2 tags in the footer
    const footerH2Tags = this.page.locator('footer h2, .footer h2, .experienceleague-footer h2');
    const footerH2Count = await footerH2Tags.count();
    
    expect(footerH2Count).toBeGreaterThan(0);
    console.log(`✓ Found ${footerH2Count} h2 tags in the footer`);
    
    // Store the h2 tag texts for later comparison
    this.footerH2Texts = [];
    for (let i = 0; i < footerH2Count; i++) {
      const h2Text = await footerH2Tags.nth(i).textContent();
      this.footerH2Texts.push(h2Text.trim());
      console.log(`Footer h2 #${i+1}: ${h2Text.trim()}`);
    }
    
  } catch (error) {
    console.error(`Error checking footer h2 tags: ${error.message}`);
    await this.page.screenshot({ path: 'footer-h2-error.png' });
    throw error;
  }
});

Then('user should see language selector', async function() {
  try {
    console.log('Checking for language selector');
    
    // Look for language selector in the footer
    const languageSelectors = [
      '.language-selector',
      '.language-navigation',
      '.language-selection',
      'select[aria-label*="language"]',
      'div[aria-label*="language"]',
      '.footer-language'
    ];
    
    let languageSelectorFound = false;
    let languageSelectorElement;
    
    for (const selector of languageSelectors) {
      const element = this.page.locator(selector);
      if (await element.isVisible().catch(() => false)) {
        languageSelectorFound = true;
        languageSelectorElement = element;
        console.log(`Found language selector with selector: ${selector}`);
        break;
      }
    }
    
    expect(languageSelectorFound).toBeTruthy();
    console.log("✓ Language selector is visible");
    
    // Store the language selector details for later comparison
    if (languageSelectorFound) {
      this.languageSelectorText = await languageSelectorElement.textContent();
      console.log(`Language selector text: ${this.languageSelectorText.trim()}`);
    }
    
  } catch (error) {
    console.error(`Error checking language selector: ${error.message}`);
    await this.page.screenshot({ path: 'language-selector-error.png' });
    throw error;
  }
});

Then('user should see social media links', async function() {
  try {
    console.log('Checking for social media links');
    
    // Look for social media links in the footer
    const socialMediaSelectors = [
      '.social-links',
      '.social-media',
      '.footer-social',
      'a[href*="facebook"], a[href*="twitter"], a[href*="linkedin"], a[href*="instagram"]'
    ];
    
    let socialMediaFound = false;
    let socialMediaElement;
    
    for (const selector of socialMediaSelectors) {
      const element = this.page.locator(selector);
      if (await element.isVisible().catch(() => false)) {
        socialMediaFound = true;
        socialMediaElement = element;
        console.log(`Found social media links with selector: ${selector}`);
        break;
      }
    }
    
    expect(socialMediaFound).toBeTruthy();
    console.log("✓ Social media links are visible");
    
    // Store the social media links count for later comparison
    if (socialMediaFound) {
      const socialLinks = socialMediaElement.locator('a');
      this.socialLinksCount = await socialLinks.count();
      console.log(`Found ${this.socialLinksCount} social media links`);
    }
    
  } catch (error) {
    console.error(`Error checking social media links: ${error.message}`);
    await this.page.screenshot({ path: 'social-media-links-error.png' });
    throw error;
  }
});

Then('user should see footer copyright section', async function() {
  try {
    console.log('Checking for footer copyright section');
    
    // Look for copyright section in the footer
    const copyrightSelectors = [
      '.copyright',
      '.footer-copyright',
      '.legal-copyright',
      'p:has-text("Copyright")',
      'div:has-text("© Adobe")'
    ];
    
    let copyrightFound = false;
    let copyrightElement;
    
    for (const selector of copyrightSelectors) {
      const element = this.page.locator(selector);
      if (await element.isVisible().catch(() => false)) {
        copyrightFound = true;
        copyrightElement = element;
        console.log(`Found copyright section with selector: ${selector}`);
        break;
      }
    }
    
    expect(copyrightFound).toBeTruthy();
    console.log("✓ Footer copyright section is visible");
    
    // Store the copyright text for later comparison
    if (copyrightFound) {
      this.copyrightText = await copyrightElement.textContent();
      console.log(`Copyright text: ${this.copyrightText.trim()}`);
    }
    
  } catch (error) {
    console.error(`Error checking footer copyright section: ${error.message}`);
    await this.page.screenshot({ path: 'footer-copyright-error.png' });
    throw error;
  }
});

When('user navigates to the main site', async function() {
  // Navigate to the main site
  await this.page.goto('https://experienceleague-stage.adobe.com/en');
  
  // Wait for the page to load completely
  await this.page.waitForTimeout(2000);
  
  // Take a screenshot of the main site
  await this.page.screenshot({ path: 'main-site.png' });
  
  console.log("✓ Successfully navigated to the main site");
});

Then('user should see the same footer elements on main site', async function() {
  try {
    console.log('Checking for footer elements on main site');
    
    // Scroll to the bottom of the page to ensure the footer is in view
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await this.page.waitForTimeout(1000);
    
    // Take a screenshot of the footer on the main site
    await this.page.screenshot({ path: 'main-site-footer.png' });
    
    // Check for footer breadcrumb
    const footerBreadcrumb = this.page.locator('.footer-breadcrumb, .breadcrumb, nav[aria-label="Breadcrumb"]');
    const isFooterBreadcrumbVisible = await footerBreadcrumb.isVisible().catch(() => false);
    
    if (isFooterBreadcrumbVisible) {
      console.log("✓ Footer breadcrumb is visible on main site");
      
      // Compare with the breadcrumb from the fragment page if available
      if (this.footerBreadcrumbText) {
        const mainSiteBreadcrumbText = await footerBreadcrumb.textContent();
        console.log(`Main site breadcrumb text: ${mainSiteBreadcrumbText.trim()}`);
      }
    } else {
      console.log("✗ Footer breadcrumb is not visible on main site");
    }
    
    // Check for footer h2 tags
    const footerH2Tags = this.page.locator('footer h2, .footer h2, .experienceleague-footer h2');
    const footerH2Count = await footerH2Tags.count();
    
    if (footerH2Count > 0) {
      console.log(`✓ Found ${footerH2Count} h2 tags in the footer on main site`);
      
      // Compare with the h2 tags from the fragment page if available
      if (this.footerH2Texts && this.footerH2Texts.length > 0) {
        const mainSiteH2Texts = [];
        for (let i = 0; i < footerH2Count; i++) {
          const h2Text = await footerH2Tags.nth(i).textContent();
          mainSiteH2Texts.push(h2Text.trim());
          console.log(`Main site footer h2 #${i+1}: ${h2Text.trim()}`);
        }
        
        // Check if all h2 texts from the fragment page are present on the main site
        const allH2TextsPresent = this.footerH2Texts.every(fragmentH2Text => 
          mainSiteH2Texts.some(mainSiteH2Text => 
            mainSiteH2Text.includes(fragmentH2Text) || fragmentH2Text.includes(mainSiteH2Text)
          )
        );
        
        if (allH2TextsPresent) {
          console.log("✓ All footer h2 texts from fragment page are present on main site");
        } else {
          console.log("✗ Some footer h2 texts from fragment page are not present on main site");
        }
      }
    } else {
      console.log("✗ No h2 tags found in the footer on main site");
    }
    
    // Check for language selector
    const languageSelectors = [
      '.language-selector',
      '.language-navigation',
      '.language-selection',
      'select[aria-label*="language"]',
      'div[aria-label*="language"]',
      '.footer-language'
    ];
    
    let languageSelectorFound = false;
    
    for (const selector of languageSelectors) {
      const element = this.page.locator(selector);
      if (await element.isVisible().catch(() => false)) {
        languageSelectorFound = true;
        console.log(`Found language selector on main site with selector: ${selector}`);
        break;
      }
    }
    
    if (languageSelectorFound) {
      console.log("✓ Language selector is visible on main site");
    } else {
      console.log("✗ Language selector is not visible on main site");
    }
    
    // Check for social media links
    const socialMediaSelectors = [
      '.social-links',
      '.social-media',
      '.footer-social',
      'a[href*="facebook"], a[href*="twitter"], a[href*="linkedin"], a[href*="instagram"]'
    ];
    
    let socialMediaFound = false;
    
    for (const selector of socialMediaSelectors) {
      const element = this.page.locator(selector);
      if (await element.isVisible().catch(() => false)) {
        socialMediaFound = true;
        console.log(`Found social media links on main site with selector: ${selector}`);
        break;
      }
    }
    
    if (socialMediaFound) {
      console.log("✓ Social media links are visible on main site");
    } else {
      console.log("✗ Social media links are not visible on main site");
    }
    
    // Check for copyright section
    const copyrightSelectors = [
      '.copyright',
      '.footer-copyright',
      '.legal-copyright',
      'p:has-text("Copyright")',
      'div:has-text("© Adobe")'
    ];
    
    let copyrightFound = false;
    
    for (const selector of copyrightSelectors) {
      const element = this.page.locator(selector);
      if (await element.isVisible().catch(() => false)) {
        copyrightFound = true;
        console.log(`Found copyright section on main site with selector: ${selector}`);
        break;
      }
    }
    
    if (copyrightFound) {
      console.log("✓ Footer copyright section is visible on main site");
    } else {
      console.log("✗ Footer copyright section is not visible on main site");
    }
    
    // Overall validation
    const allElementsPresent = isFooterBreadcrumbVisible && footerH2Count > 0 && 
                              languageSelectorFound && socialMediaFound && copyrightFound;
    
    if (allElementsPresent) {
      console.log("✓ All footer elements from fragment page are present on main site");
    } else {
      console.log("✗ Some footer elements from fragment page are not present on main site");
    }
    
    // Don't close the browser here since we'll continue with mobile testing
    
  } catch (error) {
    console.error(`Error checking footer elements on main site: ${error.message}`);
    await this.page.screenshot({ path: 'main-site-footer-error.png' });
    
    // Clean up even if there's an error
    if (this.browser) {
      await closeBrowser(this.browser);
    }
    
    throw error;
  }
});
