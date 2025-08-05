const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { performLogin } = require('../commonFunctions/login');
const { launchBrowser, closeBrowser } = require('../commonFunctions/launchbrowser');

setDefaultTimeout(90 * 1000);

Given('user logs in and lands on the home page for author validation', async function() {
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
  console.log("✓ Successfully logged in and landed on the home page for author validation");
});

When('user navigates to the perspective page for author validation', async function() {
  // Navigate directly to the perspectives page
  await this.page.goto('https://experienceleague-stage.adobe.com/en/perspectives');
  
  // Wait for the page to load completely
  await this.page.waitForTimeout(4000);
  
  // Wait for the perspective cards to load
  await this.page.waitForSelector('.browse-card-content', { state: 'visible', timeout: 30000 });
  
  console.log("✓ Successfully navigated to the perspectives page for author validation");
});

When('user clicks on a card with author information', async function() {
  try {
    console.log('Looking for a card with author information');
    
    // First try to find cards specifically within browse-cards-block-content
    const browseCardsBlock = this.page.locator('.browse-cards-block-content').first();
    if (await browseCardsBlock.isVisible().catch(() => false)) {
      console.log('Found browse-cards-block-content');
      
      // Look for cards within the browse-cards-block-content
      const cards = await browseCardsBlock.locator('.browse-card-content').all();
      console.log(`Found ${cards.length} cards within browse-cards-block-content`);
      
      if (cards.length > 0) {
        // Try to find a card with author information
        for (let i = 0; i < cards.length; i++) {
          const card = cards[i];
          const isVisible = await card.isVisible().catch(() => false);
          
          if (isVisible) {
            // Look for author element within the card
            const authorElement = card.locator('.browse-card-author, .browse-card-author-badge, .author-info');
            if (await authorElement.isVisible().catch(() => false)) {
              // Store the card title for later reference
              const titleElement = await card.locator('h2, h3, .card-title, .title').first();
              if (await titleElement.isVisible().catch(() => false)) {
                this.cardTitle = await titleElement.textContent();
                console.log(`Selected card with title: ${this.cardTitle.trim()}`);
              } else {
                this.cardTitle = `Card ${i+1}`;
                console.log(`Selected card without visible title, using index: ${i+1}`);
              }
              
              // Take a screenshot before clicking
              await this.page.screenshot({ path: 'before-author-card-click.png' });
              
              // Click the card
              await card.click();
              await this.page.waitForTimeout(2000);
              
              // Store the current URL for later verification
              this.cardPageUrl = this.page.url();
              console.log(`Navigated to: ${this.cardPageUrl}`);
              
              return; // Exit the function after successful click
            }
          }
        }
      }
    }
    
    // If we couldn't find cards with author information, try a more general approach
    console.log('Could not find cards with author information, trying a more general approach');
    
    // Define possible selectors for cards
    const cardSelectors = [
      '.browse-card-content',
      '.authorable-card',
      '.data-block-authorable-card',
      '.card-container',
      '.card'
    ];
    
    // Try to find and click on a card
    let clicked = false;
    
    for (const selector of cardSelectors) {
      const cards = await this.page.locator(selector).all();
      console.log(`Found ${cards.length} cards with selector: ${selector}`);
      
      if (cards.length > 0) {
        // Try to find a card with author information
        for (let i = 0; i < cards.length; i++) {
          const card = cards[i];
          const isVisible = await card.isVisible().catch(() => false);
          
          if (isVisible) {
            // Look for author element within the card
            const authorElement = card.locator('.browse-card-author, .browse-card-author-badge, .author-info');
            if (await authorElement.isVisible().catch(() => false)) {
              // Store the card title for later reference
              const titleElement = await card.locator('h2, h3, .card-title, .title').first();
              if (await titleElement.isVisible().catch(() => false)) {
                this.cardTitle = await titleElement.textContent();
                console.log(`Selected card with title: ${this.cardTitle.trim()}`);
              } else {
                this.cardTitle = `Card ${i+1}`;
                console.log(`Selected card without visible title, using index: ${i+1}`);
              }
              
              // Take a screenshot before clicking
              await this.page.screenshot({ path: 'before-author-card-click.png' });
              
              // Click the card
              await card.click();
              await this.page.waitForTimeout(2000);
              
              clicked = true;
              break;
            }
          }
        }
      }
      
      if (clicked) break;
    }
    
    // If still no card with author information found, just click on the first card
    if (!clicked) {
      console.log('No cards with visible author information found, clicking on the first card');
      
      const firstCard = this.page.locator('.browse-card-content').first();
      if (await firstCard.isVisible().catch(() => false)) {
        // Store the card title for later reference
        const titleElement = await firstCard.locator('h2, h3, .card-title, .title').first();
        if (await titleElement.isVisible().catch(() => false)) {
          this.cardTitle = await titleElement.textContent();
          console.log(`Selected first card with title: ${this.cardTitle.trim()}`);
        } else {
          this.cardTitle = 'First Card';
          console.log('Selected first card without visible title');
        }
        
        // Take a screenshot before clicking
        await this.page.screenshot({ path: 'before-first-card-click.png' });
        
        // Click the first card
        await firstCard.click();
        await this.page.waitForTimeout(2000);
        
        clicked = true;
      }
    }
    
    // Assert that we clicked on a card
    expect(clicked).toBeTruthy();
    console.log("✓ Successfully clicked on a card");
    
    // Store the current URL for later verification
    this.cardPageUrl = this.page.url();
    console.log(`Navigated to: ${this.cardPageUrl}`);
    
  } catch (error) {
    console.error(`Error clicking on card with author information: ${error.message}`);
    await this.page.screenshot({ path: 'author-card-click-error.png' });
    throw error;
  }
});

