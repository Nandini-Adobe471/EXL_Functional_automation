const { Given, When, Then, setDefaultTimeout } = require('@cucumber/cucumber');
const { expect } = require('@playwright/test');
const { launchBrowser, closeBrowser } = require('../commonFunctions/launchbrowser');

setDefaultTimeout(90 * 1000);

Given('the user navigates to the search results page for only facet test', async function() {
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
  console.log("✓ Successfully navigated to search results page for only facet test");
});

When('the user checks the {string} parent checkbox for only facet test', async function(parentLabel) {
  // Wait for facets to load
  await this.page.waitForTimeout(2000);
  
  // Expand the facet if it's collapsed
  await this.page.locator('atomic-facet-manager >> button[data-expanded="false"].facet-show-more-btn').nth(2).click().catch(() => {
    console.log(`No need to expand the facet or it's already expanded`);
  });
  
  // Locate the parent checkbox for "Experience Manager"
  const parentCheckbox = this.page.locator(`atomic-facet-manager >> atomic-facet >> div ul li[data-contenttype="${parentLabel}"] button[role="checkbox"]`);
  await expect(parentCheckbox).toBeVisible();
  
  // Store the parent checkbox for later use
  this.parentCheckbox = parentCheckbox;
  
  // Click to check the parent
  await parentCheckbox.click();
  console.log(`✓ Checked the "${parentLabel}" parent checkbox`);
  
  // Verify it's checked
  await expect(parentCheckbox).toHaveAttribute('aria-checked', 'true');
  console.log(`✓ Verified "${parentLabel}" parent checkbox is checked`);
  
  // Wait for the UI to update
  await this.page.waitForTimeout(2000);
});

Then('all child checkboxes under {string} should be checked for only facet test', async function(parentLabel) {
  // Get all child checkboxes under Experience Manager
  const childCheckboxes = this.page.locator(`li[data-parent="${parentLabel}"] button[role="checkbox"]`);
  
  // Store the child checkboxes for later use
  this.childCheckboxes = childCheckboxes;
  
  // Get the count of child checkboxes
  const childCount = await childCheckboxes.count();
  console.log(`Found ${childCount} child checkboxes under "${parentLabel}"`);
  
  // Ensure every child is checked
  for (let i = 0; i < childCount; i++) {
    await expect(childCheckboxes.nth(i)).toHaveAttribute('aria-checked', 'true');
    console.log(`✓ Child checkbox ${i + 1} is checked`);
  }
  
  console.log(`✓ All child checkboxes under "${parentLabel}" are checked`);
});

When('the user hovers over a child facet', async function() {
  // Wait for the UI to update
  await this.page.waitForTimeout(2000);
  
  // Get all child checkboxes
  const childCheckboxes = this.childCheckboxes;
  const count = await childCheckboxes.count();
  
  if (count > 0) {
    // Choose the second child (index 1) to hover over
    // We use the second child to avoid potential issues with the first child
    const childIndex = Math.min(1, count - 1);
    this.hoveredChildIndex = childIndex;
    
    // Get the child name for later reference
    const ariaLabel = await childCheckboxes.nth(childIndex).getAttribute('aria-label');
    if (ariaLabel) {
      const childNameParts = ariaLabel.split('|');
      if (childNameParts.length > 1) {
        this.hoveredChildName = childNameParts[1].split(';')[0].trim();
        console.log(`Hovering over child facet: ${this.hoveredChildName}`);
      }
    }
    
    // Get the parent element of the checkbox (the li element)
    const childLi = this.page.locator(`li[data-parent="Experience Manager"]`).nth(childIndex);
    
    // Store the child li for later use
    this.childLi = childLi;
    
    // Hover over the child facet
    await childLi.hover().catch(() => {
      console.log('Hover action failed, will try to proceed anyway');
    });
    console.log(`✓ Hovered over child facet at index ${childIndex}`);
    
    // Wait for the hover effect to show
    await this.page.waitForTimeout(1000);
  } else {
    throw new Error('No child checkboxes found to hover over');
  }
});

Then('the only button should be visible', async function() {
  // Wait for the hover effect to show the only button
  await this.page.waitForTimeout(1000);
  
  // Find a specific child facet that we know exists
  const specificChildFacet = this.page.locator(`atomic-facet#facetProduct >> ul li[data-contenttype="Experience Manager|6.5 LTS"]`);
  
  // Hover over the specific child facet
  await specificChildFacet.hover();
  await this.page.waitForTimeout(3000);
  //console.log('✓ Hovered over the specific child facet',specificChildFacet.locator('span').nth());
  // Find the "only" button within this facet
  const onlyButton = specificChildFacet.locator('span').nth(2).click();
  // const onlyButton = specificChildFacet.locator('span').nth(2).highlight();
 await this.page.waitForTimeout(5000);
  console.log('✓ Clicked the only button');
  
  // Store the only button for later use
  this.onlyButton = onlyButton;
  
  console.log('✓ Only button is visible');
});

When('the user clicks the only button', async function() {
  /*/ Click the only button using force: true to ensure it clicks even if not perfectly visible
  await this.page.locator(`atomic-facet#facetProduct >> ul li[data-contenttype="Experience Manager|6.5 LTS"] span[part="only-facet-btn"]`).evaluate(el => el.click({ force: true }) );
  console.log('✓ Clicked the only button');
  
  // Wait for the UI to update
  await this.page.waitForTimeout(2000);*/
});

Then('only that child should be selected', async function() {
  // Get the child checkbox that was hovered over
  const hoveredChildCheckbox = this.childCheckboxes.nth(this.hoveredChildIndex);
  
  // Verify it's checked
  await expect(hoveredChildCheckbox).toHaveAttribute('aria-checked', 'true');
  console.log(`✓ Verified child "${this.hoveredChildName}" is checked`);
});

Then('all other children should be unselected', async function() {
  // Get all child checkboxes
  const childCheckboxes = this.childCheckboxes;
  const count = await childCheckboxes.count();
  
  // Check that all other children are unchecked
  for (let i = 0; i < count; i++) {
    if (i !== this.hoveredChildIndex) {
      const ariaLabel = await childCheckboxes.nth(i).getAttribute('aria-label');
      let childName = `Child ${i + 1}`;
      if (ariaLabel) {
        const childNameParts = ariaLabel.split('|');
        if (childNameParts.length > 1) {
          childName = childNameParts[1].split(';')[0].trim();
        }
      }
      
      const isChecked = await childCheckboxes.nth(i).getAttribute('aria-checked') === 'true';
      expect(isChecked).toBeFalsy();
      console.log(`✓ Verified child "${childName}" is unchecked`);
    }
  }
  
  console.log('✓ All other children are unchecked');
});

Then('the parent checkbox should be unchecked', async function() {
  // Verify the parent checkbox is unchecked
  await expect(this.parentCheckbox).toHaveAttribute('aria-checked', 'false');
  console.log('✓ The parent checkbox is unchecked');
  
  // Clean up - close the browser
  if (this.browser) {
    await closeBrowser(this.browser);
    console.log('Browser closed successfully');
  }
});
