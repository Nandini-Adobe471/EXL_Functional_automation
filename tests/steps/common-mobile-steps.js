const { When, setDefaultTimeout } = require('@cucumber/cucumber');

setDefaultTimeout(90 * 1000);

// Common mobile view step definition
When('user sets viewport to mobile size', async function() {
  // Set viewport to a common mobile device size (e.g., iPhone 12)
  await this.page.setViewportSize({ width: 390, height: 844 });
  
  // Wait for the page to adjust to the new viewport size
  await this.page.waitForTimeout(1000);
  
  console.log('Viewport set to mobile size: 390x844');
});