Then('user extracts author info text from article marquee', async function() {
  try {
    console.log('Extracting author info text from article marquee');
    
    // Wait for the page to load completely
    await this.page.waitForTimeout(2000);
    
    // Take a screenshot of the current state
    await this.page.screenshot({ path: 'article-page-author.png' });
    
    // Define possible selectors for author info in article marquee
    const authorInfoSelectors = [
      '.article-marquee .author-info-text',
      '.article-marquee .author-info',
      '.article-marquee .author-name',
      '.article-author .author-info-text',
      '.article-author .author-name',
      '.article-byline .author-name',
      '.author-byline'
    ];
    
    // Check if any of the selectors are visible
    let authorInfoFound = false;
    let authorInfoText = '';
    
    for (const selector of authorInfoSelectors) {
      const element = this.page.locator(selector);
      if (await element.isVisible().catch(() => false)) {
        console.log(`Found author info with selector: ${selector}`);
        authorInfoText = await element.textContent();
        authorInfoFound = true;
        break;
      }
    }
    
    // If not found with specific selectors, try a more general approach
    if (!authorInfoFound) {
      console.log('No specific author info found, trying a more general approach');
      
      // Look for elements that might contain author info
      const possibleAuthorContainers = [
        this.page.locator('.article-marquee'),
        this.page.locator('.article-header'),
        this.page.locator('.article-byline'),
        this.page.locator('.article-meta')
      ];
      
      for (const container of possibleAuthorContainers) {
        if (await container.isVisible().catch(() => false)) {
          // Look for elements that might be author info within the container
          const authorElements = container.locator('a, span, div').filter({
            hasText: /by|author|written by/i
          });
          
          const count = await authorElements.count();
          if (count > 0) {
            authorInfoText = await authorElements.first().textContent();
            authorInfoFound = true;
            console.log(`Found author info with text: ${authorInfoText.trim()}`);
            break;
          }
        }
      }
    }
    
    // Store the author info text for later comparison
    if (authorInfoFound) {
      this.authorInfoText = authorInfoText.trim();
      console.log(`Extracted author info text: ${this.authorInfoText}`);
      
      // Try to extract just the author name if it contains additional text
      if (this.authorInfoText.includes('by ')) {
        this.authorName = this.authorInfoText.split('by ')[1].trim();
        console.log(`Extracted author name: ${this.authorName}`);
      } else {
        this.authorName = this.authorInfoText;
      }
    } else {
      console.log('Could not find author info text');
      this.authorInfoText = '';
      this.authorName = '';
    }
    
    // Assert that we found author info
    expect(authorInfoFound).toBeTruthy();
    console.log("✓ Successfully extracted author info text");
    
  } catch (error) {
    console.error(`Error extracting author info text: ${error.message}`);
    await this.page.screenshot({ path: 'author-info-extraction-error.png' });
    throw error;
  }
});

