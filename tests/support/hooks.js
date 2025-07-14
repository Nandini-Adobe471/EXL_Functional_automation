const { After, Status } = require('@cucumber/cucumber');

// Log when test fails but don't save screenshots
After(async function(scenario) {
  if (scenario.result.status === Status.FAILED && this.page) {
    // Log failure but don't save screenshot to file
    console.log(`Test failed: ${scenario.pickle.name}`);
    
    // Optionally capture screenshot in memory for report data
    // but don't save it to disk
    try {
      const screenshot = await this.page.screenshot({ 
        fullPage: true 
      });
      
      // Attach screenshot to report data (will be filtered out in the HTML report)
      this.attach(screenshot, 'image/png');
    } catch (error) {
      console.error('Error capturing screenshot:', error.message);
    }
  }
});
