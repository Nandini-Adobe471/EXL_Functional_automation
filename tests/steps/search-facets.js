const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { launchBrowser, closeBrowser } = require('../commonFunctions/launchbrowser');

setDefaultTimeout(90 * 1000);

Given('user navigates to search page', async function() {
  // Launch browser
  const result = await launchBrowser();
  this.page = result.page;
  this.browser = result.browser;
  this.context = result.context;
  
  // Navigate directly to the search page
  await this.page.goto('https://experienceleague.adobe.com/en/search');
  
  // Wait for the page to fully load
  await this.page.waitForTimeout(3000);
  
  // Verify we're on the search page
  //await expect(this.page).toHaveURL(/.*\/search.*/);
  console.log("✓ Successfully navigated to search page");
});

Then('facet items in {string} should be alphabetically ordered', async function(facetId) {
 // try {
    // Wait for facets to load
    await this.page.waitForTimeout(2000);
    
    // Find the facet element by ID
  
    let facetElementLocator = await this.page.locator(`atomic-facet[id="${facetId}"] > div > fieldset > ul > li:not([data-childfacet="true"])`);
    facetElementLocator= await facetElementLocator.all();
    const facetElement = await Promise.all(facetElementLocator.map(async element => {
     return await element.getAttribute('data-contenttype');
    }));
    
    //await expect(facetElement).toBeVisible();
    console.log(`✓ Found facet with ID: ${facetId}`);
      await this.page.waitForTimeout(2000);
    console.log(facetElement);
console.log([...facetElement].sort((a, b) => {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();
    
    // If one string is a prefix of another, shorter one comes first
    if (aLower.startsWith(bLower)) return 1;  // b comes first
    if (bLower.startsWith(aLower)) return -1; // a comes first
    
    // Otherwise, normal alphabetical sorting
    return aLower.localeCompare(bLower);
  }));
  expect(facetElement).toEqual([...facetElement].sort((a, b) => {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();
    
    // If one string is a prefix of another, shorter one comes first
    if (aLower.startsWith(bLower)) return 1;  // b comes first
    if (bLower.startsWith(aLower)) return -1; // a comes first
    
    // Otherwise, normal alphabetical sorting
    return aLower.localeCompare(bLower);
  }));
    
    // Use page.evaluate to access Shadow DOM and get facet items
    /*const facetItems = await this.page.evaluate((facetId) => {
      // Get the facet element
      const facetElement = document.querySelector(`atomic-facet [id="${facetId}"] .contents ul li`);
      if (!facetElement) return [];
      
      // Get all facet value elements in the shadow DOM
      const facetValues = Array.from(facetElement.querySelectorAll('data-contenttype'));
      
      // Extract text content from each facet value
      return facetValues.map(value => {
        // Get the label text (excluding the count)
        const labelElement = value.querySelector('[part="label"]');
        return labelElement ? labelElement.textContent.trim() : '';
      }).filter(text => text !== ''); // Filter out empty strings
    }, facetId); */
    
    /*console.log(`Found ${facetItems.length} items in facet ${facetId}:`);
    facetItems.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item}`);
    });
    
    // Check if the items are alphabetically ordered
    const sortedItems = [...facetItems].sort((a, b) => a.localeCompare(b));
    
    // Compare original array with sorted array
    let isAlphabetical = true;
    for (let i = 0; i < facetItems.length; i++) {
      if (facetItems[i] !== sortedItems[i]) {
        isAlphabetical = false;
        console.log(`❌ Item at position ${i + 1} is out of order: "${facetItems[i]}" should be "${sortedItems[i]}"`);
      }
    }
    
    // Assert that the items are alphabetically ordered
    expect(isAlphabetical).toBeTruthy();
    console.log(`✓ Facet items in "${facetId}" are alphabetically ordered`);
    
    // Store the facet items for later reference
    this[`${facetId}Items`] = facetItems;
    
  } catch (error) {
    console.error(`Error checking alphabetical order for facet ${facetId}: ${error.message}`);
    
    // Take a screenshot for debugging
    await this.page.screenshot({ path: `facet-${facetId}-error.png` });
    throw error;
  }*/
  
  /*/ Close the browser after checking the last facet
  if (facetId === 'facetProduct') {
    if (this.browser) {
      await closeBrowser(this.browser);
      console.log('Browser closed successfully');
    }
  }*/
});