When('user navigates to author bio page', async function() {
  try {
    console.log('Extracting author bio page link from meta tag');
    
    // Look for meta tag with name="author-bio-page"
    const authorBioMeta = this.page.locator('meta[name="author-bio-page"]');
    const authorBioUrlPath = await authorBioMeta.getAttribute('content').catch(() => null);
    
    if (authorBioUrlPath) {
      console.log(`Found author bio URL path in meta tag: ${authorBioUrlPath}`);
      
      // Append domain to the URL if it's a relative path
      const authorBioUrl = authorBioUrlPath.startsWith('http') 
        ? authorBioUrlPath 
        : `https://experienceleague-stage.adobe.com${authorBioUrlPath.startsWith('/') ? '' : '/'}${authorBioUrlPath}`;
      
      console.log(`Complete author bio URL: ${authorBioUrl}`);
      
      // Navigate to the author bio page
      await this.page.goto(authorBioUrl);
      await this.page.waitForTimeout(2000);
      
      // Store the author bio page URL
      this.authorBioPageUrl = this.page.url();
      console.log(`Navigated to author bio page: ${this.authorBioPageUrl}`);
      
      // Take a screenshot of the author bio page
      await this.page.screenshot({ path: 'author-bio-page.png' });
      
      return;
    }
    
    console.log('Meta tag with author-bio-page not found, trying alternative approaches');
    
    // Try to find author link in the article
    const authorLinkSelectors = [
      '.article-marquee .author-info-text a',
      '.article-marquee .author-info a',
      '.article-marquee .author-name a',
      '.article-author .author-info-text a',
      '.article-author .author-name a',
      '.article-byline .author-name a',
      '.author-byline a'
    ];
    
    // Check if any of the selectors are visible
    let authorLinkFound = false;
    
    for (const selector of authorLinkSelectors) {
      const element = this.page.locator(selector);
      if (await element.isVisible().catch(() => false)) {
        console.log(`Found author link with selector: ${selector}`);
        
        // Get the href attribute
        const href = await element.getAttribute('href').catch(() => null);
        if (href) {
          console.log(`Found author link href: ${href}`);
          
          // Navigate to the author bio page
          const fullUrl = href.startsWith('http') ? href : `https://experienceleague-stage.adobe.com${href}`;
          await this.page.goto(fullUrl);
          await this.page.waitForTimeout(2000);
          
          authorLinkFound = true;
          break;
        } else {
          // If no href, try clicking the link
          console.log('No href found, trying to click the link');
          
          // Take a screenshot before clicking
          await this.page.screenshot({ path: 'before-author-link-click.png' });
          
          // Click the author link
          await element.click();
          await this.page.waitForTimeout(2000);
          
          authorLinkFound = true;
          break;
        }
      }
    }
    
    // If still no author link found, try to construct the author bio URL
    if (!authorLinkFound) {
      console.log('No author link found, trying to construct author bio URL');
      
      // Clean up the author name for URL construction
      const cleanAuthorName = this.authorName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      
      // Construct a potential author bio URL
      const constructedUrl = `https://experienceleague-stage.adobe.com/en/perspectives/authors/${cleanAuthorName}`;
      console.log(`Attempting to navigate to constructed URL: ${constructedUrl}`);
      
      // Navigate to the constructed URL
      await this.page.goto(constructedUrl);
      await this.page.waitForTimeout(2000);
    }
    
    // Store the author bio page URL
    this.authorBioPageUrl = this.page.url();
    console.log(`Navigated to author bio page: ${this.authorBioPageUrl}`);
    
    // Take a screenshot of the author bio page
    await this.page.screenshot({ path: 'author-bio-page.png' });
    
  } catch (error) {
    console.error(`Error navigating to author bio page: ${error.message}`);
    await this.page.screenshot({ path: 'author-bio-navigation-error.png' });
    throw error;
  }
});

Then('author info from article should match author bio page', async function() {
  try {
    console.log('Comparing author info from article with author bio page');
    
    // Define possible selectors for author info on bio page
    const authorBioSelectors = [
      '.author-bio-name',
      '.author-name',
      '.author-title',
      'h1',
      '.author-header h1',
      '.author-profile-name'
    ];
    
    // Check if any of the selectors are visible
    let authorBioFound = false;
    let authorBioText = '';
    
    for (const selector of authorBioSelectors) {
      const element = this.page.locator(selector);
      if (await element.isVisible().catch(() => false)) {
        console.log(`Found author bio info with selector: ${selector}`);
        authorBioText = await element.textContent();
        authorBioFound = true;
        break;
      }
    }
    
    // If not found with specific selectors, try a more general approach
    if (!authorBioFound) {
      console.log('No specific author bio info found, trying a more general approach');
      
      // Look for elements that might contain author bio info
      const possibleBioContainers = [
        this.page.locator('.author-bio'),
        this.page.locator('.author-profile'),
        this.page.locator('.author-header'),
        this.page.locator('header')
      ];
      
      for (const container of possibleBioContainers) {
        if (await container.isVisible().catch(() => false)) {
          // Look for elements that might be author bio info within the container
          const bioElements = container.locator('h1, h2, .title').first();
          
          if (await bioElements.isVisible().catch(() => false)) {
            authorBioText = await bioElements.textContent();
            authorBioFound = true;
            console.log(`Found author bio info with text: ${authorBioText.trim()}`);
            break;
          }
        }
      }
    }
    
    // Clean up the texts for comparison
    const cleanAuthorInfo = this.authorName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanAuthorBio = authorBioText.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    
    console.log(`Clean author info from article: ${cleanAuthorInfo}`);
    console.log(`Clean author bio from bio page: ${cleanAuthorBio}`);
    
    // Check if the author info from the article is contained in the author bio page
    const authorInfoMatch = cleanAuthorBio.includes(cleanAuthorInfo) || cleanAuthorInfo.includes(cleanAuthorBio);
    
    if (authorInfoMatch) {
      console.log("✓ Author info from article matches author bio page");
    } else {
      console.log("✗ Author info from article does not match author bio page");
      console.log(`Article author info: ${this.authorName}`);
      console.log(`Bio page author info: ${authorBioText.trim()}`);
    }
    
    // Assert that the author info matches
    expect(authorInfoMatch).toBeTruthy();
    
    // Clean up - close the browser
    if (this.browser) {
      await closeBrowser(this.browser);
      console.log('Browser closed successfully');
    }
    
  } catch (error) {
    console.error(`Error comparing author info: ${error.message}`);
    await this.page.screenshot({ path: 'author-info-comparison-error.png' });
    
    // Clean up even if there's an error
    if (this.browser) {
      await closeBrowser(this.browser);
    }
    
    throw error;
  }
});
